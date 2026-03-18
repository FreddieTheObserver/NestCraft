# GET /api/products

This document covers the public catalog listing endpoint in `NestCraft`.

Endpoint:

```http
GET /api/products
```

Supported query params:

- `search`
- `category`
- `sort`

Example requests:

```http
GET /api/products
GET /api/products?search=lamp
GET /api/products?category=lighting
GET /api/products?sort=price-asc
GET /api/products?search=oak&category=lighting&sort=price-desc
```

## Goal

Return storefront-visible products from PostgreSQL through Prisma so the frontend can render a browseable public catalog.

The current implementation does all of the following:

- returns only active products
- includes category data
- supports text search
- supports category filtering by category slug
- supports explicit sort modes
- validates query params before controller logic runs

This endpoint started as a simple "return all active products" route. It has now grown into the real browsing contract for the public storefront.

## Why This Endpoint Matters

This route is the foundation for the catalog experience.

It now supports the core discovery actions users expect from a storefront:

- browse all products
- search for products
- narrow by category
- change sort order

That makes it more than a basic list route. It is now the backend contract behind the storefront browsing UI.

## Files Involved

Route and app wiring:

- [app.ts](c:/Users/user/NestCraft/server/src/app.ts)
- [product.ts](c:/Users/user/NestCraft/server/src/routes/product.ts)

Controller:

- [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts)

Service:

- [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts)

Validation:

- [validate.ts](c:/Users/user/NestCraft/server/src/middleware/validate.ts)
- [productSchemas.ts](c:/Users/user/NestCraft/server/src/validation/productSchemas.ts)

Database:

- [prisma.ts](c:/Users/user/NestCraft/server/src/lib/prisma.ts)
- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)

## Request Flow

The request now moves through these layers:

1. route
2. query validation middleware
3. controller
4. service
5. Prisma query
6. JSON response

That separation matters because each layer owns one kind of work:

- route -> URL mapping
- validation middleware -> request-shape enforcement
- controller -> HTTP behavior
- service -> query rules
- Prisma -> database access

## Route Responsibility

The route file in [product.ts](c:/Users/user/NestCraft/server/src/routes/product.ts) exposes:

```ts
productRouter.get("/", validate({ query: productListQuerySchema }), getProducts);
```

This route is public.

Why:

- browsing products is not a privileged action
- filters and sorting are public storefront behavior

The important change here is that the route no longer accepts any query shape implicitly. Query params are now validated before the controller runs.

## Query Validation

The query schema lives in [productSchemas.ts](c:/Users/user/NestCraft/server/src/validation/productSchemas.ts).

Current supported fields:

- `search`
- `category`
- `sort`

### `search`

- optional
- trimmed string
- max length limited
- blank strings are normalized away

### `category`

- optional
- expected to be a category slug
- validated with the same slug pattern used elsewhere
- blank strings are normalized away

### `sort`

Allowed values:

- `newest`
- `price-asc`
- `price-desc`

If the client does not provide a sort value, the schema defaults it to `newest`.

## Why Query Validation Was Added

Once search and filters exist, the endpoint is no longer "just return everything". It becomes a real query contract.

That means the backend should reject malformed values such as:

- `sort=bad-value`
- invalid category slug shapes

Validation at the route boundary is the correct place to do this because:

- the controller should not parse arbitrary query strings itself
- the service should receive a clean, trusted query object

## Validation Middleware Change

[validate.ts](c:/Users/user/NestCraft/server/src/middleware/validate.ts) was extended to support `query` schemas.

One implementation detail matters here:

- parsed query data is stored in `res.locals.validatedQuery`

instead of mutating `req.query` directly.

That change was necessary because directly assigning into `req.query` caused a runtime failure in this environment and produced the generic `"Unexpected validation failure"` message on the products page.

So the working flow now is:

1. parse `req.query`
2. store the result in `res.locals.validatedQuery`
3. controller reads the validated query from `res.locals`

That is the safe implementation currently used by this route.

## Controller Responsibility

The controller in [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts) now does three things:

- reads the validated query
- passes it to the service
- maps unexpected failures to an API error response

It does not build search logic or sorting logic directly.

That still belongs in the service layer.

## Service Responsibility

The listing rules live in [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts).

`getAllProducts(query)` now supports:

- `isActive: true` filtering
- text search against product `name` and `description`
- category filtering through `category.slug`
- explicit sort rules

### Base rule

Every storefront product query still starts from:

```ts
isActive: true
```

That is important because admin soft-deactivated products should never leak into the public catalog.

### Search behavior

If `search` is present, the service adds an `OR` condition across:

- `name`
- `description`

using case-insensitive matching.

That is a pragmatic first search implementation:

- useful immediately
- no schema changes required
- no full-text search infrastructure required

### Category behavior

If `category` is present, the service filters via:

```ts
where.category = {
  slug: query.category,
}
```

Using category slug here is the correct public API design because:

- it is URL-friendly
- it avoids exposing category IDs as the primary filter input
- it matches how category identity is already represented in the project

### Sort behavior

Current sort modes map to:

- `newest` -> `createdAt desc`
- `price-asc` -> `price asc`
- `price-desc` -> `price desc`

This keeps sort behavior explicit and easy to test.

## Why Category Data Is Still Included

Each product record still includes its related category object.

That means the frontend can render:

- category labels
- filter summaries
- distinct category counts

without a second request for each product.

This remains a good tradeoff because category objects are small and the products page uses them directly.

## Current Response Shape

The endpoint still returns an array of product objects.

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

What changed is not the response shape. What changed is the query contract used to determine which products are returned.

## Error Behavior

This route now has two broad error classes:

### Validation failures

Examples:

- invalid `sort`
- malformed `category` slug

Response:

- `400`
- shared validation error shape

### Unexpected failures

Examples:

- database failure
- internal query error

Response:

- `500`
- shared API error shape

## Relationship To Product Activation

This endpoint still only returns products where:

```ts
isActive: true
```

So when an admin deactivates a product through:

```http
PATCH /api/products/:id/deactivate
```

that product automatically disappears from all public browse/search/filter results.

That is the correct storefront behavior.

## What To Test

This route is working correctly when:

- `/api/products` returns active products
- `/api/products?search=lamp` narrows results
- `/api/products?category=lighting` narrows results
- `/api/products?sort=price-asc` changes ordering
- combined queries work
- inactive products do not appear
- invalid query values return `400`

## Relationship To Frontend

This endpoint now powers:

- the public products page
- search input behavior
- category filter behavior
- sort behavior

The frontend now treats this endpoint as a real browse API, not just a one-shot list fetch.

## What Comes Next

The next directly related frontend work after this backend expansion is:

- cleaner browse UX polish
- potentially featured or curated sections
- possibly pagination later if the catalog grows

But for the current project stage, this endpoint now supports the main browsing behaviors the storefront needed.
