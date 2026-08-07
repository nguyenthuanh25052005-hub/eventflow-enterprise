import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema(
  { text: String, done: { type: Boolean, default: false } },
  { _id: true },
);
const taskSchema = new mongoose.Schema(
  {
    taskCode: { type: String, unique: true, index: true },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"],
      default: "TODO",
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    dueDate: Date,
    assignedTo: { type: String, trim: true },
    department: { type: String, trim: true },
    checklist: { type: [checklistItemSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

taskSchema.pre("save", async function () {
  if (this.taskCode) return;
  const count = await mongoose.model("Task").countDocuments();
  this.taskCode = `TSK${String(count + 1).padStart(5, "0")}`;
});
export default mongoose.model("Task", taskSchema);
