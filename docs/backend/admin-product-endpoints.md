# Admin Product Endpoints

This document covers the admin-only backend endpoints used to create, update, and deactivate products.

## Goal

Allow store administrators to manage the product catalog without editing the database manually.

Current endpoints:

```http
POST /api/products
PATCH /api/products/:id
PATCH /api/products/:id/deactivate
```

## Files Involved

- [product.ts](c:/Users/user/NestCraft/server/src/routes/product.ts)
- [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts)
- [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts)
- [productSchemas.ts](c:/Users/user/NestCraft/server/src/validation/productSchemas.ts)
- [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts)
- [validate.ts](c:/Users/user/NestCraft/server/src/middleware/validate.ts)
- [http.ts](c:/Users/user/NestCraft/server/src/utils/http.ts)
- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)

## Why These Endpoints Exist

Before this feature, the catalog could only be changed by:

- seed scripts
- Prisma Studio
- direct database edits

That is fine early on, but it does not scale once the storefront is active. Admin product endpoints are the first real store-management capability.

## Access Control

These write endpoints are protected by both:

- `requireAuth`
- `requireAdmin`

That means:

- missing token -> `401`
- invalid token -> `401`
- logged-in non-admin user -> `403`

Public product reads remain open:

```http
GET /api/products
GET /api/products/:slug
```

Only write operations are admin-only.

## Product Model Fields Managed By Admin

The admin endpoints currently manage these fields from the `Product` model:

- `name`
- `slug`
- `description`
- `price`
- `stock`
- `imageUrl`
- `categoryId`
- `isFeatured`
- `isActive`

This is enough for a practical first admin product workflow.

## Route Design

The route layer in [product.ts](c:/Users/user/NestCraft/server/src/routes/product.ts) keeps public reads and admin writes together.

That is acceptable at this stage because:

- the product resource stays in one place
- read and write concerns are still easy to reason about
- admin protection is explicit on the write routes

Current structure:

```ts
productRouter.get("/", getProducts);
productRouter.get("/:slug", validate({ params: productSlugParamsSchema }), getProduct);

productRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  validate({ body: createProductSchema }),
  createProductHandler,
);

productRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validate({ params: productIdParamsSchema, body: updateProductSchema }),
  updateProductHandler,
);

productRouter.patch(
  "/:id/deactivate",
  requireAuth,
  requireAdmin,
  validate({ params: productIdParamsSchema }),
  deactivateProductHandler,
);
```

## Validation Rules

Validation happens before the controller runs.

### `POST /api/products`

Uses `createProductSchema`.

Checks:

- name length
- URL-safe slug
- minimum description length
- positive price
- non-negative stock
- valid image URL if provided
- positive `categoryId`

### `PATCH /api/products/:id`

Uses:

- `productIdParamsSchema`
- `updateProductSchema`

Checks:

- `id` is a positive integer
- provided fields are valid
- at least one field exists in the patch body

### `PATCH /api/products/:id/deactivate`

Uses:

- `productIdParamsSchema`

Only the route param is validated because the route body is not needed.

## Controller Responsibility

The controller in [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts) handles:

- HTTP status codes
- mapping service errors to API errors
- returning JSON responses

It does not own:

- validation rules
- database queries
- business rules like slug uniqueness or category existence

That work stays in the service and validation layers.

## Service Responsibility

The service in [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts) owns the real business logic.

### Create product

`createProduct(data)`:

- checks that the category exists
- checks that the slug is not already in use
- normalizes empty image values to `null`
- creates the product with Prisma

### Update product

`updateProduct(id, data)`:

- checks that the product exists
- checks the category if `categoryId` is being changed
- checks slug uniqueness if the slug is being changed
- applies partial updates
- allows `imageUrl` to be cleared to `null`

### Deactivate product

`deactivateProduct(id)`:

- checks that the product exists
- updates `isActive` to `false`

This is a soft-delete pattern.

## Soft Delete Behavior

The deactivate route does not remove the database row.

Instead, it sets:

```ts
isActive: false
```

That matters because:

- the product can be reactivated later
- order history still keeps product references
- admin can temporarily hide a product without destroying data

## Reactivating A Product

There is no separate `activate` endpoint right now.

Instead, reactivation is already supported through:

```http
PATCH /api/products/:id
```

with a body like:

```json
{
  "isActive": true
}
```

So the current system supports:

- dedicated deactivate route
- generic update route for reactivation

That is a reasonable design for this stage.

## Error Cases

Current business-error mapping:

- missing category -> `CATEGORY_NOT_FOUND`
- duplicate slug -> `SLUG_ALREADY_IN_USE`
- missing product on update/deactivate -> `PRODUCT_NOT_FOUND`

Validation failures return:

- `VALIDATION_ERROR`

Auth failures return:

- `UNAUTHORIZED`
- `INVALID_TOKEN`
- `FORBIDDEN`

These use the shared API error shape from [http.ts](c:/Users/user/NestCraft/server/src/utils/http.ts).

## Example Create Request

```http
POST /api/products
Authorization: Bearer <admin-token>
Content-Type: application/json
```

```json
{
  "name": "Walnut Console Table",
  "slug": "walnut-console-table",
  "description": "A slim walnut console table for entryways and living rooms.",
  "price": 129.99,
  "stock": 8,
  "imageUrl": "https://example.com/table.jpg",
  "categoryId": 2,
  "isFeatured": true,
  "isActive": true
}
```

## Example Update Request

```http
PATCH /api/products/1
Authorization: Bearer <admin-token>
Content-Type: application/json
```

```json
{
  "price": 139.99,
  "stock": 5,
  "isFeatured": false
}
```

## Example Deactivate Request

```http
PATCH /api/products/1/deactivate
Authorization: Bearer <admin-token>
```

## What Success Looks Like

This feature is working correctly when:

- admins can create products
- admins can update products
- admins can deactivate products
- non-admin users get `403`
- duplicate slugs get `409`
- bad payloads fail in validation middleware
- deactivated products disappear from the public storefront because public reads filter on `isActive: true`

## Next Logical Step

Once these endpoints are stable, the next frontend slice is:

- admin products list page
- create product form
- edit product form
- admin route protection
