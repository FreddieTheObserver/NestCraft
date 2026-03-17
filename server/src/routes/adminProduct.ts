import { Router } from 'express';

import { getAdminProducts } from '../controllers/productController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';

const adminProductRouter = Router();

adminProductRouter.get("/", requireAuth, requireAdmin, getAdminProducts);

export default adminProductRouter;