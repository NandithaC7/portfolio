import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const WS_URL =
  import.meta.env.VITE_WS_URL || API_URL.replace(/^http/, "ws");

const client = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Read straight from storage rather than importing the store, so this module
// stays free of a circular dependency with authStore.
export const TOKEN_KEY = "splitstock.auth";

export function readStoredAuth() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

client.interceptors.request.use((config) => {
  const auth = readStoredAuth();
  const access = auth?.state?.tokens?.access;
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const original = error.config || {};

    if (status === 401 && !original._retried) {
      const refresh = readStoredAuth()?.state?.tokens?.refresh;
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh/`, {
            refresh,
          });
          const stored = readStoredAuth();
          stored.state.tokens.access = data.access;
          localStorage.setItem(TOKEN_KEY, JSON.stringify(stored));
          original._retried = true;
          original.headers.Authorization = `Bearer ${data.access}`;
          return client(original);
        } catch {
          // Refresh token is dead too — fall through to a clean sign-out.
        }
      }
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(error);
  }
);

/** Turn a DRF error body into one sentence a person can act on. */
export function readError(error, fallback = "Something went wrong. Try again.") {
  const data = error?.response?.data;
  if (!data) {
    return error?.message === "Network Error"
      ? "Can't reach the server — is the backend running?"
      : fallback;
  }
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;

  const first = Object.values(data)[0];
  if (Array.isArray(first)) return String(first[0]);
  if (typeof first === "string") return first;
  return fallback;
}

/** Field-keyed errors, for painting messages under the right input. */
export function readFieldErrors(error) {
  const data = error?.response?.data;
  if (!data || typeof data !== "object") return {};
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      Array.isArray(value) ? String(value[0]) : String(value),
    ])
  );
}

export default client;
