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

export async function getProducts(): Promise<Product[]> {
      const response = await fetch('/api/products');

      if (!response.ok) {
            throw new Error(await readApiError(response, 'Failed to fetch products'));
      }

      const data: Product[] = await response.json();
      return data;
}

export async function getProductBySlug(slug: string): Promise<Product> {
      const response = await fetch(`/api/products/${slug}`);

      if (!response.ok) {
            throw new Error(await readApiError(response, 'Failed to fetch product'));
      }
      
      return response.json() as Promise<Product>
}
