import type { Request, Response } from "express";

import { getAllProducts } from "../services/productService.js";

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