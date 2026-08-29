import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    userName: {
      type: String,
      trim: true,
    },

    userRole: {
      type: String,
      trim: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    module: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    recordId: {
      type: String,
      default: null,
      index: true,
    },

    oldData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    method: {
      type: String,
      trim: true,
      uppercase: true,
    },

    path: {
      type: String,
      trim: true,
    },

    ipAddress: {
      type: String,
      trim: true,
    },

    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, recordId: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
