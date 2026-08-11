import client from "./client";

export const eventSupplierApi = {
  list: async (params = {}) => {
    const response = await client.get("/event-suppliers", {
      params,
    });

    return response.data;
  },

  get: async (id) => {
    const response = await client.get(`/event-suppliers/${id}`);

    return response.data;
  },

  create: async (payload) => {
    const response = await client.post(
      "/event-suppliers",
      payload,
    );

    return response.data;
  },

  update: async (id, payload) => {
    const response = await client.patch(
      `/event-suppliers/${id}`,
      payload,
    );

    return response.data;
  },

  remove: async (id) => {
    const response = await client.delete(
      `/event-suppliers/${id}`,
    );

    return response.data;
  },
};
