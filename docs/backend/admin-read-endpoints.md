# Admin Read Endpoints

This document covers the backend read endpoints that support the admin product UI.

Current endpoints:

- `GET /api/admin/products`
- `GET /api/categories`

These endpoints exist because the admin frontend needs a different read model than the public storefront.

The public storefront only needs:

- active products
- product detail by slug

The admin interface needs:

- all products, including inactive ones
- category data for display and editing
- category options for create and edit forms

That is why these reads are separated from the existing public catalog endpoints.

## Why These Endpoints Were Added

Before these endpoints existed, the backend had enough write functionality for admin product management:

- create product
- update product
- deactivate product

But the frontend could not build a correct admin UI because it was missing two important reads:

1. a way to load the full catalog, including hidden products
2. a way to load categories for form dropdowns

Trying to build the admin UI without these endpoints would have caused bad shortcuts such as:

- reusing `GET /api/products` and silently losing inactive products
- hardcoding `categoryId` values in forms
- making the admin UI depend on seeded assumptions instead of live data

So these endpoints are not optional polish. They are required for a usable admin workflow.

## Files Involved

Routing:

- [adminProduct.ts](c:/Users/user/NestCraft/server/src/routes/adminProduct.ts)
- [category.ts](c:/Users/user/NestCraft/server/src/routes/category.ts)

Controllers:

- [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts)
- [categoryController.ts](c:/Users/user/NestCraft/server/src/controllers/categoryController.ts)

Services:

- [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts)
- [categoryService.ts](c:/Users/user/NestCraft/server/src/services/categoryService.ts)

Middleware and app wiring:

- [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts)
- [app.ts](c:/Users/user/NestCraft/server/src/app.ts)

## Endpoint 1: `GET /api/admin/products`

### Purpose

This endpoint returns the full product catalog for admin-facing screens.

That means:

- active products are included
- inactive products are included
- related category data is included

This is different from the public `GET /api/products` endpoint, which intentionally filters the result to:

- `isActive: true`

The admin UI cannot use the public endpoint because it needs visibility into draft, hidden, or deactivated products as well.

### Route

The route is defined in [adminProduct.ts](c:/Users/user/NestCraft/server/src/routes/adminProduct.ts):

```ts
adminProductRouter.get("/", requireAuth, requireAdmin, getAdminProducts);
```

Mounted path in [app.ts](c:/Users/user/NestCraft/server/src/app.ts):

```ts
app.use("/api/admin/products", adminProductRouter);
```

So the final path is:

```http
GET /api/admin/products
```

### Protection

This route is protected by:

- `requireAuth`
- `requireAdmin`

That means:

- no token -> `401`
- invalid token -> `401`
- logged-in non-admin user -> `403`
- valid admin token -> allowed

This is the correct access policy because the endpoint exposes product records that are not meant for public storefront browsing.

### Controller Responsibility

The controller handler is `getAdminProducts` in [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts).

Its job is simple:

- call the admin read service
- return `200` with data
- convert unexpected failures into the shared API error shape

The controller does not build Prisma queries itself.

### Service Responsibility

The service function is `getAllProductsForAdmin()` in [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts).

It currently does this:

- queries all products
- includes related category data
- sorts newest first by `createdAt`

Important difference from the public service:

- it does not filter by `isActive`

That single difference is what makes this an admin read instead of a storefront read.

### Response Shape

The response contains full product records with nested category data.

Example shape:

```json
[
  {
    "id": 1,
    "name": "Oak Bedside Lamp",
    "slug": "oak-bedside-lamp",
    "description": "A warm wooden bedside lamp for cozy interior spaces.",
    "price": "49.99",
    "stock": 12,
    "imageUrl": "https://...",
    "isFeatured": true,
    "isActive": true,
    "categoryId": 1,
    "createdAt": "...",
    "updatedAt": "...",
    "category": {
      "id": 1,
      "name": "Lighting",
      "slug": "lighting",
      "imageUrl": "https://...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
]
```

