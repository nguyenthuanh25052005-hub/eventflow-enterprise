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

// Chỉ bộ phận quản trị/tài chính xem tổng quan tài chính
router.get(
  "/summary",
  allowRoles("SUPER_ADMIN", "ADMIN", "FINANCE"),
  getFinanceSummary,
);

// Event Manager cần xem expense để quản lý chi phí event
router.get(
  "/expenses",
  allowRoles("SUPER_ADMIN", "ADMIN", "FINANCE", "EVENT_MANAGER"),
  listExpenses,
);

// Tạo expense
router.post(
  "/expenses",
  allowRoles("SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "FINANCE"),
  createExpense,
);

// Update:
// EVENT_MANAGER được sửa DRAFT và submit.
// FINANCE/ADMIN được approve/reject/pay.
// Controller sẽ kiểm tra quyền chi tiết.
router.put(
  "/expenses/:id",
  allowRoles("SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "FINANCE"),
  updateExpense,
);

export default router;
