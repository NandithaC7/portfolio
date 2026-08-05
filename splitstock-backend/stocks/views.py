from decimal import Decimal

from django.db import transaction
from django.db.models import Count, Sum
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from households.models import Household, Membership
from households.permissions import IsHouseholdMember, is_member
from ml.predictor import predict_depletion, usage_history_series

from .broadcast import (
    broadcast_balance_update,
    broadcast_stock_created,
    broadcast_stock_update,
)
from .models import Balance, RestockSuggestion, Settlement, Stock, UsageLog
from .serializers import (
    BalanceSerializer,
    SettleUpSerializer,
    SettlementSerializer,
    StockSerializer,
    UsageLogSerializer,
)
from .services import recalculate_balance_for_stock, settle_up, user_balance_summary


def _member_household_ids(user):
    return Membership.objects.filter(user=user).values_list("household_id", flat=True)


class StockViewSet(viewsets.ModelViewSet):
    serializer_class = StockSerializer
    permission_classes = [IsHouseholdMember]

    def get_queryset(self):
        queryset = (
            Stock.objects.filter(household_id__in=_member_household_ids(self.request.user))
            .select_related("purchased_by", "household", "restock_suggestion")
            .annotate(usage_log_count_annotated=Count("usage_logs"))
        )
        household_id = self.request.query_params.get("household")
        if household_id:
            queryset = queryset.filter(household_id=household_id)
        active = self.request.query_params.get("is_active")
        if active is not None:
            queryset = queryset.filter(is_active=active.lower() in {"1", "true", "yes"})
        return queryset

    def perform_create(self, serializer):
        stock = serializer.save()
        transaction.on_commit(lambda: broadcast_stock_created(stock))

    def perform_update(self, serializer):
        stock = serializer.save()
        transaction.on_commit(lambda: broadcast_stock_update(stock))

    @action(detail=True, methods=["get"], url_path="usage")
    def usage(self, request, pk=None):
        stock = self.get_object()
        logs = stock.usage_logs.select_related("used_by")[:100]
        return Response(UsageLogSerializer(logs, many=True).data)

    @action(detail=True, methods=["get"], url_path="history")
    def history(self, request, pk=None):
        """Daily usage trail for the StockDetail chart."""
        stock = self.get_object()
        window = int(request.query_params.get("days", 30))
        return Response(
            {
                "stock_id": stock.id,
                "unit": stock.unit,
                "series": usage_history_series(stock, window_days=window),
            }
        )

    @action(detail=True, methods=["get", "post"], url_path="prediction")
    def prediction(self, request, pk=None):
        """GET reads the stored prediction; POST recomputes it on demand."""
        stock = self.get_object()
        if request.method == "POST":
            from .tasks import apply_prediction

            prediction = apply_prediction(stock)
            return Response(prediction.as_dict())
        return Response(predict_depletion(stock).as_dict())

    @action(detail=True, methods=["get"], url_path="split")
    def split(self, request, pk=None):
        """Who has used how much of this item, and what that costs them."""
        stock = self.get_object()
        rows = (
            stock.usage_logs.values(
                "used_by", "used_by__username", "used_by__first_name", "used_by__last_name"
            )
            .annotate(total=Sum("quantity_used"))
            .order_by("-total")
        )
        total_used = sum((row["total"] for row in rows), Decimal("0"))
        cost_per_unit = (
            Decimal(stock.total_cost) / total_used if total_used > 0 else Decimal("0")
        )
        return Response(
            {
                "total_used": total_used,
                "cost_per_unit": round(cost_per_unit, 4),
                "buyer_id": stock.purchased_by_id,
                "rows": [
                    {
                        "user_id": row["used_by"],
                        "username": row["used_by__username"],
                        "name": (
                            f"{row['used_by__first_name']} {row['used_by__last_name']}".strip()
                            or row["used_by__username"]
                        ),
                        "quantity_used": row["total"],
                        "share": round(Decimal(row["total"]) * cost_per_unit, 2),
                        "is_buyer": row["used_by"] == stock.purchased_by_id,
                    }
                    for row in rows
                ],
            }
        )


