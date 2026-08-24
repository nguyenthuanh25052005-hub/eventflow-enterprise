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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
