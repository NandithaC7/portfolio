from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Household, Membership


@receiver(post_save, sender=Household)
def make_creator_an_admin(sender, instance, created, **kwargs):
    """Whoever creates the household runs it."""
    if not created or instance.created_by_id is None:
        return
    Membership.objects.get_or_create(
        user_id=instance.created_by_id,
        household=instance,
        defaults={"role": Membership.Role.ADMIN},
    )
