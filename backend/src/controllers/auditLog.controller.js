import asyncHandler from "express-async-handler";
import AuditLog from "../models/AuditLog.js";

export const listAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

  const { action, module, userRole, recordId } = req.query;

  const filter = {};

  if (action) {
    filter.action = action.toUpperCase();
  }

  if (module) {
    filter.module = module.toUpperCase();
  }

  if (userRole) {
    filter.userRole = userRole.toUpperCase();
  }

  if (recordId) {
    filter.recordId = recordId;
  }

  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),

    AuditLog.countDocuments(filter),
  ]);

  res.json({
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});
