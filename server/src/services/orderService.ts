import { prisma } from '../lib/prisma.js';

type OrderItemInput = {
      productId: number
      quantity: number
};

type CreateOrderInput = {
      userId: number
      shippingName: string 
      shippingEmail: string 
      shippingPhone: string 
      shippingCity: string 
      shippingAddress: string 
      notes?: string 
      items: OrderItemInput[];
};

export async function createOrder(data: CreateOrderInput) {
      if (!data.items.length) {
            throw new Error("NO_ITEMS");
      }

      for (const item of data.items) {
            if (item.quantity < 1) {
                  throw new Error("INVALID_QUANTITY");
            }
      }

      const productIds = data.items.map((item) => item.productId);

      return prisma.$transaction(async (tx) => {
            const products = await tx.product.findMany({
                  where: {
                        id: { in: productIds },
                        isActive: true,
                  },
            });

            if (products.length !== productIds.length) {
                  throw new Error("INVALID_PRODUCTS");
            }

            const productMap = new Map(products.map((product) => [product.id, product]));

            const normalizedItems = data.items.map((item) => {
                  const product = productMap.get(item.productId);

                  if (!product) {
                        throw new Error("INVALID_PRODUCTS");
                  }

                  const unitPrice = Number(product.price);
                  const lineTotal = unitPrice * item.quantity;

                  return {
                        productId: product.id,
                        quantity: item.quantity,
                        unitPrice,
                        lineTotal,
                  };
            });

            // Atomically check and decrement stock in a single operation per product
            for (const item of normalizedItems) {
                  const updated = await tx.product.updateMany({
                        where: {
                              id: item.productId,
                              isActive: true,
                              stock: { gte: item.quantity },
                        },
                        data: {
                              stock: { decrement: item.quantity },
                        },
                  });

                  if (updated.count === 0) {
                        throw new Error("INSUFFICIENT_STOCK");
                  }
            }

            const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
            const shippingFee = subtotal >= 100 ? 0 : 10;
            const totalAmount = subtotal + shippingFee;

            const order = await tx.order.create({
                  data: {
                        userId: data.userId,
                        status: "pending",
                        subtotal,
                        shippingFee,
                        totalAmount,
                        shippingName: data.shippingName,
                        shippingEmail: data.shippingEmail,
                        shippingPhone: data.shippingPhone,
                        shippingCity: data.shippingCity,
                        shippingAddress: data.shippingAddress,
                        notes: data.notes,
                        items: {
                              create: normalizedItems.map((item) => ({
                                    productId: item.productId,
                                    quantity: item.quantity,
                                    unitPrice: item.unitPrice,
                              })),
                        },
                  },
                  include: {
                        items: {
                              include: {
                                    product: true,
                              },
                        },
                  },
            });

            return order;
      });
}
