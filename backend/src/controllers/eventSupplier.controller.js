import mongoose from "mongoose";
import EventSupplier from "../models/EventSupplier.js";
import Event from "../models/Event.js";
import Supplier from "../models/Supplier.js";

import {
  EVENT_SUPPLIER_STATUSES,
  canTransitionEventSupplierStatus,
} from "../utils/eventSupplierStatus.js";

const STATUSES = [
  "PROPOSED",
  "REQUESTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

function getUserId(req) {
  return req.user?._id || req.user?.id;
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function normalizeNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
}

function validateDates(startDate, endDate) {
  if (!startDate || !endDate) {
    return null;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Invalid startDate or endDate.";
  }

  if (end < start) {
    return "endDate cannot be earlier than startDate.";
  }

  return null;
}

export async function listEventSuppliers(req, res) {
  const { eventId, status, supplierId } = req.query;

  const filter = {};

  if (eventId) {
    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid eventId.",
      });
    }

    filter.event = eventId;
  }

  if (status) {
    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier status.",
      });
    }

    filter.status = status;
  }

  if (supplierId) {
    if (!isValidObjectId(supplierId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplierId.",
      });
    }

    filter.supplier = supplierId;
  }

  const items = await EventSupplier.find(filter)
    .populate(
      "event",
      "eventCode name startDate endDate status venue",
    )
    .populate(
      "supplier",
      "supplierCode name category contactName phone email rating status",
    )
    .populate("createdBy", "fullName name email")
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    success: true,
    data: items,
  });
}

export async function getEventSupplier(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid EventSupplier id.",
    });
  }

  const item = await EventSupplier.findById(id)
    .populate(
      "event",
      "eventCode name startDate endDate status venue",
    )
    .populate(
      "supplier",
      "supplierCode name category contactName phone email rating status",
    )
    .populate("createdBy", "fullName name email");

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Event supplier assignment not found.",
    });
  }

  return res.json({
    success: true,
    data: item,
  });
}

export async function createEventSupplier(req, res) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authenticated user is required.",
    });
  }

  const {
    event,
    supplier,
    service,
    description,
    quotationValue,
    contractValue,
    startDate,
    endDate,
    status,
    contactPerson,
    notes,
  } = req.body;

  if (!event) {
    return res.status(400).json({
      success: false,
      message: "Event is required.",
    });
  }

  if (!supplier) {
    return res.status(400).json({
      success: false,
      message: "Supplier is required.",
    });
  }

  if (!isValidObjectId(event)) {
    return res.status(400).json({
      success: false,
      message: "Invalid event id.",
    });
  }

  if (!isValidObjectId(supplier)) {
    return res.status(400).json({
      success: false,
      message: "Invalid supplier id.",
    });
  }

  if (!service?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Service is required.",
    });
  }

  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid supplier status.",
    });
  }

  const dateError = validateDates(startDate, endDate);

  if (dateError) {
    return res.status(400).json({
      success: false,
      message: dateError,
    });
  }

  const normalizedQuotation = normalizeNumber(quotationValue);

  if (normalizedQuotation === null) {
    return res.status(400).json({
      success: false,
      message: "quotationValue must be a non-negative number.",
    });
  }

  const normalizedContract = normalizeNumber(contractValue);

  if (normalizedContract === null) {
    return res.status(400).json({
      success: false,
      message: "contractValue must be a non-negative number.",
    });
  }

  const [eventExists, supplierExists] = await Promise.all([
    Event.exists({ _id: event }),
    Supplier.exists({ _id: supplier, status: "ACTIVE" }),
  ]);

  if (!eventExists) {
    return res.status(404).json({
      success: false,
      message: "Event not found.",
    });
  }

  if (!supplierExists) {
    return res.status(404).json({
      success: false,
      message: "Active supplier not found.",
    });
  }

  const existing = await EventSupplier.findOne({
    event,
    supplier,
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: "This supplier is already assigned to the event.",
      data: existing,
    });
  }

  const item = await EventSupplier.create({
    event,
    supplier,
    service: service.trim(),
    description: description?.trim() || "",
    quotationValue: normalizedQuotation,
    contractValue: normalizedContract,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: status || "PROPOSED",
    contactPerson: contactPerson?.trim() || "",
    notes: notes?.trim() || "",
    createdBy: userId,
  });

  const populated = await EventSupplier.findById(item._id)
    .populate(
      "event",
      "eventCode name startDate endDate status venue",
    )
    .populate(
      "supplier",
      "supplierCode name category contactName phone email rating status",
    )
    .populate("createdBy", "fullName name email");

  return res.status(201).json({
    success: true,
    message: "Supplier assigned to event successfully.",
    data: populated,
  });
}

