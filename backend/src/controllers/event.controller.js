import asyncHandler from "express-async-handler";
import Event from "../models/Event.js";
import Task from "../models/Task.js";
import Expense from "../models/Expense.js";
import Attendee from "../models/Attendee.js";
import { createAuditLog } from "../services/auditLog.service.js";
export const listEvents = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const items = await Event.find(filter)
    .populate("customer", "customerCode name companyName")
    .populate("manager", "name email")
    .sort({ startDate: 1, createdAt: -1 })
    .limit(100);
  res.json({ items });
});

export const getEvent = asyncHandler(async (req, res) => {
  const item = await Event.findById(req.params.id)
    .populate("customer")
    .populate("manager", "name email role")
    .populate("quotation");
  if (!item) return res.status(404).json({ message: "Event not found" });
  const [tasks, expenses, attendees, checkedIn] = await Promise.all([
    Task.find({ event: item._id }).sort({ dueDate: 1 }),
    Expense.find({ event: item._id }).sort({ createdAt: -1 }),
    Attendee.countDocuments({ event: item._id, status: { $ne: "CANCELLED" } }),
    Attendee.countDocuments({ event: item._id, status: "CHECKED_IN" }),
  ]);
  res.json({
    ...item.toObject(),
    tasks,
    expenses,
    attendeeStats: { registered: attendees, checkedIn },
  });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const oldEvent = await Event.findById(req.params.id);

  if (!oldEvent) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  const oldData = {};
  const newData = {};

  for (const field of Object.keys(req.body)) {
    const oldValue = oldEvent.get(field);
    const newValue = updatedEvent.get(field);

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      oldData[field] = oldValue;
      newData[field] = newValue;
    }
  }

  if (Object.keys(newData).length > 0) {
    await createAuditLog({
      req,
      action: "UPDATE",
      module: "EVENT",
      recordId: updatedEvent._id,
      oldData,
      newData,
    });
  }

  await updatedEvent.populate("customer");

  res.json(updatedEvent);
});
