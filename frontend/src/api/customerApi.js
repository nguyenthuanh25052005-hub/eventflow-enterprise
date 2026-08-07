import client from "./client";

export const customerApi = {
  list: (params) => client.get("/customers", { params }).then((r) => r.data),
  get: (id) => client.get(`/customers/${id}`).then((r) => r.data),
  create: (payload) => client.post("/customers", payload).then((r) => r.data),
  update: (id, payload) =>
    client.put(`/customers/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/customers/${id}`).then((r) => r.data),
};
