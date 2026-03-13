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