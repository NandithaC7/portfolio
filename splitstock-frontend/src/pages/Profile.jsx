import { useEffect, useState } from "react";

import { readError } from "../api/client";
import { auth as authApi, me as meApi } from "../api/endpoints";
import { useAuthStore } from "../store/authStore";
import { toast } from "../store/toastStore";

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const household = useAuthStore((state) => state.currentHousehold());
  const refreshUser = useAuthStore((state) => state.refreshUser);

  const [usage, setUsage] = useState([]);
  const [contributions, setContributions] = useState(null);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    if (!household?.id) return;
    Promise.all([meApi.usage(household.id), meApi.contributions(household.id)])
      .then(([logs, summary]) => {
        setUsage(logs);
        setContributions(summary);
      })
      .catch((err) => setError(readError(err, "Couldn't load your history.")));
  }, [household?.id]);

  async function savePhone(event) {
    event.preventDefault();
    setSavingPhone(true);
    try {
      await authApi.updateMe({ phone_number: phone });
      await refreshUser();
      toast.done("Number saved", "Restock alerts will reach you on WhatsApp.");
    } catch (err) {
      setError(readError(err, "Couldn't save that number."));
    } finally {
      setSavingPhone(false);
    }
  }

  return (
    <div className="stack-6">
      <div className="page-head">
        <div className="row" style={{ gap: "var(--space-4)" }}>
          <span className="avatar avatar--yolk" style={{ width: 52, height: 52, fontSize: 16 }}>
            {user?.initials}
          </span>
          <div className="stack-1">
            <h1 className="page-title">{user?.display_name}</h1>
            <p className="page-sub">
              What you've put in and what you've taken out{" "}
              {household ? `at ${household.name}` : ""}.
            </p>
          </div>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="stat-row">
        <div className="stat">
          <p className="stat__value">{contributions?.items_bought ?? "—"}</p>
          <p className="stat__label">items you bought</p>
        </div>
        <div className="stat stat--paper">
          <p className="stat__value">
            ₹{Number(contributions?.total_spent ?? 0).toFixed(2)}
          </p>
          <p className="stat__label">put into the shelf</p>
        </div>
        <div className="stat">
          <p className="stat__value">{contributions?.usage_events ?? "—"}</p>
          <p className="stat__label">times you logged usage</p>
        </div>
      </div>

      <div className="split">
        <section className="panel stack-4">
          <h2 className="panel-title">Your usage</h2>
          {usage.length ? (
            <table className="ledger">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "right" }}>When</th>
                </tr>
              </thead>
              <tbody>
                {usage.slice(0, 25).map((log) => (
                  <tr key={log.id}>
                    <td>{log.stock_name}</td>
                    <td className="num">
                      {Number(log.quantity_used).toFixed(2)}
                      {log.unit}
                    </td>
                    <td className="num muted">
                      {new Date(log.logged_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="hint">
              You haven't logged anything yet. Every log is what keeps the split
              honest.
            </p>
          )}
        </section>

        <div className="stack-5">
          <section className="panel panel--paper stack-4">
            <h2 className="panel-title">Restock alerts</h2>
            <form onSubmit={savePhone} className="stack-3">
              <label className="field">
                <span className="field__label">WhatsApp number</span>
                <input
                  className="input input--mono"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+91 90000 00000"
                />
              </label>
              <p className="hint">
                We only message when a shared item is within its alert window —
                usually a few days before it runs out.
              </p>
              <button
                type="submit"
                className="btn btn--primary btn--block"
                disabled={savingPhone}
              >
                {savingPhone ? "Saving…" : "Save number"}
              </button>
            </form>
          </section>

          <section className="panel stack-4">
            <h2 className="panel-title">What you bought</h2>
            {contributions?.stocks?.length ? (
              contributions.stocks.slice(0, 8).map((stock) => (
                <div key={stock.id} className="row-between">
                  <div>
                    <p style={{ fontSize: 14 }}>{stock.name}</p>
                    <p className="hint mono">
                      {Number(stock.current_quantity).toFixed(2)}
                      {stock.unit} left
                    </p>
                  </div>
                  <span className="mono-500">
                    ₹{Number(stock.total_cost).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="hint">
                You haven't bought anything for the house yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
