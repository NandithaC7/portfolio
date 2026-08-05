import { useEffect, useMemo, useState } from "react";

import { readError } from "../api/client";
import DebtGraph from "../components/DebtGraph";
import Modal from "../components/Modal";
import useBalances from "../hooks/useBalances";
import { useAuthStore } from "../store/authStore";
import { toast } from "../store/toastStore";

function money(value) {
  return `₹${Math.abs(Number(value)).toFixed(2)}`;
}

export default function BalanceSheet({ lastEvent }) {
  const household = useAuthStore((state) => state.currentHousehold());
  const user = useAuthStore((state) => state.user);
  const { data, loading, error, reload, settle } = useBalances(household?.id);

  const [settleTarget, setSettleTarget] = useState(null);
  const [settleAmount, setSettleAmount] = useState("");
  const [settleError, setSettleError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (lastEvent?.type === "balance_updated") reload();
  }, [lastEvent, reload]);

  const { iOwe, owedToMe } = useMemo(() => {
    const balances = data?.balances || [];
    return {
      iOwe: balances.filter((b) => b.debtor.id === user?.id),
      owedToMe: balances.filter((b) => b.creditor.id === user?.id),
    };
  }, [data, user]);

  const net = Number(data?.summary?.net ?? 0);

  async function submitSettlement(event) {
    event.preventDefault();
    setBusy(true);
    setSettleError("");
    try {
      const amount = settleAmount === "" ? null : Number(settleAmount);
      await settle({ creditorId: settleTarget.creditor.id, amount });
      toast.done(
        `Settled with ${settleTarget.creditor.display_name}`,
        amount ? `Recorded ${money(amount)}.` : "That debt is clear."
      );
      setSettleTarget(null);
      setSettleAmount("");
    } catch (err) {
      setSettleError(readError(err, "Couldn't record that payment."));
    } finally {
      setBusy(false);
    }
  }

  if (!household) {
    return (
      <div className="empty">
        <p className="empty__title">No household yet</p>
        <p className="empty__body">
          Join or create a household and the balance sheet fills itself in as
          people log usage.
        </p>
      </div>
    );
  }

  return (
    <div className="stack-6">
      <div className="page-head">
        <div className="stack-2">
          <h1 className="page-title">Balance sheet</h1>
          <p className="page-sub">
            Every string is one debt. Cost is split by what each person actually
            used, not evenly across the house.
          </p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="split">
        <section className="panel stack-4">
          <div className="row-between">
            <h2 className="panel-title">The board</h2>
            <span className="hint">{data?.members?.length ?? 0} members</span>
          </div>

          {loading ? (
            <p className="hint">Pinning up the strings…</p>
          ) : data?.balances?.length ? (
            <DebtGraph
              members={data.members}
              balances={data.balances}
              currentUserId={user?.id}
            />
          ) : (
            <div className="empty" style={{ borderStyle: "solid" }}>
              <p className="empty__title">Nobody owes anybody</p>
              <p className="empty__body">
                Either nothing has been used yet, or everyone has settled. Log
                some usage and the strings appear here.
              </p>
            </div>
          )}
        </section>

        <div className="stack-5">
          <section className="panel panel--paper stack-3">
            <p className="label">Your position</p>
            <p
              className="display"
              style={{
                fontSize: 44,
                color: net >= 0 ? "var(--moss)" : "var(--brick)",
              }}
            >
              {net >= 0 ? "+" : "−"}
              {money(net)}
            </p>
            <p className="hint">
              {net > 0
                ? "The house owes you this much overall."
                : net < 0
                  ? "You owe the house this much overall."
                  : "You're square with everyone."}
            </p>
            <hr className="divider" />
            <div className="row-between">
              <span className="hint">Owed to you</span>
              <span className="mono-500 text-moss">
                {money(data?.summary?.owed_to_me ?? 0)}
              </span>
            </div>
            <div className="row-between">
              <span className="hint">You owe</span>
              <span className="mono-500 text-brick">
                {money(data?.summary?.i_owe ?? 0)}
              </span>
            </div>
          </section>

          <section className="panel stack-3">
            <h2 className="panel-title">Settle up</h2>
            {iOwe.length ? (
              iOwe.map((balance) => (
                <div key={balance.id} className="row-between">
                  <div className="row">
                    <span className="avatar">{balance.creditor.initials}</span>
                    <div>
                      <p style={{ fontSize: 14 }}>{balance.creditor.display_name}</p>
                      <p className="hint mono">{money(balance.amount)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => {
                      setSettleTarget(balance);
                      setSettleAmount("");
                      setSettleError("");
                    }}
                  >
                    Pay back
                  </button>
                </div>
              ))
            ) : (
              <p className="hint">
                You don't owe anyone right now. Nothing to settle.
              </p>
            )}
          </section>

          {owedToMe.length > 0 && (
            <section className="panel stack-3">
              <h2 className="panel-title">Waiting on you</h2>
              {owedToMe.map((balance) => (
                <div key={balance.id} className="row-between">
                  <div className="row">
                    <span className="avatar">{balance.debtor.initials}</span>
                    <p style={{ fontSize: 14 }}>{balance.debtor.display_name}</p>
                  </div>
                  <span className="mono-500 text-moss">{money(balance.amount)}</span>
                </div>
              ))}
              <p className="hint">
                They settle from their own balance sheet — nothing for you to do.
              </p>
            </section>
          )}
        </div>
      </div>

      {data?.settlements?.length > 0 && (
        <section className="panel stack-4">
          <h2 className="panel-title">Recent settlements</h2>
          <table className="ledger">
            <thead>
              <tr>
                <th>Payment</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "right" }}>When</th>
              </tr>
            </thead>
            <tbody>
              {data.settlements.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.payer.id === user?.id ? "You" : row.payer.display_name} paid{" "}
                    {row.payee.id === user?.id ? "you" : row.payee.display_name}
                  </td>
                  <td className="num">{money(row.amount)}</td>
                  <td className="num muted">
                    {new Date(row.settled_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <Modal
        open={Boolean(settleTarget)}
        onClose={() => setSettleTarget(null)}
        title={`Pay back ${settleTarget?.creditor?.display_name || ""}`}
        subtitle={`You owe ${money(settleTarget?.amount || 0)}. Record what you actually handed over.`}
      >
        <form onSubmit={submitSettlement} className="stack-4">
          <label className="field">
            <span className="field__label">Amount</span>
            <div className="input-suffix">
              <input
                className="input input--mono"
                type="number"
                step="0.01"
                min="0"
                max={settleTarget?.amount}
                value={settleAmount}
                onChange={(event) => setSettleAmount(event.target.value)}
                placeholder={Number(settleTarget?.amount || 0).toFixed(2)}
              />
              <span className="input-suffix__unit">₹</span>
            </div>
            <p className="hint" style={{ marginTop: 6 }}>
              Leave it blank to settle the whole thing.
            </p>
          </label>

          {settleError && <p className="form-error">{settleError}</p>}

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setSettleTarget(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? "Recording…" : "Mark as paid"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
