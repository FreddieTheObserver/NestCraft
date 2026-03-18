# GET /api/products/:slug

This document covers the product detail endpoint for `NestCraft`.

Endpoint:

```http
GET /api/products/:slug
```

## Goal

Return one active product by its slug so the frontend can render a detail page at:

```text
/products/:slug
```

Example:

```text
/products/oak-bedside-lamp
```

## Why Slug Was Chosen Instead Of ID

For storefront routes, `slug` is the better public identifier.

Benefits:

- cleaner URLs
- easier to read and share
- more professional-looking product links
- better SEO behavior than raw numeric IDs

This is why the frontend route and the API route both use `slug`.

## Files Involved

- [product.ts](c:/Users/user/NestCraft/server/src/routes/product.ts)
- [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts)
- [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts)
- [productSchemas.ts](c:/Users/user/NestCraft/server/src/validation/productSchemas.ts)
- [validate.ts](c:/Users/user/NestCraft/server/src/middleware/validate.ts)
- [http.ts](c:/Users/user/NestCraft/server/src/utils/http.ts)
- [prisma.ts](c:/Users/user/NestCraft/server/src/lib/prisma.ts)

## Request Flow

The detail request follows the same layered flow as the list route:

1. route
2. params validation
3. controller
4. service
5. Prisma query
6. JSON response

That separation keeps the slug contract explicit and prevents invalid input from reaching the service.

## Route Responsibility

The route in [product.ts](c:/Users/user/NestCraft/server/src/routes/product.ts) defines:

```ts
productRouter.get("/:slug", validate({ params: productSlugParamsSchema }), getProduct);
```

That means:

- the path parameter is validated before controller logic
- malformed slugs fail early

This is better than doing manual string checks inside the controller.

## Parameter Validation

The slug is validated by [productSchemas.ts](c:/Users/user/NestCraft/server/src/validation/productSchemas.ts).

Checks:

- slug exists
- slug is not empty
- slug matches the expected URL-safe format

This matters because the route should reject malformed values like:

- spaces
- uppercase/invalid symbols
- empty path fragments

Even though the frontend is generating product links, the backend still owns the real contract.

## Controller Responsibility

The controller in [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts):

- reads the validated slug
- calls the service
- returns the product on success
- maps not-found and unexpected failures into API responses

It does not:

- validate the slug itself
- build the Prisma query directly

That logic stays in validation and service layers.

## Service Responsibility

The service in [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts) implements the actual product lookup rule.

The current query does three important things:

- looks up by `slug`
- includes `category`
- filters to `isActive: true`

That last rule matters because hidden products should not be publicly accessible through the storefront detail route.

## Why `isActive: true` Is Important Here

If an admin deactivates a product, two things should happen:

1. it disappears from `/api/products`
2. it should also stop being returned from `/api/products/:slug`

That is why the detail query includes the active-product constraint.

Without that, a hidden product could still be viewed if someone knew the slug.

## Current Response Shape

The endpoint returns a single product object with category data included.

Conceptually:

```json
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
  "category": {
    "id": 1,
    "name": "Lighting",
    "slug": "lighting",
    "imageUrl": "https://..."
  }
}
```

This gives the frontend enough data for:

- product title
- description
- hero image
- category label
- stock and availability display
- price

without any secondary request.

## Error Behavior

Expected outcomes:

- valid active slug -> `200`
- unknown slug -> `404 PRODUCT_NOT_FOUND`
- malformed slug -> `400 VALIDATION_ERROR`
- unexpected failure -> `500`

That is a strong contract for the frontend because it can distinguish:

- "the slug itself is invalid"
- "the product does not exist or is inactive"

## Why This Endpoint Matters

This route is the first step from catalog browsing into a real storefront detail flow.

It enables:

- detail page rendering
- add-to-cart from a specific product
- deeper product descriptions
- richer purchase decision UI

Without this route, the app has a catalog but not a usable product experience.

## What To Test

This endpoint is working correctly when:

- valid slugs return one product
- unknown slugs return `404`
- malformed slugs fail validation
- inactive products are not exposed
- category data is included

## Relationship To Frontend

This endpoint powers the page route:

```text
/products/:slug
```

The frontend reads the slug from the URL, requests this API endpoint, and renders the full product detail page from the returned JSON.

## What Comes Next

The next related improvements after a stable detail endpoint are:

- related products by category
- richer image handling
- search/filter/sort in the main catalog
