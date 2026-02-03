import { ProductVariant } from '../types';

class ProductVariantService {
  private baseUrl = '/api/v1/products';

  async getAll(productId: string): Promise<ProductVariant[]> {
    const response = await fetch(`${this.baseUrl}/${productId}/variants`);
    if (!response.ok) throw new Error('Failed to fetch variants');
    return response.json();
  }

  async getById(productId: string, variantId: string): Promise<ProductVariant> {
    const response = await fetch(
      `${this.baseUrl}/${productId}/variants/${variantId}`
    );
    if (!response.ok) throw new Error('Failed to fetch variant');
    return response.json();
  }

  async create(
    productId: string,
    data: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    const response = await fetch(`${this.baseUrl}/${productId}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create variant');
    return response.json();
  }

  async update(
    productId: string,
    variantId: string,
    data: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    const response = await fetch(
      `${this.baseUrl}/${productId}/variants/${variantId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error('Failed to update variant');
    return response.json();
  }

  async delete(productId: string, variantId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/${productId}/variants/${variantId}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) throw new Error('Failed to delete variant');
  }
}

export const productVariantService = new ProductVariantService();
