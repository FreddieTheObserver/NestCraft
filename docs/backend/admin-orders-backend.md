# Admin Orders Backend

This document covers the admin-side order-management backend in `NestCraft`.

Current admin-order endpoints:

- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`

These routes exist for store operations, not customer account pages.

The customer order flow already supports:

- `POST /api/orders`
- `GET /api/orders/me`

Those routes are scoped to the authenticated customer. Admins need a separate path that can:

- read every order across the store
- inspect customer and item details
- update the order lifecycle state

That is why the admin routes live under `/api/admin/orders`.

## Goal

The purpose of this backend slice is to let an authenticated admin:

- fetch all orders across all users
- inspect shipping and customer details
- inspect line items and totals
- update order status

Current allowed status values:

- `pending`
- `confirmed`
- `cancelled`

This is intentionally a narrow first admin workflow. It is enough to move the project from "orders can be created" to "orders can be managed".

## Files Involved

Routing:

- [adminOrder.ts](c:/Users/user/NestCraft/server/src/routes/adminOrder.ts)
- [order.ts](c:/Users/user/NestCraft/server/src/routes/order.ts)

Controllers:

- [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts)

Services:

- [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts)

Validation and authorization:

- [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts)
- [validate.ts](c:/Users/user/NestCraft/server/src/middleware/validate.ts)
- [orderSchemas.ts](c:/Users/user/NestCraft/server/src/validation/orderSchemas.ts)

Application wiring:

- [app.ts](c:/Users/user/NestCraft/server/src/app.ts)

Database model context:

- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)
- [migration.sql](c:/Users/user/NestCraft/server/prisma/migrations/20260318093000_convert_order_status_to_enum/migration.sql)

Related implementation note:

- [order-status-enum.md](c:/Users/user/NestCraft/docs/backend/order-status-enum.md)
- [order-live-updates.md](c:/Users/user/NestCraft/docs/backend/order-live-updates.md)

## Why Admin Orders Need Separate Endpoints

The customer route:

```http
GET /api/orders/me
```

is intentionally limited to the currently authenticated user.

That is correct for account pages, but it is not enough for store operations. Admins need:

- visibility into every order
- the ability to update status regardless of which customer created the order

That is why the admin route tree is separate:

```http
/api/admin/orders
```

instead of overloading the customer order routes with admin-only behavior.

## Route Structure

The admin-order router is defined in [adminOrder.ts](c:/Users/user/NestCraft/server/src/routes/adminOrder.ts).

It exposes:

```http
GET /api/admin/orders
PATCH /api/admin/orders/:id/status
```

Both routes are protected by:

- `requireAuth`
- `requireAdmin`

That means:

- unauthenticated requests get `401`
- authenticated non-admin users get `403`
- only admins can reach the controller handlers

This is the correct boundary for operational order management.

## Endpoint 1: `GET /api/admin/orders`

### Purpose

This endpoint returns all orders across all users.

It is intended for:

- admin order dashboards
- order review workflows
- future filtering by status
- future status-management screens

### Request Path

Mounted in [app.ts](c:/Users/user/NestCraft/server/src/app.ts):

```ts
app.use("/api/admin/orders", adminOrderRouter);
```

Route in [adminOrder.ts](c:/Users/user/NestCraft/server/src/routes/adminOrder.ts):

```ts
adminOrderRouter.get("/", requireAuth, requireAdmin, getAdminOrdersHandler);
```

So the full path is:

```http
GET /api/admin/orders
```

### Controller Responsibility

The handler is `getAdminOrdersHandler` in [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts).

Its job is to:

- call the admin order service
- return `200` with the results
- convert unexpected failures into the shared API error format

The controller does not construct the Prisma query itself.

### Service Responsibility

The underlying service is `getAllOrdersForAdmin()` in [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts).

It currently:

- fetches all orders
- sorts newest first by `createdAt`
- includes a basic `user` summary
- includes order items
- includes basic product information for each item

That response shape is deliberate. Admin screens usually need enough data to understand an order without performing extra per-order fetches.

### Response Shape

The endpoint returns orders with:

- order fields
- customer summary
- line items
- basic product data

Example shape:

```json
[
  {
    "id": 12,
    "userId": 3,
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
    "createdAt": "...",
    "updatedAt": "...",
    "user": {
      "id": 3,
      "name": "Freddie",
      "email": "testing@gmail.com",
      "role": "customer"
    },
    "items": [
      {
        "id": 24,
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

This is enough for:

- admin order tables
- status badges
- customer lookup in the UI
- item counts and total summaries
- future order detail screens

## Endpoint 2: `PATCH /api/admin/orders/:id/status`

### Purpose

This endpoint updates the lifecycle state of an order.

The current workflow is intentionally narrow:

- an admin reviews an order
- the admin updates its status

The current allowed values are:

- `pending`
- `confirmed`
- `cancelled`

### Request Path

Route in [adminOrder.ts](c:/Users/user/NestCraft/server/src/routes/adminOrder.ts):

```ts
adminOrderRouter.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  validate({
    params: orderIdParamsSchema,
    body: updateOrderStatusSchema,
  }),
  updateOrderStatusHandler,
);
```

So the full path is:

```http
PATCH /api/admin/orders/:id/status
```

### Validation Rules

The route validates:

- `id` as a positive integer
- `status` as one of:
  - `pending`
  - `confirmed`
  - `cancelled`

That means malformed requests are rejected before the controller runs.

### Controller Responsibility

The handler is `updateOrderStatusHandler` in [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts).

Its job is to:

- read the validated `id` and `status`
- call the order service
- return the updated order
- map `ORDER_NOT_FOUND` to `404`

### Service Responsibility

The underlying service is `updateOrderStatus(...)` in [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts).

Its job is to:

- verify the order exists
- update the `status`
- return the updated order with related data
- publish an `order.updated` event after the database write succeeds

That means the frontend can update local state immediately after the request without making a second fetch if it does not want to.

The event publication is what allows already-open customer and admin screens to refresh through the live order stream.

### Response Shape

The endpoint returns the updated order record with included `user` and `items`, matching the data needed by the admin UI.

That is useful because the frontend can:

- replace the updated order in local state
- avoid a full refresh

## Order Status Model

The system no longer stores order status as a loose database string.

It now uses a Prisma enum in [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma):

```prisma
enum OrderStatus {
  pending
  confirmed
  cancelled
}

model Order {
  status OrderStatus @default(pending)
}
```

That gives the project three layers of protection:

1. request validation at the HTTP boundary through `zod`
2. generated TypeScript typing through Prisma's `OrderStatus`
3. database-level enforcement through the PostgreSQL enum column

This is stricter than the earlier implementation, where route validation was the only thing preventing arbitrary status strings from being written.

## Safe Status Migration

The enum migration was applied with a safe in-place conversion, not by dropping and recreating the `status` column.

The migration lives in [migration.sql](c:/Users/user/NestCraft/server/prisma/migrations/20260318093000_convert_order_status_to_enum/migration.sql).

It does four things:

1. creates the PostgreSQL enum type
2. drops the old text-column default temporarily
3. casts the existing `status` values into the enum in place
4. restores the default as `pending`

The important detail is that this migration preserves existing order rows instead of wiping the column.

## Backend Typing After The Enum Migration

After the Prisma client was regenerated:

- [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts) now accepts Prisma `OrderStatus` in `updateOrderStatus(...)`
- [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts) now types the request body with Prisma `OrderStatus`

This matters because the backend no longer treats status as a generic `string`. The service contract now matches the actual schema contract.

## Why Validation Still Stays

Even though the database is now enum-backed, the route-level validator remains important.

[orderSchemas.ts](c:/Users/user/NestCraft/server/src/validation/orderSchemas.ts) still validates:

```ts
z.enum(["pending", "confirmed", "cancelled"])
```

That is still correct because:

- invalid requests should fail before controller logic runs
- DB constraints should not be the first line of defense for HTTP input

The enum and the validator do different jobs.

## Why `requireAdmin` Matters Here

Order status changes are operational actions.

They should never be available to:

- guests
- normal customers

That is why these routes use both:

- `requireAuth`
- `requireAdmin`

This makes the admin order layer consistent with the admin product layer.

## Error Behavior

Expected status behavior:

### `GET /api/admin/orders`

- `200` for success
- `401` for missing or invalid token
- `403` for non-admin user
- `500` for unexpected server failure

### `PATCH /api/admin/orders/:id/status`

- `200` for success
- `400` for invalid route params or invalid status body
- `401` for missing or invalid token
- `403` for non-admin user
- `404` for unknown order ID
- `500` for unexpected server failure

All failures should use the shared API error shape.

## Testing

### Fetch all admin orders

```bash
curl http://localhost:5000/api/admin/orders \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Verify:

- all orders are returned
- newest orders appear first
- customer info is included
- items are included

### Update status

```bash
curl -X PATCH http://localhost:5000/api/admin/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"status":"confirmed"}'
```

Verify:

- the returned order now shows `status: "confirmed"`

Negative tests:

- no token -> `401`
- customer token -> `403`
- invalid ID -> `400`
- invalid status -> `400`
- nonexistent order -> `404`

## Relationship To The Frontend Admin Orders UI

These backend endpoints are what make the frontend admin orders page possible.

They give the frontend enough data to build:

- an admin orders list page
- status controls
- customer and total summaries

Without these endpoints, the frontend admin side would have no clean way to inspect or manage incoming orders.

## What Comes Next

The frontend admin order-management UI is now in place on top of these endpoints.

The next likely backend follow-ups, if needed later, are:

- admin-side order detail reads
- admin filtering by status or date
- shared broker-backed delivery if live updates ever need to span multiple backend instances
- richer operational workflow states beyond `pending`, `confirmed`, and `cancelled`
