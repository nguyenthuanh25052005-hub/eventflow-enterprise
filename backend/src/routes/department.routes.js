import { Router } from "express";
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  listDepartments,
  updateDepartment,
} from "../controllers/department.controller.js";
import { allowRoles, protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", listDepartments);
router.get("/:id", getDepartment);
router.post("/", allowRoles("SUPER_ADMIN", "ADMIN"), createDepartment);
router.put("/:id", allowRoles("SUPER_ADMIN", "ADMIN"), updateDepartment);
router.delete("/:id", allowRoles("SUPER_ADMIN", "ADMIN"), deleteDepartment);

export default router;
