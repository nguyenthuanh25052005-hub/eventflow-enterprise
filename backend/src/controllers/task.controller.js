import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";

export const listTasks = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.event) filter.event = req.query.event;
  if (req.query.status) filter.status = req.query.status;
  const items = await Task.find(filter)
    .populate("event", "eventCode name startDate status")
    .sort({ dueDate: 1, createdAt: -1 })
    .limit(200);
  res.json({ items });
});
export const createTask = asyncHandler(async (req, res) => {
  const item = await Task.create({ ...req.body, createdBy: req.user._id });
  res
    .status(201)
    .json(await item.populate("event", "eventCode name startDate"));
});
export const updateTask = asyncHandler(async (req, res) => {
  const item = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("event", "eventCode name startDate");
  if (!item) return res.status(404).json({ message: "Task not found" });
  res.json(item);
});
