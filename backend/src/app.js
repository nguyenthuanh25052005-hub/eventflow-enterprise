import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import eventRequestRoutes from "./routes/eventRequest.routes.js";
import customerRequestRoutes from "./routes/customerRequest.routes.js";
import quotationRoutes from "./routes/quotation.routes.js";
import eventRoutes from "./routes/event.routes.js";
import taskRoutes from "./routes/task.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import attendeeRoutes from "./routes/attendee.routes.js";
import supplierRoutes from "./routes/Supplier.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import eventSupplierRoutes from "./routes/eventSupplier.routes.js";
import eventSupplierWorkflowRoutes from "./routes/eventSupplierWorkflow.routes.js";
import customerPortalRoutes from "./routes/customerPortal.routes.js";

import { errorHandler, notFound } from "./middleware/error.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`),
      );
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) =>
app.use(
  express.json({
    limit: "2mb",
  }),
);

app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
 main  res.json({
    status: "ok",
    service: "EventFlow Enterprise API",
    version: "0.2",
  }),
);

app.use("/api/auth", authRoutes);

// =====================================
// INTERNAL APIs
// =====================================

app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/event-requests", eventRequestRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/customer-requests", customerRequestRoutes);

/* Customer Portal */
app.use("/api/customer-portal", customerPortalRoutes);

app.use("/api/events", eventRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/attendees", attendeeRoutes);
app.use("/api/suppliers", supplierRoutes);

app.use("/api/event-suppliers", eventSupplierRoutes);

app.use(
  "/api/event-supplier-workflow",
  eventSupplierWorkflowRoutes,
);

app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
