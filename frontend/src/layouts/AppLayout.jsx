import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  FileText,
  CalendarDays,
  ListTodo,
  WalletCards,
  ContactRound,
  UsersRound,
  Network,
  ScanLine,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Command,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { initials } from "../utils/format";

const groups = [
  {
    label: "Workspace",
    items: [
      [
        "/dashboard",
        "Command center",
        LayoutDashboard,
        ["SUPER_ADMIN", "ADMIN", "SALES", "EVENT_MANAGER", "FINANCE", "STAFF"],
      ],
    ],
  },

  {
    label: "Sales & CRM",
    items: [
      [
        "/customers",
        "Customers",
        Building2,
        ["SUPER_ADMIN", "ADMIN", "SALES", "EVENT_MANAGER"],
      ],

      [
        "/event-requests",
        "Event requests",
        ClipboardList,
        ["SUPER_ADMIN", "ADMIN", "SALES", "EVENT_MANAGER"],
      ],

      [
        "/quotations",
        "Quotations",
        FileText,
        ["SUPER_ADMIN", "ADMIN", "SALES", "EVENT_MANAGER", "FINANCE"],
      ],
    ],
  },

  {
    label: "Operations",
    items: [
      [
        "/events",
        "Events",
        CalendarDays,
        ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "STAFF"],
      ],

      [
        "/tasks",
        "Tasks",
        ListTodo,
        ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "STAFF"],
      ],

      [
        "/suppliers",
        "Suppliers",
        Truck,
        ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "STAFF", "FINANCE"],
      ],

      [
        "/attendees",
        "Attendees & Check-in",
        ScanLine,
        ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "STAFF"],
      ],
    ],
  },

  {
    label: "People",
    items: [
      [
        "/employees",
        "Employees",
        UsersRound,
        ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"],
      ],

      ["/departments", "Departments", Network, ["SUPER_ADMIN", "ADMIN"]],
    ],
  },

  {
    label: "Business",
    items: [
      ["/finance", "Finance", WalletCards, ["SUPER_ADMIN", "ADMIN", "FINANCE"]],

      ["/reports", "Reports", BarChart3, ["SUPER_ADMIN", "ADMIN", "FINANCE"]],
    ],
  },

  {
    label: "Administration",
    items: [
      ["/settings", "Settings & Roles", Settings, ["SUPER_ADMIN", "ADMIN"]],
    ],
  },
];
const pageNames = {
  dashboard: "Command center",
  customers: "Customers",
  "event-requests": "Event requests",
  quotations: "Quotations",
  events: "Events",
  tasks: "Tasks",
  suppliers: "Suppliers",
  attendees: "Attendees & Check-in",
  employees: "Employees",
  departments: "Departments",
  finance: "Finance",
  reports: "Reports",
  settings: "Settings",
};

export default function AppLayout() {
  const navigate = useNavigate(),
    loc = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const user = JSON.parse(localStorage.getItem("eventflow_user") || "{}");

  const role = user.role || "SUPER_ADMIN";

  const visibleGroups = groups
    .map((group) => ({
      ...group,

      items: group.items.filter(([, , , allowedRoles]) =>
        allowedRoles.includes(role),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const segment = loc.pathname.split("/")[1] || "dashboard";
  function logout() {
    localStorage.removeItem("eventflow_token");
    localStorage.removeItem("eventflow_user");
    navigate("/login");
  }
  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">EF</div>
          <div className="brand-copy">
            <strong>EventFlow</strong>
            <span>Enterprise OS</span>
          </div>
          <button
            className="sidebar-collapse"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <PanelLeftClose size={17} />
            )}
          </button>
        </div>
        <div className="workspace-switch">
          <div className="workspace-logo">A</div>
          <div className="workspace-copy">
            <small>Workspace</small>
            <strong>Acme Events</strong>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav>
          {visibleGroups.map((g) => (
            <div className="nav-group" key={g.label}>
              <div className="nav-group-label">{g.label}</div>
              {g.items.map(([to, label, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    isActive ? "nav-item active" : "nav-item"
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{initials(user.name || "Admin")}</div>
          <div className="sidebar-user-copy">
            <strong>{user.name || "System Admin"}</strong>
            <span>{(user.role || "SUPER_ADMIN").replaceAll("_", " ")}</span>
          </div>
          <button className="icon-button dark" onClick={logout}>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <div className="breadcrumb">
            <span>EventFlow</span>
            <b>/</b>
            <strong>{pageNames[segment] || "Workspace"}</strong>
          </div>
          <div className="topbar-actions">
            <div className="global-search">
              <Search size={16} />
              <input placeholder="Search events, customers, tasks..." />
              <kbd>
                <Command size={11} />K
              </kbd>
            </div>
            <button className="icon-button top">
              <Bell size={18} />
              <i className="notification-dot" />
            </button>
            {["SUPER_ADMIN", "ADMIN", "SALES", "EVENT_MANAGER"].includes(
              role,
            ) && (
              <button
                className="quick-create"
                onClick={() => navigate("/event-requests")}
              >
                <Plus size={16} />
                Create
              </button>
            )}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
