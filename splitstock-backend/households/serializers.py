from rest_framework import serializers

from users.serializers import UserSerializer

from .models import Household, Membership


class MembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ("id", "user", "role", "joined_at")


class HouseholdSerializer(serializers.ModelSerializer):
    members = MembershipSerializer(source="memberships", many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    my_role = serializers.SerializerMethodField()
    invite_code = serializers.CharField(read_only=True)

    class Meta:
        model = Household
        fields = (
            "id",
            "name",
            "invite_code",
            "created_at",
            "created_by",
            "members",
            "member_count",
            "my_role",
        )
        read_only_fields = ("id", "created_at", "created_by")

    def get_member_count(self, obj):
        return obj.memberships.count()

    def get_my_role(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        membership = next(
            (m for m in obj.memberships.all() if m.user_id == request.user.id), None
        )
        return membership.role if membership else None


class HouseholdSummarySerializer(serializers.ModelSerializer):
    """Lean payload for the household switcher in the frontend header."""

    member_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Household
        fields = ("id", "name", "invite_code", "member_count")
