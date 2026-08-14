import client from "./client";

export const eventSupplierApi = {
  list(eventId) {
    return client.get("/event-suppliers", {
      params: { event: eventId },
    });
  },

  get(id) {
    return client.get(`/event-suppliers/${id}`);
  },

  getStatuses() {
    return client.get("/event-suppliers/statuses");
  },

  create(data) {
    return client.post("/event-suppliers", data);
  },

  update(id, data) {
    return client.patch(`/event-suppliers/${id}`, data);
  },

  remove(id) {
    return client.delete(`/event-suppliers/${id}`);
  },
};
