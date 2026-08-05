"""Push state changes to everyone connected to a household group.

Always called after the database transaction commits, so a client that reacts
instantly can't read a row that hasn't landed yet.
"""

import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)


def _send(household_id, payload):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    try:
        async_to_sync(channel_layer.group_send)(f"household_{household_id}", payload)
    except Exception:  # a dead Redis must never fail the HTTP request
        logger.exception("Could not broadcast to household_%s", household_id)


def broadcast_stock_update(stock, logged_by=None, logged_by_id=None, quantity_used=None):
    _send(
        stock.household_id,
        {
            "type": "stock_updated",
            "stock_id": stock.id,
            "stock_name": stock.name,
            "current_quantity": float(stock.current_quantity),
            "quantity": float(stock.quantity),
            "unit": stock.unit,
            "days_until_empty": stock.days_until_empty,
            "logged_by": logged_by,
            # Lets a client tell its own echo apart from a flatmate's action.
            "logged_by_id": logged_by_id,
            "quantity_used": float(quantity_used) if quantity_used is not None else None,
        },
    )


def broadcast_stock_created(stock):
    _send(
        stock.household_id,
        {
            "type": "stock_created",
            "stock_id": stock.id,
            "stock_name": stock.name,
            "current_quantity": float(stock.current_quantity),
            "quantity": float(stock.quantity),
            "unit": stock.unit,
        },
    )


def broadcast_balance_update(household_id):
    _send(household_id, {"type": "balance_updated", "household_id": household_id})


def broadcast_restock_alert(stock, days_left=None, suggested_quantity=None):
    _send(
        stock.household_id,
        {
            "type": "restock_alert",
            "stock_id": stock.id,
            "stock_name": stock.name,
            "unit": stock.unit,
            "current_quantity": float(stock.current_quantity),
            "days_until_empty": days_left,
            "suggested_quantity": (
                float(suggested_quantity) if suggested_quantity is not None else None
            ),
        },
    )
