import mongoose from "mongoose";
import { nextSequenceCode } from "../utils/sequence.js";

const eventSchema = new mongoose.Schema(
  {
    eventCode: {
      type: String,
      unique: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    eventRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventRequest",
    },

    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      default: "CORPORATE",
    },

    startDate: Date,

    endDate: Date,

    venue: {
      type: String,
      trim: true,
    },

    attendeesExpected: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PLANNING", "CONFIRMED", "LIVE", "COMPLETED", "CANCELLED"],
      default: "PLANNING",
      index: true,
    },

    health: {
      type: String,
      enum: ["ON_TRACK", "AT_RISK", "CRITICAL"],
      default: "ON_TRACK",
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    budget: {
      planned: {
        type: Number,
        default: 0,
      },

      committed: {
        type: Number,
        default: 0,
      },

      actual: {
        type: Number,
        default: 0,
      },

      revenue: {
        type: Number,
        default: 0,
      },
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    description: {
      type: String,
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

eventSchema.pre("save", async function () {
  if (this.eventCode) return;

  this.eventCode = await nextSequenceCode({
    model: mongoose.model("Event"),
    counterKey: "event",
    field: "eventCode",
    prefix: "EVT",
  });
});

export default mongoose.model("Event", eventSchema);
