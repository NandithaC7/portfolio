from decimal import Decimal

from django.conf import settings
from django.db import models

from households.models import Household


class Stock(models.Model):
    """One shared item on the household shelf."""

    class Unit(models.TextChoices):
        ML = "ml", "ml"
        L = "L", "L"
        G = "g", "g"
        KG = "kg", "kg"
        UNITS = "units", "units"
        ROLLS = "rolls", "rolls"
        PACKS = "packs", "packs"

    household = models.ForeignKey(
        Household, on_delete=models.CASCADE, related_name="stocks"
    )
    name = models.CharField(max_length=120)
    unit = models.CharField(max_length=16, choices=Unit.choices, default=Unit.UNITS)
    quantity = models.DecimalField(
        max_digits=12, decimal_places=2, help_text="Amount originally purchased"
    )
    current_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    purchased_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="stocks_purchased",
    )
    is_active = models.BooleanField(default=True)
    alert_threshold = models.PositiveIntegerField(
        default=3, help_text="Days of headroom before a restock alert fires"
    )
    days_until_empty = models.FloatField(null=True, blank=True)
    predicted_empty_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "stocks"
        ordering = ("-created_at",)
        indexes = [models.Index(fields=["household", "is_active"], name="idx_stock_household")]

    def __str__(self):
        return f"{self.name} ({self.household.name})"

    @property
    def percent_remaining(self):
        if not self.quantity:
            return 0.0
        return max(0.0, min(100.0, float(self.current_quantity) / float(self.quantity) * 100))

    @property
    def cost_per_unit(self):
        if not self.quantity:
            return Decimal("0")
        return (self.total_cost / self.quantity).quantize(Decimal("0.0001"))

    @property
    def is_low(self):
        if self.days_until_empty is None:
            return self.percent_remaining <= 15
        return self.days_until_empty <= self.alert_threshold


class UsageLog(models.Model):
    """Immutable record of someone taking some of a shared item."""

    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="usage_logs")
    used_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="usage_logs"
    )
    quantity_used = models.DecimalField(max_digits=12, decimal_places=2)
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "usage_logs"
        ordering = ("-logged_at",)
        indexes = [
            models.Index(fields=["stock", "logged_at"], name="idx_usage_stock_time"),
            models.Index(fields=["used_by", "logged_at"], name="idx_usage_user_time"),
        ]

    def __str__(self):
        return f"{self.used_by} used {self.quantity_used}{self.stock.unit} of {self.stock.name}"


class Balance(models.Model):
    """Denormalised ledger row: `debtor` owes `creditor` this much."""

    household = models.ForeignKey(
        Household, on_delete=models.CASCADE, related_name="balances"
    )
    debtor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="debts"
    )
    creditor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="credits"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "balances"
        constraints = [
            models.UniqueConstraint(
                fields=["household", "debtor", "creditor"], name="unique_balance_pair"
            )
        ]
        indexes = [models.Index(fields=["household", "debtor"], name="idx_balance_debtor")]

    def __str__(self):
        return f"{self.debtor} owes {self.creditor} {self.amount}"


class Settlement(models.Model):
    """A payment that cancels out debt.

    Balance rows are derived from usage history, so a settlement has to be
    recorded separately or the next ledger rebuild would resurrect the debt.
    """

    household = models.ForeignKey(
        Household, on_delete=models.CASCADE, related_name="settlements"
    )
    payer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="settlements_paid"
    )
    payee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="settlements_received",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.CharField(max_length=200, blank=True, default="")
    settled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "settlements"
        ordering = ("-settled_at",)
        indexes = [models.Index(fields=["household", "payer"], name="idx_settle_payer")]

    def __str__(self):
        return f"{self.payer} paid {self.payee} {self.amount}"


class RestockSuggestion(models.Model):
    """Latest ML output for a stock."""

    stock = models.OneToOneField(
        Stock, on_delete=models.CASCADE, related_name="restock_suggestion"
    )
    predicted_empty_date = models.DateField(null=True, blank=True)
    suggested_quantity = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    confidence = models.FloatField(default=0.0)
    avg_daily_usage = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "restock_suggestions"

    def __str__(self):
        return f"Restock {self.stock.name} by {self.predicted_empty_date}"
