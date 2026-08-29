import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token)
      return res.status(401).json({ message: "Not authorized, token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({
        message: "User is unavailable",
      });
    }

    // Nếu tài khoản là CUSTOMER,
    // kiểm tra Customer tương ứng còn ACTIVE hay không.
    if (user.role === "CUSTOMER") {
      if (!user.customer) {
        return res.status(401).json({
          message: "Customer account is unavailable",
        });
      }

      const customer = await Customer.findById(user.customer).select(
        "_id status",
      );

      if (!customer || customer.status !== "ACTIVE") {
        return res.status(401).json({
          message: "Customer account is inactive",
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
export const internalOnly = allowRoles(
  "SUPER_ADMIN",
  "ADMIN",
  "EVENT_MANAGER",
  "SALES",
  "FINANCE",
  "STAFF",
);
export const customerOnly = allowRoles("CUSTOMER");
