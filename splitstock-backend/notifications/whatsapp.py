"""Thin Twilio wrapper.

Without credentials configured this logs the message instead of sending it, so
local development and CI never need a Twilio account.
"""

import logging

from django.conf import settings

logger = logging.getLogger(__name__)


class WhatsAppNotConfigured(RuntimeError):
    pass


def _client():
    if not (settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN):
        raise WhatsAppNotConfigured("Twilio credentials are not set.")
    from twilio.rest import Client

    return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


def _normalise(number):
    number = (number or "").strip()
    if not number:
        return ""
    if number.startswith("whatsapp:"):
        return number
    return f"whatsapp:{number}"


def send_whatsapp(to_number, body):
    to = _normalise(to_number)
    if not to:
        logger.warning("Skipping WhatsApp send — recipient has no phone number.")
        return {"sent": False, "reason": "no_phone_number"}

    try:
        client = _client()
    except WhatsAppNotConfigured:
        logger.info("[whatsapp:dry-run] to=%s body=%s", to, body)
        return {"sent": False, "reason": "not_configured", "body": body}

    message = client.messages.create(
        from_=_normalise(settings.TWILIO_WHATSAPP_FROM), to=to, body=body
    )
    return {"sent": True, "sid": message.sid}


def format_restock_message(stock, days_left, suggested_quantity=None):
    name = stock.name
    unit = stock.unit
    lines = [f"SplitStock: {name} is running low."]
    if days_left is not None:
        rounded = int(days_left) if float(days_left).is_integer() else round(days_left, 1)
        lines.append(f"About {rounded} day(s) left at your household's usual pace.")
    lines.append(f"{stock.current_quantity}{unit} left of {stock.quantity}{unit}.")
    if suggested_quantity:
        lines.append(f"Suggested restock: {suggested_quantity}{unit} (about a month).")
    lines.append(f"House: {stock.household.name}")
    return "\n".join(lines)
