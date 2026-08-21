import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Building2, CalendarDays, ChevronDown, CircleHelp, ClipboardList, FilePlus2, LayoutDashboard, LogOut, Menu, ReceiptText, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { initials } from "../utils/format";
import { customerPortalApi } from "../api/customerPortalApi";

const navItems = [
  ["/portal/dashboard", "Dashboard", LayoutDashboard],
  ["/portal/requests", "My Requests", ClipboardList],
  ["/portal/requests/new", "Create Request", FilePlus2],
  ["/portal/quotations", "Quotations", ReceiptText],
  ["/portal/events", "My Events", CalendarDays],
  ["/portal/company", "My Company", Building2],
  ["/portal/profile", "My Profile", UserRound],
];

function portalTitle(pathname) {
  if (pathname === "/portal/requests/new") return "Create Request";
  if (pathname.startsWith("/portal/requests/")) return "Request Details";
  if (pathname === "/portal/requests") return "My Requests";
  if (pathname.startsWith("/portal/quotations/")) return "Quotation Details";
  if (pathname === "/portal/quotations") return "Quotations";
  if (pathname.startsWith("/portal/events/")) return "Event Details";
  if (pathname === "/portal/events") return "My Events";
  if (pathname === "/portal/company") return "My Company";
  if (pathname === "/portal/profile") return "My Profile";
  return "Dashboard";
}

export default function CustomerLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("eventflow_user") || "{}"); } catch { return {}; }
  });
  const company = user.customer || {};
  useEffect(() => {
    let active = true;
    customerPortalApi.me().then((data) => {
      if (!active || !data?.user) return;
      setUser(data.user);
      localStorage.setItem("eventflow_user", JSON.stringify(data.user));
    }).catch(() => {});
    const syncUser = () => {
      try { setUser(JSON.parse(localStorage.getItem("eventflow_user") || "{}")); } catch { /* noop */ }
    };
    window.addEventListener("eventflow:user-updated", syncUser);
    return () => { active = false; window.removeEventListener("eventflow:user-updated", syncUser); };
  }, []);
  function logout() {
    localStorage.removeItem("eventflow_token");
    localStorage.removeItem("eventflow_user");
    navigate("/login");
  }
  return (
    <div className="customer-shell">
      <aside className={`customer-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="customer-brand">
          <div className="customer-brand-mark">EF</div>
          <div><strong>EventFlow</strong><span>Customer Portal</span></div>
          <button className="customer-mobile-close" onClick={() => setMenuOpen(false)}><X size={19} /></button>
        </div>
        <div className="customer-account-card">
          <div className="customer-company-logo">{initials(company.companyName || company.name || "EventFlow")}</div>
          <div><small>Signed in for</small><strong>{company.companyName || company.name || "Customer account"}</strong><span>{company.customerCode || "EventFlow customer"}</span></div>
          <ChevronDown size={16} />
        </div>
        <nav className="customer-nav">
          <span className="customer-nav-label">Portal</span>
          {navItems.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive && !(to === "/portal/requests" && location.pathname === "/portal/requests/new") ? "active" : ""}>
              <Icon size={19} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="customer-support"><CircleHelp size={18} /><div><strong>Need help?</strong><span>Contact your EventFlow team</span></div></div>
        <div className="customer-sidebar-user">
          <div className="customer-user-avatar">{initials(user.name || "Nguyen Minh Anh")}</div>
          <div><strong>{user.name || "Nguyen Minh Anh"}</strong><span>{user.email || "minhanh@novatech.vn"}</span></div>
          <button onClick={logout} title="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>
      {menuOpen && <button className="customer-sidebar-overlay" onClick={() => setMenuOpen(false)} />}
      <main className="customer-main">
        <header className="customer-topbar">
          <button className="customer-menu-button" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
          <div><span>Customer Portal</span><b>/</b><strong>{portalTitle(location.pathname)}</strong></div>
          <button className="customer-top-profile" onClick={() => navigate("/portal/profile")}>
            <div className="customer-user-avatar small">{initials(user.name || "Nguyen Minh Anh")}</div>
            <span>{user.name || "Nguyen Minh Anh"}</span><ChevronDown size={15} />
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
