import api from '../config/api';
import { ProductVariant } from '../types';

class ProductVariantService {
  async getAll(productId: string): Promise<ProductVariant[]> {
    const { data } = await api.get(`/api/v1/products/${productId}/variants`);
    return data;
  }

  async getById(productId: string, variantId: string): Promise<ProductVariant> {
    const { data } = await api.get(
      `/api/v1/products/${productId}/variants/${variantId}`
    );
    return data;
  }

  async create(
    productId: string,
    payload: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    const { data } = await api.post(
      `/api/v1/products/${productId}/variants`,
      payload
    );
    return data;
  }

  async update(
    productId: string,
    variantId: string,
    payload: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    const { data } = await api.put(
      `/api/v1/products/${productId}/variants/${variantId}`,
      payload
    );
    return data;
  }

  async delete(productId: string, variantId: string): Promise<void> {
    await api.delete(`/api/v1/products/${productId}/variants/${variantId}`);
  }
}

export const productVariantService = new ProductVariantService();
