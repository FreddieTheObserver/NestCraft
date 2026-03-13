# GET /api/products/:slug

This note documents the product detail endpoint for `NestCraft`.

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

## Why Use Slug Instead Of ID

For ecommerce, `slug` is usually better than `id` because it gives:

- cleaner URLs
- more readable product links
- better SEO-friendly page paths
- no need to expose internal numeric IDs

## Request Flow

The detail request follows the same backend structure as the products list:

1. route
2. controller
3. service
4. Prisma query
5. JSON response

## Files Involved

- [product.ts](c:/Users/user/NestCraft/server/src/routes/product.ts)
- [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts)
- [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts)
- [prisma.ts](c:/Users/user/NestCraft/server/src/lib/prisma.ts)

## Route Responsibility

The route should define:

```text
GET /api/products/:slug
```

Its job is only to map the URL parameter to the controller.

## Controller Responsibility

The controller should:

- read `req.params.slug`
- validate that the slug exists
- call the service
- return:
  - `200` when the product exists
  - `404` when not found
  - `500` on unexpected failure

## Service Responsibility

The service should:

- query by `slug`
- include the related `category`
- only return active products

That usually means the Prisma query includes:

- `where: { slug, isActive: true }`
- `include: { category: true }`

## Response Shape

The response should be one product object including its category.

That gives the frontend everything it needs for the first detail page:

- product name
- description
- price
- image
- stock
- category label

## Testing

Run the backend:

```bash
npm run dev
```

Then test with:

```bash
curl http://localhost:5000/api/products/oak-bedside-lamp
```

Or open:

```text
http://localhost:5000/api/products/oak-bedside-lamp
```

## What Success Looks Like

This endpoint is complete when:

- valid slugs return one product
- missing slugs return `404`
- inactive products are not exposed
- category data is included in the response

## Relationship To The Frontend

This endpoint powers the storefront page route:

```text
/products/:slug
```

The frontend reads the slug from the URL, calls the API, and renders the product detail page from the returned JSON.
