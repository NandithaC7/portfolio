import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import { icons } from "../lib/pantryIcons";
import { Icon, JarIcon } from "./Icons";
import ToastDock from "./ToastDock";

const LINKS = [
  { to: "/", label: "Shelf", end: true },
  { to: "/balances", label: "Balance sheet" },
  { to: "/household", label: "Household" },
  { to: "/profile", label: "Profile" },
];

export default function AppShell({ live, liveRejected = false }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const householdList = useAuthStore((state) => state.households);
  const currentId = useAuthStore((state) => state.currentHouseholdId);
  const setCurrentHousehold = useAuthStore((state) => state.setCurrentHousehold);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <NavLink to="/" className="brand">
            <JarIcon size={22} filled />
            SplitStock
          </NavLink>

          {householdList.length > 1 && (
            <select
              className="select"
              value={currentId ?? ""}
              onChange={(event) => setCurrentHousehold(Number(event.target.value))}
              style={{ width: "auto", minWidth: 190 }}
              aria-label="Switch household"
            >
              {householdList.map((household) => (
                <option key={household.id} value={household.id}>
                  {household.name}
                </option>
              ))}
            </select>
          )}

          <nav className="nav">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "is-active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <span
              className="row"
              style={{ gap: 6, marginLeft: 10 }}
              title={
                live
                  ? "Live — updates arrive as they happen"
                  : liveRejected
                    ? "Live updates are off for this household — sign in again"
                    : "Offline — reconnecting"
              }
            >
              <span className={`live-dot ${live ? "" : "live-dot--off"}`} />
              <span className="hint" style={{ fontSize: 12 }}>
                {live ? "live" : liveRejected ? "paused" : "offline"}
              </span>
            </span>

            <button
              type="button"
              className="btn btn--quiet btn--sm"
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title={`Sign out ${user?.display_name || ""}`}
            >
              <Icon as={icons.LogOut} size={15} />
            </button>
          </nav>
        </div>
      </header>

      <main className="page">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <ToastDock />
    </div>
  );
}
