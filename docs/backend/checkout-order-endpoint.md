# Checkout Order Endpoint

This document covers the current backend checkout implementation for `NestCraft`.

Endpoint:

```http
POST /api/orders
```

This is the endpoint that turns cart data into a saved order.

## Goal

The purpose of this endpoint is to:

1. accept checkout input from the frontend
2. verify the request belongs to an authenticated user
3. validate the request shape before controller execution
4. load real product data from the database
5. calculate pricing on the server
6. create an `Order`
7. create related `OrderItem` records
8. decrement stock safely

This is the core backend slice that makes checkout real, even before a payment gateway exists.

## Why This Endpoint Matters

This is the first time the app moves from:

- browsing
- cart state

into:

- persistent order data

Without `POST /api/orders`, the app has a catalog and cart, but not a real purchase flow.

## Files Involved

- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)
- [order.ts](c:/Users/user/NestCraft/server/src/routes/order.ts)
- [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts)
- [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts)
- [orderSchemas.ts](c:/Users/user/NestCraft/server/src/validation/orderSchemas.ts)
- [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts)
- [validate.ts](c:/Users/user/NestCraft/server/src/middleware/validate.ts)
- [http.ts](c:/Users/user/NestCraft/server/src/utils/http.ts)
- [app.ts](c:/Users/user/NestCraft/server/src/app.ts)

## Data Models Used

The endpoint depends on:

- `User`
- `Product`
- `Order`
- `OrderItem`

Relationship summary:

- one `User` has many `Order`s
- one `Order` has many `OrderItem`s
- one `OrderItem` belongs to one `Product`

This is the standard ecommerce snapshot model.

Why snapshot matters:

- cart is temporary
- order is permanent
- `OrderItem.unitPrice` must preserve the purchase price even if the product price changes later

## Route And Middleware Flow

The route in [order.ts](c:/Users/user/NestCraft/server/src/routes/order.ts) is intentionally small:

```ts
orderRouter.post("/", requireAuth, validate({ body: createOrderSchema }), createOrderHandler);
```

That means the request path is:

1. `requireAuth`
2. `validate({ body: createOrderSchema })`
3. `createOrderHandler`

This is important because the controller should not be doing low-level request-shape validation anymore.

## Authentication Requirement

The route is protected by [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts).

Expected header:

```http
Authorization: Bearer <token>
```

If the token is missing or invalid:

- the request fails before order creation starts

Why this matters:

- every order must belong to a user
- checkout should not be anonymous in the current system

## Request Validation

The request body is validated by [orderSchemas.ts](c:/Users/user/NestCraft/server/src/validation/orderSchemas.ts) before it reaches the controller.

The expected body includes:

- `shippingName`
- `shippingEmail`
- `shippingPhone`
- `shippingCity`
- `shippingAddress`
- optional `notes`
- `items`

Each item must contain:

- `productId`
- `quantity`

Example request:

