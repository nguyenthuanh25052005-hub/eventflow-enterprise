import { Router } from "express";
import { protect, internalOnly } from "../middleware/auth.js";

import {
  updateEventSupplierStatus,
} from "../controllers/eventSupplier.controller.js";

const router = Router();

router.use(protect, internalOnly);

router.patch("/:id/status", updateEventSupplierStatus);

export default router;
