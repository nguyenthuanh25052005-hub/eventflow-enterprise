import AuditLog from "../models/AuditLog.js";

const SENSITIVE_FIELDS = new Set([
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
]);

function sanitizeData(data) {
  if (data === null || data === undefined) {
    return null;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  if (data instanceof Date) {
    return data;
  }

  if (typeof data !== "object") {
    return data;
  }

  const result = {};

  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.has(key)) {
      continue;
    }

    result[key] = sanitizeData(value);
  }

  return result;
}

export async function createAuditLog({
  req,
  action,
  module,
  recordId = null,
  oldData = null,
  newData = null,
}) {
  try {
    const user = req?.user || null;

    await AuditLog.create({
      user: user?._id || null,

      userName: user?.name || null,

      userRole: user?.role || null,

      action,

      module,

      recordId: recordId ? String(recordId) : null,

      oldData: sanitizeData(oldData),

      newData: sanitizeData(newData),

      method: req?.method || null,

      path: req?.originalUrl || req?.path || null,

      ipAddress:
        req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req?.ip ||
        null,

      userAgent: req?.headers?.["user-agent"] || null,
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
}
