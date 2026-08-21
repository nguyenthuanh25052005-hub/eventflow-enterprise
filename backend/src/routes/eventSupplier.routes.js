import { Router } from "express";
import { protect, internalOnly } from "../middleware/auth.js";

import {
  createEventSupplier,
  deleteEventSupplier,
  getEventSupplier,
  getEventSupplierStatuses,
  listEventSuppliers,
  updateEventSupplier,
} from "../controllers/eventSupplier.controller.js";

const router = Router();

router.use(protect, internalOnly);

// Route cố định phải đứng trước /:id
router.get("/statuses", getEventSupplierStatuses);

router.get("/", listEventSuppliers);
router.post("/", createEventSupplier);

router.get("/:id", getEventSupplier);
router.put("/:id", updateEventSupplier);
router.delete("/:id", deleteEventSupplier);

export default router;
