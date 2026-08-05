from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Django's user, plus the phone number Twilio needs for restock alerts."""

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, default="")

    REQUIRED_FIELDS = ["email"]

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.username

    @property
    def display_name(self):
        full = self.get_full_name().strip()
        return full or self.username

    @property
    def initials(self):
        source = self.get_full_name().strip() or self.username
        parts = [part for part in source.replace("_", " ").split() if part]
        if not parts:
            return "?"
        if len(parts) == 1:
            return parts[0][:2].upper()
        return (parts[0][0] + parts[-1][0]).upper()
