import client from "./client";

export const authApi = {
  login: (payload) => client.post("/auth/login", payload).then((r) => r.data),

  registerCustomer: (payload) =>
    client.post("/auth/customer/register", payload).then((r) => r.data),

  me: () => client.get("/auth/me").then((r) => r.data),
};