```json
{
  "shippingName": "John Doe",
  "shippingEmail": "john@example.com",
  "shippingPhone": "0123456789",
  "shippingCity": "Bangkok",
  "shippingAddress": "123 Sukhumvit Road",
  "notes": "Leave at front desk",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

Why this shape is used:

- shipping information belongs to the order record
- items are represented minimally by product ID and quantity
- pricing is recalculated on the server

## Controller Responsibility

The controller in [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts) handles:

- reading `req.user?.userId`
- passing validated body data to the service
- mapping business errors to HTTP errors
- returning the created order

It no longer owns:

- manual shipping-field checks
- array-shape checks for items
- ad hoc request-body validation

Those concerns moved into `zod` validation at the route layer.

## Service Responsibility

The service in [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts) owns the checkout business logic.

It is responsible for:

- rejecting empty carts
- rejecting invalid quantities
- loading active products from the database
- rejecting invalid products
- building normalized items
- checking stock and decrementing it safely
- calculating:
  - `subtotal`
  - `shippingFee`
  - `totalAmount`
- creating the order and nested order items inside a transaction

This is exactly where checkout logic should live.

## Why The Backend Recalculates Totals

The frontend must not be trusted for:

- unit price
- subtotal
- shipping fee
- total amount

Reason:

- frontend payloads can be tampered with
- database product data is the source of truth

So the backend:

1. loads products by ID
2. reads the actual price from the database
3. multiplies by quantity
4. applies shipping rules itself

That is the correct security model.

## Product Validation

The service first gathers product IDs from the request and loads matching active products:

- matching IDs
- `isActive: true`

If the number of returned products does not match what was requested:

- it throws `INVALID_PRODUCTS`

This protects the endpoint from:

- fake product IDs
- inactive products
- tampered requests

## Quantity Validation

The service rejects:

- empty item arrays
- any item with quantity less than `1`

Errors:

- `NO_ITEMS`
- `INVALID_QUANTITY`

This is a second layer of defense beyond request validation.

Why keep both:

- route validation protects the request contract
- service validation protects the business logic boundary

## Stock Handling

Stock is updated inside the same transaction using `updateMany(...)` with:

- matching product ID
- `isActive: true`
- `stock >= requested quantity`

Why this pattern is good:

- stock check and stock decrement happen together
- it reduces the chance of overselling in concurrent requests

If no row is updated:

- the service throws `INSUFFICIENT_STOCK`

## Transaction Design

The order flow runs inside `prisma.$transaction(...)`.

This is one of the most important parts of the endpoint.

Without a transaction, you could end up with broken states like:

- stock reduced but order not created
- order created but stock not reduced

With a transaction:

- everything succeeds together
- or everything rolls back

That is the minimum correctness bar for checkout.

## Pricing Rules

Current MVP pricing logic:

- `subtotal` = sum of `unitPrice * quantity`
- `shippingFee` = `0` if subtotal is at least `100`
- otherwise `shippingFee` = `10`
- `totalAmount` = `subtotal + shippingFee`

This is intentionally simple.

Why this is acceptable now:

- easy to test
- easy to explain
- enough to validate the checkout architecture

It can be replaced later with real shipping rules.

## Order Creation

After validation and pricing, the service creates:

1. the `Order`
2. nested `OrderItem` rows

Stored order data includes:

- user relationship
- status
- subtotal
- shipping fee
- total amount
- shipping information
- optional notes

Stored order item data includes:

- `productId`
- `quantity`
- `unitPrice`

Important design choice:

- `unitPrice` is stored on `OrderItem`

Why:

- product prices can change later
- order history must preserve the original purchase price

## Error Mapping

The controller currently maps service errors like this:

- `NO_ITEMS` -> `400`
- `INVALID_PRODUCTS` -> `400`
- `INVALID_QUANTITY` -> `400`
- `INSUFFICIENT_STOCK` -> `400`
- missing auth -> `401`
- unexpected failure -> `500`

Validation failures from `zod` return:

- `VALIDATION_ERROR`

All of these use the shared API error format from [http.ts](c:/Users/user/NestCraft/server/src/utils/http.ts).

## Example Success Response

On success, the endpoint returns the created order with items.

That is useful immediately for:

- checkout confirmation
- order summary UI
- future order detail pages

Conceptually:

```json
{
  "id": 3,
  "status": "pending",
  "subtotal": "74.98",
  "shippingFee": "10.00",
  "totalAmount": "84.98",
  "items": [
    {
      "productId": 1,
      "quantity": 1,
      "unitPrice": "49.99"
    }
  ]
}
```

## Common Failure Points

Typical reasons for failure:

- missing or invalid bearer token
- invalid product IDs
- inactive products
- quantity less than `1`
- insufficient stock
- validation/schema mismatch

One real bug that already happened in this implementation:

- the service briefly tried to write `lineTotal` into `OrderItem`
- the Prisma schema did not define `lineTotal`
- that caused generic order creation failure

The correct fix was:

- keep `lineTotal` only as an in-memory calculation
- store only `productId`, `quantity`, and `unitPrice` in `OrderItem`

That bug is a good reminder that service logic and schema shape must stay aligned.

## Testing Checklist

This endpoint is working correctly when:

- valid token is required
- a valid cart creates an order
- stock decreases after order creation
- invalid product IDs are rejected
- invalid quantities are rejected
- out-of-stock items are rejected
- totals are calculated on the server
- the response contains enough order data for confirmation UI

## Relationship To Frontend

The frontend checkout page depends directly on this endpoint.

The full flow is:

1. user adds products to cart
2. frontend builds checkout payload
3. frontend sends authenticated `POST /api/orders`
4. backend creates the order
5. frontend shows confirmation and clears the local cart

That is the first real end-to-end purchase slice in the project.

## What Comes Next

After this endpoint, the next related improvements are:

- admin order management
- customer-facing order numbers
- dedicated order detail pages
- payment integration later