class UsageLogViewSet(viewsets.ModelViewSet):
    """Usage logs are append-only — creating one is the app's central write."""

    serializer_class = UsageLogSerializer
    permission_classes = [IsHouseholdMember]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        queryset = UsageLog.objects.filter(
            stock__household_id__in=_member_household_ids(self.request.user)
        ).select_related("used_by", "stock")
        stock_id = self.request.query_params.get("stock")
        if stock_id:
            queryset = queryset.filter(stock_id=stock_id)
        household_id = self.request.query_params.get("household")
        if household_id:
            queryset = queryset.filter(stock__household_id=household_id)
        if self.request.query_params.get("mine") in {"1", "true", "yes"}:
            queryset = queryset.filter(used_by=self.request.user)
        return queryset[:200]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            stock = (
                Stock.objects.select_for_update()
                .get(pk=serializer.validated_data["stock"].pk)
            )
            quantity_used = serializer.validated_data["quantity_used"]

            # Re-check under the row lock: two flatmates can log at once.
            if quantity_used > stock.current_quantity:
                return Response(
                    {
                        "quantity_used": [
                            f"Can't log {quantity_used}{stock.unit} — only "
                            f"{stock.current_quantity}{stock.unit} of {stock.name} left."
                        ]
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            usage_log = UsageLog.objects.create(
                stock=stock, used_by=request.user, quantity_used=quantity_used
            )
            stock.current_quantity = stock.current_quantity - quantity_used
            stock.save(update_fields=["current_quantity", "updated_at"])

            recalculate_balance_for_stock(stock)

            logged_by = request.user.display_name
            logged_by_id = request.user.id
            household_id = stock.household_id
            transaction.on_commit(
                lambda: (
                    broadcast_stock_update(
                        stock,
                        logged_by=logged_by,
                        logged_by_id=logged_by_id,
                        quantity_used=quantity_used,
                    ),
                    broadcast_balance_update(household_id),
                )
            )

        stock.refresh_from_db()
        return Response(
            {
                "usage_log": UsageLogSerializer(usage_log).data,
                "stock": StockSerializer(stock, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class HouseholdBalancesView(APIView):
    """The corkboard payload: nodes, edges, and the current user's net position."""

    permission_classes = [IsHouseholdMember]

    def get(self, request, pk):
        household = get_object_or_404(Household, pk=pk)
        if not is_member(request.user, household.id):
            return Response(
                {"detail": "You're not a member of that household."},
                status=status.HTTP_403_FORBIDDEN,
            )

        balances = Balance.objects.filter(household=household).select_related(
            "debtor", "creditor"
        )
        members = Membership.objects.filter(household=household).select_related("user")

        return Response(
            {
                "household": {"id": household.id, "name": household.name},
                "members": [
                    {
                        "id": m.user.id,
                        "name": m.user.display_name,
                        "initials": m.user.initials,
                        "role": m.role,
                    }
                    for m in members
                ],
                "balances": BalanceSerializer(balances, many=True).data,
                "summary": user_balance_summary(household.id, request.user.id),
                "settlements": SettlementSerializer(
                    Settlement.objects.filter(household=household).select_related(
                        "payer", "payee"
                    )[:20],
                    many=True,
                ).data,
            }
        )

    def post(self, request, pk):
        """Settle up with another member."""
        household = get_object_or_404(Household, pk=pk)
        if not is_member(request.user, household.id):
            return Response(
                {"detail": "You're not a member of that household."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = SettleUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        creditor_id = serializer.validated_data["creditor_id"]

        if not is_member_id(creditor_id, household.id):
            return Response(
                {"creditor_id": ["That person isn't in this household."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = settle_up(
            household.id,
            request.user.id,
            creditor_id,
            amount=serializer.validated_data.get("amount"),
            note=serializer.validated_data.get("note", ""),
        )
        if result is None:
            return Response(
                {"detail": "There's nothing outstanding to settle with them."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        broadcast_balance_update(household.id)
        return Response(
            {
                "paid": result["paid"],
                "remaining": result["remaining"],
                "summary": user_balance_summary(household.id, request.user.id),
            }
        )


def is_member_id(user_id, household_id):
    return Membership.objects.filter(
        user_id=user_id, household_id=household_id
    ).exists()


class HouseholdSummaryView(APIView):
    """Dashboard header numbers: stock count, low count, and my net position."""

    permission_classes = [IsHouseholdMember]

    def get(self, request, pk):
        household = get_object_or_404(Household, pk=pk)
        if not is_member(request.user, household.id):
            return Response(
                {"detail": "You're not a member of that household."},
                status=status.HTTP_403_FORBIDDEN,
            )

        stocks = Stock.objects.filter(household=household, is_active=True)
        low = [s for s in stocks if s.is_low]
        return Response(
            {
                "household": {"id": household.id, "name": household.name},
                "active_stock_count": stocks.count(),
                "low_stock_count": len(low),
                "member_count": household.memberships.count(),
                "total_invested": stocks.aggregate(total=Sum("total_cost"))["total"]
                or Decimal("0"),
                "balance": user_balance_summary(household.id, request.user.id),
            }
        )


class MyUsageView(ListAPIView):
    """Profile page: everything the current user has taken, newest first."""

    serializer_class = UsageLogSerializer

    def get_queryset(self):
        queryset = UsageLog.objects.filter(used_by=self.request.user).select_related(
            "stock", "used_by"
        )
        household_id = self.request.query_params.get("household")
        if household_id:
            queryset = queryset.filter(stock__household_id=household_id)
        return queryset[:200]


class MyContributionsView(APIView):
    """Profile page: what the user has bought for the house, and what it cost."""

    def get(self, request):
        household_id = request.query_params.get("household")
        stocks = Stock.objects.filter(purchased_by=request.user)
        logs = UsageLog.objects.filter(used_by=request.user)
        if household_id:
            stocks = stocks.filter(household_id=household_id)
            logs = logs.filter(stock__household_id=household_id)

        return Response(
            {
                "items_bought": stocks.count(),
                "total_spent": stocks.aggregate(total=Sum("total_cost"))["total"]
                or Decimal("0"),
                "usage_events": logs.count(),
                "stocks": StockSerializer(
                    stocks.select_related("purchased_by")[:50],
                    many=True,
                    context={"request": request},
                ).data,
            }
        )


class RestockSuggestionListView(ListAPIView):
    """Everything the nightly job thinks the household should rebuy."""

    permission_classes = [IsHouseholdMember]
    serializer_class = StockSerializer

    def get_queryset(self):
        household_ids = _member_household_ids(self.request.user)
        queryset = Stock.objects.filter(
            household_id__in=household_ids,
            is_active=True,
            restock_suggestion__isnull=False,
        ).select_related("restock_suggestion", "purchased_by")
        household_id = self.request.query_params.get("household")
        if household_id:
            queryset = queryset.filter(household_id=household_id)
        return queryset.order_by("days_until_empty")


__all__ = [
    "StockViewSet",
    "UsageLogViewSet",
    "HouseholdBalancesView",
    "HouseholdSummaryView",
    "MyUsageView",
    "MyContributionsView",
    "RestockSuggestionListView",
    "RestockSuggestion",
]
