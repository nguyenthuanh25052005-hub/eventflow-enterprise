import asyncHandler from "express-async-handler";
import Expense from "../models/Expense.js";
import Event from "../models/Event.js";
import Quotation from "../models/Quotation.js";

export const getFinanceSummary = asyncHandler(async (req, res) => {
  const [events, expenses, approvedQuotes] = await Promise.all([
    Event.find({ status: { $ne: "CANCELLED" } }).select(
      "name eventCode budget status startDate",
    ),
    Expense.find({ status: { $in: ["APPROVED", "PAID", "PENDING"] } }).populate(
      "event",
      "name eventCode",
    ),
    Quotation.find({ status: "APPROVED" }).select("total"),
  ]);
  const revenue = approvedQuotes.reduce((s, q) => s + Number(q.total || 0), 0);
  const approvedExpense = expenses
    .filter((e) => ["APPROVED", "PAID"].includes(e.status))
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const pendingExpense = expenses
    .filter((e) => e.status === "PENDING")
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  res.json({
    revenue,
    approvedExpense,
    pendingExpense,
    grossMargin: revenue - approvedExpense,
    events,
    recentExpenses: expenses.slice(0, 20),
  });
});
export const listExpenses = asyncHandler(async (req, res) => {
  const filter = req.query.event ? { event: req.query.event } : {};
  const items = await Expense.find(filter)
    .populate("event", "eventCode name")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ items });
});
export const createExpense = asyncHandler(async (req, res) => {
  const item = await Expense.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(await item.populate("event", "eventCode name"));
});
export const updateExpense = asyncHandler(async (req, res) => {
  const item = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("event", "eventCode name");
  if (!item) return res.status(404).json({ message: "Expense not found" });
  res.json(item);
});
