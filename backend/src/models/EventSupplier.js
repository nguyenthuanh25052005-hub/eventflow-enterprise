import mongoose from "mongoose";
import { EVENT_SUPPLIER_STATUSES } from "../utils/eventSupplierStatus.js";

const eventSupplierSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },

    service: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    quotationValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    contractValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: Date,

    endDate: Date,

    status: {
      type: String,
      enum: EVENT_SUPPLIER_STATUSES,
      default: "PROPOSED",
      index: true,
    },

    contactPerson: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

eventSupplierSchema.index(
  { event: 1, supplier: 1 },
  { unique: true },
);

export default mongoose.model("EventSupplier", eventSupplierSchema);
