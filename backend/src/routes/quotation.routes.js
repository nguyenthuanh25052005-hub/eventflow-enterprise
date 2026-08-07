import { Router } from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import {
  listQuotations,
  createQuotation,
  updateQuotation,
} from "../controllers/quotation.controller.js";
const router = Router();
router.use(protect);
router.get("/", listQuotations);
router.post(
  "/",
  allowRoles("SUPER_ADMIN", "ADMIN", "SALES", "EVENT_MANAGER"),
  createQuotation,
);
router.put(
  "/:id",
  allowRoles("SUPER_ADMIN", "ADMIN", "SALES", "EVENT_MANAGER", "FINANCE"),
  updateQuotation,
);
export default router;
