import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    customer: user.customer || null,
  };
}

// POST /api/auth/customer/register
export const registerCustomer = asyncHandler(async (req, res) => {
  const {
    customerType = "COMPANY",
    companyName,
    name,
    email,
    phone,
    password,
    address,
  } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({
      message: "Full name is required",
    });
  }

  if (!email?.trim()) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      message: "Password is required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  if (!["COMPANY", "INDIVIDUAL"].includes(customerType)) {
    return res.status(400).json({
      message: "Invalid customer type",
    });
  }

  if (customerType === "COMPANY" && !companyName?.trim()) {
    return res.status(400).json({
      message: "Company name is required",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return res.status(409).json({
      message: "An account with this email already exists",
    });
  }

  let customer;

  try {
    customer = await Customer.create({
      type: customerType,

      // Customer.name là tên hiển thị của customer.
      name: customerType === "COMPANY" ? companyName.trim() : name.trim(),

      companyName: customerType === "COMPANY" ? companyName.trim() : undefined,

      email: normalizedEmail,
      phone: phone?.trim() || "",
      address: address?.trim() || "",

      contactPerson: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || "",
      },

      source: "WEBSITE",
      status: "ACTIVE",
    });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "CUSTOMER",
      customer: customer._id,
      status: "ACTIVE",
    });

    const populatedUser = await User.findById(user._id).populate(
      "customer",
      "customerCode type name companyName email phone status",
    );

    return res.status(201).json({
      message: "Customer account created successfully",
      token: signToken(user),
      user: serializeUser(populatedUser),
    });
  } catch (error) {
    // Nếu User tạo thất bại sau khi Customer đã tạo,
    // tránh để lại Customer rác.
    if (customer?._id) {
      await Customer.deleteOne({ _id: customer._id });
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    throw error;
  }
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  })
    .select("+passwordHash")
    .populate(
      "customer",
      "customerCode type name companyName email phone status",
    );

  if (!user || user.status !== "ACTIVE") {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);

  if (!ok) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  // Customer account phải gắn với Customer đang ACTIVE.
  if (
    user.role === "CUSTOMER" &&
    (!user.customer || user.customer.status !== "ACTIVE")
  ) {
    return res.status(403).json({
      message: "Customer account is not active",
    });
  }

  user.lastLoginAt = new Date();
  await user.save();

  return res.json({
    token: signToken(user),
    user: serializeUser(user),
  });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "customer",
    "customerCode type name companyName email phone status",
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.json({
    user: serializeUser(user),
  });
});
