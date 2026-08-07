import asyncHandler from "express-async-handler";
import Customer from "../models/Customer.js";
import EventRequest from "../models/EventRequest.js";
import Event from "../models/Event.js";
import Quotation from "../models/Quotation.js";

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
  const item = await Customer.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(item);
});
export const updateCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: "Customer not found" });
  res.json(item);
});
export const deleteCustomer = asyncHandler(async (req, res) => {
  const item = await Customer.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Customer not found" });
  item.status = "INACTIVE";
  await item.save();
  res.json({ message: "Customer deactivated" });
});
