import mongoose from "mongoose";
import crypto from "crypto";
const attendeeSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    ticketType: { type: String, default: "GENERAL" },
    qrCode: { type: String, unique: true, index: true },
    status: {
      type: String,
      enum: ["REGISTERED", "CHECKED_IN", "CANCELLED"],
      default: "REGISTERED",
      index: true,
    },
    checkInAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
attendeeSchema.pre("save", function () {
  if (!this.qrCode)
    this.qrCode = `EF-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
});
export default mongoose.model("Attendee", attendeeSchema);
