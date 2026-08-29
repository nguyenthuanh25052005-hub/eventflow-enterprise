import { body, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  validate,
];

export const registerCustomerValidation = [
  body("name").trim().notEmpty().withMessage("Full name is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("customerType")
    .default("COMPANY")
    .isIn(["COMPANY", "INDIVIDUAL"])
    .withMessage("Customer type must be COMPANY or INDIVIDUAL"),

  body("companyName").custom((value, { req }) => {
    if (req.body.customerType === "COMPANY" && !value?.trim()) {
      throw new Error("Company name is required");
    }

    return true;
  }),

  body("phone").optional().trim(),
  body("address").optional().trim(),

  validate,
];
