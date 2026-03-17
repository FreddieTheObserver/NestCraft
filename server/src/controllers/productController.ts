import type { Request, Response } from "express";

import { 
      createProduct,
      deactivateProduct,
      getAllProductsForAdmin,
      getAllProducts, 
      getProductBySlug,
      updateProduct
} from "../services/productService.js";
import { sendError } from '../utils/http.js';

type ProductIdParams = {
      id: string;
};

export async function getAdminProducts(_req: Request, res: Response) {
      try {
            const products = await getAllProductsForAdmin();
            return res.status(200).json(products);
      } catch (error) {
            console.error("Failed to fetch admin products: ", error);
            return sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch admin products");
      }
}

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

export async function createProductHandler(req: Request, res: Response) {
      try {
            const product = await createProduct(req.body);

            return res.status(201).json(product);
      } catch (error) {
            if (error instanceof Error) {
                  if (error.message === "CATEGORY_NOT_FOUND") {
                        return sendError(res, 400, "CATEGORY_NOT_FOUND", "Category not found");
                  }

                  if (error.message === "SLUG_ALREADY_IN_USE") {
                        return sendError(res, 409, "SLUG_ALREADY_IN_USE", "Slug already in use");
                  }

                  console.error("Failed to create product: ", error);
            }

            console.error("Failed to create product: ", error);
            return sendError(res, 500, "INTERNAL_ERROR", "Failed to create product");
      }
}

export async function updateProductHandler(
      req: Request<ProductIdParams>,
      res: Response,
) {
      try {
            const productId = Number(req.params.id);
            const product = await updateProduct(productId, req.body);

            return res.status(200).json(product);
      } catch (error) {
            if (error instanceof Error) {
                  if (error.message === "PRODUCT_NOT_FOUND") {
                        return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
                  }

                  if (error.message === "CATEGORY_NOT_FOUND") {
                        return sendError(res, 404, "CATEGORY_NOT_FOUND", "Category not found");
                  }

                  if (error.message === "SLUG_ALREADY_IN_USE") {
                        return sendError(res, 409, "SLUG_ALREADY_IN_USE", "Slug already in use");
                  }
            }

            console.error("Failed to update product: ", error);
            return sendError(res, 500, "INTERNAL_ERROR", "Failed to update product");
      }
}

export async function deactivateProductHandler(
      req: Request<ProductIdParams>,
      res: Response,
) {
      try {
            const productId = Number(req.params.id);
            const product = await deactivateProduct(productId);

            return res.status(200).json(product);
      } catch (error) {
            if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
                  return sendError(res, 404, "PRODUCT_NOT_FOUND", "Product not found");
            }

            console.error("Failed to deactivate product: ", error);
            return sendError(res, 500, "INTERNAL_ERROR", "Failed to deactivate product");
      }
}
