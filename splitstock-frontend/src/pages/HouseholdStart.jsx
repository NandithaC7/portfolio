import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { readError } from "../api/client";
import { households as householdApi } from "../api/endpoints";
import { JarIcon } from "../components/Icons";
import { useAuthStore } from "../store/authStore";
import { toast } from "../store/toastStore";

/** Create-or-join, and the landing page for an invite link. */
export default function HouseholdStart() {
  const navigate = useNavigate();
  const { code: codeFromLink } = useParams();
  const loadHouseholds = useAuthStore((state) => state.loadHouseholds);
  const setCurrentHousehold = useAuthStore((state) => state.setCurrentHousehold);

  const [mode, setMode] = useState(codeFromLink ? "join" : "create");
  const [name, setName] = useState("");
  const [code, setCode] = useState(codeFromLink || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function createHousehold(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const household = await householdApi.create({ name: name.trim() });
      await loadHouseholds();
      setCurrentHousehold(household.id);
      toast.done(household.name, `Created. Invite code: ${household.invite_code}`);
      navigate("/");
    } catch (err) {
      setError(readError(err, "Couldn't create that household."));
    } finally {
      setBusy(false);
    }
  }

  async function joinHousehold(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const household = await householdApi.join(code.trim().toUpperCase());
      await loadHouseholds();
      setCurrentHousehold(household.id);
      toast.done(household.name, "You're on the shelf.");
      navigate("/");
    } catch (err) {
      setError(readError(err, "Couldn't join with that code."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack-6" style={{ maxWidth: 520 }}>
      <div className="stack-2">
        <JarIcon size={30} filled />
        <h1 className="page-title">
          {mode === "create" ? "Start a household" : "Join a household"}
        </h1>
        <p className="page-sub">
          A household is one shared shelf and one shared ledger. Most people
          have exactly one; you can be in several.
        </p>
      </div>

      <div className="row" style={{ gap: "var(--space-2)" }}>
        <button
          type="button"
          className={`btn ${mode === "create" ? "btn--primary" : "btn--secondary"}`}
          onClick={() => setMode("create")}
        >
          Create one
        </button>
        <button
          type="button"
          className={`btn ${mode === "join" ? "btn--primary" : "btn--secondary"}`}
          onClick={() => setMode("join")}
        >
          I have a code
        </button>
      </div>

      {mode === "create" ? (
        <form onSubmit={createHousehold} className="panel stack-4">
          <label className="field">
            <span className="field__label">What do you call the place?</span>
            <input
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Flat 4B, Willow Court"
              autoFocus
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={busy || !name.trim()}
          >
            {busy ? "Creating…" : "Create household"}
          </button>
          <p className="hint">
            You'll be the admin, and you'll get an invite code to pass around.
          </p>
        </form>
      ) : (
        <form onSubmit={joinHousehold} className="panel stack-4">
          <label className="field">
            <span className="field__label">Invite code</span>
            <input
              className="input input--mono"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="N5WF5ZES"
              style={{ letterSpacing: "0.14em", fontSize: 18 }}
              autoFocus
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={busy || !code.trim()}
          >
            {busy ? "Joining…" : "Join household"}
          </button>
          <p className="hint">
            Eight characters, no zeros or ones — those get misread too often.
          </p>
        </form>
      )}
    </div>
  );
}
