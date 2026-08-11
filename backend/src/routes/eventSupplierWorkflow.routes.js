import { Router } from "express";
import { protect, allowRoles } from "../middleware/auth.js";

import {
  updateEventSupplierStatus,
} from "../controllers/eventSupplierWorkflow.controller.js";

const router = Router();

router.use(protect);

router.patch(
  "/:id/status",
  allowRoles("ADMIN", "MANAGER", "EVENT_MANAGER"),
  updateEventSupplierStatus,
);

export default router;
