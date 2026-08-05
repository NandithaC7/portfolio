import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer


class HouseholdConsumer(AsyncWebsocketConsumer):
    """One live connection per member, joined to their household's group."""

    async def connect(self):
        user = self.scope.get("user")
        if user is None or not user.is_authenticated:
            await self.close(code=4001)
            return

        self.household_id = self.scope["url_route"]["kwargs"]["household_id"]
        if not await self.is_member(user.id, self.household_id):
            await self.close(code=4003)
            return

        self.group_name = f"household_{self.household_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send(
            text_data=json.dumps(
                {"type": "connected", "household_id": int(self.household_id)}
            )
        )

    async def disconnect(self, code):
        group_name = getattr(self, "group_name", None)
        if group_name:
            await self.channel_layer.group_discard(group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        # Client-to-server traffic is limited to keepalives; all state changes
        # go through REST so they get validated and wrapped in a transaction.
        try:
            payload = json.loads(text_data or "{}")
        except json.JSONDecodeError:
            return
        if payload.get("type") == "ping":
            await self.send(text_data=json.dumps({"type": "pong"}))

    async def stock_updated(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "stock_updated",
                    "stock_id": event["stock_id"],
                    "stock_name": event["stock_name"],
                    "current_quantity": event["current_quantity"],
                    "quantity": event.get("quantity"),
                    "unit": event.get("unit"),
                    "days_until_empty": event.get("days_until_empty"),
                    "logged_by": event.get("logged_by"),
                    "quantity_used": event.get("quantity_used"),
                }
            )
        )

    async def stock_created(self, event):
        await self.send(text_data=json.dumps({**event, "type": "stock_created"}))

    async def balance_updated(self, event):
        await self.send(text_data=json.dumps({**event, "type": "balance_updated"}))

    async def restock_alert(self, event):
        await self.send(text_data=json.dumps({**event, "type": "restock_alert"}))

    @database_sync_to_async
    def is_member(self, user_id, household_id):
        from households.models import Membership

        return Membership.objects.filter(
            user_id=user_id, household_id=household_id
        ).exists()
