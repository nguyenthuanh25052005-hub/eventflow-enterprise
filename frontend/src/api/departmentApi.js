import client from "./client";

export const departmentApi = {
  list: (params = {}) =>
    client.get("/departments", { params }).then((response) => response.data),
  get: (id) =>
    client.get(`/departments/${id}`).then((response) => response.data),
  create: (data) =>
    client.post("/departments", data).then((response) => response.data),
  update: (id, data) =>
    client.put(`/departments/${id}`, data).then((response) => response.data),
};
