import type { Request, Response } from "express";

import { getAllCategories } from "../services/categoryService.js";
import { sendError } from "../utils/http.js";

export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await getAllCategories();

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Failed to fetch categories");
  }
}
