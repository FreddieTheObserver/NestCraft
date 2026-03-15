# Checkout Order Endpoint

This note documents the current backend checkout implementation for `NestCraft`.

Endpoint:

```http
POST /api/orders
```

This is the first backend endpoint that converts cart data into a saved order.

## Goal

The purpose of this endpoint is to:

1. accept checkout input from the frontend
2. verify the request belongs to an authenticated user
3. validate the products and quantities
4. calculate pricing on the server
5. create an `Order`
6. create related `OrderItem` records
7. decrement product stock safely

This is the backend foundation for checkout before any payment gateway is added.

## Why This Endpoint Matters

This is the first step where the app moves from:

- browsing
- cart state

into:

- actual order creation

That makes it one of the most important backend slices in the ecommerce flow.

## Files Involved

The current implementation uses these files:

- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)
- [order.ts](c:/Users/user/NestCraft/server/src/routes/order.ts)
- [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts)
- [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts)
- [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts)
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

This structure preserves the order as a historical snapshot rather than treating the cart itself as permanent data.

## Protected Route

The route is protected by [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts).

That means:

- the request must include `Authorization: Bearer <token>`
- the token is verified before order creation starts
- the authenticated user ID is attached to `req.user`

Why this matters:

- every order must belong to a user
- order creation should not be anonymous once auth exists

## Route Responsibility

The route file [order.ts](c:/Users/user/NestCraft/server/src/routes/order.ts) is intentionally small.

Its job is only to:

- define `POST /`
- apply `requireAuth`
- call the controller

This keeps routing separate from business logic.

## Controller Responsibility

The controller in [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts) handles HTTP concerns.

It is responsible for:

- reading `req.user?.userId`
- reading the request body
- checking required checkout fields
- validating that `items` is an array
- validating the structure of each item
- calling the order service
- mapping service errors to HTTP responses

This is the right controller role because it handles request validation and response formatting, but not database logic.

## Request Body Shape

The endpoint expects a request body with:

- `shippingName`
- `shippingEmail`
- `shippingPhone`
- `shippingCity`
- `shippingAddress`
- optional `notes`
- `items`

Each item should contain:

- `productId`
- `quantity`

Example request:

```json
{
  "shippingName": "John Doe",
  "shippingEmail": "john@example.com",
  "shippingPhone": "0123456789",
  "shippingCity": "Bangkok",
  "shippingAddress": "123 ถนนสุขุมวิท",
  "notes": "Leave at front desk",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

Why this shape is used:

- shipping details belong to the order record
- cart items are represented by product IDs and quantities
- the backend recalculates price data rather than trusting the frontend

## Service Responsibility

The service in [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts) owns the checkout business logic.

It is responsible for:

- rejecting empty carts
- rejecting invalid quantities
- loading active products from the database
- rejecting invalid products
- building normalized order items
- checking available stock
- decrementing stock safely
- calculating:
  - `subtotal`
  - `shippingFee`
  - `totalAmount`
- creating the order and order items in one transaction

This is the correct place for checkout logic because it is business logic, not request/response handling.

## Why Server-Side Price Calculation Is Required

The frontend must not be trusted for:

- product price
- subtotal
- shipping fee
- total amount

Reason:

- frontend values can be manipulated
- product prices in the database are the source of truth

That is why the service fetches products from PostgreSQL and calculates totals on the server.

## Product Validation

The service first collects all product IDs from the request.

Then it loads products with:

- matching IDs
- `isActive: true`

If the number of returned products does not match the requested items, the request fails with:

- `INVALID_PRODUCTS`

This protects the checkout flow from:

- bad product IDs
- inactive products
- tampered requests

## Quantity Validation

Before creating anything, the service checks:

- cart is not empty
- every quantity is at least `1`

If quantity is invalid, the request fails with:

- `INVALID_QUANTITY`

This prevents meaningless or broken order items.

## Stock Handling

The current implementation updates stock inside the database transaction.

For each normalized item, it uses `updateMany` with:

- matching product ID
- active product
- `stock >= requested quantity`

Why this is good:

- it checks stock and decrements in one database operation
- it reduces the risk of overselling in concurrent requests

If no row is updated, the service throws:

- `INSUFFICIENT_STOCK`

## Transaction Design

The order flow runs inside `prisma.$transaction(...)`.

That matters because checkout needs atomic behavior.

Without a transaction, you could end up in a broken state such as:

- stock reduced but order not created
- order created but stock not reduced

The transaction ensures that either:

- everything succeeds

or:

- everything rolls back

This is one of the most important parts of the implementation.

## Pricing Rules

The current pricing rules are:

- `subtotal` = sum of `unitPrice * quantity`
- `shippingFee` = `0` if subtotal is at least `100`
- otherwise `shippingFee` = `10`
- `totalAmount` = `subtotal + shippingFee`

This is a simple MVP shipping rule.

Why it is acceptable now:

- easy to test
- enough to validate checkout logic
- can be replaced later with real shipping rules

## Order Creation

After validation and pricing, the service creates:

1. the `Order`
2. nested `OrderItem` records

Stored order data includes:

- user relationship
- status
- subtotal
- shipping fee
- total amount
- shipping information
- optional notes

Stored order item data includes:

- product ID
- quantity
- unit price at the time of purchase

Important design choice:

- `unitPrice` is stored on `OrderItem`

Why:

- product prices can change later
- the order must preserve the original purchase price

## Error Handling

The controller currently maps service errors like this:

- `NO_ITEMS` -> `400`
- `INVALID_PRODUCTS` -> `400`
- `INVALID_QUANTITY` -> `400`
- `INSUFFICIENT_STOCK` -> `400`
- missing auth -> `401`
- unexpected failure -> `500`

This is a practical MVP error strategy.

## Example Success Response

On success, the endpoint returns the created order with its items.

That gives the frontend enough data for:

- checkout confirmation
- order review screen
- future order detail pages

## Testing Checklist

The endpoint is working correctly when all of these are true:

- valid token is required
- valid cart creates an order
- stock decreases after order creation
- invalid product IDs are rejected
- invalid quantities are rejected
- out-of-stock items are rejected
- totals are calculated on the server

## Common Failure Points

Typical reasons for failure include:

- missing or invalid bearer token
- cart item product IDs that do not exist
- inactive products
- quantity less than `1`
- insufficient stock
- schema and service mismatch

One example of a real bug already encountered in this implementation:

- the service briefly attempted to write `lineTotal` into `OrderItem`
- the schema did not define `lineTotal`
- that caused the generic `Failed to create order` response

The fix was to align the service with the schema and store only:

- `productId`
- `quantity`
- `unitPrice`

## What Comes Next

After this backend endpoint, the next frontend step should be:

- build `/checkout`
- collect shipping info
- send authenticated request to `POST /api/orders`
- clear local cart after success

That completes the first end-to-end checkout skeleton.
