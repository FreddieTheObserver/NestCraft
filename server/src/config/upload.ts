import fs from "node:fs"
import path from "node:path"

export const uploadsRootDirectory = path.resolve(process.cwd(), 'uploads')
export const productUploadsDirectory = path.join(uploadsRootDirectory, 'products')
export const productUploadsPublicPath = '/api/uploads/products'

fs.mkdirSync(productUploadsDirectory, { recursive: true })