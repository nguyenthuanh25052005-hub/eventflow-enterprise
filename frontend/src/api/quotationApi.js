import client from "./client";
export const quotationApi = {
  list: (params = {}) =>
    client.get("/quotations", { params }).then((r) => r.data),
  create: (data) => client.post("/quotations", data).then((r) => r.data),
  update: (id, data) =>
    client.put(`/quotations/${id}`, data).then((r) => r.data),
};
