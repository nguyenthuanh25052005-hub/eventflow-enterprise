import client from "./client";
export const taskApi = {
  list: (params = {}) => client.get("/tasks", { params }).then((r) => r.data),
  create: (data) => client.post("/tasks", data).then((r) => r.data),
  update: (id, data) => client.put(`/tasks/${id}`, data).then((r) => r.data),
};
