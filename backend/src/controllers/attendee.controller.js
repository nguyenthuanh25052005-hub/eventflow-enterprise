import asyncHandler from "express-async-handler";
import Attendee from "../models/Attendee.js";

export const listAttendees = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.event) filter.event = req.query.event;
  if (req.query.status) filter.status = req.query.status;
  const items = await Attendee.find(filter)
    .populate("event", "eventCode name startDate")
    .sort({ createdAt: -1 })
    .limit(500);
  res.json({ items });
});
export const createAttendee = asyncHandler(async (req, res) => {
  const item = await Attendee.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(await item.populate("event", "eventCode name"));
});
export const checkInAttendee = asyncHandler(async (req, res) => {
  const item = await Attendee.findOne({ qrCode: req.params.qrCode });
  if (!item) return res.status(404).json({ message: "QR code not found" });
  if (item.status === "CANCELLED")
    return res.status(400).json({ message: "Attendee is cancelled" });
  item.status = "CHECKED_IN";
  item.checkInAt = new Date();
  await item.save();
  res.json(await item.populate("event", "eventCode name"));
});
