"""Seed a believable flatshare so the UI has something honest to render."""

import random
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from households.models import Household, Membership
from stocks.models import Balance, Stock, UsageLog
from stocks.services import recalculate_balance_for_stock
from stocks.tasks import apply_prediction

User = get_user_model()

MEMBERS = [
    ("maya", "Maya", "Iyer", "+919000000001"),
    ("theo", "Theo", "Almeida", "+919000000002"),
    ("nadia", "Nadia", "Osei", "+919000000003"),
    ("sam", "Sam", "Whitfield", "+919000000004"),
]

# target_days spreads the shelf across every state the depletion ring shows —
# Brick at three days or fewer, Yolk Dim inside the week, Moss beyond it — so
# the dashboard demonstrates the full range rather than one healthy colour.
ITEMS = [
    # name, unit, quantity, cost, buyer index, alert threshold, pace, target_days
    ("Cooking Oil", "ml", 2000, "480.00", 0, 3, 55, 2),
    ("Whole Milk", "L", 6, "330.00", 1, 2, 0.55, 1),
    ("Dish Soap", "ml", 750, "180.00", 2, 3, 14, 5),
    ("Coffee Beans", "g", 1000, "1150.00", 0, 4, 26, 6),
    ("Toilet Roll", "rolls", 24, "360.00", 3, 4, 0.7, 11),
    ("Basmati Rice", "kg", 10, "920.00", 1, 5, 0.22, 19),
    ("Laundry Powder", "g", 3000, "540.00", 2, 5, 42, 26),
]


class Command(BaseCommand):
    help = "Create a demo household with members, stock, usage history and balances."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Wipe demo data first")
        parser.add_argument("--password", default="splitstock123")

    @transaction.atomic
    def handle(self, *args, **options):
        random.seed(7)
        password = options["password"]

        if options["reset"]:
            Household.objects.filter(name="Flat 4B, Willow Court").delete()
            User.objects.filter(username__in=[m[0] for m in MEMBERS]).delete()
            self.stdout.write("Cleared previous demo data.")

        users = []
        for username, first, last, phone in MEMBERS:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@willowcourt.test",
                    "first_name": first,
                    "last_name": last,
                    "phone_number": phone,
                },
            )
            if created:
                user.set_password(password)
                user.save()
            users.append(user)

        household, _ = Household.objects.get_or_create(
            name="Flat 4B, Willow Court", defaults={"created_by": users[0]}
        )
        for index, user in enumerate(users):
            Membership.objects.get_or_create(
                user=user,
                household=household,
                defaults={
                    "role": Membership.Role.ADMIN if index == 0 else Membership.Role.MEMBER
                },
            )

        now = timezone.now()
        Stock.objects.filter(household=household).delete()

        for name, unit, quantity, cost, buyer_index, threshold, pace, target_days in ITEMS:
            quantity = Decimal(str(quantity))
            stock = Stock.objects.create(
                household=household,
                name=name,
                unit=unit,
                quantity=quantity,
                current_quantity=quantity,
                total_cost=Decimal(cost),
                purchased_by=users[buyer_index],
                alert_threshold=threshold,
            )

            remaining = quantity
            for days_ago in range(21, -1, -1):
                # Not every day sees usage — real households skip days.
                if random.random() < 0.35:
                    continue
                for user in random.sample(users, random.randint(1, 3)):
                    amount = Decimal(str(round(pace * random.uniform(0.25, 0.7), 2)))
                    if amount <= 0 or amount > remaining:
                        continue
                    log = UsageLog.objects.create(
                        stock=stock, used_by=user, quantity_used=amount
                    )
                    UsageLog.objects.filter(pk=log.pk).update(
                        logged_at=now
                        - timedelta(days=days_ago, hours=random.randint(0, 20))
                    )
                    remaining -= amount

            stock.current_quantity = max(remaining, Decimal("0"))
            stock.save(update_fields=["current_quantity"])

            recalculate_balance_for_stock(stock)

            # Run the model once to learn the household's pace for this item,
            # then set what's left to land on the intended runway and re-run.
            prediction = apply_prediction(stock)
            if prediction.avg_daily_usage:
                level = Decimal(str(round(prediction.avg_daily_usage * target_days, 2)))
                stock.current_quantity = max(
                    Decimal("0"), min(level, quantity)
                )
                stock.save(update_fields=["current_quantity"])
                apply_prediction(stock)

        low = [s.name for s in Stock.objects.filter(household=household) if s.is_low]

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSeeded '{household.name}'\n"
                f"  invite code : {household.invite_code}\n"
                f"  members     : {', '.join(u.username for u in users)}\n"
                f"  password    : {password}\n"
                f"  stocks      : {Stock.objects.filter(household=household).count()}\n"
                f"  usage logs  : {UsageLog.objects.filter(stock__household=household).count()}\n"
                f"  balances    : {Balance.objects.filter(household=household).count()}\n"
                f"  running low : {', '.join(low) or 'none'}\n"
            )
        )
