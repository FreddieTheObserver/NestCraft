import multer from 'multer';
import { Router } from 'express';

import { uploadProductImageHandler } from '../controllers/uploadController.js';
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js';
import { productImageUpload } from '../middleware/productImageUpload.js';
import { sendError } from '../utils/http.js';

const uploadRouter = Router();

uploadRouter.post('/products', requireAuth, requireAdmin, (req, res, next) => {
      productImageUpload.single('image')(req, res, (error) => {
            if (!error) {
                  return next();
            }

            if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
                  return sendError(res, 400, "IMAGE_TOO_LARGE", "Image must be 5mb or smaller");
            }

            if (error instanceof Error && error.message === "INVALID_IMAGE_TYPE") {
                  return sendError(
                        res,
                        400,
                        "INVALID_IMAGE_TYPE",
                        "Only JPG, PNG, WENP, and AVIF images are allowed",
                  );
            }

            return sendError(res, 500, "UPLOAD_FAILED", "Failed to upload image");
      });
}, uploadProductImageHandler);

export default uploadRouter;