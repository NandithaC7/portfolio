import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { readError, readFieldErrors } from "../api/client";
import { JarIcon } from "../components/Icons";
import { useAuthStore } from "../store/authStore";

const EMPTY = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  phone_number: "",
  password: "",
  password_confirm: "",
};

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setErrors({});
    try {
      await register(form);
      navigate("/household/start");
    } catch (err) {
      setErrors(readFieldErrors(err));
      setError(readError(err, "Couldn't create that account."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="center-pane">
      <div className="auth-card stack-5" style={{ maxWidth: 460 }}>
        <div className="stack-2">
          <JarIcon size={34} filled />
          <h1 className="page-title">Join the shelf</h1>
          <p className="page-sub">
            One account covers every house you share. You'll pick or create a
            household next.
          </p>
        </div>

        <form onSubmit={submit} className="panel stack-4">
          <div className="row" style={{ gap: "var(--space-3)" }}>
            <label className="field grow">
              <span className="field__label">First name</span>
              <input
                className="input"
                value={form.first_name}
                onChange={update("first_name")}
                autoComplete="given-name"
              />
            </label>
            <label className="field grow">
              <span className="field__label">Last name</span>
              <input
                className="input"
                value={form.last_name}
                onChange={update("last_name")}
                autoComplete="family-name"
              />
            </label>
          </div>

          <label className="field">
            <span className="field__label">Username</span>
            <input
              className="input"
              value={form.username}
              onChange={update("username")}
              autoComplete="username"
              required
            />
            {errors.username && <p className="field__error">{errors.username}</p>}
          </label>

          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={update("email")}
              autoComplete="email"
              required
            />
            {errors.email && <p className="field__error">{errors.email}</p>}
          </label>

          <label className="field">
            <span className="field__label">Phone (for restock alerts)</span>
            <input
              className="input input--mono"
              value={form.phone_number}
              onChange={update("phone_number")}
              placeholder="+91 90000 00000"
              autoComplete="tel"
            />
            <p className="hint" style={{ marginTop: 6 }}>
              Optional. We only message you when a shared item is about to run out.
            </p>
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
              required
            />
            {errors.password && <p className="field__error">{errors.password}</p>}
          </label>

          <label className="field">
            <span className="field__label">Confirm password</span>
            <input
              className="input"
              type="password"
              value={form.password_confirm}
              onChange={update("password_confirm")}
              autoComplete="new-password"
              required
            />
            {errors.password_confirm && (
              <p className="field__error">{errors.password_confirm}</p>
            )}
          </label>

          {error && !Object.keys(errors).length && (
            <p className="form-error">{error}</p>
          )}

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="hint" style={{ textAlign: "center" }}>
          Already have one?{" "}
          <Link to="/login" style={{ textDecoration: "underline" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
