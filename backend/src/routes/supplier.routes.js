import { Router } from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
} from "../controllers/supplier.controller.js";
const router = Router();
router.use(protect);
router.get("/", listSuppliers);
router.post(
  "/",
  allowRoles("SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"),
  createSupplier,
);
router.put(
  "/:id",
  allowRoles("SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"),
  updateSupplier,
);
export default router;
