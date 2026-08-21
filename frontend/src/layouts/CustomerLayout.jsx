import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Plus,
  FileText,
  CalendarDays,
  LogOut,
} from "lucide-react";

export default function CustomerLayout() {
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("eventflow_user") || "{}",
    );
  } catch {
    user = {};
  }

  function logout() {
    localStorage.removeItem("eventflow_token");
    localStorage.removeItem("eventflow_user");

    navigate("/login", {
      replace: true,
    });
  }

  function navClass({ isActive }) {
    return isActive
      ? "nav-item active"
      : "nav-item";
  }

  return (
    <div className="app-shell customer-portal">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            EF
          </div>

          <div className="brand-copy">
            <strong>EventFlow</strong>
            <span>
              CUSTOMER PORTAL
            </span>
          </div>
        </div>

        <nav>
          <div className="nav-group">
            <div className="nav-group-label">
              REQUESTS
            </div>

            <NavLink
              to="/portal/requests"
              className={navClass}
            >
              <ClipboardList size={18} />

              <span>
                My Requests
              </span>
            </NavLink>

            <NavLink
              to="/portal/requests/new"
              className={navClass}
            >
              <Plus size={18} />

              <span>
                Create Request
              </span>
            </NavLink>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">
              QUOTATIONS
            </div>

            <NavLink
              to="/portal/quotations"
              className={navClass}
            >
              <FileText size={18} />

              <span>
               Quotations
              </span>
            </NavLink>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">
              EVENTS
            </div>

            <NavLink
              to="/portal/events"
              className={navClass}
            >
              <CalendarDays size={18} />

              <span>
                My Events
              </span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-user">
          <div className="avatar">
            {(user.name || "C")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div className="sidebar-user-copy">
            <strong>
              {user.name || "Customer"}
            </strong>

            <span>
              CUSTOMER ACCOUNT
            </span>
          </div>

          <button
            type="button"
            className="icon-button dark"
            onClick={logout}
            title="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="breadcrumb">
            <span>
              EventFlow
            </span>

            <b>/</b>

            <strong>
              Customer Portal
            </strong>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
