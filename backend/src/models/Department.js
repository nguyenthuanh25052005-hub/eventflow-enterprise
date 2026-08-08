import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    departmentCode: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true, unique: true, index: true },
    description: { type: String, trim: true },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

departmentSchema.pre("save", async function nextCode() {
  if (this.departmentCode) return;
  const count = await mongoose.model("Department").countDocuments();
  this.departmentCode = `DEP${String(count + 1).padStart(4, "0")}`;
});

export default mongoose.model("Department", departmentSchema);
