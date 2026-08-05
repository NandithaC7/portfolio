from django.urls import include, path
from rest_framework.routers import DefaultRouter

from stocks.views import HouseholdBalancesView, HouseholdSummaryView

from .views import HouseholdViewSet, join_household, promote_member

router = DefaultRouter()
router.register("", HouseholdViewSet, basename="household")

urlpatterns = [
    path("join/<str:invite_code>/", join_household, name="household-join"),
    path("<int:pk>/balances/", HouseholdBalancesView.as_view(), name="household-balances"),
    path("<int:pk>/summary/", HouseholdSummaryView.as_view(), name="household-summary"),
    path(
        "<int:pk>/members/<int:membership_id>/promote/",
        promote_member,
        name="household-promote",
    ),
    path("", include(router.urls)),
]
