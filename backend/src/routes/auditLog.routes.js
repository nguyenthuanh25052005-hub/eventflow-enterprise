import { Router } from "express";

import { listAuditLogs } from "../controllers/auditLog.controller.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, allowRoles("SUPER_ADMIN", "ADMIN"), listAuditLogs);

export default router;
