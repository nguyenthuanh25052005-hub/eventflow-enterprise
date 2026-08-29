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
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import MyCompany from "./pages/customer/MyCompany";
import MyProfile from "./pages/customer/MyProfile";
import CustomerRequests from "./pages/customer/CustomerRequests";
import CreateCustomerRequest from "./pages/customer/CreateCustomerRequest";
import CustomerRequestDetail from "./pages/customer/CustomerRequestDetail";
import CustomerQuotations from "./pages/customer/CustomerQuotations";
import CustomerQuotationDetail from "./pages/customer/CustomerQuotationDetail";
import CustomerEvents from "./pages/customer/CustomerEvents";
import CustomerEventDetail from "./pages/customer/CustomerEventDetail";
import PublicHome from "./pages/public/PublicHome";
import "./styles/customer.css";
import "./styles/customer-workflow.css";
import "./styles/public.css";
import "./styles/public-enhancements.css";

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
        {/* Public */}
        <Route path="/" element={<PublicHome />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Customer only */}
        <Route
          path="/portal"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="company" element={<MyCompany />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="requests" element={<CustomerRequests />} />
          <Route path="requests/new" element={<CreateCustomerRequest />} />
          <Route path="requests/:id" element={<CustomerRequestDetail />} />
          <Route path="quotations" element={<CustomerQuotations />} />
          <Route path="quotations/:id" element={<CustomerQuotationDetail />} />
          <Route path="events" element={<CustomerEvents />} />
          <Route path="events/:id" element={<CustomerEventDetail />} />
        </Route>

        {/* Internal EventFlow */}
        <Route
          element={
            <ProtectedRoute allowedRoles={INTERNAL_ROLES}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={CRM_ROLES}>
                <Customers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/event-requests"
            element={
              <ProtectedRoute allowedRoles={CRM_ROLES}>
                <EventRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quotations"
            element={
              <ProtectedRoute allowedRoles={QUOTATION_ROLES}>
                <Quotations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events"
            element={
              <ProtectedRoute allowedRoles={OPERATION_ROLES}>
                <Events />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events/:id"
            element={
              <ProtectedRoute allowedRoles={OPERATION_ROLES}>
                <EventDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute allowedRoles={OPERATION_ROLES}>
                <Tasks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/suppliers"
            element={
              <ProtectedRoute allowedRoles={SUPPLIER_ROLES}>
                <Suppliers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendees"
            element={
              <ProtectedRoute allowedRoles={OPERATION_ROLES}>
                <Attendees />
              </ProtectedRoute>
            }
          />

          <Route
            path="/finance"
            element={
              <ProtectedRoute allowedRoles={FINANCE_ROLES}>
                <Finance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={FINANCE_ROLES}>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={EMPLOYEE_ROLES}>
                <Employees />
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <Departments />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const CRM_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "EVENT_MANAGER"];

const QUOTATION_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SALES",
  "EVENT_MANAGER",
  "FINANCE",
];

const OPERATION_ROLES = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "STAFF"];

const SUPPLIER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EVENT_MANAGER",
  "STAFF",
  "FINANCE",
];

const FINANCE_ROLES = ["SUPER_ADMIN", "ADMIN", "FINANCE"];

const EMPLOYEE_ROLES = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"];

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];
