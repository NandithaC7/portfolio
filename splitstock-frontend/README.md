# SplitStock — frontend

React (Vite) client for the shared-household inventory platform.

## Running it

```bash
npm install
cp .env.example .env.local   # points at the Django dev server by default
npm run dev                  # http://localhost:5173
```

The backend needs to be up at `VITE_API_URL` (default `http://127.0.0.1:8000`).
See `../splitstock-backend/README.md`.

## Layout

```
src/
├── api/          Axios instance (auto-attaches the JWT, refreshes on 401)
├── components/   Design-system components — see the design notes below
├── hooks/        useHouseholdWS (live updates), useBalances
├── lib/          Icon vocabulary and depletion colour rules
├── pages/        One file per route
├── store/        Zustand: auth + current household, and the toast queue
└── styles/       tokens.css (the palette) and base.css (everything else)
```

## Design notes

The visual language is a shared pantry: jars, labels, a shelf, a receipt.

- **Palette is closed.** Seven colours live in `styles/tokens.css` and nothing
  else is used anywhere — no blues, purples, teals, gradients, pure black or
  pure white.
- **There is no `box-shadow` in this codebase.** Elevation comes from
  alternating Milk/Paper panels and 1px hairline Ink borders. If a surface
  needs to lift, it changes background colour.
- **Three typefaces, three jobs.** Fraunces for page titles and the two big
  numbers (the balance figure, the depletion countdown). Work Sans for all UI
  copy. IBM Plex Mono for every quantity, price, date and invite code — that
  consistency is what gives the app its ledger texture.
- **Motion is liquid settling.** 150–200ms on hover, 500–600ms on the jar fill
  and countdown ring, cubic easing throughout. No springs, no bounce, no
  scale-pop, no glow.

### The three signature components

`StockBar.jsx` — a jar silhouette whose Yolk fill carries a soft quadratic
meniscus at its surface. Fill level animates via a D3 `attrTween` on the path,
so the meniscus travels with the liquid rather than the whole shape scaling.

`DepletionRing.jsx` — an SVG `stroke-dashoffset` countdown. Moss past a week,
Yolk Dim inside the week, Brick at three days or fewer.

`DebtGraph.jsx` — the balance sheet as a corkboard. D3 force layout positions
member circles, the simulation is ticked to rest before first paint so nothing
visibly bounces, and each debt hangs as a sagging string with a small
luggage-tag label at its midpoint.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on 5173 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built bundle |
| `npm run lint` | oxlint |
