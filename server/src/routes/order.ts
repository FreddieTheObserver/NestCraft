import { Router } from 'express';

import { createOrderHandler, getMyOrdersHandler } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const orderRouter = Router();

orderRouter.get("/me", requireAuth, getMyOrdersHandler);
orderRouter.post("/", requireAuth, createOrderHandler);

export default orderRouter;
