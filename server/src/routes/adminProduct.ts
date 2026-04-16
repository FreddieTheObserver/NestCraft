import { Router } from "express";

import {
      getAdminProductsHandler,
      getAdminProductHandler,
} from "../controllers/adminProductController.js";
import {
      createProductHandler,
      deactivateProductHandler,
      updateProductHandler,
} from "../controllers/productController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { adminProductListQuerySchema } from "../validation/adminProductSchemas.js";
import {
      createProductSchema,
      productIdParamsSchema,
      updateProductSchema,
} from "../validation/productSchemas.js";

const adminProductRouter = Router();

adminProductRouter.get(
      "/",
      requireAuth,
      requireAdmin,
      validate({ query: adminProductListQuerySchema }),
      getAdminProductsHandler,
);

adminProductRouter.get(
      "/:id",
      requireAuth,
      requireAdmin,
      validate({ params: productIdParamsSchema }),
      getAdminProductHandler,
);

adminProductRouter.post(
      "/",
      requireAuth,
      requireAdmin,
      validate({ body: createProductSchema }),
      createProductHandler,
);

adminProductRouter.patch(
      "/:id",
      requireAuth,
      requireAdmin,
      validate({ params: productIdParamsSchema, body: updateProductSchema }),
      updateProductHandler,
);

adminProductRouter.patch(
      "/:id/deactivate",
      requireAuth,
      requireAdmin,
      validate({ params: productIdParamsSchema }),
      deactivateProductHandler,
);

export default adminProductRouter;
