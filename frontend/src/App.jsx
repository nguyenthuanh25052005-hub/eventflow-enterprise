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
      <Route>

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/portal"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Navigate
                to="requests"
                replace
              />
            }
          />
          <Route
            path="requests"
            element={<CustomerRequests />}
          />
          <Route
            path="requests/new"
            element={<CreateCustomerRequest />}
          />

          <Route
            path="requests/:id"
            element={<CustomerRequestDetail />}
          />

          <Route
            path="quotations"
            element={<CustomerQuotations />}
          />

          <Route
            path="quotations/:id"
            element={<CustomerQuotationDetail />}
          />

          <Route
            path="events"
            element={<CustomerEvents />}
          />

          <Route
            path="events/:id"
            element={<CustomerEventDetail />}
          />
        </Route>

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


