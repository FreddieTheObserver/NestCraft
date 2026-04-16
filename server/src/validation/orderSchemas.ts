import { z } from 'zod';

const orderItemSchema = z.object({
      productId: z.number().int().positive("Product id must be a positive integer"),
      quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
      shippingName: z.string().trim().min(2, "Shipping name is required"),
      shippingEmail: z.string().trim().email("Shipping email must be valid"),
      shippingPhone: z.string().trim().min(6, "Shipping phone is required"),
      shippingCity: z.string().trim().min(2, "Shipping city is required"),
      shippingAddress: z.string().trim().min(5, "Shipping address is required"),
      notes: z.string().trim().max(500, "Notes are too long").optional(),
      items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
});

export const orderIdParamsSchema = z.object({
      id: z.coerce.number().int().positive("Order id must be a positive integer"),
});

export const updateOrderStatusSchema = z.object({
      status: z.enum(["pending", "confirmed", "cancelled"]),
});

export const orderNumberParamsSchema = z.object({
      orderNumber: z
            .string()
            .regex(/^NC-[0-9]{6,}$/, "Invalid order number"),
});

export const adminOrderListQuerySchema = z.object({
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).max(50).default(10),
      status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
      search: z.string().trim().min(1).max(100).optional(),
});

export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;