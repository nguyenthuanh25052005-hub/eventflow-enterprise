import asyncHandler from "express-async-handler";

import Quotation from "../models/Quotation.js";
import EventRequest from "../models/EventRequest.js";
import { createAuditLog } from "../services/auditLog.service.js";

import {
  REQUEST_STATUS,
  assertSystemTransition,
} from "../utils/eventRequestWorkflow.js";

// =====================================
// QUOTATION WORKFLOW
// =====================================

// Nhân viên nội bộ chỉ được:
// DRAFT -> SENT
//
// APPROVED / REJECTED sẽ do Customer Portal xử lý.
// EXPIRED do hệ thống xử lý.
const QUOTATION_TRANSITIONS = {
  DRAFT: ["SENT"],
  SENT: [],
  APPROVED: [],
  REJECTED: [],
  EXPIRED: [],
};

function assertQuotationTransition(from, to) {
  if (from === to) {
    return;
  }

  if (QUOTATION_TRANSITIONS[from]?.includes(to)) {
    return;
  }

  const error = new Error(`Invalid quotation transition: ${from} -> ${to}`);

  error.statusCode = 400;

  throw error;
}

// Những field nhân viên được phép sửa
const EDITABLE_FIELDS = [
  "title",
  "items",
  "discount",
  "vatPercent",
  "validUntil",
  "note",
];

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
  const { eventRequest, title, items, discount, vatPercent, validUntil, note } =
    req.body;

  // =====================================
  // VALIDATE EVENT REQUEST
  // =====================================

  if (!eventRequest) {
    return res.status(400).json({
      success: false,
      message: "Event request is required",
    });
  }

  const request = await EventRequest.findById(eventRequest);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Event request not found",
    });
  }

  // Request phải đang ở QUALIFYING
  // hoặc đã ở QUOTATION.
  assertSystemTransition(request.status, REQUEST_STATUS.QUOTATION);

  // =====================================
  // CREATE QUOTATION
  // =====================================

  // Không dùng ...req.body vì client có thể
  // gửi status/customer/createdBy giả.
  const quotation = await Quotation.create({
    eventRequest: request._id,

    // Customer luôn lấy từ Event Request
    customer: request.customer,

    title,

    items: Array.isArray(items) ? items : [],

    discount: discount !== undefined ? Number(discount) : 0,

    vatPercent: vatPercent !== undefined ? Number(vatPercent) : 10,

    validUntil: validUntil || null,

    note,

    // QUAN TRỌNG:
    // Quotation mới luôn phải là DRAFT
    status: "DRAFT",

    // User tạo quotation
    createdBy: req.user._id,
  });

  // =====================================
  // UPDATE EVENT REQUEST
  // =====================================

  if (request.status !== REQUEST_STATUS.QUOTATION) {
    const oldRequestStatus = request.status;

    request.status = REQUEST_STATUS.QUOTATION;

    await request.save();

    await createAuditLog({
      req,

      action: "STATUS_CHANGE",

      module: "EVENT_REQUEST",

      recordId: request._id,

      oldData: {
        status: oldRequestStatus,
      },

      newData: {
        status: request.status,
      },
    });
  }

  // =====================================
  // AUDIT LOG
  // =====================================

  await createAuditLog({
    req,

    action: "CREATE",

    module: "QUOTATION",

    recordId: quotation._id,

    oldData: null,

    newData: {
      quotationCode: quotation.quotationCode,

      eventRequest: quotation.eventRequest,

      customer: quotation.customer,

      title: quotation.title,

      subtotal: quotation.subtotal,

      discount: quotation.discount,

      vatPercent: quotation.vatPercent,

      vatAmount: quotation.vatAmount,

      total: quotation.total,

      status: quotation.status,

      validUntil: quotation.validUntil,
    },
  });

  // =====================================
  // POPULATE
  // =====================================

  const populated = await quotation.populate([
    {
      path: "customer",
      select: "customerCode name companyName",
    },
    {
      path: "eventRequest",
      select: "requestCode title status",
    },
  ]);

  res.status(201).json(populated);
});

