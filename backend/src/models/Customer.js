import mongoose from "mongoose";

const contactPersonSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    position: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false },
);

const customerSchema = new mongoose.Schema(
  {
    customerCode: { type: String, unique: true, index: true },
    type: { type: String, enum: ["COMPANY", "INDIVIDUAL"], default: "COMPANY" },
    name: { type: String, required: true, trim: true, index: true },
    companyName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true, index: true },
    address: { type: String, trim: true },
    taxCode: { type: String, trim: true },
    contactPerson: contactPersonSchema,
    source: {
      type: String,
      enum: ["WEBSITE", "REFERRAL", "FACEBOOK", "EMAIL", "PHONE", "OTHER"],
      default: "OTHER",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

customerSchema.pre("save", async function nextCode() {
  if (this.customerCode) return;
  const count = await mongoose.model("Customer").countDocuments();
  this.customerCode = `CUS${String(count + 1).padStart(5, "0")}`;
});

export default mongoose.model("Customer", customerSchema);
