import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { readError } from "../api/client";
import { stocks as stockApi } from "../api/endpoints";
import RestockCard from "../components/RestockCard";
import StockBar from "../components/StockBar";
import UsageChart from "../components/UsageChart";
import UsageForm from "../components/UsageForm";
import { Icon } from "../components/Icons";
import { icons, stockGlyph } from "../lib/pantryIcons";
import { useAuthStore } from "../store/authStore";
import { toast } from "../store/toastStore";

function timeAgo(value) {
  const seconds = (Date.now() - new Date(value)) / 1000;
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function StockDetail({ lastEvent }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [stock, setStock] = useState(null);
  const [logs, setLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [split, setSplit] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [usageOpen, setUsageOpen] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      const [detail, usage, trail, breakdown] = await Promise.all([
        stockApi.get(id),
        stockApi.usage(id),
        stockApi.history(id, 30),
        stockApi.split(id),
      ]);
      setStock(detail);
      setLogs(usage);
      setHistory(trail.series);
      setSplit(breakdown);
    } catch (err) {
      setError(readError(err, "Couldn't open that item."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    if (lastEvent?.type === "stock_updated" && lastEvent.stock_id === Number(id)) {
      load();
    }
  }, [lastEvent, id, load]);

  async function recalculate() {
    setRecalculating(true);
    try {
      await stockApi.repredict(id);
      await load();
      toast.info("Forecast updated", "Re-ran the model against the latest usage.");
    } catch (err) {
      setError(readError(err, "Couldn't recalculate the forecast."));
    } finally {
      setRecalculating(false);
    }
  }

  if (loading) {
    return <p className="hint">Opening the jar…</p>;
  }

  if (error && !stock) {
    return (
      <div className="stack-4">
        <p className="form-error">{error}</p>
        <Link to="/" className="btn btn--secondary">
          Back to the shelf
        </Link>
      </div>
    );
  }

  const Glyph = stockGlyph(stock.name, stock.unit);
  const percent = Number(stock.percent_remaining);

  return (
    <div className="stack-6">
      <button type="button" className="btn btn--quiet btn--sm" onClick={() => navigate("/")}>
        <Icon as={icons.ArrowLeft} size={15} />
        Back to the shelf
      </button>

      <div className="page-head">
        <div className="row" style={{ gap: "var(--space-5)" }}>
          <StockBar percent={percent} width={72} height={96} />
          <div className="stack-2">
            <div className="row" style={{ gap: "var(--space-2)" }}>
              <Icon as={Glyph} size={18} color="var(--ink-70)" />
              <h1 className="page-title">{stock.name}</h1>
            </div>
            <p className="page-sub mono">
              {Number(stock.current_quantity).toFixed(2)}
              {stock.unit} left of {Number(stock.quantity).toFixed(2)}
              {stock.unit} · ₹{Number(stock.cost_per_unit).toFixed(4)}/{stock.unit}
            </p>
            <p className="hint">
              Bought by{" "}
              {stock.purchased_by?.id === user?.id
                ? "you"
                : stock.purchased_by?.display_name || "someone"}{" "}
              for ₹{Number(stock.total_cost).toFixed(2)}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setUsageOpen(true)}
        >
          Log usage
        </button>
      </div>

      <div className="split">
        <div className="stack-5">
          <section className="panel stack-4">
            <h2 className="panel-title">How it's been going</h2>
            <UsageChart series={history} unit={stock.unit} />
            <p className="hint">
              The line is what was left; the bars underneath are how much came
              off each day.
            </p>
          </section>

          <section className="panel stack-4">
            <h2 className="panel-title">Who's used it</h2>
            {split?.rows?.length ? (
              <table className="ledger">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th style={{ textAlign: "right" }}>Used</th>
                    <th style={{ textAlign: "right" }}>Their share</th>
                  </tr>
                </thead>
                <tbody>
                  {split.rows.map((row) => (
                    <tr key={row.user_id}>
                      <td>
                        {row.user_id === user?.id ? "You" : row.name}
                        {row.is_buyer && (
                          <span className="chip chip--yolk" style={{ marginLeft: 8 }}>
                            bought it
                          </span>
                        )}
                      </td>
                      <td className="num">
                        {Number(row.quantity_used).toFixed(2)}
                        {stock.unit}
                      </td>
                      <td className="num">
                        {row.is_buyer ? (
                          <span className="muted">—</span>
                        ) : (
                          `₹${Number(row.share).toFixed(2)}`
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="hint">
                Nobody has logged usage yet. The first log starts the split.
              </p>
            )}
          </section>

          <section className="panel stack-4">
            <h2 className="panel-title">Usage log</h2>
            {logs.length ? (
              <table className="ledger">
                <thead>
                  <tr>
                    <th>Who</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th style={{ textAlign: "right" }}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        {log.used_by.id === user?.id ? "You" : log.used_by.display_name}
                      </td>
                      <td className="num">
                        {Number(log.quantity_used).toFixed(2)}
                        {stock.unit}
                      </td>
                      <td className="num muted">{timeAgo(log.logged_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="hint">Nothing logged against this item yet.</p>
            )}
          </section>
        </div>

        <div className="stack-5">
          <RestockCard
            stock={stock}
            prediction={stock.restock_suggestion}
            onRecalculate={recalculate}
            busy={recalculating}
          />

          <section className="panel stack-3">
            <h2 className="panel-title">Details</h2>
            <div className="row-between">
              <span className="hint">Alert threshold</span>
              <span className="mono">{stock.alert_threshold} days</span>
            </div>
            <div className="row-between">
              <span className="hint">Usage events</span>
              <span className="mono">{stock.usage_log_count}</span>
            </div>
            <div className="row-between">
              <span className="hint">Added</span>
              <span className="mono">
                {new Date(stock.created_at).toLocaleDateString()}
              </span>
            </div>
          </section>
        </div>
      </div>

      <UsageForm
        open={usageOpen}
        stock={stock}
        onClose={() => setUsageOpen(false)}
        onLogged={(result) => {
          setStock(result.stock);
          load();
          toast.done(
            `${result.usage_log.quantity_used}${result.stock.unit} of ${result.stock.name}`,
            "Logged. Your share is on the balance sheet."
          );
        }}
      />
    </div>
  );
}
