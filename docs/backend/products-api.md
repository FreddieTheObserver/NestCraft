# GET /api/products

This note documents the first catalog API endpoint for `NestCraft`.

Endpoint:

```http
GET /api/products
```

## Goal

Return product records from PostgreSQL through Prisma so the frontend can render a real product listing.

The first version stays intentionally simple:

- return all active products
- include category data
- sort by newest first
- no filters, search, or pagination yet

## Request Flow

The request should move through these layers:

1. route
2. controller
3. service
4. Prisma query
5. JSON response

This keeps responsibilities clear.

## Files Involved

- [app.ts](c:/Users/user/NestCraft/server/src/app.ts)
- [product.ts](c:/Users/user/NestCraft/server/src/routes/product.ts)
- [productController.ts](c:/Users/user/NestCraft/server/src/controllers/productController.ts)
- [productService.ts](c:/Users/user/NestCraft/server/src/services/productService.ts)
- [prisma.ts](c:/Users/user/NestCraft/server/src/lib/prisma.ts)

## Why This Structure

### Route

The route maps the HTTP path to a controller function.

For this feature:

- mount router at `/api/products`
- route `GET /` to the products controller

### Controller

The controller handles HTTP concerns:

- receives the request
- calls the service
- sends the response
- catches errors

### Service

The service handles business and database logic:

- query active products
- include category
- sort records

This keeps controllers thin and easier to read.

## Prisma Query Design

The first product query should do three things:

- filter `isActive: true`
- include the related `category`
- sort by `createdAt: "desc"`

Why:

- inactive products should stay hidden
- category data is useful for the client
- deterministic ordering helps the UI and testing

## Expected Response Shape

The endpoint returns an array of products.

Each product includes:

- product fields
- nested `category` object

This is useful because the client can render category labels without making a second request.

## Testing

Run the backend:

```bash
npm run dev
```

Then open:

```text
http://localhost:5000/api/products
```

Or use:

```bash
curl http://localhost:5000/api/products
```

## What Success Looks Like

The endpoint is complete when:

- backend starts without errors
- `/api/products` returns JSON
- products come from the seeded database
- category data is included

## What Comes Next

After `GET /api/products`, the next steps are:

- connect the frontend to `/api/products`
- render a products page
- then build `GET /api/products/:id`
