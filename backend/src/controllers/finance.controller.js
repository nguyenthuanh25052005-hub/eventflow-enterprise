import asyncHandler from "express-async-handler";
import Expense from "../models/Expense.js";
import Event from "../models/Event.js";
import Quotation from "../models/Quotation.js";
import { createAuditLog } from "../services/auditLog.service.js";

const EXPENSE_STATUS_TRANSITIONS = {
  DRAFT: ["PENDING"],
  PENDING: ["APPROVED", "REJECTED"],
  REJECTED: ["DRAFT"],
  APPROVED: ["PAID"],
  PAID: [],
};

// =====================================
// FINANCE SUMMARY
// =====================================

export const getFinanceSummary = asyncHandler(async (req, res) => {
  const [events, expenses, approvedQuoteGroups] = await Promise.all([
    Event.find({
      status: {
        $ne: "CANCELLED",
      },
    }).select("name eventCode budget status startDate"),

    Expense.find({
      status: {
        $in: ["APPROVED", "PAID", "PENDING"],
      },
    })
      .populate("event", "name eventCode")
      .sort({
        createdAt: -1,
      }),

    // Mỗi Event Request chỉ tính một quotation APPROVED
    // để tránh cộng trùng doanh thu từ dữ liệu cũ.
    Quotation.aggregate([
      {
        $match: {
          status: "APPROVED",
          eventRequest: {
            $ne: null,
          },
        },
      },

      {
        $sort: {
          updatedAt: -1,
          createdAt: -1,
        },
      },

      {
        $group: {
          _id: "$eventRequest",

          total: {
            $first: "$total",
          },
        },
      },
    ]),
  ]);

  const revenue = approvedQuoteGroups.reduce(
    (sum, quotation) => sum + Number(quotation.total || 0),
    0,
  );

  const approvedExpense = expenses
    .filter((expense) => ["APPROVED", "PAID"].includes(expense.status))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const pendingExpense = expenses
    .filter((expense) => expense.status === "PENDING")
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  res.json({
    revenue,
    approvedExpense,
    pendingExpense,
    grossMargin: revenue - approvedExpense,
    events,
    recentExpenses: expenses.slice(0, 20),
  });
});

// =====================================
// LIST EXPENSES
// =====================================

export const listExpenses = asyncHandler(async (req, res) => {
  const filter = req.query.event
    ? {
        event: req.query.event,
      }
    : {};

  const items = await Expense.find(filter)
    .populate("event", "eventCode name")
    .sort({
      createdAt: -1,
    })
    .limit(100);

  res.json({
    items,
  });
});

// =====================================
// CREATE EXPENSE
// =====================================

export const createExpense = asyncHandler(async (req, res) => {
  const { event, category, description, vendor, amount, expenseDate } =
    req.body;

  const existingEvent = await Event.findById(event);

  if (!existingEvent) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  // Không dùng ...req.body
  // để client không tự đặt status hoặc approval fields.
  const item = await Expense.create({
    event,
    category,
    description,
    vendor,
    amount,
    expenseDate,

    status: "DRAFT",

    createdBy: req.user._id,
  });

  await createAuditLog({
    req,

    action: "CREATE",

    module: "EXPENSE",

    recordId: item._id,

    oldData: null,

    newData: {
      event: item.event,
      category: item.category,
      description: item.description,
      vendor: item.vendor,
      amount: item.amount,
      status: item.status,
      expenseDate: item.expenseDate,
    },
  });

  await item.populate("event", "eventCode name");

  res.status(201).json(item);
});

// =====================================
// UPDATE EXPENSE
// =====================================

