"""Authenticate WebSocket connections with the same JWT the REST API uses.

Browsers can't set headers on a WebSocket handshake, so the token comes in as
a query parameter (?token=...) or as a subprotocol.
"""

from urllib.parse import parse_qs

from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


@database_sync_to_async
def get_user_from_token(raw_token):
    from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
    from rest_framework_simplejwt.tokens import AccessToken
    from django.contrib.auth import get_user_model

    try:
        token = AccessToken(raw_token)
    except (InvalidToken, TokenError, Exception):
        return AnonymousUser()

    user_id = token.get("user_id")
    if user_id is None:
        return AnonymousUser()
    return get_user_model().objects.filter(id=user_id).first() or AnonymousUser()


class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        raw_token = None

        query = parse_qs(scope.get("query_string", b"").decode())
        if query.get("token"):
            raw_token = query["token"][0]

        if raw_token is None:
            for name, value in scope.get("headers", []):
                if name == b"authorization" and value.startswith(b"Bearer "):
                    raw_token = value[len(b"Bearer ") :].decode()
                    break

        scope = dict(scope)
        if raw_token:
            scope["user"] = await get_user_from_token(raw_token)
        elif "user" not in scope:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))
