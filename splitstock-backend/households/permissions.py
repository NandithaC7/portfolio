from rest_framework import permissions

from .models import Membership


def is_member(user, household_id):
    if not user or not user.is_authenticated or household_id is None:
        return False
    return Membership.objects.filter(user=user, household_id=household_id).exists()


def is_admin(user, household_id):
    if not user or not user.is_authenticated or household_id is None:
        return False
    return Membership.objects.filter(
        user=user, household_id=household_id, role=Membership.Role.ADMIN
    ).exists()


class IsHouseholdMember(permissions.BasePermission):
    """Gate every household-scoped endpoint on actual membership.

    Views expose the household id either through `get_household_id()` or via a
    `household` / `household_id` attribute on the object being accessed.
    """

    message = "You're not a member of that household."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        household_id = None
        if hasattr(view, "get_household_id"):
            household_id = view.get_household_id()
        if household_id is None:
            return True  # object-level check below handles it
        return is_member(request.user, household_id)

    def has_object_permission(self, request, view, obj):
        household_id = getattr(obj, "household_id", None)
        if household_id is None and hasattr(obj, "id"):
            household_id = obj.id
        return is_member(request.user, household_id)


class IsHouseholdAdmin(IsHouseholdMember):
    message = "Only a household admin can do that."

    def has_object_permission(self, request, view, obj):
        household_id = getattr(obj, "household_id", None) or getattr(obj, "id", None)
        return is_admin(request.user, household_id)
