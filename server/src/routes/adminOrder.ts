import { Router } from 'express';

import {
      getAdminOrdersHandler,
      updateOrderStatusHandler,
} from '../controllers/orderController.js';

import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

import {
      orderIdParamsSchema,
      updateOrderStatusSchema,
} from '../validation/orderSchemas.js';

const adminOrderRouter = Router();

adminOrderRouter.get("/", requireAuth, requireAdmin, getAdminOrdersHandler);

adminOrderRouter.patch(
      "/:id/status",
      requireAuth,
      requireAdmin,
      validate({
            params: orderIdParamsSchema,
            body: updateOrderStatusSchema,
      }),
      updateOrderStatusHandler,
);

export default adminOrderRouter;
