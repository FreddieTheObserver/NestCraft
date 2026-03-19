import { Router } from 'express';

import { validate } from '../middleware/validate.js';
import { createOrderSchema, orderNumberParamsSchema } from '../validation/orderSchemas.js';

import { createOrderHandler, getMyOrderNumberHandler, getMyOrdersHandler } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const orderRouter = Router();

orderRouter.get("/me", requireAuth, getMyOrdersHandler);

orderRouter.get(
      "/:orderNumber",
      requireAuth,
      validate({ params: orderNumberParamsSchema }),
      getMyOrderNumberHandler,
);

orderRouter.post("/", requireAuth, validate({ body: createOrderSchema }), createOrderHandler);

export default orderRouter;