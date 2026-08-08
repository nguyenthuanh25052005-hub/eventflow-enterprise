import client from "./client";

export const employeeApi = {
  list: (params = {}) =>
    client.get("/employees", { params }).then((response) => response.data),
  get: (id) => client.get(`/employees/${id}`).then((response) => response.data),
  create: (data) =>
    client.post("/employees", data).then((response) => response.data),
  update: (id, data) =>
    client.put(`/employees/${id}`, data).then((response) => response.data),
};
