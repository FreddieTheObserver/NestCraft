# Order Detail Page

This document covers the customer-facing order detail page in `NestCraft`.

Route:

```text
/orders/:orderNumber
```

API source:

```http
GET /api/orders/:orderNumber
```

## Goal

Let the logged-in customer open one saved order directly from:

- checkout confirmation
- purchase history
- a refreshed browser tab using the order URL

This page is the drill-down view for the customer order flow.

## Files Involved

- [OrderDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrderDetailPage.tsx)
- [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts)
- [orderStream.ts](c:/Users/user/NestCraft/client/src/services/orderStream.ts)
- [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx)
- [OrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrdersPage.tsx)
- [CheckoutPage.tsx](c:/Users/user/NestCraft/client/src/pages/CheckoutPage.tsx)
- [ProtectedRoute.tsx](c:/Users/user/NestCraft/client/src/components/ProtectedRoute.tsx)
- [AuthContext.tsx](c:/Users/user/NestCraft/client/src/context/AuthContext.tsx)
- [StoreHeader.tsx](c:/Users/user/NestCraft/client/src/components/StoreHeader.tsx)

Related implementation note:

- [order-live-updates.md](c:/Users/user/NestCraft/docs/frontend/order-live-updates.md)

## Why This Page Exists

The purchase-history page already showed order contents, but it was still a list view.

The order-detail page adds:

- a dedicated URL for one order
- a refresh-safe way to reopen an order later
- a better place to center the customer-facing order number

Without this page, the customer flow would still stop at a list and a transient checkout confirmation.

## Why The Route Uses `orderNumber`

The route is:

```text
/orders/:orderNumber
```

not:

```text
/orders/:id
```

That is intentional.

The customer should see the public order number, not the internal database ID. The backend still owns the real access control, but the frontend now uses the public identifier consistently in links and page headings.

## Route Protection

The route is wrapped in [ProtectedRoute.tsx](c:/Users/user/NestCraft/client/src/components/ProtectedRoute.tsx).

That means:

- logged-out users are redirected to `/login`
- only authenticated users can open the page

This matches the fact that the backend endpoint is also protected.

## Request Flow

The page works in this sequence:

1. React Router matches `/orders/:orderNumber`
2. `ProtectedRoute` confirms authentication
3. `OrderDetailPage.tsx` reads `orderNumber` from the URL
4. the page reads `token` from [AuthContext.tsx](c:/Users/user/NestCraft/client/src/context/AuthContext.tsx)
5. `getMyOrderByOrderNumber(orderNumber, token)` in [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts) sends `GET /api/orders/:orderNumber`
6. the backend returns the matching owned order or an error
7. the page renders loading, error, or success UI
8. the page also listens to the live order stream and patches the current status when that same order is updated

This keeps responsibilities clean:

- auth state stays in context
- network code stays in the service file
- stream transport stays in the shared order stream service
- order-detail UI stays in the page

## Live Status Behavior

The page no longer depends only on the initial fetch.

While the route remains open, it subscribes to the authenticated order stream and watches for:

- `order.updated`

If the event's `orderNumber` matches the current route param, the page updates `order.status` in local state immediately.

That gives the customer live feedback when an admin changes the order state while the detail screen is open.

For the full transport and reconnect behavior, read [order-live-updates.md](c:/Users/user/NestCraft/docs/frontend/order-live-updates.md).

## State Handling

`OrderDetailPage.tsx` owns:

- `order`
- `loading`
- `error`

That is the right scope.

This data should not live in a global context because it belongs to one route and one request lifecycle.

## What The Page Renders

The page renders:

- shared store header
- back link to `/orders`
- order number
- placed date
- current status
- line items with product links
- shipping details
- subtotal, shipping, and total blocks

This is the customer-focused version of order drill-down, not an admin operations screen.

## Relationship To Other Customer Order Screens

The page connects two existing screens:

### Checkout confirmation

[CheckoutPage.tsx](c:/Users/user/NestCraft/client/src/pages/CheckoutPage.tsx) now shows the public order number and links directly to the detail page.

### Purchase history

[OrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrdersPage.tsx) now shows the public order number and gives each order a clear detail link.

That means the customer order flow is now consistent:

1. create order
2. see `orderNumber`
3. open order detail
4. revisit the same order later from history

## Error Behavior

The page handles:

- missing token
- missing route param
- backend `404`
- other fetch failures

Because the service uses the shared API error reader, the page can surface backend messages instead of collapsing to a generic fallback when possible.

## What To Test

This page is working correctly when:

- checkout confirmation links to the new route
- order history links to the new route
- refreshing `/orders/:orderNumber` works
- invalid or foreign order numbers show an error state
- product links still navigate back to `/products/:slug`
- totals and shipping details match the saved order

## Why This Slice Matters

This page completes the customer account-side order journey.

The app now supports:

- checkout creation
- customer-facing order numbers
- purchase history
- direct order detail drill-down
- live status freshness while an order detail screen stays open

That is a much more complete ecommerce account flow than a list-only history screen.
