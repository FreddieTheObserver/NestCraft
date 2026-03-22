# Product Image Uploads

This document covers the backend implementation for admin-uploaded product images in `NestCraft`.

## Goal

Allow administrators to upload product images through the application instead of pasting external image URLs manually.

That backend slice has four jobs:

- accept an authenticated admin image upload
- store the file on the server
- return a stable `imageUrl` string for product records
- serve uploaded files back to browsers

## Route Summary

Current image-upload route:

```http
POST /api/uploads/products
```

Returned shape:

```json
{
  "imageUrl": "/api/uploads/products/1711111111111-uuid-product-image.jpg"
}
```

That response is later stored in `Product.imageUrl` through the existing product create and update endpoints.

## Why This Feature Exists

Before this slice, admins had to provide a value like:

```json
{
  "imageUrl": "https://example.com/image.jpg"
}
```

That was fragile because:

- admins needed a separately hosted image first
- broken or expired third-party URLs would break the storefront
- image management lived outside the app

The upload route moves the first step into the backend itself.

## Files Involved

Upload storage and path configuration:

- [uploads.ts](c:/Users/user/NestCraft/server/src/config/uploads.ts)

Upload middleware:

- [productImageUpload.ts](c:/Users/user/NestCraft/server/src/middleware/productImageUpload.ts)

Upload controller and route:

- [uploadController.ts](c:/Users/user/NestCraft/server/src/controllers/uploadController.ts)
- [upload.ts](c:/Users/user/NestCraft/server/src/routes/upload.ts)

App wiring:

- [app.ts](c:/Users/user/NestCraft/server/src/app.ts)

Product validation compatibility:

- [productSchemas.ts](c:/Users/user/NestCraft/server/src/validation/productSchemas.ts)

Product persistence:

- [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts)
- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)

## Storage Model

Uploaded product images are stored on disk under:

```text
server/uploads/products/
```

The backend creates that directory at startup through [uploads.ts](c:/Users/user/NestCraft/server/src/config/uploads.ts).

Public URLs are shaped as:

```text
/api/uploads/products/<filename>
```

This design is intentional:

- local development already proxies `/api`
- the frontend already knows how to build API-based URLs
- the database can store one string field without schema changes

## Why No Prisma Migration Was Needed

The existing Prisma model already had:

```prisma
imageUrl String?
```

in [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma).

That means the backend can now store either:

- a full external URL
- an internal upload path such as `/api/uploads/products/...`
- `null`

Because the column type is still `String?`, there was no need to rename or migrate the field.

## Upload Request Flow

The upload path works like this:

1. `POST /api/uploads/products` reaches the upload router
2. `requireAuth` verifies the bearer token
3. `requireAdmin` ensures the caller is an admin
4. `multer` parses `multipart/form-data`
5. the file is validated and written to disk
6. the controller returns the public path in `{ imageUrl }`
7. the client sends that path later through `POST /api/products` or `PATCH /api/products/:id`

This split is important:

- upload endpoint handles binary file transfer
- product endpoints keep handling ordinary product JSON

That keeps product CRUD routes simpler than mixing file parsing directly into them.

## Authentication And Authorization

The upload route is protected by:

- `requireAuth`
- `requireAdmin`

That means:

- missing token -> `401`
- invalid token -> `401`
- non-admin token -> `403`

Product images are therefore an admin-managed asset, not a public write surface.

## Upload Middleware

[productImageUpload.ts](c:/Users/user/NestCraft/server/src/middleware/productImageUpload.ts) uses `multer` with `diskStorage`.

It controls:

- destination directory
- generated file name
- file size limit
- allowed MIME types

### Allowed file types

