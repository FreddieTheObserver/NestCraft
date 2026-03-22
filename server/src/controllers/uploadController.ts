import type { Request, Response } from "express";

import { productUploadsPublicPath } from "../config/upload.js";
import { sendError } from "../utils/http.js";

export function uploadProductImageHandler(req: Request, res: Response) {
      if (!req.file) {
            return sendError(res, 400, "IMAGE_REQUIRED", "An image file is required");
      }

      return res.status(201).json({
            imageUrl: `${productUploadsPublicPath}/${req.file.filename}`,
      });
}