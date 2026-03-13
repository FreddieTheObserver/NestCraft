import { Router } from 'express';

import { getProducts, getProduct } from '../controllers/productController.js';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/:slug', getProduct);

export default productRouter;