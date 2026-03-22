import { apiFetch, readApiError } from "../utils/api";
import type { Product } from './products';

export type AdminProduct = Product;

export type UploadProductImageResponse = {
      imageUrl: string
}

export async function uploadProductImage(
      file: File,
      token: string,
): Promise<UploadProductImageResponse> {
      const formData = new FormData()
      formData.append('image', file)

      const response = await apiFetch('/api/uploads/products', {
            method: 'POST',
            headers: {
                  Authorization: `Bearer ${token}`,
            },
            body: formData,
      })

      if (!response.ok) {
            throw new Error(await readApiError(response, 'Failed to upload image'))
      }

      return response.json() as Promise<UploadProductImageResponse>
}

export type CategoryOption = {
      id: number
      name: string     
      slug: string 
      imageUrl: string | null       
      createdAt: string 
      updatedAt: string
}

export type ProductFormInput = {
      name: string 
      slug: string 
      description: string 
      price: number 
      stock: number 
      imageUrl: string 
      categoryId: number 
      isFeatured: boolean 
      isActive: boolean
}

export async function getAdminProducts(token: string): Promise<AdminProduct[]> {
      const response = await apiFetch('/api/admin/products', {
            headers: {
                  Authorization: `Bearer ${token}`,
            },
      })

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to fetch admin products"))
      }

      return response.json() as Promise<AdminProduct[]>;
}

export async function getCategories(): Promise<CategoryOption[]> {
      const response = await apiFetch('/api/categories');

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to fetch categories"));
      }

      return response.json() as Promise<CategoryOption[]>;
}

export async function createAdminProduct(
      data: ProductFormInput,
      token: string,
): Promise<AdminProduct> {
      const response = await apiFetch('/api/products', {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
      })

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to create product"));
      }

      return response.json() as Promise<AdminProduct>;
}

export async function updateAdminProduct(
      id: number,
      data: Partial<ProductFormInput>,
      token: string,
): Promise<AdminProduct> {
      const response = await apiFetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
      })

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to update product"));
      }

      return response.json() as Promise<AdminProduct>;
}

export async function deactivateAdminProduct(
      id: number,
      token: string,
): Promise<AdminProduct> {
      const response = await apiFetch(`/api/products/${id}/deactivate`, {
            method: 'PATCH',
            headers: {
                  Authorization: `Bearer ${token}`,
            },
      })

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to deactivate product"));
      }

      return response.json() as Promise<AdminProduct>;
}

export async function reactivateAdminProduct(
      id: number,
      token: string,
): Promise<AdminProduct> {
      return updateAdminProduct(id, { isActive: true }, token);
}
