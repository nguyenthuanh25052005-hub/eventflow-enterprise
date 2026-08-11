import client from "./client";

export const eventSupplierDirectoryApi = {
  list: async (params = {}) => {
    const response = await client.get("/suppliers", {
      params,
    });

    return response.data;
  },
};
