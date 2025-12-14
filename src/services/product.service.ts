import api from '../config/api';
import { Product } from '../types';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get('/api/v1/categories/all/products');
    return data;
  },

  getById: async (categoryId: string, productId: string): Promise<Product> => {
    const { data } = await api.get(
      `/api/v1/categories/${categoryId}/products/${productId}`
    );
    return data;
  },

  create: async (categoryId: string, formData: FormData): Promise<Product> => {
    const { data } = await api.post(
      `/api/v1/categories/${categoryId}/products`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data;
  },

  update: async (
    categoryId: string,
    productId: string,
    formData: FormData
  ): Promise<Product> => {
    const { data } = await api.put(
      `/api/v1/categories/${categoryId}/products/${productId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data;
  },

  delete: async (categoryId: string, productId: string): Promise<void> => {
    await api.delete(`/api/v1/categories/${categoryId}/products/${productId}`);
  },
};
