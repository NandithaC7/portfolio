# SplitStock

A shared-household inventory and smart-restock platform. Flatmates pool money
to buy in bulk, log usage as they consume, and the app keeps a running
cost-per-head balance while a small model predicts when each item will run out.

It exists to solve three things that go wrong in every flatshare:

- **The cooking oil problem.** One person buys it, everyone uses it for months,
  nobody tracks who owes what.
- **The empty fridge problem.** You run out of something at the worst possible
  time because nobody noticed it depleting.
- **The WhatsApp chaos problem.** Expense tracking dies in a message thread.

```
splitstock-backend/    Django + DRF + Channels + Celery + PostgreSQL
splitstock-frontend/   React (Vite) + D3 + Framer Motion + Zustand
```

Each directory has its own README with setup, architecture and deploy notes.

## Running the whole thing

Four processes, plus PostgreSQL and Redis.

```bash
# 1 — backend
cd splitstock-backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_demo        # a four-person flat with three weeks of history
python manage.py runserver        # http://127.0.0.1:8000

# 2 — Celery worker
celery -A config worker -l info

# 3 — Celery beat (nightly forecasting)
celery -A config beat -l info

# 4 — frontend
cd splitstock-frontend
npm install
npm run dev                       # http://localhost:5173
```

Sign in as `maya` / `splitstock123`. Every seeded member shares that password.

To see the live updates, open a second browser window signed in as `theo` and
log usage in one — the other window's jar drains without a refresh.

## How it fits together

Three data flows, kept distinct:

**REST** — the browser sends a JWT-authenticated request, DRF validates it, the
ORM reads or writes PostgreSQL, JSON comes back.

**WebSocket** — a Channels consumer holds one connection per household. When
usage saves over REST, the view broadcasts the new stock level to that
household's group after the transaction commits, and the React client animates
the jar down without a refresh.

**Background** — Celery Beat fires `run_nightly_predictions` at midnight. The
worker re-forecasts every active stock, writes the predicted empty date, and
queues WhatsApp alerts for anything inside its threshold.

## Data model

| Table | What it holds |
| --- | --- |
| `users` | Django's user plus `phone_number` |
| `households` | The flat, and its invite code |
| `memberships` | Users ↔ households, with an admin/member role |
| `stocks` | Shared items: quantity, current quantity, cost, buyer, prediction |
| `usage_logs` | Immutable record of who took how much, when |
| `balances` | Denormalised ledger, rebuilt on every usage event |
| `settlements` | Payments, so a settled debt can't be resurrected by a rebuild |
| `restock_suggestions` | The model's output per stock |

Indexed on `usage_logs(stock, logged_at)` and `usage_logs(used_by, logged_at)`
for the model and the profile view, `stocks(household, is_active)` for the
dashboard, and `balances(household, debtor)` for the balance sheet.

## Design

The interface is grounded in the product's actual subject — a shared pantry, so
jars, labels, a shelf, a receipt — rather than a generic dashboard.

The palette is seven warm colours and nothing else: Milk, Paper, Yolk, Yolk
Dim, Ink, Moss, Brick. There is no `box-shadow` anywhere in the codebase;
elevation comes from alternating Milk and Paper panels behind hairline Ink
borders. Fraunces sets page titles and the two numbers that matter most, Work
Sans carries the UI, and IBM Plex Mono carries every quantity, price and date —
that last rule is what gives the app its ledger texture.

Three components carry the identity:

- **StockBar** — a jar silhouette whose Yolk fill has a soft meniscus curve at
  its surface, animated over 600ms with a D3 `attrTween` so the curve travels
  with the liquid.
- **DepletionRing** — an SVG countdown, Moss past a week, Yolk Dim inside the
  week, Brick at three days or fewer.
- **DebtGraph** — the balance sheet as a corkboard: member initials pinned in
  circles, joined by sagging string, with a luggage tag at each midpoint
  carrying the amount.

Motion throughout is liquid settling: cubic easing, 150–200ms on hover,
500–600ms on the jar and ring. No springs, no bounce, no glow.

## Tests

```bash
cd splitstock-backend && USE_INMEMORY_CHANNEL_LAYER=1 python manage.py test
cd splitstock-frontend && npm run lint && npm run build
```
