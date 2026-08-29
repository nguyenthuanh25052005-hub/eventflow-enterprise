import { Router } from "express";
import rateLimit from "express-rate-limit";

import { login, me, registerCustomer } from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.js";

import {
  loginValidation,
  registerCustomerValidation,
} from "../middleware/authValidation.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts, please try again after 15 minutes",
  },
});

// Customer register
router.post("/customer/register", registerCustomerValidation, registerCustomer);

// Login
router.post("/login", loginLimiter, loginValidation, login);

// Current user
router.get("/me", protect, me);

export default router;
