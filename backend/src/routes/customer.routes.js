import { Router } from "express";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
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
export default router;
