import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "ADMIN",
        "EVENT_MANAGER",
        "SALES",
        "FINANCE",
        "STAFF",
        "CUSTOMER",
      ],
      default: "STAFF",
      index: true,
    },

    // Chỉ dùng khi role = CUSTOMER.
    // Không unique vì sau này một Customer/Company
    // có thể có nhiều tài khoản đăng nhập.
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    lastLoginAt: Date,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
