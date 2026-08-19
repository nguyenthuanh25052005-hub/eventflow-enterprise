import { Router } from "express";
import { protect, internalOnly } from "../middleware/auth.js";
import {
  listTasks,
  createTask,
  updateTask,
} from "../controllers/task.controller.js";
const router = Router();
router.use(protect, internalOnly);
router.get("/", listTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
export default router;
