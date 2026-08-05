import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { readError } from "../api/client";
import { households as householdApi, stocks as stockApi } from "../api/endpoints";
import JarCard from "../components/JarCard";
import Modal from "../components/Modal";
import UsageForm from "../components/UsageForm";
import { Icon } from "../components/Icons";
import { icons } from "../lib/pantryIcons";
import { useAuthStore } from "../store/authStore";
import { toast } from "../store/toastStore";
import AddStockForm from "../components/AddStockForm";

const SORTS = [
  { key: "urgency", label: "Running out first" },
  { key: "name", label: "A–Z" },
  { key: "recent", label: "Newest" },
];

export default function Dashboard({ lastEvent }) {
  const household = useAuthStore((state) => state.currentHousehold());
  const householdId = household?.id;

  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("urgency");
  const [usageTarget, setUsageTarget] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [flashed, setFlashed] = useState(null);

  const load = useCallback(async () => {
    if (!householdId) {
      setStocks([]);
      setLoading(false);
      return;
    }
    try {
      setError("");
      const [list, head] = await Promise.all([
        stockApi.list(householdId),
        householdApi.summary(householdId),
      ]);
      setStocks(list);
      setSummary(head);
    } catch (err) {
      setError(readError(err, "Couldn't load the shelf."));
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // A flatmate logging usage elsewhere should move this shelf without a refresh.
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === "stock_updated") {
      setStocks((prev) =>
        prev.map((stock) =>
          stock.id === lastEvent.stock_id
            ? {
                ...stock,
                current_quantity: lastEvent.current_quantity,
                percent_remaining:
                  Number(stock.quantity) > 0
                    ? (lastEvent.current_quantity / Number(stock.quantity)) * 100
                    : 0,
                days_until_empty: lastEvent.days_until_empty ?? stock.days_until_empty,
              }
            : stock
        )
      );
      setFlashed(lastEvent.stock_id);
      setTimeout(() => setFlashed(null), 900);
    }
    if (lastEvent.type === "stock_created") {
      load();
    }
  }, [lastEvent, load]);

  const sorted = useMemo(() => {
    const copy = [...stocks];
    if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "recent")
      return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return copy.sort((a, b) => {
      const left = a.days_until_empty ?? Number.POSITIVE_INFINITY;
      const right = b.days_until_empty ?? Number.POSITIVE_INFINITY;
      if (left === right) return a.percent_remaining - b.percent_remaining;
      return left - right;
    });
  }, [stocks, sort]);

  function onLogged(result) {
    setStocks((prev) =>
      prev.map((stock) => (stock.id === result.stock.id ? result.stock : stock))
    );
    householdApi.summary(householdId).then(setSummary).catch(() => {});
    toast.done(
      `${result.usage_log.quantity_used}${result.stock.unit} of ${result.stock.name}`,
      "Logged. Your share is on the balance sheet."
    );
  }

  if (!householdId) {
    return (
      <div className="stack-5">
        <h1 className="page-title">No household yet</h1>
        <div className="empty">
          <p className="empty__title">Start with a household</p>
          <p className="empty__body">
            SplitStock works around a shared shelf. Create one for your flat, or
            join the one your flatmates already set up.
          </p>
          <Link to="/household/start" className="btn btn--primary">
            Create or join a household
          </Link>
        </div>
      </div>
    );
  }

  const lowCount = summary?.low_stock_count ?? 0;
  const net = Number(summary?.balance?.net ?? 0);

  return (
    <div className="stack-6">
      <div className="page-head">
        <div className="stack-2">
          <h1 className="page-title">{household.name}</h1>
          <p className="page-sub">
            {loading
              ? "Reading the shelf…"
              : lowCount > 0
                ? `${lowCount} item${lowCount === 1 ? "" : "s"} running low. Everything else has room.`
                : "Nothing is running low. The shelf is in good shape."}
          </p>
        </div>

        <div className="row">
          <select
            className="select"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort the shelf"
            style={{ width: "auto" }}
          >
            {SORTS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setAddOpen(true)}
          >
            <Icon as={icons.Plus} size={16} />
            Add an item
          </button>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <p className="stat__value">{summary?.active_stock_count ?? "—"}</p>
          <p className="stat__label">items on the shelf</p>
        </div>
        <div className="stat stat--paper">
          <p
            className="stat__value"
            style={{ color: lowCount > 0 ? "var(--brick)" : "var(--moss)" }}
          >
            {lowCount}
          </p>
          <p className="stat__label">running low</p>
        </div>
        <div className="stat">
          <p className="stat__value">
            ₹{Number(summary?.total_invested ?? 0).toFixed(2)}
          </p>
          <p className="stat__label">pooled into this shelf</p>
        </div>
        <Link to="/balances" className="stat stat--paper" style={{ display: "block" }}>
          <p
            className="stat__value"
            style={{ color: net >= 0 ? "var(--moss)" : "var(--brick)" }}
          >
            {net >= 0 ? "+" : "−"}₹{Math.abs(net).toFixed(2)}
          </p>
          <p className="stat__label">
            {net >= 0 ? "you're owed" : "you owe"} · see the board
          </p>
        </Link>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <div className="shelf">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`jar-label ${index % 2 === 1 ? "jar-label--paper" : ""}`}
              style={{ cursor: "default", height: 104 }}
            >
              <div className="skeleton-line" style={{ height: 72, width: 56 }} />
              <div className="stack-2" style={{ width: "100%" }}>
                <div className="skeleton-line" style={{ width: "38%" }} />
                <div className="skeleton-line" style={{ width: "58%", height: 9 }} />
              </div>
              <div />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="empty">
          <p className="empty__title">The shelf is empty</p>
          <p className="empty__body">
            No stock yet — add the first item your household shares. Cooking oil
            is usually the one nobody tracks.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setAddOpen(true)}
          >
            <Icon as={icons.Plus} size={16} />
            Add the first item
          </button>
        </div>
      ) : (
        <div className="shelf">
          {sorted.map((stock, index) => (
            <JarCard
              key={stock.id}
              stock={stock}
              index={index}
              onLogUsage={setUsageTarget}
              justUpdated={flashed === stock.id}
            />
          ))}
        </div>
      )}

      <UsageForm
        open={Boolean(usageTarget)}
        stock={usageTarget}
        onClose={() => setUsageTarget(null)}
        onLogged={onLogged}
      />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add an item to the shelf"
        subtitle="Log what you bought and what it cost. Everyone's usage gets split against it."
      >
        <AddStockForm
          householdId={householdId}
          onClose={() => setAddOpen(false)}
          onCreated={(stock) => {
            setStocks((prev) => [stock, ...prev]);
            setAddOpen(false);
            householdApi.summary(householdId).then(setSummary).catch(() => {});
            toast.done(stock.name, "Added to the shelf.");
          }}
        />
      </Modal>
    </div>
  );
}
