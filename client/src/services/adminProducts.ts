import { apiFetch, readApiError } from "../utils/api";
import type { Product } from './products';

export type AdminProduct = Product;

export type PaginatedResponse<T> = {
      items: T[]
      page: number
      pageSize: number
      totalCount: number
      totalPages: number
}

export type UploadProductImageResponse = {
      imageUrl: string
}

export async function uploadProductImage(
      file: File,
): Promise<UploadProductImageResponse> {
      const formData = new FormData()
      formData.append('image', file)

      const response = await apiFetch('/api/uploads/products', {
            method: 'POST',
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

export async function getAdminProducts(
      params: URLSearchParams = new URLSearchParams({ page: '1', pageSize: '12' }),
): Promise<PaginatedResponse<AdminProduct>> {
      const response = await apiFetch(`/api/admin/products?${params.toString()}`)

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to fetch admin products"))
      }

      return response.json() as Promise<PaginatedResponse<AdminProduct>>;
}

export async function getAdminProductById(id: number): Promise<AdminProduct> {
      const response = await apiFetch(`/api/admin/products/${id}`)

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to fetch product"))
      }

      return response.json() as Promise<AdminProduct>
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
): Promise<AdminProduct> {
      const response = await apiFetch('/api/admin/products', {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json',
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
): Promise<AdminProduct> {
      const response = await apiFetch(`/api/admin/products/${id}`, {
            method: 'PATCH',
            headers: {
                  'Content-Type': 'application/json',
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
): Promise<AdminProduct> {
      const response = await apiFetch(`/api/admin/products/${id}/deactivate`, {
            method: 'PATCH',
      })

      if (!response.ok) {
            throw new Error(await readApiError(response, "Failed to deactivate product"));
      }

      return response.json() as Promise<AdminProduct>;
}

export async function reactivateAdminProduct(
      id: number,
): Promise<AdminProduct> {
      return updateAdminProduct(id, { isActive: true });
}