export async function updateEventSupplier(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid EventSupplier id.",
    });
  }

  const item = await EventSupplier.findById(id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Event supplier assignment not found.",
    });
  }

  const {
    supplier,
    service,
    description,
    quotationValue,
    contractValue,
    startDate,
    endDate,
    status,
    contactPerson,
    notes,
  } = req.body;

  if (supplier !== undefined) {
    if (!isValidObjectId(supplier)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier id.",
      });
    }

    const supplierExists = await Supplier.exists({
      _id: supplier,
      status: "ACTIVE",
    });

    if (!supplierExists) {
      return res.status(404).json({
        success: false,
        message: "Active supplier not found.",
      });
    }

    const duplicate = await EventSupplier.findOne({
      event: item.event,
      supplier,
      _id: { $ne: item._id },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "This supplier is already assigned to the event.",
      });
    }

    item.supplier = supplier;
  }

  if (service !== undefined) {
    if (!String(service).trim()) {
      return res.status(400).json({
        success: false,
        message: "Service is required.",
      });
    }

    item.service = String(service).trim();
  }

  if (description !== undefined) {
    item.description = String(description).trim();
  }

  if (quotationValue !== undefined) {
    const value = normalizeNumber(quotationValue);

    if (value === null) {
      return res.status(400).json({
        success: false,
        message: "quotationValue must be a non-negative number.",
      });
    }

    item.quotationValue = value;
  }

  if (contractValue !== undefined) {
    const value = normalizeNumber(contractValue);

    if (value === null) {
      return res.status(400).json({
        success: false,
        message: "contractValue must be a non-negative number.",
      });
    }

    item.contractValue = value;
  }

  const nextStartDate =
    startDate !== undefined ? startDate : item.startDate;

  const nextEndDate =
    endDate !== undefined ? endDate : item.endDate;

  const dateError = validateDates(
    nextStartDate,
    nextEndDate,
  );

  if (dateError) {
    return res.status(400).json({
      success: false,
      message: dateError,
    });
  }

  if (startDate !== undefined) {
    item.startDate = startDate || undefined;
  }

  if (endDate !== undefined) {
    item.endDate = endDate || undefined;
  }

if (status !== undefined) {
  if (!EVENT_SUPPLIER_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid supplier status.",
    });
  }

  if (
    !canTransitionEventSupplierStatus(
      item.status,
      status,
    )
  ) {
    return res.status(409).json({
      success: false,
      message: `Cannot move supplier from ${item.status} to ${status}.`,
    });
  }

  item.status = status;
}

if (contactPerson !== undefined) {
  item.contactPerson = String(contactPerson).trim();
}

if (notes !== undefined) {
  item.notes = String(notes).trim();
}

await item.save();

const populated = await EventSupplier.findById(item._id)
  .populate(
    "event",
    "eventCode name startDate endDate status venue",
  )
  .populate(
    "supplier",
    "supplierCode name category contactName phone email rating status",
  )
  .populate("createdBy", "fullName name email");

return res.json({
  success: true,
  message: "Event supplier updated successfully.",
  data: populated,
});

}

export async function deleteEventSupplier(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid EventSupplier id.",
    });
  }

  const item = await EventSupplier.findById(id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Event supplier assignment not found.",
    });
  }

  await item.deleteOne();

  return res.json({
    success: true,
    message: "Event supplier assignment deleted successfully.",
  });
}
