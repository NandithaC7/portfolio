"""Ledger maths for SplitStock.

The rule: whoever bought the item fronted the money, so everyone else who used
it owes the buyer for exactly what they took, at the item's per-unit cost.
"""

from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.db.models import Sum

from .models import Balance, Settlement, Stock, UsageLog

CENTS = Decimal("0.01")


def _money(value):
    return Decimal(value).quantize(CENTS, rounding=ROUND_HALF_UP)


def recalculate_balance_for_stock(stock: Stock):
    """Recompute every debt this one stock creates, then fold it into the ledger.

    Balances are stored per (household, debtor, creditor) across all stocks, so
    this rebuilds this stock's contribution from its full usage history and
    re-applies it on top of the other stocks' contributions.
    """
    if stock.purchased_by_id is None:
        return {}

    with transaction.atomic():
        totals = (
            UsageLog.objects.filter(stock=stock)
            .values("used_by")
            .annotate(total=Sum("quantity_used"))
        )
        total_used = sum((row["total"] for row in totals), Decimal("0"))

        if total_used <= 0:
            _rebuild_household_ledger(stock.household_id)
            return {}

        # Cost is spread over what has actually been consumed so far, so the
        # split stays fair while the jar is still half full.
        cost_per_unit = Decimal(stock.total_cost) / total_used

        owed = {}
        for row in totals:
            if row["used_by"] == stock.purchased_by_id:
                continue
            owed[row["used_by"]] = _money(Decimal(row["total"]) * cost_per_unit)

        _rebuild_household_ledger(stock.household_id)
        return owed


def compute_household_debts(household_id):
    """Return {(debtor_id, creditor_id): amount} for every stock in a household."""
    debts = defaultdict(Decimal)

    stocks = Stock.objects.filter(household_id=household_id).exclude(
        purchased_by__isnull=True
    )
    for stock in stocks:
        totals = (
            UsageLog.objects.filter(stock=stock)
            .values("used_by")
            .annotate(total=Sum("quantity_used"))
        )
        total_used = sum((row["total"] for row in totals), Decimal("0"))
        if total_used <= 0:
            continue
        cost_per_unit = Decimal(stock.total_cost) / total_used
        for row in totals:
            if row["used_by"] == stock.purchased_by_id:
                continue
            debts[(row["used_by"], stock.purchased_by_id)] += (
                Decimal(row["total"]) * cost_per_unit
            )

    # Money already handed over reduces what's outstanding.
    for settlement in Settlement.objects.filter(household_id=household_id):
        debts[(settlement.payer_id, settlement.payee_id)] -= Decimal(settlement.amount)

    return {pair: _money(amount) for pair, amount in debts.items() if _money(amount) != 0}


def _net_debts(raw_debts):
    """Cancel out mutual debt so the corkboard only ever shows one string per pair."""
    per_pair = defaultdict(Decimal)
    for (debtor, creditor), amount in raw_debts.items():
        # Key on the ordered pair so A→B and B→A land in the same bucket.
        low, high = sorted((debtor, creditor))
        sign = 1 if (debtor, creditor) == (low, high) else -1
        per_pair[(low, high)] += sign * amount

    netted = {}
    for (low, high), amount in per_pair.items():
        rounded = _money(amount)
        if rounded > 0:
            netted[(low, high)] = rounded
        elif rounded < 0:
            netted[(high, low)] = -rounded
    return netted


def _rebuild_household_ledger(household_id):
    """Upsert the denormalised Balance rows for a household."""
    netted = _net_debts(compute_household_debts(household_id))

    with transaction.atomic():
        existing = {
            (b.debtor_id, b.creditor_id): b
            for b in Balance.objects.select_for_update().filter(household_id=household_id)
        }

        for (debtor_id, creditor_id), amount in netted.items():
            row = existing.pop((debtor_id, creditor_id), None)
            if row is None:
                Balance.objects.create(
                    household_id=household_id,
                    debtor_id=debtor_id,
                    creditor_id=creditor_id,
                    amount=amount,
                )
            elif row.amount != amount:
                row.amount = amount
                row.save(update_fields=["amount", "updated_at"])

        stale_ids = [row.id for row in existing.values()]
        if stale_ids:
            Balance.objects.filter(id__in=stale_ids).delete()


def settle_up(household_id, debtor_id, creditor_id, amount=None, note=""):
    """Record a payment from debtor to creditor and refresh the ledger.

    Passing amount=None settles the whole outstanding balance.
    """
    with transaction.atomic():
        balance = (
            Balance.objects.select_for_update()
            .filter(
                household_id=household_id, debtor_id=debtor_id, creditor_id=creditor_id
            )
            .first()
        )
        outstanding = balance.amount if balance else Decimal("0")
        payment = outstanding if amount is None else _money(amount)
        if payment <= 0:
            return None

        Settlement.objects.create(
            household_id=household_id,
            payer_id=debtor_id,
            payee_id=creditor_id,
            amount=payment,
            note=note,
        )
        _rebuild_household_ledger(household_id)

    remaining = (
        Balance.objects.filter(
            household_id=household_id, debtor_id=debtor_id, creditor_id=creditor_id
        )
        .values_list("amount", flat=True)
        .first()
    )
    return {"paid": payment, "remaining": remaining or Decimal("0")}


def user_balance_summary(household_id, user_id):
    """Net position for one member: positive means the household owes them."""
    owed_to_me = Balance.objects.filter(
        household_id=household_id, creditor_id=user_id
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0")
    i_owe = Balance.objects.filter(
        household_id=household_id, debtor_id=user_id
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0")
    return {
        "owed_to_me": _money(owed_to_me),
        "i_owe": _money(i_owe),
        "net": _money(owed_to_me - i_owe),
    }
