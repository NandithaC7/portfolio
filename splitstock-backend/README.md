# SplitStock — backend

Django + DRF + Channels + Celery API for the shared-household inventory
platform.

## Running it locally

You need PostgreSQL and Redis. Redis is not optional: it backs both the
WebSocket channel layer and the Celery broker.

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

createdb splitstock                     # or use the values in .env
python manage.py migrate
python manage.py seed_demo              # optional, see below
python manage.py runserver              # ASGI, so WebSockets work
```

Confirm Redis first — everything real-time depends on it:

```bash
redis-cli ping   # -> PONG
```

Background jobs need two more processes:

```bash
celery -A config worker -l info
celery -A config beat -l info
```

### Demo data

`python manage.py seed_demo --reset` creates a four-person flatshare with three
weeks of usage history, a settled ledger, and a shelf deliberately spread
across every depletion state (one item a day from empty, one at 26 days) so the
dashboard exercises all three ring colours. Everyone's password is
`splitstock123`.

## Layout

```
config/       settings, URLs, ASGI entrypoint, Celery app
users/        CustomUser (AbstractUser + phone_number), auth endpoints
households/   Household, Membership, invite/join, IsHouseholdMember
stocks/       Stock, UsageLog, Balance, Settlement, RestockSuggestion
              services.py   the ledger maths
              consumers.py  the household WebSocket
              tasks.py      run_nightly_predictions
ml/           predictor.py — depletion forecasting
notifications/ Twilio WhatsApp wrapper and the alert task
```

## The three data flows

**REST.** A JWT-authenticated request hits DRF, which validates it, reads or
writes through the ORM, and returns JSON. Every household-scoped endpoint is
behind `IsHouseholdMember`.

**WebSocket.** `HouseholdConsumer` holds one connection per member, joined to
the group `household_{id}`. When usage is logged over REST, the view calls
`group_send` from `transaction.on_commit`, so a client reacting instantly can
never read a row that hasn't landed. Connections are authenticated with the
same JWT, passed as a query parameter because browsers can't set headers on a
handshake. Rejections use distinct close codes — 4001 for a bad token, 4003 for
a household you're not in — so the client knows not to retry.

**Background.** Celery Beat fires `run_nightly_predictions` at midnight. The
worker re-forecasts every active stock, writes `predicted_empty_date`, upserts
the `RestockSuggestion`, and queues a WhatsApp alert for anything inside its
alert threshold.

## How the ledger works

Whoever buys an item fronts the money, so everyone else owes them for what they
actually took — not an even split.

`recalculate_balance_for_stock` divides an item's cost by the quantity consumed
so far to get a per-unit price, bills each user for their own usage, then
rebuilds the household's `Balance` rows. Mutual debt is netted down to one row
per pair, so the corkboard never shows two strings between the same people.

Settlements are their own records rather than an edit to a `Balance` row.
Balances are derived from usage history, so a paid debt stored only as a
reduced balance would reappear the next time anyone logged usage.

## How the prediction works

`ml/predictor.py` aggregates the last 14 days of usage into a daily series with
missing days filled with zero — a day nobody cooked is real evidence of slower
usage, and dropping it would bias the average upward. A 7-day rolling mean
gives the daily pace; `current_quantity / pace` gives the runway.

Below three logs it returns nulls rather than a number, and the UI says so.
Confidence is `min(log_count / 20, 1.0)`, and the suggested restock is 30 days
at the current pace.

## Key endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register/` | Create an account, returns JWTs |
| POST | `/api/auth/login/` | Username *or* email, returns JWTs |
| GET/PATCH | `/api/auth/me/` | The current user |
| GET | `/api/households/` | Households you belong to |
| POST | `/api/households/` | Create one (you become ADMIN) |
| GET/POST | `/api/households/join/<code>/` | Preview / join by invite code |
| POST | `/api/households/<id>/regenerate-invite/` | Admin only |
| GET | `/api/households/<id>/balances/` | The corkboard payload |
| POST | `/api/households/<id>/balances/` | Settle up |
| GET | `/api/households/<id>/summary/` | Dashboard header numbers |
| — | `/api/stocks/` | Full CRUD, plus `usage`, `history`, `prediction`, `split` |
| POST | `/api/usage-logs/` | Log usage — the app's central write |
| WS | `/ws/households/<id>/?token=<jwt>` | Live stock and balance updates |

## Tests

```bash
USE_INMEMORY_CHANNEL_LAYER=1 python manage.py test
```

35 tests covering the ledger maths (including settlement durability and debt
netting), the prediction edges, household isolation, and the WebSocket
consumer's auth behaviour.

## Deploying to Railway

Add PostgreSQL and Redis plugins, then deploy this directory. `railway.json`
handles the web service; add a second service from the same repo with the
start command from the `Procfile`'s `worker` line, and a third for `beat` if
you want the nightly forecast to fire.

Required variables:

```
DJANGO_SECRET_KEY     a real secret — the app refuses to boot without one when DEBUG is off
DJANGO_DEBUG          false
DJANGO_ALLOWED_HOSTS  your-api.up.railway.app
CORS_ALLOWED_ORIGINS  https://your-frontend.vercel.app
DATABASE_URL          provided by the Postgres plugin
REDIS_URL             provided by the Redis plugin
TWILIO_ACCOUNT_SID    optional — alerts are logged instead of sent without it
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_FROM
```
