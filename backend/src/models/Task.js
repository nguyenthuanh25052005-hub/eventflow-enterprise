import mongoose from "mongoose";
import { nextSequenceCode } from "../utils/sequence.js";

const checklistItemSchema = new mongoose.Schema(
  {
    text: String,
    done: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  },
);

const taskSchema = new mongoose.Schema(
  {
    taskCode: {
      type: String,
      unique: true,
      index: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

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

    assignedTo: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    checklist: {
      type: [checklistItemSchema],
      default: [],
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

taskSchema.pre("save", async function () {
  if (this.taskCode) return;

  this.taskCode = await nextSequenceCode({
    model: mongoose.model("Task"),
    counterKey: "task",
    field: "taskCode",
    prefix: "TSK",
  });
});

export default mongoose.model("Task", taskSchema);
