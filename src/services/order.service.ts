import api from '../config/api';
import { Order } from '../types';

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const { data } = await api.get('/api/v1/orders');
    return data;
  },

  getById: async (id: string): Promise<Order> => {
    const { data } = await api.get(`/api/v1/orders/${id}`);
    return data;
  },

  update: async (
    id: string,
    updates: {
      status?: string;
      trackingNumber?: string;
      notes?: string;
    }
  ): Promise<Order> => {
    const { data } = await api.put(`/api/v1/orders/${id}`, updates);
    return data;
  },

  updateView: async (id: string, viewStatus: boolean): Promise<Order> => {
    const { data } = await api.put(
      `/api/v1/orders/${id}/view-order`,
      { isViewed: viewStatus } // Wrap in object
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/orders/${id}`);
  },
};
