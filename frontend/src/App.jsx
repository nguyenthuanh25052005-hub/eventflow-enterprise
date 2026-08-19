import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import EventRequests from "./pages/EventRequests";
import Quotations from "./pages/Quotations";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Tasks from "./pages/Tasks";
import Suppliers from "./pages/Suppliers";
import Attendees from "./pages/Attendees";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";

const INTERNAL_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EVENT_MANAGER",
  "SALES",
  "FINANCE",
  "STAFF",
];

function CustomerPortalPlaceholder() {
  const rawUser = localStorage.getItem("eventflow_user");

  let user = null;

  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  function logout() {
    localStorage.removeItem("eventflow_token");
    localStorage.removeItem("eventflow_user");
    window.location.href = "/login";
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#f6f8fb",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "30px",
        }}
      >
        <span className="eyebrow">CUSTOMER PORTAL</span>

        <h1>Welcome to EventFlow</h1>

        <p className="muted">
          Customer authentication is working. The full customer portal is being
          developed.
        </p>

        {user && (
          <div style={{ marginTop: "24px" }}>
            <p>
              <strong>Name:</strong> {user.name}
            </p>

            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p>
              <strong>Role:</strong> {user.role}
            </p>

            <p>
              <strong>Customer:</strong> {user.customer?.customerCode || "-"}
            </p>
          </div>
        )}

        <button
          className="primary-button"
          onClick={logout}
          style={{ marginTop: "20px" }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Customer only */}
        <Route
          path="/portal"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerPortalPlaceholder />
            </ProtectedRoute>
          }
        />

        {/* Internal EventFlow */}
        <Route
          element={
            <ProtectedRoute allowedRoles={INTERNAL_ROLES}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/customers" element={<Customers />} />

          <Route path="/event-requests" element={<EventRequests />} />

          <Route path="/quotations" element={<Quotations />} />

          <Route path="/events" element={<Events />} />

          <Route path="/events/:id" element={<EventDetail />} />

          <Route path="/tasks" element={<Tasks />} />

          <Route path="/suppliers" element={<Suppliers />} />

          <Route path="/attendees" element={<Attendees />} />

          <Route path="/finance" element={<Finance />} />

          <Route path="/reports" element={<Reports />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="/employees" element={<Employees />} />

          <Route path="/departments" element={<Departments />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