Current allowed MIME types:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/avif`

These map to file extensions:

- `.jpg`
- `.png`
- `.webp`
- `.avif`

### File size limit

Current max upload size:

```ts
5 * 1024 * 1024
```

That is a 5 MB limit.

### Filename generation

The saved filename includes:

- current timestamp
- random UUID
- sanitized original base name
- extension derived from MIME type

That reduces collisions and prevents raw user file names from becoming the entire storage contract.

## Static File Serving

[app.ts](c:/Users/user/NestCraft/server/src/app.ts) mounts:

```ts
app.use("/api/uploads", express.static(uploadsRootDirectory));
```

That means a stored value like:

```text
/api/uploads/products/example.jpg
```

can be requested directly by the browser afterward.

This matters because the upload endpoint only returns metadata, not file contents.

## Validation Contract

Product validation in [productSchemas.ts](c:/Users/user/NestCraft/server/src/validation/productSchemas.ts) now accepts:

- empty value
- uploaded file path starting with `/api/uploads`
- valid absolute URL

This compatibility matters for two reasons:

- old seed data still uses external URLs
- new uploaded images use internal API paths

So the backend now supports both image strategies during the transition.

## Error Handling

Current upload-specific error cases:

- `IMAGE_REQUIRED`
- `IMAGE_TOO_LARGE`
- `INVALID_IMAGE_TYPE`
- `UPLOAD_FAILED`

Example invalid type response:

```json
{
  "error": {
    "code": "INVALID_IMAGE_TYPE",
    "message": "Only JPG, PNG, WEBP, and AVIF images are allowed"
  }
}
```

Example oversize response:

```json
{
  "error": {
    "code": "IMAGE_TOO_LARGE",
    "message": "Image must be 5MB or smaller"
  }
}
```

These errors use the same shared error envelope returned by [http.ts](c:/Users/user/NestCraft/server/src/utils/http.ts).

## Example Upload Request

```http
POST /api/uploads/products
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

Form field:

```text
image=<binary file>
```

Example response:

```json
{
  "imageUrl": "/api/uploads/products/1711111111111-550e8400-e29b-41d4-a716-446655440000-floor-lamp.jpg"
}
```

## Relationship To Product Create And Update

The upload route does not create or update products by itself.

The intended flow is:

1. upload file
2. receive `imageUrl`
3. submit product JSON using that `imageUrl`

Example create payload after upload:

```json
{
  "name": "Oak Floor Lamp",
  "slug": "oak-floor-lamp",
  "description": "A warm oak floor lamp for living rooms and reading corners.",
  "price": 189.99,
  "stock": 5,
  "imageUrl": "/api/uploads/products/1711111111111-uuid-oak-floor-lamp.jpg",
  "categoryId": 2,
  "isFeatured": true,
  "isActive": true
}
```

## Operational Tradeoff: Disk Storage

The current implementation stores uploads on the server filesystem.

That is a good fit for:

- local development
- a single server with persistent disk
- a practice project that needs a simple admin workflow first

But it comes with an important limitation:

- if the deployment filesystem is ephemeral, uploaded files may disappear on redeploy or restart

At that point the storage backend should move to something like:

- S3-compatible object storage
- Cloudinary
- another managed asset store

The current design still keeps that migration manageable because the frontend only depends on receiving an `imageUrl` string.

## What To Test

Minimum backend verification:

- admin can upload JPG, PNG, WEBP, and AVIF
- upload returns `201` with an `imageUrl`
- uploaded file is reachable by `GET /api/uploads/products/<filename>`
- non-admin upload gets `403`
- missing token gets `401`
- invalid token gets `401`
- missing file gets `400 IMAGE_REQUIRED`
- invalid MIME type gets `400 INVALID_IMAGE_TYPE`
- oversized file gets `400 IMAGE_TOO_LARGE`
- uploaded image path can be stored through `POST /api/products`
- uploaded image path can be updated through `PATCH /api/products/:id`

## What Success Looks Like

This slice is working when:

- admins can upload product imagery directly in the app
- product records store the returned upload path
- public product pages can render those uploaded images
- old externally hosted image URLs still continue to work

## Next Logical Improvement

The next backend improvement after this slice would be one of:

- file deletion when an image is replaced or cleared
- object-storage-based uploads for persistent hosted deployment
- image resizing / optimization pipeline

Those are useful follow-ups, but they are not required for the first working admin upload flow.
