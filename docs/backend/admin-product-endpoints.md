# Admin Product Endpoints

This document covers the admin-only backend endpoints used to manage the product catalog.

## Goal

Allow administrators to create products, update products, and hide products from the storefront without editing the database manually.

Current endpoints:

```http
POST /api/products
PATCH /api/products/:id
PATCH /api/products/:id/deactivate
```

## Why This Feature Exists

Before these endpoints existed, product management depended on:

- seed scripts
- Prisma Studio
- direct database edits

That was acceptable while the project was still proving out the storefront. It stops being acceptable once the app needs a real store-owner workflow.

These endpoints are the first backend step toward a usable admin panel.

## Files Involved

- [product.ts](c:/Users/user/NestCraft/server/src/routes/product.ts)
- [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts)
- [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts)
- [productSchemas.ts](c:/Users/user/NestCraft/server/src/validation/productSchemas.ts)
- [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts)
- [validate.ts](c:/Users/user/NestCraft/server/src/middleware/validate.ts)
- [http.ts](c:/Users/user/NestCraft/server/src/utils/http.ts)
- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)

## Access Model

Public product reads remain open:

```http
GET /api/products
GET /api/products/:slug
```

Catalog writes are protected by both:

- `requireAuth`
- `requireAdmin`

That means:

- missing token -> `401`
- invalid token -> `401`
- authenticated non-admin user -> `403`

This is the correct split:

- browsing the catalog is public
- changing the catalog is privileged

## Important Prerequisite: Real Admin Token

You need an actual admin user to test these routes.

Setting the `role` field to `admin` in the database is only part of the work. After changing the role, the user must log in again so a new JWT is issued with:

```json
{
  "userId": 1,
  "role": "admin"
}
```

If the token was issued before the role change, `requireAdmin` will still reject the request.

## Product Fields Managed By Admin

The current endpoints manage these `Product` fields:

- `name`
- `slug`
- `description`
- `price`
- `stock`
- `imageUrl`
- `categoryId`
- `isFeatured`
- `isActive`

That is enough for a first real product-management workflow:

- create a new product
- edit core product information
- change stock
- feature or unfeature products
- hide or reactivate products

## Route Design

The product router keeps public read routes and admin write routes together:

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

Why this is acceptable:

- the resource stays centralized
- read and write concerns are still easy to scan
- write protection is explicit at the route layer

At a larger scale, it might make sense to split admin product routes into a separate router, but it is not necessary yet.

## Request Flow

The write-path lifecycle is now:

1. request hits the product route
2. `requireAuth` verifies the bearer token
3. `requireAdmin` checks the JWT role
4. `validate(...)` parses params and/or body
5. controller receives already-validated input
6. service applies business rules and Prisma queries
7. controller returns success data or standardized errors

That is the intended separation:

- middleware handles auth and validation
- controller handles HTTP concerns
- service handles business logic

## Validation Rules

Validation happens before controller execution.

## `POST /api/products`

Uses `createProductSchema`.

Checks:

- `name` has minimum length
- `slug` is URL-safe
- `description` has minimum length
- `price` is positive
- `stock` is a non-negative integer
- `imageUrl` is a valid URL if provided
- `categoryId` is a positive integer

This route expects a complete create payload.

## `PATCH /api/products/:id`

Uses:

- `productIdParamsSchema`
- `updateProductSchema`

Checks:

- `id` is a positive integer
- all provided fields are individually valid
- at least one field exists in the patch body

This is important because patch routes should not accept an empty object and pretend an update happened.

## `PATCH /api/products/:id/deactivate`

Uses:

- `productIdParamsSchema`

No body is required because the route expresses a single action:

- set `isActive` to `false`

## Controller Responsibilities

The controller in [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts) handles:

- status codes
- success JSON responses
- mapping service errors to API errors

It does not own:

- request validation
- category existence queries
- slug uniqueness checks
- product existence checks

That logic lives in the service layer.

## Service Responsibilities

The service in [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts) owns the business rules.

## Create

`createProduct(data)`:

- checks the category exists
- checks the slug is unique
- normalizes `imageUrl`
- sets default booleans if omitted
- creates the record with Prisma

One concrete bug already caught in this path was the wrong use of `findMany()` for slug uniqueness. Because an empty array is truthy in JavaScript, that check caused `SLUG_ALREADY_IN_USE` to fire for every create request. The fix was switching to `findUnique()`.

That bug is a good reminder that service-layer business checks need exact query semantics.

## Update

`updateProduct(id, data)`:

- checks the product exists
- checks the category exists if `categoryId` changes
- checks slug uniqueness if `slug` changes
- applies partial updates only
- allows `imageUrl` to be cleared to `null`

This is the route that also supports reactivation:

```json
{
  "isActive": true
}
```

## Deactivate

`deactivateProduct(id)`:

- checks the product exists
- sets `isActive` to `false`

This is intentionally a soft delete, not a hard delete.

## Why Soft Delete Was Chosen

The deactivate route does not remove the row from the database.

It sets:

```ts
isActive: false
```

Why that is the right choice here:

- the product can be restored later
- old order history can still reference the product
- the storefront can hide products without losing data

Hard delete would make early product management riskier than necessary.

## Reactivating A Product

There is no dedicated `PATCH /api/products/:id/activate` route yet.

That is acceptable because reactivation is already supported by:

```http
PATCH /api/products/:id
```

with:

```json
{
  "isActive": true
}
```

So the current design is:

- dedicated route for deactivation
- generic patch route for reactivation

That is a pragmatic compromise for this project stage.

## Error Mapping

Current business errors:

- `CATEGORY_NOT_FOUND`
- `SLUG_ALREADY_IN_USE`
- `PRODUCT_NOT_FOUND`

Validation errors:

- `VALIDATION_ERROR`

Auth/role errors:

- `UNAUTHORIZED`
- `INVALID_TOKEN`
- `FORBIDDEN`

All of these use the shared API error envelope from [http.ts](c:/Users/user/NestCraft/server/src/utils/http.ts).

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

## Example Reactivation Request

```http
PATCH /api/products/1
Authorization: Bearer <admin-token>
Content-Type: application/json
```

```json
{
  "isActive": true
}
```

## Example Deactivate Request

```http
PATCH /api/products/1/deactivate
Authorization: Bearer <admin-token>
```

## What To Test

Minimum backend test matrix:

- admin can create a product
- admin can update a product
- admin can deactivate a product
- admin can reactivate a product through `PATCH /api/products/:id`
- non-admin user gets `403`
- missing token gets `401`
- invalid category gets `400`
- duplicate slug gets `409`
- bad payload gets `400 VALIDATION_ERROR`

## What Success Looks Like

This feature is working correctly when:

- admins can maintain the catalog through the API
- public users cannot access write operations
- deactivated products stop appearing in public catalog reads because those reads filter on `isActive: true`
- reactivation works without adding a second activation-specific endpoint

## Next Logical Step

Once these endpoints are stable, the next frontend slice is:

- admin products list page
- create product form
- edit product form
- activate/deactivate controls
- admin route protection
