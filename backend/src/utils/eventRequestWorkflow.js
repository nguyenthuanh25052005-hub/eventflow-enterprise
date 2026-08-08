export const REQUEST_STATUS = Object.freeze({
  NEW: "NEW",
  QUALIFYING: "QUALIFYING",
  QUOTATION: "QUOTATION",
  NEGOTIATING: "NEGOTIATING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CONVERTED: "CONVERTED",
});

// Những bước người dùng được phép thao tác trực tiếp.
export const MANUAL_TRANSITIONS = Object.freeze({
  NEW: ["QUALIFYING", "REJECTED"],

  QUALIFYING: ["REJECTED"],

  QUOTATION: ["REJECTED"],

  NEGOTIATING: ["REJECTED"],

  APPROVED: [],

  REJECTED: [],

  CONVERTED: [],
});

// Những bước chỉ hệ thống/nghiệp vụ khác được phép chuyển.
export const SYSTEM_TRANSITIONS = Object.freeze({
  QUALIFYING: ["QUOTATION"],

  QUOTATION: ["NEGOTIATING"],

  NEGOTIATING: ["APPROVED"],

  APPROVED: ["CONVERTED"],
});

export function canManualTransition(from, to) {
  if (from === to) return true;

  return MANUAL_TRANSITIONS[from]?.includes(to) || false;
}

export function canSystemTransition(from, to) {
  if (from === to) return true;

  return SYSTEM_TRANSITIONS[from]?.includes(to) || false;
}

export function assertManualTransition(from, to) {
  if (canManualTransition(from, to)) return;

  const error = new Error(`Invalid event request transition: ${from} -> ${to}`);

  error.statusCode = 400;

  throw error;
}

export function assertSystemTransition(from, to) {
  if (canSystemTransition(from, to)) return;

  const error = new Error(`Invalid system transition: ${from} -> ${to}`);

  error.statusCode = 400;

  throw error;
}
