import client from "./client";
export const eventApi = {
  list: (params = {}) => client.get("/events", { params }).then((r) => r.data),
  get: (id) => client.get(`/events/${id}`).then((r) => r.data),
  update: (id, data) => client.put(`/events/${id}`, data).then((r) => r.data),
};
