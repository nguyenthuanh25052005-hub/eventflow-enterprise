import client from "../api/client";

export const eventSupplierWorkflowApi = {
  updateStatus: async (id, status) => {
    const response = await client.patch(
      `/event-supplier-workflow/${id}/status`,
      {
        status,
      },
    );

    return response.data;
  },
}; 
