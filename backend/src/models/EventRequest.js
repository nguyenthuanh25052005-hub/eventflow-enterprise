import mongoose from "mongoose";
import { nextSequenceCode } from "../utils/sequence.js";

const eventRequestSchema = new mongoose.Schema(
  {
    requestCode: { type: String, unique: true, index: true },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    eventType: {
      type: String,
      enum: [
        "CONFERENCE",
        "CORPORATE",
        "ACTIVATION",
        "EXHIBITION",
        "FESTIVAL",
        "GALA",
        "TEAM_BUILDING",
        "OTHER",
      ],
      default: "CORPORATE",
    },

    eventDate: {
      type: Date,
    },

    expectedAttendees: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      trim: true,
    },

    expectedBudget: {
      type: Number,
      default: 0,
    },

    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: [
        "NEW",
        "QUALIFYING",
        "QUOTATION",
        "NEGOTIATING",
        "APPROVED",
        "REJECTED",
        "CONVERTED",
      ],
      default: "NEW",
      index: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    notes: {
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

eventRequestSchema.pre("save", async function () {
  if (this.requestCode) return;

  this.requestCode = await nextSequenceCode({
    model: mongoose.model("EventRequest"),
    counterKey: "event-request",
    field: "requestCode",
    prefix: "REQ",
  });
});

export default mongoose.model("EventRequest", eventRequestSchema);
