import { Router } from 'express';

import { validate } from '../middleware/validate.js';
import { productSlugParamsSchema } from '../validation/productSchemas.js';

import { getProducts, getProduct } from '../controllers/productController.js';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/:slug', validate({ params: productSlugParamsSchema }), getProduct);

export default productRouter;