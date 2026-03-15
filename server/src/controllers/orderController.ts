import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { createOrder } from '../services/orderService.js';

type OrderItemInput = {
      productId: number, 
      quantity: number,
};

export async function createOrderHandler(
      req: AuthenticatedRequest,
      res: Response,
) {
      try {
            const userId = req.user?.userId;
            if (!userId) {
                  return res.status(401).json({
                        message: "Unauthorized",
                  });
            }

            const {
                  shippingName,
                  shippingEmail,
                  shippingPhone,
                  shippingCity,
                  shippingAddress,
                  notes,
                  items,
            } = req.body;

            if (
                  !shippingName ||
                  !shippingEmail || 
                  !shippingPhone || 
                  !shippingCity || 
                  !shippingAddress ||
                  !Array.isArray(items) || 
                  items.length === 0
            ) {
                  return res.status(400).json({
                        message: "Missing required checkout fields",
                  });
            }

            const isValidItems = items.every(
                  (item: unknown) => 
                        item !== null && 
                        typeof item === "object" && 
                        typeof (item as any).productId === "number" &&
                        typeof (item as any).quantity === "number",
            );

            if (!isValidItems) {
                  return res.status(400).json({
                        message: "Invalid items format",
                  });
            }

            const order = await createOrder({
                  userId,
                  shippingName,
                  shippingEmail,
                  shippingPhone,
                  shippingCity,
                  shippingAddress,
                  notes: notes !== undefined ? String(notes) : undefined,
                  items: items as OrderItemInput[],
            });

            return res.status(201).json(order);
      } catch (error) {
            if (error instanceof Error) {
                  if (error.message === "NO_ITEMS") {
                        return res.status(400).json({
                              message: "Order must contain at least one item",
                        });
                  }

                  if (error.message === "INVALID_PRODUCTS") {
                        return res.status(400).json({
                              message: "One or more products are invalid",
                        });
                  }

                  if (error.message === "INVALID_QUANTITY") {
                        return res.status(400).json({
                              message: "Invalid quantity in order items",
                        });
                  }

                  if (error.message === "INSUFFICIENT_STOCK") {
                        return res.status(400).json({
                              message: "One or more items are out of stock",
                        });
                  }
            }

            console.error("Create order failed: ", error);
            return res.status(500).json({
                  message: "Failed to create order",
            });
      }
}