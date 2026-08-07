import client from "./client";
export const financeApi = {
  summary: () => client.get("/finance/summary").then((r) => r.data),
  expenses: (params = {}) =>
    client.get("/finance/expenses", { params }).then((r) => r.data),
  createExpense: (data) =>
    client.post("/finance/expenses", data).then((r) => r.data),
  updateExpense: (id, data) =>
    client.put(`/finance/expenses/${id}`, data).then((r) => r.data),
};
