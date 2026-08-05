import { useEffect, useState } from "react";

import { readFieldErrors, readError } from "../api/client";
import { usageLogs } from "../api/endpoints";
import Modal from "./Modal";
import StockBar from "./StockBar";
import { icons } from "../lib/pantryIcons";
import { Icon } from "./Icons";

/** Quick amounts sized to the unit, so nobody types "0.25" for a bag of rice. */
function quickAmounts(unit, remaining) {
  const presets = {
    ml: [10, 25, 50, 100],
    L: [0.1, 0.25, 0.5, 1],
    g: [10, 25, 50, 100],
    kg: [0.1, 0.25, 0.5, 1],
    units: [1, 2, 3, 5],
    rolls: [1, 2, 3, 4],
    packs: [1, 2, 3],
  };
  return (presets[unit] || [1, 2, 5, 10]).filter((value) => value <= remaining);
}

export default function UsageForm({ open, stock, onClose, onLogged }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setError("");
      setFieldErrors({});
    }
  }, [open, stock?.id]);

  if (!stock) return null;

  const remaining = Number(stock.current_quantity);
  const typed = Number(amount);
  const valid = amount !== "" && typed > 0 && typed <= remaining;

  const previewPercent =
    Number(stock.quantity) > 0 && valid
      ? Math.max(0, ((remaining - typed) / Number(stock.quantity)) * 100)
      : Number(stock.percent_remaining ?? 0);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    if (typed > remaining) {
      setFieldErrors({
        quantity_used: `Can't log ${typed}${stock.unit} — only ${remaining}${stock.unit} of ${stock.name} left.`,
      });
      return;
    }

    setSaving(true);
    try {
      const result = await usageLogs.create({
        stock: stock.id,
        quantity_used: typed,
      });
      onLogged?.(result);
      onClose?.();
    } catch (err) {
      setFieldErrors(readFieldErrors(err));
      setError(readError(err, "Couldn't log that usage."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Log usage — ${stock.name}`}
      subtitle={`${remaining}${stock.unit} left of ${stock.quantity}${stock.unit}. Your share gets added to the ledger.`}
    >
      <form onSubmit={submit} className="stack-4">
        <div className="row" style={{ gap: "var(--space-5)" }}>
          <StockBar percent={previewPercent} width={48} height={64} />
          <div className="grow">
            <label className="field">
              <span className="field__label">How much did you use?</span>
              <div className="input-suffix">
                <input
                  className="input input--mono"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  max={remaining}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0"
                  autoFocus
                />
                <span className="input-suffix__unit">{stock.unit}</span>
              </div>
            </label>
            {fieldErrors.quantity_used && (
              <p className="field__error">{fieldErrors.quantity_used}</p>
            )}
          </div>
        </div>

        <div className="row wrap" style={{ gap: "var(--space-2)" }}>
          {quickAmounts(stock.unit, remaining).map((value) => (
            <button
              key={value}
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => setAmount(String(value))}
            >
              <span className="mono">
                {value}
                {stock.unit}
              </span>
            </button>
          ))}
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setAmount(String(remaining))}
          >
            Finished it
          </button>
        </div>

        {valid && (
          <p className="hint mono">
            Leaves {(remaining - typed).toFixed(2)}
            {stock.unit} · your share ≈ ₹
            {(typed * Number(stock.cost_per_unit || 0)).toFixed(2)}
          </p>
        )}

        {error && !fieldErrors.quantity_used && (
          <p className="form-error">{error}</p>
        )}

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={!valid || saving}>
            <Icon as={icons.Check} size={16} />
            {saving ? "Logging…" : "Log usage"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
