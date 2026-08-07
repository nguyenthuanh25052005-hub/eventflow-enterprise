import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

await connectDB();
const email = (
  process.env.ADMIN_EMAIL || "admin@eventflow.local"
).toLowerCase();
const password = process.env.ADMIN_PASSWORD || "Admin@123456";
const passwordHash = await bcrypt.hash(password, 12);

const user = await User.findOneAndUpdate(
  { email },
  {
    name: process.env.ADMIN_NAME || "System Admin",
    email,
    passwordHash,
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  },
  { upsert: true, new: true, setDefaultsOnInsert: true },
);

console.log(`Admin ready: ${user.email}`);
process.exit(0);
