import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import User from "../models/User.js";
import Customer from "../models/Customer.js";
import EventRequest from "../models/EventRequest.js";
import Quotation from "../models/Quotation.js";
import Event from "../models/Event.js";
import { createAuditLog } from "../services/auditLog.service.js";
import {
  REQUEST_STATUS,
  assertManualTransition,
  assertSystemTransition,
} from "../utils/eventRequestWorkflow.js";

function getCustomerId(req) {
  return req.user?.customer;
}

function isValidId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function normalizeRequirements(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function ensureCustomer(req, res) {
  const customerId = getCustomerId(req);

  if (!customerId) {
    res.status(403).json({
      message: "Customer account is not linked to a customer profile",
    });

    return null;
  }

  return customerId;
}

// =====================================
// PORTAL PROFILE
// =====================================

// GET /api/customer-portal/me
export const getPortalMe = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  const user = await User.findById(req.user._id).populate(
    "customer",
    "customerCode type name companyName email phone address taxCode contactPerson status",
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      customer: user.customer,
    },
  });
});

// GET /api/customer-portal/summary
export const getPortalSummary = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  const now = new Date();

  const [activeRequests, pendingQuotations, upcomingEvents, completedEvents] =
    await Promise.all([
      EventRequest.countDocuments({
        customer: customerId,
        status: {
          $in: ["NEW", "QUALIFYING", "QUOTATION", "NEGOTIATING", "APPROVED"],
        },
      }),

      Quotation.countDocuments({
        customer: customerId,
        status: "SENT",
      }),

      Event.countDocuments({
        customer: customerId,
        startDate: { $gte: now },
        status: {
          $nin: ["COMPLETED", "CANCELLED"],
        },
      }),

      Event.countDocuments({
        customer: customerId,
        status: "COMPLETED",
      }),
    ]);

  res.json({
    activeRequests,
    pendingQuotations,
    upcomingEvents,
    completedEvents,
  });
});

// =====================================
// COMPANY
// =====================================

// GET /api/customer-portal/company
export const getCompany = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  const customer = await Customer.findById(customerId);

  if (!customer) {
    return res.status(404).json({
      message: "Customer profile not found",
    });
  }

  res.json({
    customer,
  });
});

// PUT /api/customer-portal/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  const user = await User.findById(req.user._id);
  const customer = await Customer.findById(customerId);

  if (!user || !customer) {
    return res.status(404).json({
      message: "Customer account not found",
    });
  }

  const { name, email, phone } = req.body;

  if (name !== undefined) {
    if (!String(name).trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    user.name = String(name).trim();

    if (!customer.contactPerson) {
      customer.contactPerson = {};
    }

    customer.contactPerson.name = String(name).trim();

    if (customer.type === "INDIVIDUAL") {
      customer.name = String(name).trim();
    }
  }

  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const duplicate = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Email is already in use",
      });
    }

    user.email = normalizedEmail;
    customer.email = normalizedEmail;

    if (!customer.contactPerson) {
      customer.contactPerson = {};
    }

    customer.contactPerson.email = normalizedEmail;
  }

  if (phone !== undefined) {
    const normalizedPhone = String(phone).trim();

    customer.phone = normalizedPhone;

    if (!customer.contactPerson) {
      customer.contactPerson = {};
    }

    customer.contactPerson.phone = normalizedPhone;
  }

  await Promise.all([user.save(), customer.save()]);

  const populatedUser = await User.findById(user._id).populate(
    "customer",
    "customerCode type name companyName email phone address taxCode contactPerson status",
  );

  res.json({
    message: "Profile updated successfully",
    user: {
      id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: populatedUser.role,
      customer: populatedUser.customer,
    },
  });
});

// PUT /api/customer-portal/company
export const updateCompany = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  const customer = await Customer.findById(customerId);

  if (!customer) {
    return res.status(404).json({
      message: "Customer profile not found",
    });
  }

  const { companyName, phone, address, taxCode } = req.body;

  if (customer.type === "COMPANY" && companyName !== undefined) {
    if (!String(companyName).trim()) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }

    customer.companyName = String(companyName).trim();

    customer.name = String(companyName).trim();
  }

  if (phone !== undefined) {
    customer.phone = String(phone).trim();
  }

  if (address !== undefined) {
    customer.address = String(address).trim();
  }

  if (taxCode !== undefined) {
    customer.taxCode = String(taxCode).trim();
  }

  await customer.save();

  res.json({
    message: "Company updated successfully",
    customer,
  });
});

// =====================================
// EVENT REQUESTS
// =====================================

