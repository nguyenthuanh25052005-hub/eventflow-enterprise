import { Router } from "express";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createCustomerPortalAccount,
} from "../controllers/customer.controller.js";
import { allowRoles, protect, internalOnly } from "../middleware/auth.js";

const router = Router();
router.use(protect, internalOnly);
router.get("/", listCustomers);
router.get("/:id", getCustomer);
router.post(
  "/",
  allowRoles("SUPER_ADMIN", "ADMIN", "SALES", "EVENT_MANAGER"),
  createCustomer,
);
router.put(
  "/:id",
  allowRoles("SUPER_ADMIN", "ADMIN", "SALES", "EVENT_MANAGER"),
  updateCustomer,
);
router.delete("/:id", allowRoles("SUPER_ADMIN", "ADMIN"), deleteCustomer);
router.post(
  "/:id/portal-account",
  allowRoles("SUPER_ADMIN", "ADMIN"),
  createCustomerPortalAccount,
);
export default router;