// =====================================
// UPDATE
// =====================================

export const updateQuotation = asyncHandler(async (req, res) => {
  const quotation = await Quotation.findById(req.params.id);

  if (!quotation) {
    return res.status(404).json({
      success: false,
      message: "Quotation not found",
    });
  }

  const previousStatus = quotation.status;

  const requestedStatus = req.body.status;

  // =====================================
  // CHECK EDITABLE FIELDS
  // =====================================

  const hasEditableFields = EDITABLE_FIELDS.some(
    (field) => req.body[field] !== undefined,
  );

  // Báo giá chỉ được chỉnh sửa khi DRAFT.
  if (hasEditableFields && quotation.status !== "DRAFT") {
    return res.status(409).json({
      success: false,
      message: "Quotation details can only be edited while status is DRAFT",
    });
  }

  // =====================================
  // CHECK STATUS
  // =====================================

  if (requestedStatus && requestedStatus !== previousStatus) {
    assertQuotationTransition(previousStatus, requestedStatus);
  }

  // =====================================
  // VALIDATE BEFORE SEND
  // =====================================

  if (
    requestedStatus === "SENT" &&
    quotation.validUntil &&
    new Date(quotation.validUntil) < new Date()
  ) {
    return res.status(400).json({
      success: false,
      message: "Cannot send an expired quotation",
    });
  }

  // =====================================
  // SAVE OLD DATA FOR AUDIT
  // =====================================

  const oldData = {};

  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) {
      oldData[field] = quotation.get(field);
    }
  }

  if (requestedStatus !== undefined && requestedStatus !== previousStatus) {
    oldData.status = previousStatus;
  }

  // =====================================
  // UPDATE ALLOWED FIELDS
  // =====================================

  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) {
      quotation.set(field, req.body[field]);
    }
  }

  // =====================================
  // STATUS CHANGE
  // =====================================

  if (requestedStatus && requestedStatus !== previousStatus) {
    quotation.status = requestedStatus;
  }

  await quotation.save();

  // =====================================
  // WHEN QUOTATION IS SENT
  // =====================================

  if (requestedStatus === "SENT" && previousStatus !== "SENT") {
    const request = await EventRequest.findById(quotation.eventRequest);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Linked event request not found",
      });
    }

    // =====================================
    // EXPIRE OLD SENT QUOTATIONS
    // =====================================

    // Chỉ giữ một quotation SENT
    // cho một Event Request.
    await Quotation.updateMany(
      {
        eventRequest: quotation.eventRequest,

        _id: {
          $ne: quotation._id,
        },

        status: "SENT",
      },
      {
        $set: {
          status: "EXPIRED",
        },
      },
    );

    // =====================================
    // UPDATE REQUEST -> NEGOTIATING
    // =====================================

    if (request.status !== REQUEST_STATUS.NEGOTIATING) {
      assertSystemTransition(request.status, REQUEST_STATUS.NEGOTIATING);

      const oldRequestStatus = request.status;

      request.status = REQUEST_STATUS.NEGOTIATING;

      await request.save();

      await createAuditLog({
        req,

        action: "STATUS_CHANGE",

        module: "EVENT_REQUEST",

        recordId: request._id,

        oldData: {
          status: oldRequestStatus,
        },

        newData: {
          status: request.status,
        },
      });
    }
  }

  // =====================================
  // AUDIT NEW DATA
  // =====================================

  const newData = {};

  for (const key of Object.keys(oldData)) {
    const oldValue = oldData[key];

    const newValue = quotation.get(key);

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      newData[key] = newValue;
    } else {
      delete oldData[key];
    }
  }

  if (Object.keys(newData).length > 0) {
    await createAuditLog({
      req,

      action: "UPDATE",

      module: "QUOTATION",

      recordId: quotation._id,

      oldData,

      newData,
    });
  }

  // =====================================
  // RESPONSE
  // =====================================

  const populated = await quotation.populate([
    {
      path: "customer",
      select: "customerCode name companyName",
    },
    {
      path: "eventRequest",
      select: "requestCode title status",
    },
  ]);

  res.json(populated);
});
