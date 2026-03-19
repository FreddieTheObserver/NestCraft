# Orders Page

This document covers the frontend purchase-history page for `NestCraft`.

Route:

```text
/orders
```

API source:

```http
GET /api/orders/me
```

## Goal

Show the logged-in user the orders they have already placed through checkout.

This page is the first real account-facing screen built on top of:

- authentication
- checkout
- server-saved order records

## Files Involved

- [OrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrdersPage.tsx)
- [OrderDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrderDetailPage.tsx)
- [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts)
- [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx)
- [StoreHeader.tsx](c:/Users/user/NestCraft/client/src/components/StoreHeader.tsx)
- [AuthContext.tsx](c:/Users/user/NestCraft/client/src/context/AuthContext.tsx)
- [ProtectedRoute.tsx](c:/Users/user/NestCraft/client/src/components/ProtectedRoute.tsx)

## Why The Page Exists

Checkout creates orders, but users also need a place to review what they bought.

This page closes that loop:

1. place order
2. persist order in backend
3. open `/orders`
4. review purchase history

Without this page, order creation would exist only as a transient confirmation state.

## Why The Page Is Protected

The `/orders` route is wrapped in `ProtectedRoute` in [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx).

That means:

- unauthenticated users are redirected to `/login`
- only authenticated users can open purchase history

This is required because orders are private account data.

Frontend protection improves user flow, but the backend still enforces the real security boundary through `GET /api/orders/me`.

## Request Flow

The page works in this sequence:

1. router matches `/orders`
2. `ProtectedRoute` confirms the user is logged in
3. `OrdersPage` reads the token from [AuthContext.tsx](c:/Users/user/NestCraft/client/src/context/AuthContext.tsx)
4. `getMyOrders(token)` in [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts) sends `GET /api/orders/me`
5. backend verifies the bearer token and returns only that user's orders
6. React stores the result in local state and renders the page

This keeps responsibilities clean:

- route protection stays in `ProtectedRoute`
- token ownership stays in auth context
- network code stays in `services/orders.ts`
- UI stays in `OrdersPage.tsx`

## Why The Orders Service Exists

The request function lives in [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts):

```ts
export async function getMyOrders(token: string): Promise<OrderResponse[]>
```

That file owns the API contract for orders.

Why that separation matters:

- the page does not build auth headers inline
- response typing stays centralized
- API-level error parsing stays reusable

This becomes more important as more order endpoints are added later.

## State Handling In The Page

`OrdersPage.tsx` manages three primary state buckets:

- `orders`
- `loading`
- `error`

That gives the page explicit handling for:

- loading state while the request is in flight
- error state if the request fails
- empty state if the user has no orders yet
- success state when orders exist

This is the right structure for account-style pages.

## What The Page Renders

The page renders:

- shared `StoreHeader`
- a summary section showing total orders and total spent
- a list of order cards
- customer-facing order numbers
- detail links for each order
- nested line items for each order
- delivery details for each order
- subtotal, shipping, and total blocks

Each order card is designed to answer the common customer questions:

- when was this placed
- how many items were in it
- what products were purchased
- where is it being delivered
- what did it cost
- what is its current status

## Why The Summary Section Exists

The page includes a high-level snapshot:

- number of orders
- total spent across those orders

This is not strictly required, but it improves the account feel of the page and makes the history view more useful at a glance.

## Why Product Links Are Included

Each order item includes backend-provided product summary data:

- `name`
- `slug`
- `imageUrl`

That allows the UI to link purchased products back to:

```text
/products/:slug
```

This improves usability without requiring another API request.

## Why The Page Uses Customer-Facing Order Numbers

The page now displays `order.orderNumber`, not the raw database `id`.

That is the correct customer-facing behavior because the backend now stores a separate public identifier such as:

- `NC-000001`
- `NC-000057`

This gives the frontend a clean split between:

- internal database `id`
- public `orderNumber`

The page also uses that same value in detail links:

```text
/orders/:orderNumber
```

That keeps checkout confirmation, order history, and order detail consistent.

## Error Behavior

Because the service now uses the shared API error reader, the page can show more accurate messages than before.

That means failures like:

- invalid token
- expired token
- backend fetch failure

can surface their actual API message instead of a generic fallback whenever the response is parseable.

## Relationship To Checkout

This page depends on successful use of:

```http
POST /api/orders
```

That endpoint creates the order rows. This page loads and displays those rows later.

The full user flow is:

1. add items to cart
2. complete checkout
3. backend saves the order and returns `orderNumber`
4. checkout confirmation links to the detail page
5. `/orders` loads the saved order history with the same public order numbers

## What To Test

This page is working correctly when:

- logged-in users can open `/orders`
- logged-out users are redirected to `/login`
- users only see their own orders
- loading state renders correctly
- empty state renders correctly
- error state renders correctly
- order items display correct quantities and prices
- product links point back to product detail pages
- each order links to `/orders/:orderNumber`

## What Success Looks Like

This page is complete enough for the current stage when:

- purchase history is reliable after checkout
- the UI clearly communicates order contents and totals
- the page feels like part of an account area, not just raw JSON mapped into a component

## Reasonable Next Improvements

The next useful improvements after this page are:

- customer account dashboard
- order-status timeline or richer delivery progress
- account-area polish and grouping for larger order histories