That response is suitable for:

- admin product table views
- edit buttons
- active/inactive status chips
- featured badges
- category display

### Why Category Data Is Included

Including category data here prevents the admin UI from needing extra requests just to show product rows cleanly.

Without included category data, the frontend would need:

- another lookup map
- or multiple additional requests

That would add unnecessary complexity to a page that already needs to manage admin actions.

### Current Limitations

This endpoint currently does not support:

- pagination
- search
- category filtering
- sort query params

That is acceptable for the current project stage. The endpoint is doing the minimum correct job for the first admin UI slice.

## Endpoint 2: `GET /api/categories`

### Purpose

This endpoint returns categories for the frontend create and edit product forms.

The main use case is simple:

- populate a category dropdown or select input

That lets the frontend submit a real `categoryId` chosen from live backend data.

### Why This Endpoint Is Public For Now

The current route is public.

That is acceptable because category names and slugs are not sensitive in this project.

Making it public keeps the implementation simple and leaves room for future reuse in:

- storefront filters
- category navigation
- public browsing enhancements later

If the admin domain grows more complex later, this can still be moved behind auth. For now, public is the simplest correct choice.

### Route

The route is defined in [category.ts](c:/Users/user/NestCraft/server/src/routes/category.ts):

```ts
categoryRouter.get("/", getCategories);
```

Mounted path in [app.ts](c:/Users/user/NestCraft/server/src/app.ts):

```ts
app.use("/api/categories", categoryRouter);
```

So the final path is:

```http
GET /api/categories
```

### Controller Responsibility

The controller handler is `getCategories` in [categoryController.ts](c:/Users/user/NestCraft/server/src/controllers/categoryController.ts).

Its job is:

- call the category service
- return `200` with category data
- convert unexpected failures into the shared error format

### Service Responsibility

The service function is `getAllCategories()` in [categoryService.ts](c:/Users/user/NestCraft/server/src/services/categoryService.ts).

It currently:

- fetches all categories
- sorts them alphabetically by `name`

Alphabetical sorting is a practical default because it makes form dropdowns easier to scan.

### Response Shape

Example response:

```json
[
  {
    "id": 2,
    "name": "Decor",
    "slug": "decor",
    "imageUrl": "https://..."
  },
  {
    "id": 1,
    "name": "Lighting",
    "slug": "lighting",
    "imageUrl": "https://..."
  }
]
```

That is enough for:

- admin create product form
- admin edit product form
- future public category filter UIs if needed

## Relationship To Existing Product Endpoints

These new read endpoints do not replace the public catalog endpoints.

They solve different problems.

Public catalog endpoints:

- optimized for storefront browsing
- hide inactive products
- expose only what the storefront needs

Admin read endpoints:

- optimized for catalog management
- include inactive products
- provide support data for forms and admin screens

That separation is intentional and correct.

It keeps the public API simpler while giving the admin interface the broader visibility it needs.

## Error Behavior

Current expected status behavior:

### `GET /api/admin/products`

- `200` for success
- `401` for missing or invalid token
- `403` for authenticated non-admin user
- `500` for unexpected server failure

### `GET /api/categories`

- `200` for success
- `500` for unexpected server failure

These errors use the same shared JSON error format already used elsewhere in the backend.

## Testing

### Admin products

```bash
curl http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Verify:

- active products appear
- inactive products also appear
- category data is included

Negative tests:

- no token -> `401`
- customer token -> `403`

### Categories

```bash
curl http://localhost:5000/api/categories
```

Verify:

- categories return successfully
- categories are ordered by name
- IDs are usable in admin form submission

## Why These Endpoints Matter For The Next Step

These endpoints are what make frontend admin product management realistic.

With them, the frontend can now build:

- admin products list page
- create product form
- edit product form
- activate/deactivate controls

Without them, the admin UI would be forced into brittle assumptions or incomplete data access.

That is why these read endpoints are the correct bridge between the backend admin write APIs and the upcoming admin frontend work.
