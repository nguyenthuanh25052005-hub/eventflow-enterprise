import mongoose from "mongoose";
import EventSupplier from "../models/EventSupplier.js";

import {
  EVENT_SUPPLIER_STATUSES,
  canTransitionEventSupplierStatus,
  getAllowedEventSupplierTransitions,
} from "../utils/eventSupplierStatus.js";

export async function updateEventSupplierStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid EventSupplier id.",
    });
  }

  if (!EVENT_SUPPLIER_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid supplier status.",
    });
  }

  const item = await EventSupplier.findById(id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Event supplier assignment not found.",
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
      currentStatus: item.status,
      allowedTransitions:
        getAllowedEventSupplierTransitions(item.status),
    });
  }

  item.status = status;

  await item.save();

  const populated = await EventSupplier.findById(
    item._id,
  )
    .populate(
      "event",
      "eventCode name startDate endDate status venue",
    )
    .populate(
      "supplier",
      "supplierCode name category contactName phone email rating status",
    )
    .populate(
      "createdBy",
      "fullName name email",
    );

  return res.json({
    success: true,
    message: `Supplier status changed to ${status}.`,
    data: populated,
  });
}
