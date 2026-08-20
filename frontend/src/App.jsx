import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import CustomerLayout from "./layouts/CustomerLayout";
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

/* Customer Portal */
import CustomerRequests from "./pages/CustomerRequests";
import CreateCustomerRequest from "./pages/CreateCustomerRequest";
import CustomerRequestDetail from "./pages/CustomerRequestDetail";
import CustomerQuotations from "./pages/CustomerQuotations";
import CustomerQuotationDetail from "./pages/CustomerQuotationDetail";
import CustomerEvents from "./pages/CustomerEvents";
import CustomerEventDetail from "./pages/CustomerEventDetail";

const INTERNAL_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EVENT_MANAGER",
  "SALES",
  "FINANCE",
  "STAFF",
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC
        ========================== */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* =========================
            CUSTOMER PORTAL
        ========================== */}

        <Route
          path="/portal"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          {/* Customer login -> My Requests */}
          <Route
            index
            element={
              <Navigate
                to="requests"
                replace
              />
            }
          />

          {/* My Requests */}
          <Route
            path="requests"
            element={<CustomerRequests />}
          />

          {/* Create Request */}
          <Route
            path="requests/new"
            element={<CreateCustomerRequest />}
          />

          {/* Request Detail */}
          <Route
            path="requests/:id"
            element={<CustomerRequestDetail />}
          />

          {/* My Quotations */}
          <Route
            path="quotations"
            element={<CustomerQuotations />}
          />

          {/* Quotation Detail + Approve / Reject */}
          <Route
            path="quotations/:id"
            element={<CustomerQuotationDetail />}
          />

          {/* My Events */}
          <Route
            path="events"
            element={<CustomerEvents />}
          />

          {/* Event Detail */}
          <Route
            path="events/:id"
            element={<CustomerEventDetail />}
          />
        </Route>

        {/* =========================
            INTERNAL EVENTFLOW
        ========================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={INTERNAL_ROLES}
            >
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/customers"
            element={<Customers />}
          />

          <Route
            path="/event-requests"
            element={<EventRequests />}
          />

          <Route
            path="/quotations"
            element={<Quotations />}
          />

          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/events/:id"
            element={<EventDetail />}
          />

          <Route
            path="/tasks"
            element={<Tasks />}
          />

          <Route
            path="/suppliers"
            element={<Suppliers />}
          />

          <Route
            path="/attendees"
            element={<Attendees />}
          />

          <Route
            path="/finance"
            element={<Finance />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/employees"
            element={<Employees />}
          />

          <Route
            path="/departments"
            element={<Departments />}
          />
        </Route>

        {/* =========================
            FALLBACK
        ========================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}