// GET /api/customer-portal/requests
export const listMyRequests = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  const filter = {
    customer: customerId,
  };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const items = await EventRequest.find(filter)
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({
    items,
  });
});

// POST /api/customer-portal/requests
export const createMyRequest = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  const {
    title,
    eventType,
    eventDate,
    expectedAttendees,
    location,
    expectedBudget,
    requirements,
    notes,
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({
      message: "Event title is required",
    });
  }

  const attendees =
    expectedAttendees === "" || expectedAttendees === undefined
      ? 0
      : Number(expectedAttendees);

  const budget =
    expectedBudget === "" || expectedBudget === undefined
      ? 0
      : Number(expectedBudget);

  if (!Number.isFinite(attendees) || attendees < 0) {
    return res.status(400).json({
      message: "Expected attendees must be a non-negative number",
    });
  }

  if (!Number.isFinite(budget) || budget < 0) {
    return res.status(400).json({
      message: "Expected budget must be a non-negative number",
    });
  }

  const item = await EventRequest.create({
    customer: customerId,

    title: title.trim(),

    eventType: eventType || "CORPORATE",

    eventDate: eventDate || undefined,

    expectedAttendees: attendees,

    location: location?.trim() || "",

    expectedBudget: budget,

    requirements: normalizeRequirements(requirements),

    notes: notes?.trim() || "",

    // Customer không được tự đặt stage.
    status: REQUEST_STATUS.NEW,

    priority: "MEDIUM",

    createdBy: req.user._id,
  });

  res.status(201).json({
    message: "Event request submitted successfully",
    item,
  });
});

// GET /api/customer-portal/requests/:id
export const getMyRequest = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  if (!isValidId(req.params.id)) {
    return res.status(404).json({
      message: "Event request not found",
    });
  }

  const request = await EventRequest.findOne({
    _id: req.params.id,
    customer: customerId,
  });

  if (!request) {
    return res.status(404).json({
      message: "Event request not found",
    });
  }

  const [quotations, event] = await Promise.all([
    Quotation.find({
      eventRequest: request._id,
      customer: customerId,

      // DRAFT là dữ liệu nội bộ,
      // customer chưa được xem.
      status: {
        $ne: "DRAFT",
      },
    }).sort({
      createdAt: -1,
    }),

    Event.findOne({
      eventRequest: request._id,
      customer: customerId,
    }).select(
      "eventCode name type startDate endDate venue attendeesExpected status health progress description",
    ),
  ]);

  res.json({
    request,
    quotations,
    event,
  });
});

// =====================================
// QUOTATIONS
// =====================================

// GET /api/customer-portal/quotations
export const listMyQuotations = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  const filter = {
    customer: customerId,

    // Không expose quotation draft.
    status: {
      $ne: "DRAFT",
    },
  };

  if (req.query.status) {
    if (req.query.status === "DRAFT") {
      return res.status(403).json({
        message: "Draft quotations are internal",
      });
    }

    filter.status = req.query.status;
  }

  const items = await Quotation.find(filter)
    .populate("eventRequest", "requestCode title status eventDate")
    .sort({
      createdAt: -1,
    })
    .limit(100);

  res.json({
    items,
  });
});

// GET /api/customer-portal/quotations/:id
export const getMyQuotation = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  if (!isValidId(req.params.id)) {
    return res.status(404).json({
      message: "Quotation not found",
    });
  }

  const quotation = await Quotation.findOne({
    _id: req.params.id,
    customer: customerId,
    status: {
      $ne: "DRAFT",
    },
  }).populate(
    "eventRequest",
    "requestCode title status eventDate expectedAttendees location",
  );

  if (!quotation) {
    return res.status(404).json({
      message: "Quotation not found",
    });
  }

  res.json({
    quotation,
  });
});

