import EventSupplier from "../models/EventSupplier.js";
import Event from "../models/Event.js";
import Supplier from "../models/Supplier.js";
import { EVENT_SUPPLIER_STATUSES } from "../utils/eventSupplierStatus.js";

const supplierSelect =
  "supplierCode name category contactName phone email";

const eventSelect = "eventCode name";

export async function getEventSupplierStatuses(req, res) {
  res.json(EVENT_SUPPLIER_STATUSES);
}

export async function listEventSuppliers(req, res) {
  const filter = {};

  if (req.query.event) {
    filter.event = req.query.event;
  }

  const items = await EventSupplier.find(filter)
    .populate("supplier", supplierSelect)
    .populate("event", eventSelect)
    .sort({ createdAt: -1 });

  res.json(items);
}

export async function getEventSupplier(req, res) {
  const item = await EventSupplier.findById(req.params.id)
    .populate("supplier", supplierSelect)
    .populate("event", eventSelect);

  if (!item) {
    return res.status(404).json({
      message: "Event supplier not found",
    });
  }

  res.json(item);
}

export async function createEventSupplier(req, res) {
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

  if (!event || !supplier || !service?.trim()) {
    return res.status(400).json({
      message: "Event, supplier and service are required",
    });
  }

  if (
    status &&
    !EVENT_SUPPLIER_STATUSES.includes(status)
  ) {
    return res.status(400).json({
      message: "Invalid event supplier status",
    });
  }

  const [eventExists, supplierExists] = await Promise.all([
    Event.exists({ _id: event }),
    Supplier.exists({ _id: supplier }),
  ]);

  if (!eventExists) {
    return res.status(404).json({
      message: "Event not found",
    });
  }

  if (!supplierExists) {
    return res.status(404).json({
      message: "Supplier not found",
    });
  }

  const existing = await EventSupplier.findOne({
    event,
    supplier,
  });

  if (existing) {
    return res.status(409).json({
      message:
        "This supplier is already assigned to the event",
    });
  }

  const item = await EventSupplier.create({
    event,
    supplier,
    service: service.trim(),
    description,
    quotationValue,
    contractValue,
    startDate,
    endDate,
    ...(status ? { status } : {}),
    contactPerson,
    notes,
    createdBy: req.user?._id,
  });

  const populated = await item.populate([
    {
      path: "supplier",
      select: supplierSelect,
    },
    {
      path: "event",
      select: eventSelect,
    },
  ]);

  res.status(201).json(populated);
}

export async function updateEventSupplier(req, res) {
  const item = await EventSupplier.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Event supplier not found",
    });
  }

  const allowedFields = [
    "service",
    "description",
    "quotationValue",
    "contractValue",
    "startDate",
    "endDate",
    "contactPerson",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      item[field] = req.body[field];
    }
  });

  await item.save();

  const populated = await item.populate([
    {
      path: "supplier",
      select: supplierSelect,
    },
    {
      path: "event",
      select: eventSelect,
    },
  ]);

  res.json(populated);
}

export async function updateEventSupplierStatus(
  req,
  res,
) {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      message: "Status is required",
    });
  }

  if (!EVENT_SUPPLIER_STATUSES.includes(status)) {
    return res.status(400).json({
      message: "Invalid event supplier status",
    });
  }

  const item = await EventSupplier.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("supplier", supplierSelect)
    .populate("event", eventSelect);

  if (!item) {
    return res.status(404).json({
      message: "Event supplier not found",
    });
  }

  res.json(item);
}

export async function deleteEventSupplier(req, res) {
  const item = await EventSupplier.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Event supplier not found",
    });
  }

  await item.deleteOne();

  res.json({
    message: "Event supplier removed",
  });
}
