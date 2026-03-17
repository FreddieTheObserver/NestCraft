import { prisma } from '../lib/prisma.js';

type CreateProductInput = {
      name: string;
      slug: string;
      description: string;
      price: number;
      stock: number;
      imageUrl?: string;
      categoryId: number;
      isFeatured?: boolean;
      isActive?: boolean;
}

type UpdateProductInput = Partial<CreateProductInput>;

export async function getAllProductsForAdmin() {
      return prisma.product.findMany({
            include: {
                  category: true,
            },
            orderBy: {
                  createdAt: "desc",
            },
      });
}

export async function getAllProducts() {
      return prisma.product.findMany({
            where: {
                  isActive: true,
            },
            include: {
                  category: true,
            },
            orderBy: {
                  createdAt: "desc",
            },
      });
}

export async function getProductBySlug(slug: string) {
      return prisma.product.findFirst({
            where: {
                  slug,
                  isActive: true,
            },
            include: {
                  category: true,
            },
      });
}

export async function createProduct(data: CreateProductInput) {
      const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
      });

      if (!category) {
            throw new Error("CATEGORY_NOT_FOUND");
      }

      const existingSlug = await prisma.product.findUnique({
            where: { slug: data.slug },
      });

      if (existingSlug) {
            throw new Error("SLUG_ALREADY_IN_USE");
      }

      return prisma.product.create({
            data: {
                  ...data, 
                  imageUrl: data.imageUrl || null, 
                  isFeatured: data.isFeatured ?? false,
                  isActive: data.isActive ?? true,
            },
            include: {
                  category: true,
            },
      });
}

export async function updateProduct(id: number, data: UpdateProductInput) {
      const exisitingProduct = await prisma.product.findUnique({
            where: { id },
      })

      if (!exisitingProduct) {
            throw new Error("PRODUCT_NOT_FOUND");
      }

      if (data.categoryId !== undefined) {
            const category = await prisma.category.findUnique({
                  where: { id: data.categoryId },
            });

            if (!category) {
                  throw new Error("CATEGORY_NOT_FOUND");
            }
      }

      if (data.slug && data.slug !== exisitingProduct.slug) {
            const slugOwner = await prisma.product.findUnique({
                  where: { slug: data.slug },
            });

            if (slugOwner) {
                  throw new Error("SLUG_ALREADY_IN_USE");
            }
      }

      return prisma.product.update({
            where: { id },
            data: {
                  ...data, 
                  imageUrl: data.imageUrl === "" ? null : data.imageUrl,
            },
            include: {
                  category: true,
            },
      });
}

export async function deactivateProduct(id: number) {
      const existingProduct = await prisma.product.findUnique({
            where: { id },
      });

      if (!existingProduct) {
            throw new Error("PRODUCT_NOT_FOUND");
      }

      return prisma.product.update({
            where: { id },
            data: {
                  isActive: false,
            },
            include: {
                  category: true,
            },
      });
}
