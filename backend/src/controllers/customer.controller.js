import asyncHandler from "express-async-handler";
import Customer from "../models/Customer.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import EventRequest from "../models/EventRequest.js";
import Event from "../models/Event.js";
import Quotation from "../models/Quotation.js";
import { createAuditLog } from "../services/auditLog.service.js";
export const listCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1),
    limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const { search = "", status, type } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (search)
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { customerCode: { $regex: search, $options: "i" } },
    ];
  const [items, total] = await Promise.all([
    Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Customer.countDocuments(filter),
  ]);
  res.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Customer not found" });
  const [requests, events, quotes] = await Promise.all([
    EventRequest.find({ customer: item._id }).sort({ createdAt: -1 }).limit(10),
    Event.find({ customer: item._id }).sort({ startDate: -1 }).limit(10),
    Quotation.find({ customer: item._id }).sort({ createdAt: -1 }).limit(10),
  ]);
  const approvedRevenue = quotes
    .filter((q) => q.status === "APPROVED")
    .reduce((s, q) => s + Number(q.total || 0), 0);
  res.json({
    ...item.toObject(),
    metrics: {
      requests: requests.length,
      events: events.length,
      approvedRevenue,
    },
    requests,
    events,
    quotations: quotes,
  });
});
export const createCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await createAuditLog({
    req,
    action: "CREATE",
    module: "CUSTOMER",
    recordId: item._id,
    oldData: null,
    newData: {
      customerCode: item.customerCode,
      type: item.type,
      name: item.name,
      companyName: item.companyName,
      email: item.email,
      phone: item.phone,
      source: item.source,
      status: item.status,
    },
  });

  res.status(201).json(item);
});
export const updateCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Customer not found",
    });
  }

  // Không cho sửa các field hệ thống
  const { customerCode, createdBy, _id, ...editableFields } = req.body;

  const oldData = {};

  for (const field of Object.keys(editableFields)) {
    oldData[field] = item.get(field);
  }

  Object.assign(item, editableFields);

  await item.save();

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

  if (Object.keys(newData).length > 0) {
    await createAuditLog({
      req,
      action: "UPDATE",
      module: "CUSTOMER",
      recordId: item._id,
      oldData,
      newData,
    });
  }

  res.json(item);
});
export const deleteCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Customer not found",
    });
  }

  if (item.status === "INACTIVE") {
    return res.json({
      message: "Customer is already inactive",
    });
  }

  const oldStatus = item.status;

  item.status = "INACTIVE";
  await item.save();

  await createAuditLog({
    req,
    action: "DEACTIVATE",
    module: "CUSTOMER",
    recordId: item._id,
    oldData: {
      status: oldStatus,
    },
    newData: {
      status: item.status,
    },
  });

  res.json({
    message: "Customer deactivated",
  });
});
export const createCustomerPortalAccount = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({
      message: "Customer not found",
    });
  }

  if (customer.status !== "ACTIVE") {
    return res.status(409).json({
      message: "Customer must be ACTIVE before creating a portal account",
    });
  }

  const { email, password, name } = req.body;

  const normalizedEmail = String(
    email || customer.contactPerson?.email || customer.email || "",
  )
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({
      message: "Portal email is required",
    });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return res.status(409).json({
      message: "A user account with this email already exists",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name?.trim() || customer.contactPerson?.name || customer.name,

    email: normalizedEmail,

    passwordHash,

    role: "CUSTOMER",

    customer: customer._id,

    status: "ACTIVE",
  });

  await createAuditLog({
    req,

    action: "CREATE_PORTAL_ACCOUNT",

    module: "CUSTOMER",

    recordId: customer._id,

    oldData: null,

    newData: {
      user: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });

  res.status(201).json({
    message: "Customer portal account created successfully",

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      customer: user.customer,
      status: user.status,
    },
  });
});