export const updateExpense = asyncHandler(async (req, res) => {
  const item = await Expense.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Expense not found",
    });
  }

  const {
    _id,
    createdBy,

    // Không cho client tự gán audit fields
    submittedBy,
    submittedAt,

    approvedBy,
    approvedAt,

    rejectedBy,
    rejectedAt,

    paidBy,
    paidAt,

    status,

    ...editableFields
  } = req.body;

  const oldStatus = item.status;

  const userRole = req.user.role;

  const financeRoles = ["SUPER_ADMIN", "ADMIN", "FINANCE"];

  // =====================================
  // CHECK EDITABLE FIELDS
  // =====================================

  const hasEditableFields = Object.keys(editableFields).length > 0;

  if (hasEditableFields && !["DRAFT", "REJECTED"].includes(item.status)) {
    return res.status(409).json({
      success: false,

      code: "EXPENSE_LOCKED",

      message:
        "Expense details can only be edited while status is DRAFT or REJECTED",
    });
  }

  // =====================================
  // CHECK STATUS WORKFLOW
  // =====================================

  if (status && status !== oldStatus) {
    const allowedStatuses = EXPENSE_STATUS_TRANSITIONS[oldStatus] || [];

    if (!allowedStatuses.includes(status)) {
      return res.status(409).json({
        success: false,

        code: "INVALID_EXPENSE_STATUS_TRANSITION",

        message: `Cannot change expense status from ${oldStatus} to ${status}`,
      });
    }

    // Chỉ Finance/Admin được approve/reject/pay
    if (
      ["APPROVED", "REJECTED", "PAID"].includes(status) &&
      !financeRoles.includes(userRole)
    ) {
      return res.status(403).json({
        success: false,

        code: "EXPENSE_PERMISSION_DENIED",

        message:
          "Only Finance or Admin can approve, reject or mark an expense as paid",
      });
    }
  }

  // =====================================
  // OLD DATA FOR AUDIT
  // =====================================

  const oldData = {};

  for (const field of Object.keys(editableFields)) {
    oldData[field] = item.get(field);
  }

  if (status && status !== oldStatus) {
    oldData.status = oldStatus;
  }

  // =====================================
  // UPDATE NORMAL FIELDS
  // =====================================

  Object.assign(item, editableFields);

  // =====================================
  // STATUS CHANGE
  // =====================================

  if (status && status !== oldStatus) {
    item.status = status;

    // DRAFT -> PENDING
    if (status === "PENDING") {
      oldData.submittedBy = item.submittedBy || null;
      oldData.submittedAt = item.submittedAt || null;

      item.submittedBy = req.user._id;
      item.submittedAt = new Date();
    }

    // PENDING -> APPROVED
    if (status === "APPROVED") {
      oldData.approvedBy = item.approvedBy || null;
      oldData.approvedAt = item.approvedAt || null;

      item.approvedBy = req.user._id;
      item.approvedAt = new Date();
    }

    // PENDING -> REJECTED
    if (status === "REJECTED") {
      oldData.rejectedBy = item.rejectedBy || null;
      oldData.rejectedAt = item.rejectedAt || null;

      item.rejectedBy = req.user._id;
      item.rejectedAt = new Date();
    }

    // APPROVED -> PAID
    if (status === "PAID") {
      oldData.paidBy = item.paidBy || null;
      oldData.paidAt = item.paidAt || null;

      item.paidBy = req.user._id;
      item.paidAt = new Date();
    }
  }

  await item.save();

  // =====================================
  // NEW DATA FOR AUDIT
  // =====================================

  const newData = {};

  for (const field of Object.keys(editableFields)) {
    const oldValue = oldData[field];

    const newValue = item.get(field);

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      newData[field] = newValue;
    } else {
      delete oldData[field];
    }
  }

  if (status && status !== oldStatus) {
    newData.status = item.status;

    if (status === "PENDING") {
      newData.submittedBy = item.submittedBy;
      newData.submittedAt = item.submittedAt;
    }

    if (status === "APPROVED") {
      newData.approvedBy = item.approvedBy;
      newData.approvedAt = item.approvedAt;
    }

    if (status === "REJECTED") {
      newData.rejectedBy = item.rejectedBy;
      newData.rejectedAt = item.rejectedAt;
    }

    if (status === "PAID") {
      newData.paidBy = item.paidBy;
      newData.paidAt = item.paidAt;
    }
  }

  // =====================================
  // AUDIT LOG
  // =====================================

  if (Object.keys(newData).length > 0) {
    await createAuditLog({
      req,

      action: oldStatus !== item.status ? "STATUS_CHANGE" : "UPDATE",

      module: "EXPENSE",

      recordId: item._id,

      oldData,

      newData,
    });
  }

  await item.populate("event", "eventCode name");

  res.json(item);
});
