export const EVENT_SUPPLIER_STATUSES = [
  "PROPOSED",
  "REQUESTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const TRANSITIONS = {
  PROPOSED: [
    "REQUESTED",
    "CANCELLED",
  ],

  REQUESTED: [
    "CONFIRMED",
    "CANCELLED",
  ],

  CONFIRMED: [
    "IN_PROGRESS",
    "CANCELLED",
  ],

  IN_PROGRESS: [
    "COMPLETED",
    "CANCELLED",
  ],

  COMPLETED: [],

  CANCELLED: [],
};

export function canTransitionEventSupplierStatus(
  currentStatus,
  nextStatus,
) {
  if (currentStatus === nextStatus) {
    return true;
  }

  return (
    TRANSITIONS[currentStatus]?.includes(nextStatus) ||
    false
  );
}

export function getAllowedEventSupplierTransitions(
  currentStatus,
) {
  return TRANSITIONS[currentStatus] || [];
}
