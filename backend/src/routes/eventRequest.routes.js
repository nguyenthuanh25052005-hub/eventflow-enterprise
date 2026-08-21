import { Router } from "express";
import { protect, allowRoles, internalOnly } from "../middleware/auth.js";
import {
  listEventRequests,
  getEventRequest,
  createEventRequest,
  updateEventRequest,
  convertEventRequest,
} from "../controllers/eventRequest.controller.js";
const router = Router();
router.use(protect, internalOnly);
router.get("/", listEventRequests);
router.get("/:id", getEventRequest);
router.post(
  "/",
  allowRoles("SUPER_ADMIN", "ADMIN", "SALES", "EVENT_MANAGER"),
  createEventRequest,
);
router.put(
  "/:id",
  allowRoles("SUPER_ADMIN", "ADMIN", "SALES", "EVENT_MANAGER"),
  updateEventRequest,
);
router.post(
  "/:id/convert",
  allowRoles("SUPER_ADMIN", "ADMIN", "EVENT_MANAGER", "SALES"),
  convertEventRequest,
);
export default router;
