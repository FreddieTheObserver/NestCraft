import { Router } from 'express';

import { validate } from '../middleware/validate.js';
import { createOrderSchema } from '../validation/orderSchemas.js';

import { createOrderHandler, getMyOrdersHandler } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const orderRouter = Router();

orderRouter.get("/me", requireAuth, getMyOrdersHandler);
orderRouter.post("/", requireAuth, validate({ body: createOrderSchema }), createOrderHandler);

export default orderRouter;