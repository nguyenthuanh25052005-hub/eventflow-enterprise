import client from "./client";

export const customerPortalApi = {
  me: () => client.get("/customer-portal/me").then((r) => r.data),

  summary: () => client.get("/customer-portal/summary").then((r) => r.data),

  getCompany: () => client.get("/customer-portal/company").then((r) => r.data),

  updateProfile: (payload) =>
    client.put("/customer-portal/profile", payload).then((r) => r.data),

  updateCompany: (payload) =>
    client.put("/customer-portal/company", payload).then((r) => r.data),

  listRequests: (params = {}) =>
    client.get("/customer-portal/requests", { params }).then((r) => r.data),

  createRequest: (payload) =>
    client.post("/customer-portal/requests", payload).then((r) => r.data),

  getRequest: (id) =>
    client.get(`/customer-portal/requests/${id}`).then((r) => r.data),

  listQuotations: (params = {}) =>
    client.get("/customer-portal/quotations", { params }).then((r) => r.data),

  getQuotation: (id) =>
    client.get(`/customer-portal/quotations/${id}`).then((r) => r.data),

  decideQuotation: (id, decision) =>
    client
      .patch(`/customer-portal/quotations/${id}/decision`, { decision })
      .then((r) => r.data),

  listEvents: (params = {}) =>
    client.get("/customer-portal/events", { params }).then((r) => r.data),

  getEvent: (id) =>
    client.get(`/customer-portal/events/${id}`).then((r) => r.data),
};
