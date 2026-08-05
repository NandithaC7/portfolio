from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase

from households.models import Household, Membership
from ml.predictor import predict_depletion
from stocks.models import Balance, Stock, UsageLog
from stocks.services import recalculate_balance_for_stock, settle_up
from stocks.tasks import apply_prediction

User = get_user_model()


def make_user(username):
    return User.objects.create_user(
        username=username, email=f"{username}@test.local", password="pw-for-tests-123"
    )


class LedgerTests(TestCase):
    def setUp(self):
        self.buyer = make_user("buyer")
        self.a = make_user("alice")
        self.b = make_user("bob")
        self.household = Household.objects.create(
            name="Test Flat", created_by=self.buyer
        )
        for user in (self.a, self.b):
            Membership.objects.create(user=user, household=self.household)

        self.stock = Stock.objects.create(
            household=self.household,
            name="Cooking Oil",
            unit="ml",
            quantity=Decimal("1000"),
            current_quantity=Decimal("1000"),
            total_cost=Decimal("300.00"),
            purchased_by=self.buyer,
        )

    def test_cost_is_split_by_actual_usage(self):
        UsageLog.objects.create(
            stock=self.stock, used_by=self.a, quantity_used=Decimal("300")
        )
        UsageLog.objects.create(
            stock=self.stock, used_by=self.b, quantity_used=Decimal("100")
        )
        recalculate_balance_for_stock(self.stock)

        # 400ml used of a 300.00 item -> 0.75 per ml.
        alice = Balance.objects.get(debtor=self.a, creditor=self.buyer)
        bob = Balance.objects.get(debtor=self.b, creditor=self.buyer)
        self.assertEqual(alice.amount, Decimal("225.00"))
        self.assertEqual(bob.amount, Decimal("75.00"))

    def test_buyer_never_owes_themselves(self):
        UsageLog.objects.create(
            stock=self.stock, used_by=self.buyer, quantity_used=Decimal("500")
        )
        recalculate_balance_for_stock(self.stock)
        self.assertFalse(Balance.objects.filter(debtor=self.buyer).exists())

    def test_mutual_debt_is_netted_to_one_row(self):
        other = Stock.objects.create(
            household=self.household,
            name="Rice",
            unit="kg",
            quantity=Decimal("10"),
            current_quantity=Decimal("10"),
            total_cost=Decimal("100.00"),
            purchased_by=self.a,
        )
        UsageLog.objects.create(
            stock=self.stock, used_by=self.a, quantity_used=Decimal("100")
        )
        UsageLog.objects.create(
            stock=other, used_by=self.buyer, quantity_used=Decimal("10")
        )
        recalculate_balance_for_stock(self.stock)
        recalculate_balance_for_stock(other)

        pair = Balance.objects.filter(
            household=self.household
        ).filter(debtor__in=[self.a, self.buyer], creditor__in=[self.a, self.buyer])
        self.assertEqual(pair.count(), 1)
        # alice owes 300, buyer owes 100 -> alice owes 200 net.
        row = pair.get()
        self.assertEqual(row.debtor, self.a)
        self.assertEqual(row.amount, Decimal("200.00"))

    def test_settlement_survives_a_ledger_rebuild(self):
        UsageLog.objects.create(
            stock=self.stock, used_by=self.a, quantity_used=Decimal("100")
        )
        recalculate_balance_for_stock(self.stock)
        self.assertEqual(
            Balance.objects.get(debtor=self.a, creditor=self.buyer).amount,
            Decimal("300.00"),
        )

        settle_up(self.household.id, self.a.id, self.buyer.id, amount=Decimal("100"))
        self.assertEqual(
            Balance.objects.get(debtor=self.a, creditor=self.buyer).amount,
            Decimal("200.00"),
        )

        # Another usage event must not resurrect the settled portion.
        UsageLog.objects.create(
            stock=self.stock, used_by=self.b, quantity_used=Decimal("100")
        )
        recalculate_balance_for_stock(self.stock)
        self.assertEqual(
            Balance.objects.get(debtor=self.a, creditor=self.buyer).amount,
            Decimal("50.00"),  # 200ml used total -> 1.50/ml, alice 150 minus 100 paid
        )

    def test_full_settlement_clears_the_row(self):
        UsageLog.objects.create(
            stock=self.stock, used_by=self.a, quantity_used=Decimal("100")
        )
        recalculate_balance_for_stock(self.stock)
        settle_up(self.household.id, self.a.id, self.buyer.id)
        self.assertFalse(
            Balance.objects.filter(debtor=self.a, creditor=self.buyer).exists()
        )


