"""Connect to a household WebSocket, log usage over REST, assert the push arrives.

Usage: python scripts/ws_smoke_test.py [household_id] [stock_id]
"""

import asyncio
import json
import sys
import urllib.request

API = "http://127.0.0.1:8000"
WS = "ws://127.0.0.1:8000"


def post(path, payload, token=None):
    data = json.dumps(payload).encode()
    request = urllib.request.Request(
        f"{API}{path}", data=data, headers={"Content-Type": "application/json"}
    )
    if token:
        request.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read())


async def main():
    household_id = sys.argv[1] if len(sys.argv) > 1 else "1"
    stock_id = int(sys.argv[2]) if len(sys.argv) > 2 else 1

    listener = post("/api/auth/login/", {"username": "maya", "password": "splitstock123"})
    actor = post("/api/auth/login/", {"username": "theo", "password": "splitstock123"})

    import websockets

    url = f"{WS}/ws/households/{household_id}/?token={listener['tokens']['access']}"
    async with websockets.connect(url) as socket:
        hello = json.loads(await asyncio.wait_for(socket.recv(), timeout=5))
        assert hello["type"] == "connected", hello
        print("connected:", hello)

        post(
            "/api/usage-logs/",
            {"stock": stock_id, "quantity_used": 5},
            token=actor["tokens"]["access"],
        )

        seen = []
        try:
            while len(seen) < 2:
                message = json.loads(await asyncio.wait_for(socket.recv(), timeout=5))
                seen.append(message)
                print("received:", message)
        except asyncio.TimeoutError:
            pass

        types = {m["type"] for m in seen}
        assert "stock_updated" in types, f"no stock_updated push, saw {types}"
        print("\nOK — stock_updated pushed to the other connection.")


if __name__ == "__main__":
    asyncio.run(main())
