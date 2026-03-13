import { prisma } from '../lib/prisma.js';

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