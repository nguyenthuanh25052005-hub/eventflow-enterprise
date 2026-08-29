import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },
    phone: { type: String, trim: true, index: true },
    avatar: { type: String, trim: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    position: {
      type: String,
      required: true,
      enum: [
        "SUPER_ADMIN",
        "ADMIN",
        "SALES",
        "EVENT_MANAGER",
        "FINANCE",
        "STAFF",
      ],
      index: true,
    },
    skills: [{ type: String, trim: true }],
    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "FREELANCE"],
      default: "FULL_TIME",
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

employeeSchema.pre("save", async function nextCode() {
  if (this.employeeCode) return;
  const count = await mongoose.model("Employee").countDocuments();
  this.employeeCode = `EMP${String(count + 1).padStart(5, "0")}`;
});

export default mongoose.model("Employee", employeeSchema);
