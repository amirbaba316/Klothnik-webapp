import api from '../config/api';
import { Category } from '../types';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get('/api/v1/categories');
    return data;
  },

  getById: async (id: string): Promise<Category> => {
    const { data } = await api.get(`/api/v1/categories/${id}`);
    return data;
  },

  create: async (formData: FormData): Promise<Category> => {
    const { data } = await api.post('/api/v1/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: string, formData: FormData): Promise<Category> => {
    const { data } = await api.put(`/api/v1/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/categories/${id}`);
  },
};

//comement
