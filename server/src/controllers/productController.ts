import type { Request, Response } from "express";

import { getAllProducts, getProductBySlug } from "../services/productService.js";
import { sendError } from '../utils/http.js';

export async function getProducts(_req: Request, res: Response) {
      try {
            const products = await getAllProducts();

            return res.status(200).json(products);
      } catch (error) {
            console.error("Failed to fetch products: ", error);
            return sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch products");
      }
}

export async function getProduct(req: Request<{ slug: string }>, res: Response) {
      try {
            const { slug } = req.params;

            const product = await getProductBySlug(slug);

            if (!product) {
                  return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
            }

            return res.status(200).json(product);
      } catch (error) {
            console.error("Failed to fetch product: ", error);
            return sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch product");
      }
}
