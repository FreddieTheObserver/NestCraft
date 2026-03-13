import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
      await prisma.product.deleteMany();
      await prisma.category.deleteMany();

      const lighting = await prisma.category.create({
            data: {
                  name: "Lighting",
                  slug: "lighting",
                  imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f",
            },
      });

      const decor = await prisma.category.create({
            data: {
                  name: "Decor",
                  slug: "decor",
                  imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
            },
      });

      const storage = await prisma.category.create({
            data: {
                  name: "Storage",
                  slug: "storage",
                  imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
            },
      });

      await prisma.product.createMany({
            data: [
                  {
                        name: "Oak Bedside Lamp",
                        slug: "oak-bedside-lamp",
                        description: "A warm wooden bedside lamp for cozy interior spaces.",
                        price: "49.99",
                        stock: 12,
                        imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
                        isFeatured: true,
                        isActive: true,
                        categoryId: lighting.id,
                  },

                  {
                        name: "Ceramic Table Vase",
                        slug: "ceramic-table-vase",
                        description: "Minimal ceramic vase suited for shelves, dining tables, and consoles.",
                        price: "34.50",
                        stock: 20,
                        imageUrl: "https://images.unsplash.com/photo-1612196808214-b7e239e5ad73",
                        isFeatured: false,
                        isActive: true,
                        categoryId: decor.id,
                  },

                  {
                        name: "Linen Cushion Cover",
                        slug: "linen-cushion-cover",
                        description: "Soft neutral cushion cover for sofas and accent chairs.",
                        price: "24.99",
                        stock: 18,
                        imageUrl: "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f",
                        isFeatured: false,
                        isActive: true,
                        categoryId: decor.id,
                  },

                  {
                        name: "Bamboo Storage Basket",
                        slug: "bamboo-storage-basket",
                        description: "Lightweight woven basket for blankets, toys, or laundry.",
                        price: "39.95",
                        stock: 10,
                        imageUrl: "https://images.unsplash.com/photo-1582582429416-47e44cb5f4a0",
                        isFeatured: true,
                        isActive: true,
                        categoryId: storage.id,
                  },

                  {
                        name: "Modular Shelf Bin",
                        slug: "modular-shelf-bin",
                        description: "Structured fabric bin designed to keep shelves neat and flexible.",
                        price: "19.99",
                        stock: 25,
                        imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
                        isFeatured: false,
                        isActive: true,
                        categoryId: storage.id,
                  },
            ],
      });
}

main()
      .then(async () => {
            await prisma.$disconnect();
      })
      .catch(async (error) => {
            console.error(error);
            await prisma.$disconnect();
            process.exit(1);
      })
