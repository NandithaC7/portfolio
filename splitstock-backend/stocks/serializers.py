from decimal import Decimal

from rest_framework import serializers

from households.permissions import is_member
from users.serializers import UserSerializer

from .models import Balance, RestockSuggestion, Settlement, Stock, UsageLog


class RestockSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestockSuggestion
        fields = (
            "predicted_empty_date",
            "suggested_quantity",
            "confidence",
            "avg_daily_usage",
            "updated_at",
        )


class StockSerializer(serializers.ModelSerializer):
    purchased_by = UserSerializer(read_only=True)
    purchased_by_id = serializers.IntegerField(write_only=True, required=False)
    percent_remaining = serializers.FloatField(read_only=True)
    cost_per_unit = serializers.DecimalField(
        max_digits=12, decimal_places=4, read_only=True
    )
    is_low = serializers.BooleanField(read_only=True)
    restock_suggestion = RestockSuggestionSerializer(read_only=True)
    usage_log_count = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = (
            "id",
            "household",
            "name",
            "unit",
            "quantity",
            "current_quantity",
            "total_cost",
            "purchased_by",
            "purchased_by_id",
            "is_active",
            "alert_threshold",
            "days_until_empty",
            "predicted_empty_date",
            "percent_remaining",
            "cost_per_unit",
            "is_low",
            "restock_suggestion",
            "usage_log_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "days_until_empty",
            "predicted_empty_date",
            "created_at",
            "updated_at",
        )

    def get_usage_log_count(self, obj):
        if hasattr(obj, "usage_log_count_annotated"):
            return obj.usage_log_count_annotated
        return obj.usage_logs.count()

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity has to be more than zero.")
        return value

    def validate_total_cost(self, value):
        if value < 0:
            raise serializers.ValidationError("Cost can't be negative.")
        return value

    def validate_household(self, value):
        request = self.context.get("request")
        if request and not is_member(request.user, value.id):
            raise serializers.ValidationError(
                "You can only add stock to a household you're in."
            )
        return value

    def validate(self, attrs):
        current = attrs.get("current_quantity")
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", None))
        if current is not None and quantity is not None and current > quantity:
            raise serializers.ValidationError(
                {
                    "current_quantity": "There can't be more left than was bought "
                    f"({quantity})."
                }
            )
        return attrs

    def create(self, validated_data):
        validated_data.setdefault(
            "current_quantity", validated_data.get("quantity", Decimal("0"))
        )
        validated_data.setdefault(
            "purchased_by_id", self.context["request"].user.id
        )
        return super().create(validated_data)


class UsageLogSerializer(serializers.ModelSerializer):
    used_by = UserSerializer(read_only=True)
    stock_name = serializers.CharField(source="stock.name", read_only=True)
    unit = serializers.CharField(source="stock.unit", read_only=True)

    class Meta:
        model = UsageLog
        fields = (
            "id",
            "stock",
            "stock_name",
            "unit",
            "used_by",
            "quantity_used",
            "logged_at",
        )
        read_only_fields = ("id", "logged_at", "used_by")

    def validate_quantity_used(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Log an amount greater than zero — that's how the split stays fair."
            )
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        stock = attrs["stock"]

        if request and not is_member(request.user, stock.household_id):
            raise serializers.ValidationError(
                {"stock": "You're not a member of that household."}
            )
        if not stock.is_active:
            raise serializers.ValidationError(
                {"stock": f"{stock.name} is archived — reopen it before logging usage."}
            )

        quantity_used = attrs["quantity_used"]
        if quantity_used > stock.current_quantity:
            raise serializers.ValidationError(
                {
                    "quantity_used": (
                        f"Can't log {_fmt(quantity_used)}{stock.unit} — only "
                        f"{_fmt(stock.current_quantity)}{stock.unit} of {stock.name} left."
                    )
                }
            )
        return attrs


def _fmt(value):
    """Trim trailing zeros so error copy reads like a person wrote it."""
    text = f"{Decimal(value).normalize():f}"
    return text


class BalanceSerializer(serializers.ModelSerializer):
    debtor = UserSerializer(read_only=True)
    creditor = UserSerializer(read_only=True)

    class Meta:
        model = Balance
        fields = ("id", "household", "debtor", "creditor", "amount", "updated_at")


class SettlementSerializer(serializers.ModelSerializer):
    payer = UserSerializer(read_only=True)
    payee = UserSerializer(read_only=True)

    class Meta:
        model = Settlement
        fields = ("id", "household", "payer", "payee", "amount", "note", "settled_at")


class SettleUpSerializer(serializers.Serializer):
    creditor_id = serializers.IntegerField()
    amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, allow_null=True
    )
    note = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_amount(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Settle an amount greater than zero.")
        return value
