import { prisma } from '../lib/prisma.js';

export async function getAllCategories() {
      return prisma.category.findMany({
            orderBy: {
                  name: "asc",
            },
      });
}