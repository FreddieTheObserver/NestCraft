# GET /api/products

This document covers the main catalog listing endpoint for `NestCraft`.

Endpoint:

```http
GET /api/products
```

## Goal

Return active products from PostgreSQL through Prisma so the frontend can render the storefront catalog with real data.

The current implementation intentionally stays simple:

- only active products are returned
- category data is included
- products are sorted newest first
- no search, filter, sort query params yet

That simplicity is deliberate. This endpoint is the stable base that later catalog browsing features will extend.

## Why This Endpoint Matters

This was the first real catalog API in the project.

It turned the storefront from:

- static placeholder UI
- or fake frontend data

into:

- API-driven product rendering from the database

Every later storefront feature depends on this route working correctly:

- products page
- home page sections
- cart entry points
- product detail navigation

## Files Involved

- [app.ts](c:/Users/user/NestCraft/server/src/app.ts)
- [product.ts](c:/Users/user/NestCraft/server/src/routes/product.ts)
- [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts)
- [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts)
- [prisma.ts](c:/Users/user/NestCraft/server/src/lib/prisma.ts)
- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)

## Request Flow

The request moves through these layers:

1. route
2. controller
3. service
4. Prisma query
5. JSON response

That separation matters because each layer should own one kind of work:

- route -> URL mapping
- controller -> HTTP behavior
- service -> business/query logic
- Prisma -> database access

## Route Responsibility

The route file in [product.ts](c:/Users/user/NestCraft/server/src/routes/product.ts) exposes:

```ts
productRouter.get("/", getProducts);
```

This route is public.

Why:

- the storefront catalog must be readable without authentication
- browsing products is not a privileged action

The route is intentionally thin. It should not contain query logic or response formatting.

## Controller Responsibility

The controller in [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts) does two things:

- calls the service
- maps unexpected failures to an API error

It does not:

- build the Prisma query directly
- implement filtering rules
- decide what counts as an active product

That logic belongs in the service.

## Service Responsibility

The service in [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts) defines the listing rules.

The current query:

- filters `isActive: true`
- includes `category`
- orders by `createdAt: "desc"`

Why these rules matter:

- `isActive: true`
  - products hidden by admin soft-delete should not leak into the storefront
- `include: { category: true }`
  - the client can render category labels without a second request
- `orderBy: { createdAt: "desc" }`
  - product listing is deterministic and easy to test

## Why Category Data Is Included

Each product record includes its related category object.

That means the frontend can show:

- category name
- category slug later if needed

without making a second API call.

This is a reasonable tradeoff at this stage because:

- category objects are small
- the products page benefits from richer display data immediately

## Current Response Shape

The endpoint returns an array of products.

Conceptually:

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
    "createdAt": "2026-03-13T10:00:00.000Z",
    "updatedAt": "2026-03-13T10:00:00.000Z",
    "category": {
      "id": 1,
      "name": "Lighting",
      "slug": "lighting",
      "imageUrl": "https://..."
    }
  }
]
```

The exact timestamp values will differ, but this is the shape the frontend expects.

## Why This Endpoint Does Not Yet Take Query Params

Search, filter, and sort are valid next features, but they do not belong in the very first version.

Reasons:

- the base listing route must work reliably first
- the response shape should be stable before query logic expands
- simpler endpoints are easier to debug while the stack is still evolving

The right progression is:

1. stable list route
2. stable detail route
3. search/filter/sort extensions later

## Error Behavior

Right now this endpoint mainly has one failure mode:

- unexpected server or database error -> `500`

Because the route takes no request body and no required params, there is not much request-shape validation needed here yet.

If later query params are added, request validation will matter more for this route.

## Relationship To Product Activation

This endpoint only returns products where:

```ts
isActive: true
```

That is important because admin deactivation uses soft delete, not hard delete.

So when an admin calls:

```http
PATCH /api/products/:id/deactivate
```

the product is hidden from this listing automatically.

That is the correct storefront behavior.

## What To Test

This route is working correctly when:

- the backend starts without errors
- `/api/products` returns JSON
- products come from the database, not hardcoded values
- inactive products do not appear
- category data is included
- ordering is stable

## Relationship To Frontend

This endpoint powers the main catalog UI:

- products page
- product cards
- initial storefront browsing experience

The frontend service layer reads this response and turns it into rendered product cards.

## What Comes Next

The next directly related route is:

```http
GET /api/products/:slug
```

And after that, the next catalog expansion is:

- search
- filter by category
- sort options
