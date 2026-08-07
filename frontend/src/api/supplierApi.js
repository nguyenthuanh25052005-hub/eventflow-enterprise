import client from "./client";
export const supplierApi = {
  list: (params = {}) =>
    client.get("/suppliers", { params }).then((r) => r.data),
  create: (data) => client.post("/suppliers", data).then((r) => r.data),
  update: (id, data) =>
    client.put(`/suppliers/${id}`, data).then((r) => r.data),
};
