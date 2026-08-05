import secrets

from django.conf import settings
from django.db import models

INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no ambiguous 0/O/1/I


def generate_invite_code(length=8):
    return "".join(secrets.choice(INVITE_ALPHABET) for _ in range(length))


class Household(models.Model):
    name = models.CharField(max_length=120)
    invite_code = models.CharField(max_length=12, unique=True, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="households_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "households"
        ordering = ("-created_at",)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.invite_code:
            self.invite_code = self.new_invite_code()
        super().save(*args, **kwargs)

    @classmethod
    def new_invite_code(cls):
        while True:
            code = generate_invite_code()
            if not cls.objects.filter(invite_code=code).exists():
                return code

    def regenerate_invite_code(self):
        self.invite_code = self.new_invite_code()
        self.save(update_fields=["invite_code"])
        return self.invite_code


class Membership(models.Model):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        MEMBER = "MEMBER", "Member"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memberships"
    )
    household = models.ForeignKey(
        Household, on_delete=models.CASCADE, related_name="memberships"
    )
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "memberships"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "household"], name="unique_membership_per_household"
            )
        ]
        indexes = [models.Index(fields=["household", "role"])]
        ordering = ("joined_at",)

    def __str__(self):
        return f"{self.user} @ {self.household} ({self.role})"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
