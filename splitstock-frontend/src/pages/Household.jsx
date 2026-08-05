import { useEffect, useState } from "react";

import { readError } from "../api/client";
import { households as householdApi } from "../api/endpoints";
import { Icon } from "../components/Icons";
import { icons } from "../lib/pantryIcons";
import { useAuthStore } from "../store/authStore";
import { toast } from "../store/toastStore";

export default function Household() {
  const household = useAuthStore((state) => state.currentHousehold());
  const user = useAuthStore((state) => state.user);
  const loadHouseholds = useAuthStore((state) => state.loadHouseholds);

  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!household?.id) return;
    householdApi
      .get(household.id)
      .then(setDetail)
      .catch((err) => setError(readError(err, "Couldn't load the household.")));
  }, [household?.id]);

  if (!household) {
    return (
      <div className="empty">
        <p className="empty__title">No household yet</p>
        <p className="empty__body">
          Create one for your flat, or join with the code a flatmate sent you.
        </p>
        <a href="/household/start" className="btn btn--primary">
          Create or join
        </a>
      </div>
    );
  }

  const inviteCode = detail?.invite_code || household.invite_code;
  const inviteLink = `${window.location.origin}/join/${inviteCode}`;
  const isAdmin = detail?.my_role === "ADMIN";

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn't reach the clipboard — copy the code by hand.");
    }
  }

  async function regenerate() {
    setBusy(true);
    try {
      const result = await householdApi.regenerateInvite(household.id);
      setDetail((prev) => ({ ...prev, invite_code: result.invite_code }));
      await loadHouseholds();
      toast.info("New invite code", "The old code stops working right away.");
    } catch (err) {
      setError(readError(err, "Couldn't reset the invite code."));
    } finally {
      setBusy(false);
    }
  }

  async function promote(membershipId) {
    try {
      await householdApi.promote(household.id, membershipId);
      const fresh = await householdApi.get(household.id);
      setDetail(fresh);
      toast.done("Admin added", "They can now manage the household.");
    } catch (err) {
      setError(readError(err, "Couldn't change that role."));
    }
  }

  return (
    <div className="stack-6">
      <div className="page-head">
        <div className="stack-2">
          <h1 className="page-title">{household.name}</h1>
          <p className="page-sub">
            Everyone here shares the same shelf and the same ledger.
          </p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="split">
        <section className="panel stack-4">
          <h2 className="panel-title">Members</h2>
          <table className="ledger">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th style={{ textAlign: "right" }}>Joined</th>
                {isAdmin && <th />}
              </tr>
            </thead>
            <tbody>
              {(detail?.members || []).map((membership) => (
                <tr key={membership.id}>
                  <td>
                    <div className="row">
                      <span
                        className={`avatar ${
                          membership.user.id === user?.id ? "avatar--yolk" : ""
                        }`}
                      >
                        {membership.user.initials}
                      </span>
                      <div>
                        <p style={{ fontSize: 14 }}>
                          {membership.user.display_name}
                          {membership.user.id === user?.id && (
                            <span className="muted"> · you</span>
                          )}
                        </p>
                        <p className="hint">{membership.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`chip ${
                        membership.role === "ADMIN" ? "chip--yolk" : ""
                      }`}
                    >
                      {membership.role.toLowerCase()}
                    </span>
                  </td>
                  <td className="num muted">
                    {new Date(membership.joined_at).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="num">
                      {membership.role !== "ADMIN" && (
                        <button
                          type="button"
                          className="btn btn--quiet btn--sm"
                          onClick={() => promote(membership.id)}
                        >
                          Make admin
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="stack-5">
          <section className="panel panel--paper stack-4">
            <h2 className="panel-title">Invite a flatmate</h2>
            <p className="hint">
              They enter this code once and they're on the shelf.
            </p>

            <div
              className="row-between"
              style={{
                border: "1px solid var(--ink-25)",
                borderRadius: "var(--radius-control)",
                padding: "10px 14px",
                background: "var(--milk)",
              }}
            >
              <span
                className="mono-500"
                style={{ fontSize: 20, letterSpacing: "0.14em" }}
              >
                {inviteCode}
              </span>
              <button
                type="button"
                className="btn btn--quiet btn--sm"
                onClick={() => copy(inviteCode)}
              >
                <Icon as={copied ? icons.Check : icons.Copy} size={15} />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <button
              type="button"
              className="btn btn--secondary btn--block"
              onClick={() => copy(inviteLink)}
            >
              Copy the join link
            </button>

            {isAdmin && (
              <>
                <hr className="divider" />
                <button
                  type="button"
                  className="btn btn--danger btn--block"
                  onClick={regenerate}
                  disabled={busy}
                >
                  <Icon as={icons.RefreshCw} size={15} color="currentColor" />
                  {busy ? "Resetting…" : "Reset the invite code"}
                </button>
                <p className="hint">
                  Use this if the code got shared somewhere it shouldn't have.
                  Anyone holding the old code loses access to join.
                </p>
              </>
            )}
          </section>

          <section className="panel stack-3">
            <h2 className="panel-title">About this household</h2>
            <div className="row-between">
              <span className="hint">Members</span>
              <span className="mono">{detail?.member_count ?? "—"}</span>
            </div>
            <div className="row-between">
              <span className="hint">Created</span>
              <span className="mono">
                {detail ? new Date(detail.created_at).toLocaleDateString() : "—"}
              </span>
            </div>
            <div className="row-between">
              <span className="hint">Your role</span>
              <span className="mono">{detail?.my_role?.toLowerCase() ?? "—"}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