class PredictorTests(TestCase):
    def setUp(self):
        self.user = make_user("predictor-user")
        self.household = Household.objects.create(name="Flat", created_by=self.user)
        self.stock = Stock.objects.create(
            household=self.household,
            name="Milk",
            unit="L",
            quantity=Decimal("10"),
            current_quantity=Decimal("6"),
            total_cost=Decimal("200"),
            purchased_by=self.user,
        )

    def _log(self, amount, days_ago):
        log = UsageLog.objects.create(
            stock=self.stock, used_by=self.user, quantity_used=Decimal(str(amount))
        )
        UsageLog.objects.filter(pk=log.pk).update(
            logged_at=timezone.now() - timedelta(days=days_ago)
        )

    def test_returns_nulls_below_three_logs(self):
        self._log(1, 1)
        self._log(1, 2)
        prediction = predict_depletion(self.stock)
        self.assertIsNone(prediction.days_until_empty)
        self.assertIsNone(prediction.predicted_empty_date)
        self.assertEqual(prediction.log_count, 2)
        self.assertIn("Not enough", prediction.reason)

    def test_steady_usage_gives_a_sane_runway(self):
        for days_ago in range(7):
            self._log(1, days_ago)
        prediction = predict_depletion(self.stock)
        # 1L/day over the rolling window, 6L left.
        self.assertAlmostEqual(prediction.days_until_empty, 6.0, places=1)
        self.assertEqual(
            prediction.predicted_empty_date, timezone.now().date() + timedelta(days=6)
        )

    def test_confidence_scales_with_log_count(self):
        for days_ago in range(10):
            self._log(0.5, days_ago)
        self.assertEqual(predict_depletion(self.stock).confidence, 0.5)

    def test_suggested_quantity_covers_a_month(self):
        for days_ago in range(7):
            self._log(2, days_ago)
        self.assertAlmostEqual(predict_depletion(self.stock).suggested_quantity, 60.0, places=1)

    def test_apply_prediction_persists_to_the_stock(self):
        for days_ago in range(7):
            self._log(1, days_ago)
        apply_prediction(self.stock)
        self.stock.refresh_from_db()
        self.assertIsNotNone(self.stock.days_until_empty)
        self.assertIsNotNone(self.stock.predicted_empty_date)
        self.assertIsNotNone(self.stock.restock_suggestion)


class StockAPITests(APITestCase):
    def setUp(self):
        self.owner = make_user("owner")
        self.mate = make_user("mate")
        self.outsider = make_user("outsider")
        self.household = Household.objects.create(name="Willow", created_by=self.owner)
        Membership.objects.create(user=self.mate, household=self.household)

        self.stock = Stock.objects.create(
            household=self.household,
            name="Dish Soap",
            unit="ml",
            quantity=Decimal("500"),
            current_quantity=Decimal("320"),
            total_cost=Decimal("150"),
            purchased_by=self.owner,
        )

    def test_outsiders_cannot_see_household_stock(self):
        self.client.force_authenticate(self.outsider)
        response = self.client.get("/api/stocks/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_outsiders_cannot_read_balances(self):
        self.client.force_authenticate(self.outsider)
        response = self.client.get(f"/api/households/{self.household.id}/balances/")
        self.assertEqual(response.status_code, 403)

    def test_anonymous_requests_are_rejected(self):
        self.assertEqual(self.client.get("/api/stocks/").status_code, 401)

    def test_logging_more_than_is_left_is_refused_with_useful_copy(self):
        self.client.force_authenticate(self.mate)
        response = self.client.post(
            "/api/usage-logs/",
            {"stock": self.stock.id, "quantity_used": "500"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("only 320", response.json()["quantity_used"][0])

    def test_logging_usage_decrements_stock_and_writes_the_ledger(self):
        self.client.force_authenticate(self.mate)
        response = self.client.post(
            "/api/usage-logs/",
            {"stock": self.stock.id, "quantity_used": "20"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.stock.refresh_from_db()
        self.assertEqual(self.stock.current_quantity, Decimal("300.00"))
        self.assertTrue(
            Balance.objects.filter(debtor=self.mate, creditor=self.owner).exists()
        )

    def test_zero_usage_is_refused(self):
        self.client.force_authenticate(self.mate)
        response = self.client.post(
            "/api/usage-logs/",
            {"stock": self.stock.id, "quantity_used": "0"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_outsiders_cannot_log_usage(self):
        self.client.force_authenticate(self.outsider)
        response = self.client.post(
            "/api/usage-logs/",
            {"stock": self.stock.id, "quantity_used": "10"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_settle_up_endpoint_clears_the_debt(self):
        UsageLog.objects.create(
            stock=self.stock, used_by=self.mate, quantity_used=Decimal("100")
        )
        recalculate_balance_for_stock(self.stock)

        self.client.force_authenticate(self.mate)
        response = self.client.post(
            f"/api/households/{self.household.id}/balances/",
            {"creditor_id": self.owner.id},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(
            Balance.objects.filter(debtor=self.mate, creditor=self.owner).exists()
        )
