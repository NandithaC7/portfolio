from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    MyContributionsView,
    MyUsageView,
    RestockSuggestionListView,
    StockViewSet,
    UsageLogViewSet,
)

router = DefaultRouter()
router.register("stocks", StockViewSet, basename="stock")
router.register("usage-logs", UsageLogViewSet, basename="usage-log")

urlpatterns = [
    path("me/usage/", MyUsageView.as_view(), name="my-usage"),
    path("me/contributions/", MyContributionsView.as_view(), name="my-contributions"),
    path("restock-suggestions/", RestockSuggestionListView.as_view(), name="restock-suggestions"),
    path("", include(router.urls)),
]
