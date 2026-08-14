import { Router } from "express";
import { protect } from "../middleware/auth.js";

import {
  updateEventSupplierStatus,
} from "../controllers/eventSupplier.controller.js";

const router = Router();

router.use(protect);

router.patch("/:id/status", updateEventSupplierStatus);

export default router;
