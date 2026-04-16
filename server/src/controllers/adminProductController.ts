import type { Request, Response } from "express";

import {
  getAdminProductById,
  getAdminProductsPage,
} from "../services/productService.js";
import type { AdminProductListQuery } from "../validation/adminProductSchemas.js";
import { sendError } from "../utils/http.js";

export async function getAdminProductsHandler(_req: Request, res: Response) {
  try {
    const query = res.locals.validatedQuery as AdminProductListQuery;
    const page = await getAdminProductsPage(query);
    return res.status(200).json(page);
  } catch (error) {
    console.error("Failed to fetch admin products: ", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch admin products");
  }
}

export async function getAdminProductHandler(_req: Request, res: Response) {
  try {
    const params = res.locals.validatedParams as { id: number };
    const product = await getAdminProductById(params.id);

    if (!product) {
      return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Failed to fetch admin product: ", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch admin product");
  }
}
