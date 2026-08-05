from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)
    initials = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "display_name",
            "initials",
            "date_joined",
        )
        read_only_fields = ("id", "date_joined")


class RegisterSerializer(serializers.ModelSerializer):
    # Both fields are unique on the model, so DRF attaches a UniqueValidator
    # whose generic message ("custom user with this email already exists")
    # would win before the field-level checks below ever run. Declaring them
    # with an empty validator list hands the wording back to us.
    username = serializers.CharField(validators=[])
    email = serializers.EmailField(validators=[])
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "password",
            "password_confirm",
        )

    def validate_username(self, value):
        value = value.strip()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "That username is taken — pick another one."
            )
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "That email already has an account. Try logging in instead."
            )
        return value.lower()

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "The two passwords don't match."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Accepts either a username or an email in the same field."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs["username"].strip()
        password = attrs["password"]

        username = identifier
        if "@" in identifier:
            match = User.objects.filter(email__iexact=identifier).first()
            if match:
                username = match.username

        user = authenticate(
            request=self.context.get("request"), username=username, password=password
        )
        if user is None:
            raise serializers.ValidationError(
                {"detail": "That username and password don't match an account."}
            )
        if not user.is_active:
            raise serializers.ValidationError({"detail": "This account is deactivated."})

        attrs["user"] = user
        return attrs


def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}
