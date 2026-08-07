import asyncHandler from "express-async-handler";
import Supplier from "../models/Supplier.js";
export const listSuppliers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search)
    filter.name = { $regex: req.query.search, $options: "i" };
  res.json({ items: await Supplier.find(filter).sort({ name: 1 }).limit(200) });
});
export const createSupplier = asyncHandler(async (req, res) => {
  res
    .status(201)
    .json(await Supplier.create({ ...req.body, createdBy: req.user._id }));
});
export const updateSupplier = asyncHandler(async (req, res) => {
  const item = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: "Supplier not found" });
  res.json(item);
});
