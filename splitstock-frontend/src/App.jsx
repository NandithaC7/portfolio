import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import AppShell from "./components/AppShell";
import BalanceSheet from "./pages/BalanceSheet";
import Dashboard from "./pages/Dashboard";
import Household from "./pages/Household";
import HouseholdStart from "./pages/HouseholdStart";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import StockDetail from "./pages/StockDetail";
import useHouseholdWS from "./hooks/useHouseholdWS";
import { useAuthStore } from "./store/authStore";
import { toast } from "./store/toastStore";

function RequireAuth({ children }) {
  const location = useLocation();
  const authenticated = useAuthStore((state) => Boolean(state.tokens?.access));
  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function RedirectIfAuthed({ children }) {
  const authenticated = useAuthStore((state) => Boolean(state.tokens?.access));
  return authenticated ? <Navigate to="/" replace /> : children;
}

/**
 * One WebSocket for the whole session, held at the router level so every page
 * reacts to the same stream and a navigation never drops the connection.
 */
function LiveRoutes() {
  const householdId = useAuthStore((state) => state.currentHouseholdId);
  const userId = useAuthStore((state) => state.user?.id);
  const [lastEvent, setLastEvent] = useState(null);

  const { connected, rejected } = useHouseholdWS(householdId, (event) => {
    setLastEvent({ ...event, receivedAt: Date.now() });

    // Your own log already got a confirmation from the form that submitted it.
    const isMyOwnEcho = event.logged_by_id && event.logged_by_id === userId;

    if (event.type === "stock_updated" && event.logged_by && !isMyOwnEcho) {
      toast.info(
        `${event.stock_name} · ${event.current_quantity}${event.unit || ""} left`,
        `${event.logged_by} just logged usage.`
      );
    }

    if (event.type === "restock_alert") {
      const days = event.days_until_empty;
      toast.restock(
        `${event.stock_name} — ${days != null ? `${Math.round(days)} days left` : "running low"}`,
        event.suggested_quantity
          ? `Buy about ${event.suggested_quantity}${event.unit} to cover the month.`
          : "Worth picking up on the next shop."
      );
    }
  });

  return (
    <Routes>
      <Route element={<AppShell live={connected} liveRejected={Boolean(rejected)} />}>
        <Route index element={<Dashboard lastEvent={lastEvent} />} />
        <Route path="stock/:id" element={<StockDetail lastEvent={lastEvent} />} />
        <Route path="balances" element={<BalanceSheet lastEvent={lastEvent} />} />
        <Route path="household" element={<Household />} />
        <Route path="household/start" element={<HouseholdStart />} />
        <Route path="join/:code" element={<HouseholdStart />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const authenticated = useAuthStore((state) => Boolean(state.tokens?.access));

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (!bootstrapped && authenticated) {
    return (
      <div className="center-pane">
        <p className="hint">Opening the pantry…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthed>
              <Register />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <LiveRoutes />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
