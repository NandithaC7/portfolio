import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(name="notifications.send_restock_alert")
def send_restock_alert(stock_id, days_left=None, suggested_quantity=None):
    """Message every member of the household that a shared item is running out."""
    from households.models import Membership
    from stocks.models import Stock

    from .whatsapp import format_restock_message, send_whatsapp

    stock = Stock.objects.filter(id=stock_id).select_related("household").first()
    if stock is None:
        logger.warning("Restock alert skipped — stock %s no longer exists.", stock_id)
        return {"sent": 0, "reason": "stock_missing"}

    body = format_restock_message(stock, days_left, suggested_quantity)
    recipients = Membership.objects.filter(
        household_id=stock.household_id
    ).select_related("user")

    results = []
    for membership in recipients:
        results.append(send_whatsapp(membership.user.phone_number, body))

    sent = sum(1 for r in results if r.get("sent"))
    logger.info("Restock alert for %s: %s/%s delivered.", stock.name, sent, len(results))
    return {"sent": sent, "attempted": len(results)}
