import { Router } from "express";
import { protect, allowRoles, internalOnly } from "../middleware/auth.js";
import {
  listSuppliers,
  createSupplier,
  updateSupplier,
} from "../controllers/supplier.controller.js";
const router = Router();
router.use(protect, internalOnly);
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