// PATCH /api/customer-portal/quotations/:id/decision
export const decideMyQuotation = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  // Kiểm tra ID quotation hợp lệ
  if (!isValidId(req.params.id)) {
    return res.status(404).json({
      message: "Quotation not found",
    });
  }

  // Chỉ chấp nhận APPROVE hoặc REJECT
  const decision = String(req.body.decision || "").toUpperCase();

  if (!["APPROVE", "REJECT"].includes(decision)) {
    return res.status(400).json({
      message: "Decision must be APPROVE or REJECT",
    });
  }

  // Chỉ lấy quotation thuộc đúng customer đang đăng nhập
  const quotation = await Quotation.findOne({
    _id: req.params.id,
    customer: customerId,
  });

  if (!quotation) {
    return res.status(404).json({
      message: "Quotation not found",
    });
  }

  // Customer chỉ được quyết định quotation đã SENT
  if (quotation.status !== "SENT") {
    return res.status(409).json({
      message: "Only a SENT quotation can be approved or rejected",
    });
  }

  // =====================================
  // CHECK EXPIRATION
  // =====================================

  if (quotation.validUntil && new Date(quotation.validUntil) < new Date()) {
    const oldStatus = quotation.status;

    quotation.status = "EXPIRED";

    await quotation.save();

    await createAuditLog({
      req,
      action: "EXPIRE",
      module: "QUOTATION",
      recordId: quotation._id,

      oldData: {
        status: oldStatus,
      },

      newData: {
        status: "EXPIRED",
      },
    });

    return res.status(409).json({
      message: "Quotation has expired",
    });
  }

  // =====================================
  // GET EVENT REQUEST
  // =====================================

  const request = await EventRequest.findOne({
    _id: quotation.eventRequest,
    customer: customerId,
  });

  if (!request) {
    return res.status(404).json({
      message: "Linked event request not found",
    });
  }

  const oldQuotationStatus = quotation.status;
  const oldRequestStatus = request.status;

  // =====================================
  // APPROVE
  // =====================================

  if (decision === "APPROVE") {
    // Kiểm tra xem request này đã có quotation
    // nào APPROVED chưa.
    const approvedQuotation = await Quotation.findOne({
      eventRequest: quotation.eventRequest,

      status: "APPROVED",

      _id: {
        $ne: quotation._id,
      },
    }).select("_id quotationCode");

    if (approvedQuotation) {
      return res.status(409).json({
        success: false,

        code: "EVENT_REQUEST_ALREADY_HAS_APPROVED_QUOTATION",

        message: "This event request already has an approved quotation",
      });
    }

    // Kiểm tra workflow của Event Request
    assertSystemTransition(request.status, REQUEST_STATUS.APPROVED);

    quotation.status = "APPROVED";

    request.status = REQUEST_STATUS.APPROVED;
  }

  // =====================================
  // REJECT
  // =====================================

  if (decision === "REJECT") {
    assertManualTransition(request.status, REQUEST_STATUS.REJECTED);

    quotation.status = "REJECTED";

    request.status = REQUEST_STATUS.REJECTED;
  }

  // =====================================
  // SAVE
  // =====================================

  await Promise.all([quotation.save(), request.save()]);

  // =====================================
  // EXPIRE OTHER QUOTATIONS
  // =====================================

  if (decision === "APPROVE") {
    // Khi khách duyệt 1 quotation,
    // tất cả quotation SENT khác của cùng request
    // sẽ không còn hiệu lực.
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
  }

  // =====================================
  // AUDIT QUOTATION
  // =====================================

  await createAuditLog({
    req,

    action: decision,

    module: "QUOTATION",

    recordId: quotation._id,

    oldData: {
      status: oldQuotationStatus,
    },

    newData: {
      status: quotation.status,
    },
  });

  // =====================================
  // AUDIT EVENT REQUEST
  // =====================================

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

  // =====================================
  // RESPONSE
  // =====================================

  const populated = await Quotation.findById(quotation._id).populate(
    "eventRequest",
    "requestCode title status eventDate",
  );

  res.json({
    message:
      decision === "APPROVE"
        ? "Quotation approved successfully"
        : "Quotation rejected successfully",

    quotation: populated,
  });
});
// =====================================
// EVENTS
// =====================================

// GET /api/customer-portal/events
export const listMyEvents = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  const filter = {
    customer: customerId,
  };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const items = await Event.find(filter)
    .select(
      "eventCode eventRequest quotation name type startDate endDate venue attendeesExpected status health progress description createdAt",
    )
    .populate("eventRequest", "requestCode title status")
    .populate("quotation", "quotationCode title total status")
    .sort({
      startDate: 1,
      createdAt: -1,
    });

  res.json({
    items,
  });
});

// GET /api/customer-portal/events/:id
export const getMyEvent = asyncHandler(async (req, res) => {
  const customerId = ensureCustomer(req, res);

  if (!customerId) return;

  if (!isValidId(req.params.id)) {
    return res.status(404).json({
      message: "Event not found",
    });
  }

  const event = await Event.findOne({
    _id: req.params.id,
    customer: customerId,
  })
    .select(
      "eventCode eventRequest quotation name type startDate endDate venue attendeesExpected status health progress description createdAt updatedAt",
    )
    .populate("eventRequest", "requestCode title status eventDate")
    .populate(
      "quotation",
      "quotationCode title subtotal discount vatPercent vatAmount total status validUntil",
    );

  if (!event) {
    return res.status(404).json({
      message: "Event not found",
    });
  }

  res.json({
    event,
  });
});
