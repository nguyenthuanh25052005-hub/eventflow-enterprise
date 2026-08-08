import asyncHandler from "express-async-handler";
import Department from "../models/Department.js";
import Employee from "../models/Employee.js";

export const listDepartments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { departmentCode: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const items = await Department.find(filter)
    .populate("manager", "employeeCode name email phone avatar position status")
    .sort({ name: 1 })
    .limit(200);
  res.json({ items });
});

export const getDepartment = asyncHandler(async (req, res) => {
  const item = await Department.findById(req.params.id)
    .populate(
      "manager",
      "employeeCode name email phone avatar position status",
    )
    .populate("createdBy", "name email");
  if (!item) return res.status(404).json({ message: "Department not found" });

  const employeeCount = await Employee.countDocuments({ department: item._id });
  res.json({ ...item.toObject(), employeeCount });
});

export const createDepartment = asyncHandler(async (req, res) => {
  if (req.body.manager) {
    return res.status(400).json({
      message:
        "Create the department first, then assign an employee from that department as manager",
    });
  }

  const item = await Department.create({
    ...req.body,
    createdBy: req.user._id,
  });
  res.status(201).json(item);
});

export const updateDepartment = asyncHandler(async (req, res) => {
  if (req.body.manager) {
    const manager = await Employee.findOne({
      _id: req.body.manager,
      department: req.params.id,
      status: "ACTIVE",
    });
    if (!manager) {
      return res.status(400).json({
        message: "Manager must be an active employee of this department",
      });
    }
  }

  const item = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate(
    "manager",
    "employeeCode name email phone avatar position status",
  );
  if (!item) return res.status(404).json({ message: "Department not found" });
  res.json(item);
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const item = await Department.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Department not found" });
  item.status = "INACTIVE";
  await item.save();
  res.json({ message: "Department deactivated" });
});
