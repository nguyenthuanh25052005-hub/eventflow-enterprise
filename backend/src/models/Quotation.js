import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 0 },
    unit: { type: String, default: "item", trim: true },
    unitPrice: { type: Number, default: 0, min: 0 },
    amount: { type: Number, default: 0, min: 0 },
  },
  { _id: true },
);

const quotationSchema = new mongoose.Schema(
  {
    quotationCode: { type: String, unique: true, index: true },
    eventRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventRequest",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    items: { type: [itemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    vatPercent: { type: Number, default: 10 },
    vatAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"],
      default: "DRAFT",
      index: true,
    },
    validUntil: Date,
    note: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

quotationSchema.pre("save", async function () {
  if (!this.quotationCode) {
    const count = await mongoose.model("Quotation").countDocuments();
    this.quotationCode = `QT${String(count + 1).padStart(5, "0")}`;
  }
  this.items = (this.items || []).map((i) => {
    const raw = typeof i.toObject === "function" ? i.toObject() : i;
    return {
      ...raw,
      amount: Number(i.quantity || 0) * Number(i.unitPrice || 0),
    };
  });
  this.subtotal = this.items.reduce((s, i) => s + Number(i.amount || 0), 0);
  const taxable = Math.max(this.subtotal - Number(this.discount || 0), 0);
  this.vatAmount = (taxable * Number(this.vatPercent || 0)) / 100;
  this.total = taxable + this.vatAmount;
});

export default mongoose.model("Quotation", quotationSchema);
