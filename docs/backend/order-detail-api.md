# Order Detail API

This document covers the customer-facing backend endpoint for loading one saved order by public order number.

Endpoint:

```http
GET /api/orders/:orderNumber
```

## Goal

Return one order for the currently authenticated user using the public `orderNumber`, not the internal database `id`.

This endpoint exists so the frontend can support:

```text
/orders/:orderNumber
```

and so checkout confirmation and purchase history can link to a stable, customer-facing order detail page.

## Files Involved

- [order.ts](c:/Users/user/NestCraft/server/src/routes/order.ts)
- [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts)
- [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts)
- [orderSchemas.ts](c:/Users/user/NestCraft/server/src/validation/orderSchemas.ts)
- [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts)
- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)

## Why This Endpoint Exists

`GET /api/orders/me` is the right endpoint for purchase history, but it is not the right shape for direct drill-down by URL.

The order-detail route needs:

- one explicit order identifier in the path
- backend ownership checks
- refresh-safe page loading
- a customer-facing identifier instead of a raw database ID

That is why this endpoint uses `orderNumber`.

## Why `orderNumber` Is Separate From `id`

The `Order` model now stores:

- internal `id`
- public `orderNumber`

This is the correct split because:

- `id` is still the primary key for internal relations
- `orderNumber` is what customers should see in the UI
- the frontend can link to `/orders/:orderNumber` without exposing raw database IDs

Current format:

```text
NC-000123
```

The formatting logic lives in the order service because order numbering is order-domain logic, not controller logic and not frontend presentation logic.

## Route Responsibility

The route in [order.ts](c:/Users/user/NestCraft/server/src/routes/order.ts) is:

```ts
orderRouter.get(
  "/:orderNumber",
  requireAuth,
  validate({ params: orderNumberParamsSchema }),
  getMyOrderNumberHandler,
);
```

This route does three things before the handler runs:

- verifies authentication
- validates the path param format
- sends only valid requests into the controller

Important route-order detail:

- `GET /me` must stay above `GET /:orderNumber`

Otherwise `/me` would be captured by the dynamic route before validation runs.

## Validation Responsibility

The param schema lives in [orderSchemas.ts](c:/Users/user/NestCraft/server/src/validation/orderSchemas.ts).

It validates the route param as an order number with the expected `NC-` prefix and numeric suffix.

That means malformed paths fail at the request boundary with `400`, not inside the controller.

## Controller Responsibility

The handler in [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts) is responsible for:

1. reading `req.user?.userId`
2. rejecting unauthenticated access with `401`
3. reading `req.params.orderNumber`
4. calling the service
5. returning `404` when the order is missing or belongs to another user
6. returning `200` with the order when found

Returning `404` for both missing and foreign orders is important because it avoids leaking whether an order number exists for someone else.

## Service Responsibility

The query lives in [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts) as `getOrderByOrderNumberForUser(orderNumber, userId)`.

It filters by both:

- `orderNumber`
- `userId`

That is the correct ownership boundary for a customer resource.

The service also includes:

- order items
- product summary data

So the frontend can render the whole detail page without extra product requests.

## Response Shape

The endpoint returns the order with:

- `id`
- `orderNumber`
- status
- totals
- shipping fields
- notes
- item rows
- product summary data per item

This mirrors the customer order model already used by checkout confirmation and purchase history.

## Relationship To Checkout And Order History

This endpoint depends on:

- `POST /api/orders` creating `orderNumber`
- `GET /api/orders/me` listing those same saved orders

The customer flow is now:

1. checkout creates the order
2. checkout confirmation shows `orderNumber`
3. order history lists that same `orderNumber`
4. the customer opens `/orders/:orderNumber`
5. the backend loads exactly one owned order

## Error Behavior

Expected outcomes:

- invalid token or missing token -> `401`
- invalid `orderNumber` format -> `400`
- missing order -> `404`
- other user's order number -> `404`
- unexpected failure -> `500`

All failures use the shared API error format.

## What To Test

This endpoint is working correctly when:

- a logged-in user can load their own order by `orderNumber`
- a logged-out request is rejected
- malformed order numbers are rejected with `400`
- another user's order number returns `404`
- the response includes enough item and shipping data for the full page

## Why This Slice Matters

This endpoint completes the customer order flow.

Before it existed, the app had:

- checkout confirmation
- order history list

After it exists, the app also has:

- direct order drill-down
- refresh-safe order links
- customer-facing order numbers across the full order journey
