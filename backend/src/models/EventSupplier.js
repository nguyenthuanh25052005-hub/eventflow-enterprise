import mongoose from "mongoose";

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
      trim: true,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    quotationValue: {
      type: Number,
      min: 0,
      default: 0,
    },

    contractValue: {
      type: Number,
      min: 0,
      default: 0,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "PROPOSED",
        "REQUESTED",
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PROPOSED",
      index: true,
    },

    contactPerson: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
