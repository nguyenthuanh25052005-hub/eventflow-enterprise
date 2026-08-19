import { Router } from "express";
import { protect, allowRoles, internalOnly } from "../middleware/auth.js";
import {
  getFinanceSummary,
  listExpenses,
  createExpense,
  updateExpense,
} from "../controllers/finance.controller.js";
const router = Router();
router.use(protect, internalOnly);
router.get("/summary", getFinanceSummary);
router.get("/expenses", listExpenses);
router.post(
  "/expenses",
  allowRoles("SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "FINANCE"),
  createExpense,
);
router.put(
  "/expenses/:id",
  allowRoles("SUPER_ADMIN", "ADMIN", "FINANCE"),
  updateExpense,
);
export default router;
