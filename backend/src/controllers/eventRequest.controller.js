import asyncHandler from "express-async-handler";
import EventRequest from "../models/EventRequest.js";
import Event from "../models/Event.js";
import Quotation from "../models/Quotation.js";

export const listEventRequests = asyncHandler(async (req, res) => {
  const { status, search = "" } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search)
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { requestCode: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  const items = await EventRequest.find(filter)
    .populate("customer", "customerCode name companyName email phone")
    .populate("owner", "name email")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ items });
});

export const getEventRequest = asyncHandler(async (req, res) => {
  const item = await EventRequest.findById(req.params.id)
    .populate("customer")
    .populate("owner", "name email role");
  if (!item)
    return res.status(404).json({ message: "Event request not found" });
  const quotations = await Quotation.find({ eventRequest: item._id }).sort({
    createdAt: -1,
  });
  res.json({ ...item.toObject(), quotations });
});

export const createEventRequest = asyncHandler(async (req, res) => {
  const item = await EventRequest.create({
    ...req.body,
    owner: req.body.owner || req.user._id,
    createdBy: req.user._id,
  });
  const populated = await item.populate(
    "customer",
    "customerCode name companyName",
  );
  res.status(201).json(populated);
});

export const updateEventRequest = asyncHandler(async (req, res) => {
  const item = await EventRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("customer", "customerCode name companyName");
  if (!item)
    return res.status(404).json({ message: "Event request not found" });
  res.json(item);
});

export const convertEventRequest = asyncHandler(async (req, res) => {
  const request = await EventRequest.findById(req.params.id).populate(
    "customer",
  );
  if (!request)
    return res.status(404).json({ message: "Event request not found" });
  if (request.status === "CONVERTED")
    return res
      .status(400)
      .json({ message: "Request has already been converted" });
  const quotation = await Quotation.findOne({
    eventRequest: request._id,
    status: "APPROVED",
  }).sort({ createdAt: -1 });
  const event = await Event.create({
    customer: request.customer._id,
    eventRequest: request._id,
    quotation: quotation?._id,
    name: request.title,
    type: request.eventType,
    startDate: request.eventDate,
    venue: request.location,
    attendeesExpected: request.expectedAttendees,
    budget: {
      planned: request.expectedBudget,
      revenue: quotation?.total || request.expectedBudget || 0,
    },
    manager: request.owner || req.user._id,
    createdBy: req.user._id,
  });
  request.status = "CONVERTED";
  await request.save();
  res
    .status(201)
    .json(await event.populate("customer", "name companyName customerCode"));
});
