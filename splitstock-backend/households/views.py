from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import Household, Membership
from .permissions import IsHouseholdMember, is_admin
from .serializers import HouseholdSerializer, MembershipSerializer


class HouseholdViewSet(viewsets.ModelViewSet):
    serializer_class = HouseholdSerializer
    permission_classes = [IsHouseholdMember]

    def get_queryset(self):
        return (
            Household.objects.filter(memberships__user=self.request.user)
            .prefetch_related("memberships__user")
            .distinct()
        )

    def perform_create(self, serializer):
        # The post_save signal on Household promotes the creator to ADMIN.
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="regenerate-invite")
    def regenerate_invite(self, request, pk=None):
        household = self.get_object()
        if not is_admin(request.user, household.id):
            return Response(
                {"detail": "Only a household admin can reset the invite code."},
                status=status.HTTP_403_FORBIDDEN,
            )
        code = household.regenerate_invite_code()
        return Response({"invite_code": code})

    @action(detail=True, methods=["get"])
    def members(self, request, pk=None):
        household = self.get_object()
        memberships = household.memberships.select_related("user")
        return Response(MembershipSerializer(memberships, many=True).data)

    @action(detail=True, methods=["post"])
    def leave(self, request, pk=None):
        household = self.get_object()
        membership = get_object_or_404(
            Membership, household=household, user=request.user
        )
        admin_count = household.memberships.filter(
            role=Membership.Role.ADMIN
        ).count()
        if membership.is_admin and admin_count == 1:
            return Response(
                {
                    "detail": "You're the only admin — promote someone else "
                    "before you leave."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST"])
def join_household(request, invite_code):
    """GET previews the household behind a code, POST actually joins it."""
    household = Household.objects.filter(
        invite_code__iexact=invite_code.strip()
    ).first()
    if household is None:
        return Response(
            {"detail": f"No household matches the code {invite_code.upper()}."},
            status=status.HTTP_404_NOT_FOUND,
        )

    already_member = Membership.objects.filter(
        household=household, user=request.user
    ).exists()

    if request.method == "GET":
        return Response(
            {
                "id": household.id,
                "name": household.name,
                "member_count": household.memberships.count(),
                "already_member": already_member,
            }
        )

    if already_member:
        return Response(
            HouseholdSerializer(household, context={"request": request}).data
        )

    with transaction.atomic():
        Membership.objects.create(
            user=request.user, household=household, role=Membership.Role.MEMBER
        )

    household.refresh_from_db()
    return Response(
        HouseholdSerializer(household, context={"request": request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsHouseholdMember])
def promote_member(request, pk, membership_id):
    household = get_object_or_404(Household, pk=pk)
    if not is_admin(request.user, household.id):
        return Response(
            {"detail": "Only a household admin can change roles."},
            status=status.HTTP_403_FORBIDDEN,
        )
    membership = get_object_or_404(Membership, pk=membership_id, household=household)
    membership.role = Membership.Role.ADMIN
    membership.save(update_fields=["role"])
    return Response(MembershipSerializer(membership).data)
