import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  createEventSupplier,
  deleteEventSupplier,
  getEventSupplier,
  listEventSuppliers,
  updateEventSupplier,
} from "../controllers/eventSupplier.controller.js";

const router = Router();

router.use(protect);
router.get("/", listEventSuppliers);
router.get("/:id", getEventSupplier);
router.post("/", createEventSupplier);
router.put("/:id", updateEventSupplier);
router.delete("/:id", deleteEventSupplier);

export default router;
