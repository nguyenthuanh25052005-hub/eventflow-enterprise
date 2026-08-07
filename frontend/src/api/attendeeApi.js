import client from "./client";
export const attendeeApi = {
  list: (params = {}) =>
    client.get("/attendees", { params }).then((r) => r.data),
  create: (data) => client.post("/attendees", data).then((r) => r.data),
  checkIn: (qrCode) =>
    client
      .post(`/attendees/check-in/${encodeURIComponent(qrCode)}`)
      .then((r) => r.data),
};
