import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Department from "../models/Department.js";
import Employee from "../models/Employee.js";

async function ensureActiveDepartment(departmentId) {
  if (!mongoose.isValidObjectId(departmentId)) return false;
  return Department.exists({ _id: departmentId, status: "ACTIVE" });
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
    .populate("createdBy", "name email");
  if (!item) return res.status(404).json({ message: "Employee not found" });
  res.json(item);
});

export const getEmployeeByCode = asyncHandler(async (req, res) => {
  const item = await Employee.findOne({ employeeCode: req.params.employeeCode })
    .populate("department", "departmentCode name status")
    .populate("createdBy", "name email");
  if (!item) return res.status(404).json({ message: "Employee not found" });
  res.json(item);
});

export const createEmployee = asyncHandler(async (req, res) => {
  if (!(await ensureActiveDepartment(req.body.department))) {
    return res.status(400).json({ message: "Active department is required" });
  }

  const item = await Employee.create({
    ...req.body,
    createdBy: req.user._id,
  });
  await item.populate("department", "departmentCode name status");
  res.status(201).json(item);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  if (
    req.body.department !== undefined &&
    !(await ensureActiveDepartment(req.body.department))
  ) {
    return res.status(400).json({ message: "Active department is required" });
  }

  const item = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("department", "departmentCode name status");
  if (!item) return res.status(404).json({ message: "Employee not found" });
  res.json(item);
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const item = await Employee.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Employee not found" });
  item.status = "INACTIVE";
  await item.save();
  res.json({ message: "Employee deactivated" });
});
