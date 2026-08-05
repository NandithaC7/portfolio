import { useState } from "react";

import { readError, readFieldErrors } from "../api/client";
import { stocks as stockApi } from "../api/endpoints";

const UNITS = ["ml", "L", "g", "kg", "units", "rolls", "packs"];

export default function AddStockForm({ householdId, onCreated, onClose }) {
  const [form, setForm] = useState({
    name: "",
    unit: "ml",
    quantity: "",
    total_cost: "",
    alert_threshold: 3,
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const valid =
    form.name.trim() && Number(form.quantity) > 0 && form.total_cost !== "";

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setErrors({});
    try {
      const stock = await stockApi.create({
        household: householdId,
        name: form.name.trim(),
        unit: form.unit,
        quantity: form.quantity,
        current_quantity: form.quantity,
        total_cost: form.total_cost,
        alert_threshold: Number(form.alert_threshold) || 3,
      });
      onCreated?.(stock);
    } catch (err) {
      setErrors(readFieldErrors(err));
      setError(readError(err, "Couldn't add that item."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="stack-4">
      <label className="field">
        <span className="field__label">What is it?</span>
        <input
          className="input"
          value={form.name}
          onChange={update("name")}
          placeholder="Cooking oil"
          autoFocus
          required
        />
        {errors.name && <p className="field__error">{errors.name}</p>}
      </label>

      <div className="row" style={{ gap: "var(--space-3)", alignItems: "flex-end" }}>
        <label className="field grow">
          <span className="field__label">How much did you buy?</span>
          <input
            className="input input--mono"
            type="number"
            step="0.01"
            min="0"
            value={form.quantity}
            onChange={update("quantity")}
            placeholder="2000"
            required
          />
        </label>
        <label className="field" style={{ width: 110 }}>
          <span className="field__label">Unit</span>
          <select className="select" value={form.unit} onChange={update("unit")}>
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </label>
      </div>
      {errors.quantity && <p className="field__error">{errors.quantity}</p>}

      <div className="row" style={{ gap: "var(--space-3)", alignItems: "flex-end" }}>
        <label className="field grow">
          <span className="field__label">What did it cost?</span>
          <div className="input-suffix">
            <input
              className="input input--mono"
              type="number"
              step="0.01"
              min="0"
              value={form.total_cost}
              onChange={update("total_cost")}
              placeholder="480.00"
              required
            />
            <span className="input-suffix__unit">₹</span>
          </div>
        </label>
        <label className="field" style={{ width: 140 }}>
          <span className="field__label">Warn me at</span>
          <div className="input-suffix">
            <input
              className="input input--mono"
              type="number"
              min="1"
              max="30"
              value={form.alert_threshold}
              onChange={update("alert_threshold")}
            />
            <span className="input-suffix__unit">days</span>
          </div>
        </label>
      </div>
      {errors.total_cost && <p className="field__error">{errors.total_cost}</p>}

      <p className="hint">
        You're recorded as the buyer, so everyone else's usage gets billed back
        to you at this item's per-unit cost.
      </p>

      {error && !Object.keys(errors).length && <p className="form-error">{error}</p>}

      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={!valid || busy}>
          {busy ? "Adding…" : "Add to shelf"}
        </button>
      </div>
    </form>
  );
}
