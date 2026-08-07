export const money = (v = 0) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(v || 0));
export const number = (v = 0) =>
  new Intl.NumberFormat("vi-VN").format(Number(v || 0));
export const shortDate = (v) =>
  v
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(v))
    : "—";
export const dateTime = (v) =>
  v
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(v))
    : "—";
export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((x) => x[0])
    .join("")
    .toUpperCase() || "EF";
export const cls = (...x) => x.filter(Boolean).join(" ");
