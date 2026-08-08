import asyncHandler from "express-async-handler";

import Quotation from "../models/Quotation.js";
import EventRequest from "../models/EventRequest.js";

import {
  REQUEST_STATUS,
  assertSystemTransition,
} from "../utils/eventRequestWorkflow.js";

const QUOTATION_TRANSITIONS = {
  DRAFT: ["SENT"],
  SENT: ["APPROVED"],
  APPROVED: [],
  REJECTED: [],
  EXPIRED: [],
};

function assertQuotationTransition(from, to) {
  if (from === to) return;

  if (QUOTATION_TRANSITIONS[from]?.includes(to)) {
    return;
  }

  const error = new Error(`Invalid quotation transition: ${from} -> ${to}`);

  error.statusCode = 400;

  throw error;
}

// =====================================
// LIST
// =====================================

export const listQuotations = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.eventRequest) {
    filter.eventRequest = req.query.eventRequest;
  }

  const items = await Quotation.find(filter)
    .populate("customer", "customerCode name companyName")
    .populate("eventRequest", "requestCode title status")
    .sort({
      createdAt: -1,
    })
    .limit(100);

  res.json({
    items,
  });
});

// =====================================
// CREATE
// =====================================

export const createQuotation = asyncHandler(async (req, res) => {
  const request = await EventRequest.findById(req.body.eventRequest);

  if (!request) {
    return res.status(404).json({
      message: "Event request not found",
    });
  }

  // Không cho NEW tạo quotation ngay.
  // Phải qualification trước.
  assertSystemTransition(request.status, REQUEST_STATUS.QUOTATION);

  const item = await Quotation.create({
    ...req.body,

    customer: request.customer,

    createdBy: req.user._id,
  });

  request.status = REQUEST_STATUS.QUOTATION;

  await request.save();

  const populated = await item.populate(["customer", "eventRequest"]);

  res.status(201).json(populated);
});

// =====================================
// UPDATE
// =====================================

export const updateQuotation = asyncHandler(async (req, res) => {
  const item = await Quotation.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Quotation not found",
    });
  }

  const previousStatus = item.status;

  const requestedStatus = req.body.status;

  if (requestedStatus && requestedStatus !== previousStatus) {
    assertQuotationTransition(previousStatus, requestedStatus);
  }

  Object.assign(item, req.body);

  await item.save();

  // Chỉ thực hiện side effect
  // khi status thật sự đổi.
  if (requestedStatus && requestedStatus !== previousStatus) {
    const request = await EventRequest.findById(item.eventRequest);

    if (!request) {
      return res.status(404).json({
        message: "Linked event request not found",
      });
    }

    // DRAFT -> SENT
    // Request: QUOTATION -> NEGOTIATING
    if (requestedStatus === "SENT") {
      assertSystemTransition(request.status, REQUEST_STATUS.NEGOTIATING);

      request.status = REQUEST_STATUS.NEGOTIATING;

      await request.save();
    }

    // SENT -> APPROVED
    // Request:
    // NEGOTIATING -> APPROVED
    if (requestedStatus === "APPROVED") {
      assertSystemTransition(request.status, REQUEST_STATUS.APPROVED);

      request.status = REQUEST_STATUS.APPROVED;

      await request.save();
    }
  }

  const populated = await item.populate(["customer", "eventRequest"]);

  res.json(populated);
});
