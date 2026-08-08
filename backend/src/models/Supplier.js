import mongoose from "mongoose";
import { nextSequenceCode } from "../utils/sequence.js";

const supplierSchema = new mongoose.Schema(
  {
    supplierCode: {
      type: String,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    category: {
      type: String,
      enum: [
        "VENUE",
        "PRODUCTION",
        "SOUND",
        "LIGHTING",
        "LED",
        "CATERING",
        "MEDIA",
        "DECORATION",
        "TRANSPORT",
        "STAFFING",
        "OTHER",
      ],
      default: "OTHER",
    },

    contactName: String,

    phone: String,

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    notes: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

supplierSchema.pre("save", async function () {
  if (this.supplierCode) return;

  this.supplierCode = await nextSequenceCode({
    model: mongoose.model("Supplier"),
    counterKey: "supplier",
    field: "supplierCode",
    prefix: "SUP",
  });
});

export default mongoose.model("Supplier", supplierSchema);
