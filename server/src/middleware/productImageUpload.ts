import crypto from 'node:crypto'
import path from 'node:path'
import multer from 'multer'

import { productUploadsDirectory } from '../config/upload.js'

const allowedMimeTypes = new Map<string, string>([
      ['image/jpeg', '.jpg'],
      ['image/png', '.png'],
      ['image/webp', '.webp'],
      ['image/avif', '.avif'],
])

const storage = multer.diskStorage({
      destination(_req, _file, callback) {
            callback(null, productUploadsDirectory)
      },
      filename(_req, file, callback) {
            const extension = allowedMimeTypes.get(file.mimetype)

            if (!extension) {
                  return callback(new Error('INVALID_IMAGE_TYPE'), '')
            }

            const safeBaseName = 
                  path
                        .basename(file.originalname, path.extname(file.originalname))
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '')
                        .slice(0, 50) || 'product-image'
                  
            callback(null, `${Date.now()}-${crypto.randomUUID()}-${safeBaseName}${extension}`)
      },
})

function fileFilter(
      _req: Express.Request,
      file: Express.Multer.File,
      callback: multer.FileFilterCallback,
) {
      if (!allowedMimeTypes.has(file.mimetype)) {
            return callback(new Error('INVALID_IMAGE_TYPE'))
      }

      return callback(null, true)
}

export const productImageUpload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter,
})