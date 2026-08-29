import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { protect, internalOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, internalOnly, getDashboard);

export default router;
