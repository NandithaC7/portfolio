import DepletionRing from "./DepletionRing";
import { icons } from "../lib/pantryIcons";
import { Icon } from "./Icons";

function formatDate(value) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function confidenceCopy(confidence) {
  if (confidence >= 0.75) return "Plenty of usage logged — this is a firm estimate.";
  if (confidence >= 0.4) return "A fair amount logged — treat this as a rough guide.";
  return "Only a few logs so far — the estimate will sharpen as you log more.";
}

/**
 * The nightly model's output for one stock, written as advice rather than
 * as a row of statistics.
 */
export default function RestockCard({ stock, prediction, onRecalculate, busy }) {
  const suggestion = prediction || stock?.restock_suggestion;
  const days = stock?.days_until_empty ?? suggestion?.days_until_empty ?? null;
  const emptyDate = formatDate(
    stock?.predicted_empty_date || suggestion?.predicted_empty_date
  );
  const suggested = suggestion?.suggested_quantity;
  const confidence = Number(suggestion?.confidence ?? 0);

  const enoughData = days !== null && days !== undefined;

  return (
    <section className="panel panel--paper stack-4">
      <div className="row-between">
        <h2 className="panel-title">Restock</h2>
        {onRecalculate && (
          <button
            type="button"
            className="btn btn--quiet btn--sm"
            onClick={onRecalculate}
            disabled={busy}
          >
            <Icon as={icons.RefreshCw} size={14} />
            {busy ? "Recalculating…" : "Recalculate"}
          </button>
        )}
      </div>

      {!enoughData ? (
        <div className="row" style={{ alignItems: "flex-start", gap: "var(--space-4)" }}>
          <DepletionRing days={null} size={62} />
          <div>
            <p style={{ fontSize: 14.5 }}>Not enough usage logged to call it yet.</p>
            <p className="hint" style={{ marginTop: 4 }}>
              Log this item three times and the nightly forecast will start
              predicting a run-out date.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="row" style={{ alignItems: "flex-start", gap: "var(--space-4)" }}>
            <DepletionRing days={days} size={72} />
            <div className="stack-1">
              <p style={{ fontSize: 15 }}>
                At the house's current pace, {stock.name} runs out{" "}
                {emptyDate ? (
                  <span className="mono-500">around {emptyDate}</span>
                ) : (
                  "soon"
                )}
                .
              </p>
              {suggestion?.avg_daily_usage != null && (
                <p className="hint mono">
                  {Number(suggestion.avg_daily_usage).toFixed(2)}
                  {stock.unit}/day average · alert at {stock.alert_threshold} days
                </p>
              )}
            </div>
          </div>

          <hr className="divider" />

          <div className="row-between wrap">
            <div>
              <p className="label">Buy about</p>
              <p className="mono-500" style={{ fontSize: 20 }}>
                {suggested != null ? `${Number(suggested).toFixed(2)}${stock.unit}` : "—"}
              </p>
              <p className="hint">Roughly a month's worth for this household.</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="label">Confidence</p>
              <p className="mono-500" style={{ fontSize: 20 }}>
                {Math.round(confidence * 100)}%
              </p>
            </div>
          </div>

          <p className="hint">{confidenceCopy(confidence)}</p>
        </>
      )}
    </section>
  );
}
