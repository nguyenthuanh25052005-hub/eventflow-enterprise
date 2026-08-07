import asyncHandler from "express-async-handler";
import Quotation from "../models/Quotation.js";
import EventRequest from "../models/EventRequest.js";

export const listQuotations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.eventRequest) filter.eventRequest = req.query.eventRequest;
  const items = await Quotation.find(filter)
    .populate("customer", "customerCode name companyName")
    .populate("eventRequest", "requestCode title status")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ items });
});

export const createQuotation = asyncHandler(async (req, res) => {
  const request = await EventRequest.findById(req.body.eventRequest);
  if (!request)
    return res.status(404).json({ message: "Event request not found" });
  const item = await Quotation.create({
    ...req.body,
    customer: request.customer,
    createdBy: req.user._id,
  });
  if (request.status === "NEW" || request.status === "QUALIFYING") {
    request.status = "QUOTATION";
    await request.save();
  }
  res.status(201).json(await item.populate(["customer", "eventRequest"]));
});

export const updateQuotation = asyncHandler(async (req, res) => {
  const item = await Quotation.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Quotation not found" });
  Object.assign(item, req.body);
  await item.save();
  if (item.status === "APPROVED")
    await EventRequest.findByIdAndUpdate(item.eventRequest, {
      status: "APPROVED",
    });
  if (item.status === "SENT")
    await EventRequest.findByIdAndUpdate(item.eventRequest, {
      status: "NEGOTIATING",
    });
  res.json(await item.populate(["customer", "eventRequest"]));
});
