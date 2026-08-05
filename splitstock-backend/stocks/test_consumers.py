from decimal import Decimal

from channels.db import database_sync_to_async
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase, override_settings
from rest_framework_simplejwt.tokens import RefreshToken

from households.models import Household, Membership
from stocks.broadcast import broadcast_stock_update
from stocks.middleware import JWTAuthMiddlewareStack
from stocks.models import Stock
from stocks.routing import websocket_urlpatterns

User = get_user_model()

application = JWTAuthMiddlewareStack(URLRouter(websocket_urlpatterns))


@override_settings(
    CHANNEL_LAYERS={"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}
)
class HouseholdConsumerTests(TransactionTestCase):
    def setUp(self):
        self.member = User.objects.create_user(
            username="member", email="m@test.local", password="a-strong-passphrase-42"
        )
        self.outsider = User.objects.create_user(
            username="outsider", email="o@test.local", password="a-strong-passphrase-42"
        )
        self.household = Household.objects.create(name="Willow", created_by=self.member)
        self.stock = Stock.objects.create(
            household=self.household,
            name="Cooking Oil",
            unit="ml",
            quantity=Decimal("1000"),
            current_quantity=Decimal("800"),
            total_cost=Decimal("300"),
            purchased_by=self.member,
        )

    def token_for(self, user):
        return str(RefreshToken.for_user(user).access_token)

    def connect_as(self, user=None):
        url = f"/ws/households/{self.household.id}/"
        if user is not None:
            url += f"?token={self.token_for(user)}"
        return WebsocketCommunicator(application, url)

    async def test_member_connects_and_gets_a_hello(self):
        communicator = self.connect_as(self.member)
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        hello = await communicator.receive_json_from()
        self.assertEqual(hello["type"], "connected")
        self.assertEqual(hello["household_id"], self.household.id)
        await communicator.disconnect()

    async def test_anonymous_connection_is_closed(self):
        communicator = self.connect_as(None)
        connected, code = await communicator.connect()
        self.assertFalse(connected)
        self.assertEqual(code, 4001)

    async def test_non_member_is_closed_with_a_distinct_code(self):
        """4003 tells the client to stop retrying — this can never succeed."""
        communicator = self.connect_as(self.outsider)
        connected, code = await communicator.connect()
        self.assertFalse(connected)
        self.assertEqual(code, 4003)

    async def test_stock_update_is_pushed_to_the_group(self):
        communicator = self.connect_as(self.member)
        await communicator.connect()
        await communicator.receive_json_from()  # the hello frame

        await database_sync_to_async(broadcast_stock_update)(
            self.stock, logged_by="Theo Almeida", logged_by_id=99, quantity_used=25
        )

        message = await communicator.receive_json_from()
        self.assertEqual(message["type"], "stock_updated")
        self.assertEqual(message["stock_id"], self.stock.id)
        self.assertEqual(message["stock_name"], "Cooking Oil")
        self.assertEqual(message["current_quantity"], 800.0)
        self.assertEqual(message["logged_by"], "Theo Almeida")
        self.assertEqual(message["logged_by_id"], 99)
        await communicator.disconnect()

    async def test_ping_is_answered(self):
        communicator = self.connect_as(self.member)
        await communicator.connect()
        await communicator.receive_json_from()

        await communicator.send_json_to({"type": "ping"})
        self.assertEqual((await communicator.receive_json_from())["type"], "pong")
        await communicator.disconnect()
