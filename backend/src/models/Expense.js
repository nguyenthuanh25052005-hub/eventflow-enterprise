import mongoose from "mongoose";
const expenseSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "VENUE",
        "PRODUCTION",
        "CATERING",
        "MEDIA",
        "STAFF",
        "TRANSPORT",
        "MARKETING",
        "OTHER",
      ],
      default: "OTHER",
    },
    description: { type: String, required: true, trim: true },
    vendor: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED", "PAID"],
      default: "PENDING",
      index: true,
    },
    expenseDate: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
export default mongoose.model("Expense", expenseSchema);
