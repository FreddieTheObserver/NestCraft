import { Router } from 'express';

import {
      getProducts,
      getProduct,
} from '../controllers/productController.js';

import { validate } from '../middleware/validate.js';
import {
      productListQuerySchema,
      productSlugParamsSchema,
} from '../validation/productSchemas.js';

const productRouter = Router();

productRouter.get('/', validate({ query: productListQuerySchema }), getProducts);
productRouter.get('/:slug', validate({ params: productSlugParamsSchema }), getProduct);

export default productRouter;
