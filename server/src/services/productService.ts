import { prisma } from '../lib/prisma.js';
import { Prisma } from '../generated/prisma/client.js';
import type { ProductListQuery } from '../validation/productSchemas.js';

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

type AdminProductListParams = {
      page: number;
      pageSize: number;
      search?: string;
      isActive?: "true" | "false";
      isFeatured?: "true" | "false";
};

export async function getAdminProductsPage(query: AdminProductListParams) {
      const where: Prisma.ProductWhereInput = {};

      if (query.search) {
            where.OR = [
                  { name: { contains: query.search, mode: "insensitive" } },
                  { description: { contains: query.search, mode: "insensitive" } },
                  { slug: { contains: query.search, mode: "insensitive" } },
            ];
      }

      if (query.isActive) {
            where.isActive = query.isActive === "true";
      }

      if (query.isFeatured) {
            where.isFeatured = query.isFeatured === "true";
      }

      const [items, totalCount] = await prisma.$transaction([
            prisma.product.findMany({
                  where,
                  include: { category: true },
                  orderBy: { createdAt: "desc" },
                  skip: (query.page - 1) * query.pageSize,
                  take: query.pageSize,
            }),
            prisma.product.count({ where }),
      ]);

      return {
            items,
            page: query.page,
            pageSize: query.pageSize,
            totalCount,
            totalPages: Math.max(1, Math.ceil(totalCount / query.pageSize)),
      };
}

export async function getAdminProductById(id: number) {
      return prisma.product.findUnique({
            where: { id },
            include: { category: true },
      });
}

export async function getAllProducts(query: ProductListQuery = { sort: "newest" }) {
      const where: Prisma.ProductWhereInput = {
            isActive: true,
      };

      if (query.search) {
            where.OR = [
                  {
                        name: {
                              contains: query.search,
                              mode: "insensitive",
                        },
                  },
                  {
                        description: {
                              contains: query.search,
                              mode: "insensitive",
                        },
                  },
            ];
      }

      if (query.category) {
            where.category = {
                  slug: query.category,
            };
      }

      const orderBy: Prisma.ProductOrderByWithRelationInput =
            query.sort === "price-asc"
                  ? { price: "asc" }
                  : query.sort === "price-desc"
                  ? { price: "desc" }
                  : { createdAt: "desc" };
      
      return prisma.product.findMany({
            where,
                  include: {
                        category: true,
                  },
                  orderBy,
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
