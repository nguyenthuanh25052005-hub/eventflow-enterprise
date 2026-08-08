import asyncHandler from "express-async-handler";

import EventRequest from "../models/EventRequest.js";
import Event from "../models/Event.js";
import Quotation from "../models/Quotation.js";

import {
  REQUEST_STATUS,
  assertManualTransition,
  assertSystemTransition,
} from "../utils/eventRequestWorkflow.js";

// =====================================
// LIST
// =====================================

export const listEventRequests = asyncHandler(async (req, res) => {
  const { status, search = "" } = req.query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      {
        title: {
          $regex: search,
          $options: "i",
        },
      },
      {
        requestCode: {
          $regex: search,
          $options: "i",
        },
      },
      {
        location: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const items = await EventRequest.find(filter)
    .populate("customer", "customerCode name companyName email phone")
    .populate("owner", "name email")
    .sort({
      createdAt: -1,
    })
    .limit(100);

  res.json({
    items,
  });
});

// =====================================
// DETAIL
// =====================================

export const getEventRequest = asyncHandler(async (req, res) => {
  const item = await EventRequest.findById(req.params.id)
    .populate("customer")
    .populate("owner", "name email role");

  if (!item) {
    return res.status(404).json({
      message: "Event request not found",
    });
  }

  const quotations = await Quotation.find({
    eventRequest: item._id,
  }).sort({
    createdAt: -1,
  });

  res.json({
    ...item.toObject(),
    quotations,
  });
});

// =====================================
// CREATE
// =====================================

export const createEventRequest = asyncHandler(async (req, res) => {
  // Không cho client tự tạo request với stage bất kỳ.
  const payload = {
    ...req.body,

    status: REQUEST_STATUS.NEW,

    owner: req.body.owner || req.user._id,

    createdBy: req.user._id,
  };

  const item = await EventRequest.create(payload);

  const populated = await item.populate(
    "customer",
    "customerCode name companyName",
  );

  res.status(201).json(populated);
});

// =====================================
// UPDATE
// =====================================

export const updateEventRequest = asyncHandler(async (req, res) => {
  const item = await EventRequest.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Event request not found",
    });
  }

  const { status, requestCode, createdBy, ...editableFields } = req.body;

  // Nếu client muốn chuyển stage,
  // bắt buộc phải đi qua state machine.
  if (status && status !== item.status) {
    assertManualTransition(item.status, status);

    item.status = status;
  }

  // Không cho client sửa mã nghiệp vụ
  // hoặc người tạo.
  Object.assign(item, editableFields);

  await item.save();

  const populated = await item.populate(
    "customer",
    "customerCode name companyName",
  );

  res.json(populated);
});

// =====================================
// CONVERT REQUEST -> EVENT
// =====================================

export const convertEventRequest = asyncHandler(async (req, res) => {
  const request = await EventRequest.findById(req.params.id).populate(
    "customer",
  );

  if (!request) {
    return res.status(404).json({
      message: "Event request not found",
    });
  }

  if (request.status === REQUEST_STATUS.CONVERTED) {
    return res.status(400).json({
      message: "Request has already been converted",
    });
  }

  // Quan trọng:
  // chỉ APPROVED mới được chuyển thành Event.
  assertSystemTransition(request.status, REQUEST_STATUS.CONVERTED);

  // Chặn tạo Event trùng dù dữ liệu request
  // có vấn đề.
  const existingEvent = await Event.findOne({
    eventRequest: request._id,
  });

  if (existingEvent) {
    return res.status(409).json({
      message: "An event already exists for this request",
    });
  }

  // Event doanh nghiệp phải có
  // quotation đã APPROVED.
  const quotation = await Quotation.findOne({
    eventRequest: request._id,

    status: "APPROVED",
  }).sort({
    createdAt: -1,
  });

  if (!quotation) {
    return res.status(400).json({
      message:
        "An approved quotation is required before converting this request",
    });
  }

  const event = await Event.create({
    customer: request.customer._id,

    eventRequest: request._id,

    quotation: quotation._id,

    name: request.title,

    type: request.eventType,

    startDate: request.eventDate,

    venue: request.location,

    attendeesExpected: request.expectedAttendees,

    budget: {
      planned: request.expectedBudget,

      revenue: quotation.total || 0,
    },

    manager: request.owner || req.user._id,

    createdBy: req.user._id,
  });

  request.status = REQUEST_STATUS.CONVERTED;

  await request.save();

  const populated = await event.populate(
    "customer",
    "name companyName customerCode",
  );

  res.status(201).json(populated);
});
