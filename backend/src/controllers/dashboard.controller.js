import asyncHandler from "express-async-handler";
import Customer from "../models/Customer.js";
import EventRequest from "../models/EventRequest.js";
import Event from "../models/Event.js";
import Task from "../models/Task.js";
import Expense from "../models/Expense.js";
import Quotation from "../models/Quotation.js";
import Attendee from "../models/Attendee.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 86400000);
  const [
    customers,
    activeCustomers,
    eventRequests,
    openRequests,
    upcomingEvents,
    overdueTasks,
    approvedQuotes,
    approvedExpenses,
    events,
    tasks,
    checkedIn,
    registered,
  ] = await Promise.all([
    Customer.countDocuments(),
    Customer.countDocuments({ status: "ACTIVE" }),
    EventRequest.countDocuments(),
    EventRequest.countDocuments({
      status: { $nin: ["REJECTED", "CONVERTED"] },
    }),
    Event.countDocuments({
      startDate: { $gte: now, $lte: in30 },
      status: { $nin: ["COMPLETED", "CANCELLED"] },
    }),
    Task.countDocuments({ dueDate: { $lt: now }, status: { $nin: ["DONE"] } }),
    Quotation.find({ status: "APPROVED" }).select("total"),
    Expense.find({ status: { $in: ["APPROVED", "PAID"] } }).select("amount"),
    Event.find({ status: { $nin: ["COMPLETED", "CANCELLED"] } })
      .populate("customer", "name companyName")
      .sort({ startDate: 1 })
      .limit(6),
    Task.find({ status: { $nin: ["DONE"] } })
      .populate("event", "name eventCode")
      .sort({ dueDate: 1 })
      .limit(6),
    Attendee.countDocuments({ status: "CHECKED_IN" }),
    Attendee.countDocuments({ status: { $ne: "CANCELLED" } }),
  ]);
  const revenue = approvedQuotes.reduce((s, x) => s + Number(x.total || 0), 0);
  const cost = approvedExpenses.reduce((s, x) => s + Number(x.amount || 0), 0);
  const pipeline = await EventRequest.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        value: { $sum: "$expectedBudget" },
      },
    },
  ]);
  res.json({
    customers,
    activeCustomers,
    eventRequests,
    openRequests,
    upcomingEvents,
    overdueTasks,
    revenue,
    cost,
    grossMargin: revenue - cost,
    checkInRate: registered ? Math.round((checkedIn / registered) * 100) : 0,
    events,
    tasks,
    pipeline,
  });
});
