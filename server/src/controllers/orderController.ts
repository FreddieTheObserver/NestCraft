import type { Response } from 'express';

import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { createOrder, getOrdersByUserId } from '../services/orderService.js';
import { sendError } from '../utils/http.js';

type OrderItemInput = {
      productId: number, 
      quantity: number,
};

export async function getMyOrdersHandler(
      req: AuthenticatedRequest,
      res: Response,
) {
      try {
            const userId = req.user?.userId;

            if (!userId) {
                  return sendError(res, 401, "UNAUTHORIZED", "Authentication is required");
            }

            const orders = await getOrdersByUserId(userId);

            return res.status(200).json(orders);
      } catch (error) {
            console.error("Fetch orders failed: ", error);
            return sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch orders");
      }
}

export async function createOrderHandler(
      req: AuthenticatedRequest,
      res: Response,
) {
      try {
            const userId = req.user?.userId;
            if (!userId) {
                  return sendError(res, 401, "UNAUTHORIZED", "Authentication is required");
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
                        return sendError(res, 400, "NO_ITEMS", "Order must contain at least one item");
                  }

                  if (error.message === "INVALID_PRODUCTS") {
                        return sendError(res, 400, "INVALID_PRODUCTS", "One or more products are invalid");
                  }

                  if (error.message === "INVALID_QUANTITY") {
                        return sendError(res, 400, "INVALID_QUANTITY", "Invalid quantity in order items");
                  }

                  if (error.message === "INSUFFICIENT_STOCK") {
                        return sendError(res, 400, "INSUFFICIENT_STOCK", "One or more items are out of stock");
                  }
            }

            console.error("Create order failed: ", error);
            return sendError(res, 500, "INTERNAL_ERROR", "Failed to create order");
      }
}
