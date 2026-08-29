import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";

async function ensureActiveDepartment(departmentId) {
  if (!mongoose.isValidObjectId(departmentId)) return false;
  return Department.exists({ _id: departmentId, status: "ACTIVE" });
}
function canAssignPosition(currentRole, newPosition) {
  if (currentRole === "SUPER_ADMIN") {
    return true;
  }

  if (currentRole === "ADMIN") {
    return newPosition !== "SUPER_ADMIN";
  }

  if (currentRole === "EVENT_MANAGER") {
    return ["EVENT_MANAGER", "STAFF"].includes(newPosition);
  }

  return false;
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export const listEmployees = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const { search = "", department, employmentType, status } = req.query;
  const filter = {};

  if (department) filter.department = department;
  if (employmentType) filter.employmentType = employmentType;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { employeeCode: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { position: { $regex: search, $options: "i" } },
      { skills: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Employee.find(filter)
      .populate("department", "departmentCode name status")
      .populate("user", "name email role status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Employee.countDocuments(filter),
  ]);

  res.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getEmployee = asyncHandler(async (req, res) => {
  const item = await Employee.findById(req.params.id)
    .populate("department", "departmentCode name status")
    .populate("user", "name email role status lastLoginAt")
    .populate("createdBy", "name email");

  if (!item) return res.status(404).json({ message: "Employee not found" });
  res.json(item);
});

export const getEmployeeByCode = asyncHandler(async (req, res) => {
  const item = await Employee.findOne({ employeeCode: req.params.employeeCode })
    .populate("department", "departmentCode name status")
    .populate("createdBy", "name email")
    .populate("user", "name email role status lastLoginAt");p

  if (!item) return res.status(404).json({ message: "Employee not found" });
  res.json(item);
});

export const createEmployee = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    avatar,
    department,
    position,
    skills,
    employmentType,
    status = "ACTIVE",
    password,
  } = req.body;

  // =====================================
  // VALIDATE
  // =====================================

  if (!name?.trim()) {
    return res.status(400).json({
      message: "Employee name is required",
    });
  }

  if (!email?.trim()) {
    return res.status(400).json({
      message: "Employee email is required",
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

  if (!(await ensureActiveDepartment(department))) {
    return res.status(400).json({
      message: "Active department is required",
    });
  }

  if (!canAssignPosition(req.user.role, position)) {
    return res.status(403).json({
      message: "You cannot assign this employee position",
    });
  }

  const normalizedEmail = normalizeEmail(email);

  // =====================================
  // CHECK DUPLICATE ACCOUNT
  // =====================================

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return res.status(409).json({
      message: "A user account with this email already exists",
    });
  }

  const existingEmployee = await Employee.findOne({
    email: normalizedEmail,
  });

  if (existingEmployee) {
    return res.status(409).json({
      message: "An employee with this email already exists",
    });
  }

  let employee = null;
  let user = null;

  try {
    // =====================================
    // CREATE EMPLOYEE
    // =====================================

    employee = await Employee.create({
      name: name.trim(),

      email: normalizedEmail,

      phone: phone?.trim() || "",

      avatar: avatar || "",

      department,

      position,

      skills: Array.isArray(skills) ? skills : [],

      employmentType: employmentType || "FULL_TIME",

      status,

      createdBy: req.user._id,
    });

    // =====================================
    // CREATE LOGIN ACCOUNT
    // =====================================

    const passwordHash = await bcrypt.hash(password, 12);

    user = await User.create({
      name: employee.name,

      email: normalizedEmail,

      passwordHash,

      role: position,

      status: employee.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",

      customer: null,
    });

    // =====================================
    // LINK EMPLOYEE -> USER
    // =====================================

    employee.user = user._id;

    await employee.save();

    await employee.populate([
      {
        path: "department",
        select: "departmentCode name status",
      },
      {
        path: "user",
        select: "name email role status",
      },
    ]);

    res.status(201).json(employee);
  } catch (error) {
    // Nếu lỗi giữa quá trình tạo,
    // không để lại dữ liệu rác.
    if (user?._id) {
      await User.deleteOne({
        _id: user._id,
      });
    }

    if (employee?._id) {
      await Employee.deleteOne({
        _id: employee._id,
      });
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    throw error;
  }
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const item = await Employee.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Employee not found",
    });
  }

  // =====================================
  // DEPARTMENT
  // =====================================

  if (
    req.body.department !== undefined &&
    !(await ensureActiveDepartment(req.body.department))
  ) {
    return res.status(400).json({
      message: "Active department is required",
    });
  }

  // =====================================
  // POSITION PERMISSION
  // =====================================

  const newPosition =
    req.body.position !== undefined ? req.body.position : item.position;

  if (
    req.body.position !== undefined &&
    !canAssignPosition(req.user.role, newPosition)
  ) {
    return res.status(403).json({
      message: "You cannot assign this employee position",
    });
  }

  // =====================================
  // PASSWORD
  // =====================================

  const password = req.body.password;

  if (password !== undefined && password && password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  // =====================================
  // EMAIL
  // =====================================

  let normalizedEmail = item.email;

  if (req.body.email !== undefined) {
    normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail) {
      return res.status(400).json({
        message: "Employee email is required",
      });
    }

    const duplicateEmployee = await Employee.findOne({
      email: normalizedEmail,

      _id: {
        $ne: item._id,
      },
    });

    if (duplicateEmployee) {
      return res.status(409).json({
        message: "Employee email already exists",
      });
    }

    const duplicateUser = await User.findOne({
      email: normalizedEmail,

      ...(item.user
        ? {
            _id: {
              $ne: item.user,
            },
          }
        : {}),
    });

    if (duplicateUser) {
      return res.status(409).json({
        message: "User account email already exists",
      });
    }
  }

  // =====================================
  // UPDATE EMPLOYEE FIELDS
  // =====================================

  const allowedFields = [
    "name",
    "phone",
    "avatar",
    "department",
    "position",
    "skills",
    "employmentType",
    "status",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      item[field] = req.body[field];
    }
  }

  item.email = normalizedEmail;

  await item.save();

  // =====================================
  // UPDATE EXISTING USER ACCOUNT
  // =====================================

  let user = null;

  if (item.user) {
    user = await User.findById(item.user).select("+passwordHash");

    if (user) {
      user.name = item.name;

      user.email = item.email;

      user.role = item.position;

      user.status = item.status === "ACTIVE" ? "ACTIVE" : "INACTIVE";

      if (password) {
        user.passwordHash = await bcrypt.hash(password, 12);
      }

      await user.save();
    }
  }

  // =====================================
  // CREATE ACCOUNT FOR OLD EMPLOYEE
  // =====================================

  // Những Employee đã tồn tại trước khi chúng ta
  // thêm chức năng User sẽ chưa có item.user.
  //
  // Khi Admin nhập password lúc Edit,
  // hệ thống sẽ tạo account cho nhân viên đó.
  if (!item.user && password) {
    const passwordHash = await bcrypt.hash(password, 12);

    user = await User.create({
      name: item.name,

      email: item.email,

      passwordHash,

      role: item.position,

      status: item.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",

      customer: null,
    });

    item.user = user._id;

    await item.save();
  }

  // =====================================
  // RESPONSE
  // =====================================

  await item.populate([
    {
      path: "department",
      select: "departmentCode name status",
    },

    {
      path: "user",
      select: "name email role status lastLoginAt",
    },
  ]);

  res.json(item);
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const item = await Employee.findById(req.params.id);

  if (!item) {
    return res.status(404).json({
      message: "Employee not found",
    });
  }

  item.status = "INACTIVE";

  await item.save();

  // Khóa luôn tài khoản đăng nhập
  if (item.user) {
    await User.findByIdAndUpdate(item.user, {
      status: "INACTIVE",
    });
  }

  res.json({
    message: "Employee and login account deactivated",
  });
});
