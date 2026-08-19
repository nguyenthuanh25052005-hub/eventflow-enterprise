import EventSupplier from "../models/EventSupplier.js";
import Event from "../models/Event.js";
import Supplier from "../models/Supplier.js";
import {
  EVENT_SUPPLIER_STATUSES,
  canTransitionEventSupplierStatus,
} from "../utils/eventSupplierStatus.js";

const supplierSelect = "supplierCode name category contactName phone email";

const eventSelect = "eventCode name startDate endDate status venue";

// GET /api/event-suppliers/statuses
export function getEventSupplierStatuses(req, res) {
  return res.json(EVENT_SUPPLIER_STATUSES);
}

// GET /api/event-suppliers
export async function listEventSuppliers(req, res) {
  try {
    const filter = {};

    if (req.query.event) {
      filter.event = req.query.event;
    }

    if (req.query.supplier) {
      filter.supplier = req.query.supplier;
    }

    if (req.query.status) {
      if (!EVENT_SUPPLIER_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          message: "Invalid event supplier status",
        });
      }

      filter.status = req.query.status;
    }

    const items = await EventSupplier.find(filter)
      .populate("supplier", supplierSelect)
      .populate("event", eventSelect)
      .populate("createdBy", "fullName name email")
      .sort({ createdAt: -1 });

    return res.json(items);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Could not load event suppliers",
    });
  }
}

// GET /api/event-suppliers/:id
export async function getEventSupplier(req, res) {
  try {
    const item = await EventSupplier.findById(req.params.id)
      .populate("supplier", supplierSelect)
      .populate("event", eventSelect)
      .populate("createdBy", "fullName name email");

    if (!item) {
      return res.status(404).json({
        message: "Event supplier not found",
      });
    }

    return res.json(item);
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Invalid event supplier id",
    });
  }
}

// POST /api/event-suppliers
export async function createEventSupplier(req, res) {
  try {
    const {
      event,
      supplier,
      service,
      description,
      quotationValue,
      contractValue,
      startDate,
      endDate,
      contactPerson,
      notes,
    } = req.body;

    if (!event || !supplier || !service?.trim()) {
      return res.status(400).json({
        message: "Event, supplier and service are required",
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
        message: "This supplier is already assigned to the event",
      });
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "endDate cannot be earlier than startDate",
      });
    }

    const item = await EventSupplier.create({
      event,
      supplier,
      service: service.trim(),
      description: description?.trim() || "",
      quotationValue:
        quotationValue === "" || quotationValue === undefined
          ? 0
          : Number(quotationValue),
      contractValue:
        contractValue === "" || contractValue === undefined
          ? 0
          : Number(contractValue),
      startDate: startDate || undefined,
      endDate: endDate || undefined,

      // Assignment mới luôn bắt đầu từ PROPOSED.
      status: "PROPOSED",

      contactPerson: contactPerson?.trim() || "",
      notes: notes?.trim() || "",
      createdBy: req.user?._id || req.user?.id,
    });

    const populated = await EventSupplier.findById(item._id)
      .populate("supplier", supplierSelect)
      .populate("event", eventSelect)
      .populate("createdBy", "fullName name email");

    return res.status(201).json(populated);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "This supplier is already assigned to the event",
      });
    }

    return res.status(500).json({
      message: error.message || "Could not assign supplier to event",
    });
  }
}

// PUT /api/event-suppliers/:id
export async function updateEventSupplier(req, res) {
  try {
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

    if (
      item.startDate &&
      item.endDate &&
      new Date(item.endDate) < new Date(item.startDate)
    ) {
      return res.status(400).json({
        message: "endDate cannot be earlier than startDate",
      });
    }

    await item.save();

    const populated = await EventSupplier.findById(item._id)
      .populate("supplier", supplierSelect)
      .populate("event", eventSelect)
      .populate("createdBy", "fullName name email");

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Could not update event supplier",
    });
  }
}

// PATCH /api/event-supplier-workflow/:id/status
export async function updateEventSupplierStatus(req, res) {
  try {
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

    const item = await EventSupplier.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Event supplier not found",
      });
    }

    if (
      typeof canTransitionEventSupplierStatus === "function" &&
      !canTransitionEventSupplierStatus(item.status, status)
    ) {
      return res.status(409).json({
        message: `Cannot move supplier from ${item.status} to ${status}`,
      });
    }

    item.status = status;

    await item.save();

    const populated = await EventSupplier.findById(item._id)
      .populate("supplier", supplierSelect)
      .populate("event", eventSelect)
      .populate("createdBy", "fullName name email");

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Could not update supplier status",
    });
  }
}

// DELETE /api/event-suppliers/:id
export async function deleteEventSupplier(req, res) {
  try {
    const item = await EventSupplier.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Event supplier not found",
      });
    }

    // Không hard-delete assignment đã đi vào vận hành.
    if (!["PROPOSED", "CANCELLED"].includes(item.status)) {
      return res.status(409).json({
        message:
          "Only PROPOSED or CANCELLED supplier assignments can be removed",
      });
    }

    await item.deleteOne();

    return res.json({
      message: "Event supplier removed",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Could not remove event supplier",
    });
  }
}
