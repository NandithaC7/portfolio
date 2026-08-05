import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { readError } from "../api/client";
import { JarIcon } from "../components/Icons";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(readError(err, "That username and password don't match an account."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="center-pane">
      <div className="auth-card stack-5">
        <div className="stack-2">
          <JarIcon size={34} filled />
          <h1 className="page-title">Welcome back</h1>
          <p className="page-sub">
            Sign in to see what's left on the shelf and where the money sits.
          </p>
        </div>

        <form onSubmit={submit} className="panel stack-4">
          <label className="field">
            <span className="field__label">Username or email</span>
            <input
              className="input"
              value={form.username}
              onChange={update("username")}
              autoComplete="username"
              autoFocus
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={update("password")}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="hint" style={{ textAlign: "center" }}>
          New here?{" "}
          <Link to="/register" style={{ textDecoration: "underline" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
