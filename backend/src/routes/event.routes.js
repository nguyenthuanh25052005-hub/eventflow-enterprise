import { Router } from "express";
import { protect, allowRoles, internalOnly } from "../middleware/auth.js";
import {
  listEvents,
  getEvent,
  updateEvent,
} from "../controllers/event.controller.js";
const router = Router();
router.use(protect, internalOnly);
router.get("/", listEvents);
router.get("/:id", getEvent);
router.put(
  "/:id",
  allowRoles("SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"),
  updateEvent,
);
export default router;
