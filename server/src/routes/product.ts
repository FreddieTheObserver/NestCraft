import { Router } from 'express';

import { 
      createProductHandler,
      deactivateProductHandler,
      getProducts, 
      getProduct,
      updateProductHandler,
} from '../controllers/productController.js';

import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { 
      createProductSchema,
      productIdParamsSchema,
      productListQuerySchema,
      productSlugParamsSchema,
      updateProductSchema,
} from '../validation/productSchemas.js';

const productRouter = Router();

productRouter.get('/', validate({ query: productListQuerySchema }), getProducts);
productRouter.get('/:slug', validate({ params: productSlugParamsSchema }), getProduct);

productRouter.post(
      '/',
      requireAuth,
      requireAdmin,
      validate({ body: createProductSchema }),
      createProductHandler,
);

productRouter.patch(
      '/:id',
      requireAuth,
      requireAdmin,
      validate({ params: productIdParamsSchema, body: updateProductSchema }),
      updateProductHandler,
);

productRouter.patch(
      '/:id/deactivate',
      requireAuth,
      requireAdmin,
      validate({ params: productIdParamsSchema }),
      deactivateProductHandler,
)

export default productRouter;
