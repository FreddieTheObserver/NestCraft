# Orders History API

This document covers the backend endpoint that returns purchase history for the currently authenticated user.

Endpoint:

```http
GET /api/orders/me
```

## Goal

Return only the orders that belong to the logged-in user, with enough nested data to render a complete purchase-history page without extra requests.

This endpoint is the backend source for:

```text
/orders
```

## Files Involved

- [order.ts](c:/Users/user/NestCraft/server/src/routes/order.ts)
- [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts)
- [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts)
- [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts)
- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)

## Why This Endpoint Exists

`POST /api/orders` creates orders during checkout. That is not enough on its own. Users also need to review what they have already purchased.

That requires the backend to do three things correctly:

- verify the request is authenticated
- filter orders by the logged-in user
- include nested order items and product summary data

Without `GET /api/orders/me`, the frontend would have no reliable source of truth for purchase history.

## Route Responsibility

The route definition is in [order.ts](c:/Users/user/NestCraft/server/src/routes/order.ts):

```ts
orderRouter.get("/me", requireAuth, getMyOrdersHandler);
```

What this does:

- exposes `GET /api/orders/me`
- runs `requireAuth` before the controller
- blocks unauthenticated access before any database work happens

This is the correct place to declare that purchase history is a protected resource.

## Auth Responsibility

The auth middleware in [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts) reads the `Authorization` header, verifies the JWT, and attaches the decoded payload to `req.user`.

Expected header:

```http
Authorization: Bearer <token>
```

If the token is missing or invalid, the request is rejected with `401`.

That means the controller can rely on `req.user?.userId` as the authenticated user identity.

## Controller Responsibility

The controller in [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts) is `getMyOrdersHandler`.

Its job is:

1. read `req.user?.userId`
2. reject the request with `401` if the user is missing
3. call the service layer
4. return the orders as JSON
5. convert unexpected failures into a `500`

This keeps HTTP and auth concerns in the controller instead of mixing them into the Prisma query.

## Service Responsibility

The service in [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts) is `getOrdersByUserId(userId)`.

It runs this query shape:

- filter by `userId`
- sort by `createdAt` descending
- include `items`
- include `product` summary data for each item

That means the frontend receives one response containing:

- order metadata
- delivery information
- order totals
- order item quantity and unit price
- product name, slug, and image

That is intentional. Purchase history should not require extra product lookups per order item.

## Response Shape

The endpoint returns an array of orders. Each order includes nested items and product summary data.

Conceptually, the response looks like this:

```json
[
  {
    "id": 3,
    "status": "pending",
    "subtotal": "74.98",
    "shippingFee": "10.00",
    "totalAmount": "84.98",
    "shippingName": "Freddie",
    "shippingEmail": "testing@gmail.com",
    "shippingPhone": "0969696969",
    "shippingCity": "New York",
    "shippingAddress": "Home",
    "notes": null,
    "createdAt": "2026-03-16T10:00:00.000Z",
    "items": [
      {
        "id": 8,
        "productId": 1,
        "quantity": 1,
        "unitPrice": "49.99",
        "product": {
          "id": 1,
          "name": "Oak Bedside Lamp",
          "slug": "oak-bedside-lamp",
          "imageUrl": "https://..."
        }
      }
    ]
  }
]
```

## Why The Orders Are User-Specific

The service filters on:

```ts
where: { userId }
```

So even if multiple accounts have created orders, this endpoint returns only the orders for the authenticated user.

That is the important privacy rule for purchase history.

## Why The UI Can Show `Order #3` For A User's First Order

This is the part that often causes confusion.

The orders list is user-filtered, but the order ID is still global.

In [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma), the `Order` model uses:

```prisma
id Int @id @default(autoincrement())
```

That means PostgreSQL assigns one increasing sequence for the entire `Order` table, not one sequence per user.

Example:

- user A places order `#1`
- user B places order `#2`
- current user places their first order

The current user will correctly see only their own order in `/orders`, but that order may still be:

- `Order #3`

This is normal.

Important distinction:

- the visible order list is filtered by user
- the displayed order ID is global across the table

## If A Friendlier Customer-Facing Order Number Is Needed Later

If you do not want to expose raw database IDs in the UI, add a separate field later, for example:

```prisma
orderNumber String @unique
```

Then display something like:

- `NC-20260316-0003`

That gives you a clean split between:

- internal database ID
- customer-facing order number

## Error Behavior

Expected failure cases:

- missing token -> `401 Unauthorized`
- invalid token -> `401 Unauthorized`
- unexpected server failure -> `500 Failed to fetch orders`

This endpoint does not accept a request body, so the main risk surface is authentication and database access.

## Relationship To Checkout

This endpoint depends on successful use of:

```http
POST /api/orders
```

The flow is:

1. checkout creates the order
2. order rows are saved in PostgreSQL
3. `GET /api/orders/me` loads those rows back for the logged-in user

## What Success Looks Like

This endpoint is working correctly when:

- unauthenticated requests are rejected
- authenticated users only receive their own orders
- orders are sorted newest first
- each order includes item data and product summary data
- the frontend can render purchase history without extra API calls
