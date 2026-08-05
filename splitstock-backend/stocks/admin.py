from django.contrib import admin

from .models import Balance, RestockSuggestion, Settlement, Stock, UsageLog


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "household",
        "current_quantity",
        "quantity",
        "unit",
        "days_until_empty",
        "is_active",
    )
    list_filter = ("is_active", "unit", "household")
    search_fields = ("name",)


@admin.register(UsageLog)
class UsageLogAdmin(admin.ModelAdmin):
    list_display = ("stock", "used_by", "quantity_used", "logged_at")
    list_filter = ("stock__household",)


@admin.register(Balance)
class BalanceAdmin(admin.ModelAdmin):
    list_display = ("household", "debtor", "creditor", "amount", "updated_at")


@admin.register(Settlement)
class SettlementAdmin(admin.ModelAdmin):
    list_display = ("household", "payer", "payee", "amount", "settled_at")


@admin.register(RestockSuggestion)
class RestockSuggestionAdmin(admin.ModelAdmin):
    list_display = (
        "stock",
        "predicted_empty_date",
        "suggested_quantity",
        "confidence",
    )
