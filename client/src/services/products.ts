import { readApiError } from '../utils/api'

export type Product = {
      id: number,
      name: string,
      slug: string,
      description: string,
      price: string, 
      stock: number,
      imageUrl: string | null,
      isFeatured: boolean,
      isActive: boolean,
      categoryId: number,
      createdAt: string,
      updatedAt: string,
      category: {
            id: number,
            name: string,
            slug: string,
            imageUrl: string | null,
            createdAt: string,
            updatedAt: string
      }
}

export type ProductSort = 'newest' | 'price-asc' | 'price-desc'

export type ProductListFilters = {
      search?: string
      category?: string
      sort?: ProductSort
}

export type ProductCategory = {
      id: number
      name: string
      slug: string
      imageUrl: string | null
      createdAt: string
      updatedAt: string
}

export async function getProducts(filters: ProductListFilters = {}): Promise<Product[]> {
      const params = new URLSearchParams()
      const normalizedSearch = filters.search?.trim()

      if (normalizedSearch) {
            params.set('search', normalizedSearch)
      }

      if (filters.category) {
            params.set('category', filters.category)
      }

      if (filters.sort && filters.sort !== 'newest') {
            params.set('sort', filters.sort)
      }

      const query = params.toString()
      const response = await fetch(query ? `/api/products?${query}` : '/api/products')

      if (!response.ok) {
            throw new Error(await readApiError(response, 'Failed to fetch products'));
      }

      const data: Product[] = await response.json();
      return data;
}

export async function getProductCategories(): Promise<ProductCategory[]> {
      const response = await fetch('/api/categories')

      if (!response.ok) {
            throw new Error(await readApiError(response, 'Failed to fetch categories'))
      }

      return response.json() as Promise<ProductCategory[]>
}

export async function getProductBySlug(slug: string): Promise<Product> {
      const response = await fetch(`/api/products/${slug}`);

      if (!response.ok) {
            throw new Error(await readApiError(response, 'Failed to fetch product'));
      }
      
      return response.json() as Promise<Product>
}
