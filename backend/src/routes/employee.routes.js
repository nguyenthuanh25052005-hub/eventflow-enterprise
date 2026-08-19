import { Router } from "express";
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  getEmployeeByCode,
  listEmployees,
  updateEmployee,
} from "../controllers/employee.controller.js";
import { allowRoles, protect, internalOnly } from "../middleware/auth.js";

const router = Router();
router.use(protect, internalOnly);
router.get("/", listEmployees);
router.get("/code/:employeeCode", getEmployeeByCode);
router.get("/:id", getEmployee);
router.post(
  "/",
  allowRoles("SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"),
  createEmployee,
);
router.put(
  "/:id",
  allowRoles("SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"),
  updateEmployee,
);
router.delete("/:id", allowRoles("SUPER_ADMIN", "ADMIN"), deleteEmployee);

export default router;
