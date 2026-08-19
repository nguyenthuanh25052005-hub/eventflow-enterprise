import { Router } from "express";

import { protect, customerOnly } from "../middleware/auth.js";

import {
  getPortalMe,
  getPortalSummary,
  getCompany,
  updateProfile,
  updateCompany,
  listMyRequests,
  createMyRequest,
  getMyRequest,
  listMyQuotations,
  getMyQuotation,
  decideMyQuotation,
  listMyEvents,
  getMyEvent,
} from "../controllers/customerPortal.controller.js";

const router = Router();

router.use(protect, customerOnly);

// Profile / Dashboard
router.get("/me", getPortalMe);
router.get("/summary", getPortalSummary);

router.get("/company", getCompany);
router.put("/profile", updateProfile);
router.put("/company", updateCompany);

// Event Requests
router.get("/requests", listMyRequests);
router.post("/requests", createMyRequest);
router.get("/requests/:id", getMyRequest);

// Quotations
router.get("/quotations", listMyQuotations);

router.patch("/quotations/:id/decision", decideMyQuotation);

router.get("/quotations/:id", getMyQuotation);

// Events
router.get("/events", listMyEvents);
router.get("/events/:id", getMyEvent);

export default router;
