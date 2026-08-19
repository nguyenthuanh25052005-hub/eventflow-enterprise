import { Router } from "express";
import { protect, internalOnly } from "../middleware/auth.js";
import {
  listAttendees,
  createAttendee,
  checkInAttendee,
} from "../controllers/attendee.controller.js";
const router = Router();
router.use(protect, internalOnly);
router.get("/", listAttendees);
router.post("/", createAttendee);
router.post("/check-in/:qrCode", checkInAttendee);
export default router;
