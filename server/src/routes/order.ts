import { Router } from 'express';

import { createOrderHandler } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const orderRouter = Router();

orderRouter.post("/", requireAuth, createOrderHandler);

export default orderRouter;