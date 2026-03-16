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
- [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts)
- [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx)
- [StoreHeader.tsx](c:/Users/user/NestCraft/client/src/components/StoreHeader.tsx)
- [AuthContext.tsx](c:/Users/user/NestCraft/client/src/context/AuthContext.tsx)
- [ProtectedRoute.tsx](c:/Users/user/NestCraft/client/src/components/ProtectedRoute.tsx)

## Why The Page Is Protected

The `/orders` route is wrapped in `ProtectedRoute` in [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx).

That means:

- unauthenticated users are redirected to `/login`
- only authenticated users can open purchase history

This is required because order history is private account data.

## Request Flow

The page works in this sequence:

1. the router matches `/orders`
2. `ProtectedRoute` verifies the user is logged in
3. `OrdersPage` reads the token from [AuthContext.tsx](c:/Users/user/NestCraft/client/src/context/AuthContext.tsx)
4. `getMyOrders(token)` in [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts) sends `GET /api/orders/me`
5. the backend verifies the bearer token and returns only that user's orders
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

That file owns the API contract for orders. The page should not build headers or raw `fetch()` calls inline.

This is the right separation because:

- page components stay focused on rendering
- API calls stay reusable
- auth headers are handled in one place

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

This is important because account pages should handle all four conditions cleanly.

## What The Page Renders

The page renders:

- a shared `StoreHeader`
- a summary section showing total orders and total spent
- a list of order cards
- nested line items for each order
- delivery details per order
- subtotal, shipping, and total blocks

Each order card includes enough information to answer the normal customer questions:

- when was this placed
- how many items were in it
- what products were purchased
- where was it shipped
- how much did it cost
- what is the order status

## Why Product Links Are Included

Each order item includes product summary data from the backend:

- `name`
- `slug`
- `imageUrl`

So the page can link each purchased product back to:

```text
/products/:slug
```

That improves the usefulness of purchase history and avoids another API call.

## Why The Page Can Show `Order #3` For A User's First Purchase

This is expected and it comes from the backend data model, not a frontend bug.

The page displays:

```text
Order #{order.id}
```

The backend filters the order list by user, but `order.id` is still the global autoincrement ID from the database.

So if several orders were created by other accounts first, a user's first personal order may still be:

- `Order #3`
- `Order #7`
- `Order #12`

Important distinction:

- the order list is user-specific
- the displayed numeric ID is global

The page is correctly showing what the backend returns.

## Relationship To Checkout

This page depends on successful use of:

```http
POST /api/orders
```

That endpoint creates the order rows. This page loads and displays those rows later.

The user flow is:

1. add items to cart
2. complete checkout
3. backend saves the order
4. `/orders` loads and displays the saved order history

## What Success Looks Like

The page is working correctly when:

- logged-in users can open `/orders`
- logged-out users are redirected to `/login`
- users only see their own orders
- loading, error, and empty states all render correctly
- order items display correct quantities and prices
- product links point back to product detail pages

## Reasonable Next Improvements

The next useful improvements after this page are:

- a dedicated order-detail page
- a customer account dashboard
- customer-facing order numbers instead of raw database IDs
- admin order management
