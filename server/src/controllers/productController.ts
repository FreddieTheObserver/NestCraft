import type { Request, Response } from "express";

import { getAllProducts, getProductBySlug } from "../services/productService.js";

export async function getProducts(req: Request, res: Response) {
      try {
            const products = await getAllProducts();

            res.status(200).json(products);
      } catch (error) {
            console.error("Failed to fetch products: ", error);
            res.status(500).json({
                  message: "Failed to fetch products",
            });
      }
}

export async function getProduct(req: Request, res: Response) {
      try {
            const slug = req.params.slug;

            if (!slug || Array.isArray(slug)) {
                  return res.status(400).json({
                        message: "Invalid product slug",
                  });
            }

            const product = await getProductBySlug(slug);

            if (!product) {
                  return res.status(404).json({
                        message: "Product not found",
                  });
            }

            return res.status(200).json(product);
      } catch (error) {
            console.error("Failed to feetch product: ", error);
            return res.status(500).json({
                  message: "Failed to fetch product",
            });
      }
}