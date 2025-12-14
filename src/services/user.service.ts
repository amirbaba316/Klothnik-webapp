import api from '../config/api';
import { User } from '../types';

export const userService = {
  getAll: async (role?: string): Promise<User[]> => {
    const params = role ? { role } : {};
    const { data } = await api.get('/api/v1/users', { params });
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get(`/api/v1/users/${id}`);
    return data;
  },

  update: async (id: string, formData: FormData): Promise<User> => {
    const { data } = await api.put(`/api/v1/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/users/${id}`);
  },
};
