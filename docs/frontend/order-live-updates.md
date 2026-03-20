# Order Live Updates Frontend

This document covers the frontend implementation for live order updates in `NestCraft`.

Primary backend dependency:

```http
GET /api/orders/stream
```

Affected pages:

- `/orders`
- `/orders/:orderNumber`
- `/admin/orders`

## Goal

The purpose of this slice is to keep order-related pages fresh while they remain open.

That means the UI can respond to backend order events without depending on:

- manual refresh
- leaving and re-entering the page
- repeated timer-based polling

The current frontend behavior is:

- the customer orders page refetches when order events arrive
- the admin orders page refetches when order events arrive
- the customer order detail page patches the currently viewed order status in place when relevant

## Files Involved

Shared stream service:

- [orderStream.ts](c:/Users/user/NestCraft/client/src/services/orderStream.ts)

Customer pages:

- [OrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrdersPage.tsx)
- [OrderDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrderDetailPage.tsx)

Admin page:

- [AdminOrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminOrdersPage.tsx)

Related API services:

- [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts)
- [adminOrders.ts](c:/Users/user/NestCraft/client/src/services/adminOrders.ts)

Shared API URL logic:

- [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts)

Auth state source:

- [AuthContext.tsx](c:/Users/user/NestCraft/client/src/context/AuthContext.tsx)

## Why There Is A Dedicated Stream Service

The realtime client logic lives in [orderStream.ts](c:/Users/user/NestCraft/client/src/services/orderStream.ts).

That file owns:

- opening the stream
- sending the bearer token
- parsing SSE frames
- surfacing typed order events
- reconnecting when the connection drops

This separation matters for the same reason the normal REST services exist:

- pages should focus on UI state
- network transport details should stay in the service layer

Without that separation, the page components would each need to reimplement stream parsing and reconnect behavior.

## Why This Does Not Use Browser `EventSource`

The frontend does not use the browser's native `EventSource` API.

It uses `fetch()` with a streamed response instead.

That is intentional.

The current backend stream route requires:

- `Authorization: Bearer <token>`

Native `EventSource` does not provide a clean standard way to attach arbitrary authorization headers.

Because this app already stores JWT auth in the frontend and sends bearer headers to protected endpoints, a fetch-stream approach is the correct fit.

That choice lets the stream reuse the same authentication model as the rest of the client.

## Shared Event Model

The frontend stream service understands two event types:

### `order.created`

Payload:

- `type`
- `orderNumber`
- `userId`

### `order.updated`

Payload:

- `type`
- `orderNumber`
- `userId`
- `status`

The service parses the JSON payload and exposes a typed `OrderStreamEvent` union to callers.

That keeps page logic simpler and avoids passing raw text frames around the app.

## Stream Connection Flow

The shared subscription helper works in this sequence:

1. page calls `subscribeToOrderStream({ token, onEvent, onError })`
2. the service builds the URL through `buildApiUrl()`
3. the service opens `fetch('/api/orders/stream')` with bearer auth
4. the response body reader consumes the stream chunk by chunk
5. SSE `data:` frames are assembled into one JSON payload per event
6. parsed events are passed to the page callback
7. if the stream disconnects unexpectedly, the service retries after a short delay

This is a practical compromise:

- light enough for the current app
- reusable across pages
- still fully typed in TypeScript

## SSE Parsing Strategy

The frontend parser in [orderStream.ts](c:/Users/user/NestCraft/client/src/services/orderStream.ts) handles the parts of SSE this feature actually uses.

It:

- buffers incoming text chunks
- splits lines on newline boundaries
- ignores comment heartbeats starting with `:`
- ignores `event:` metadata because the JSON payload already includes `type`
- collects one or more `data:` lines
- emits one parsed event when a blank line ends the SSE message

This is intentionally narrow rather than a full generic SSE library.

That is acceptable because the current backend contract is also small and controlled within the same repository.

## Reconnect Behavior

The shared stream helper reconnects automatically after a disconnect.

Current delay:

- 3 seconds

Why reconnect exists:

- network hiccups should not permanently disable freshness
- the backend stream may close during local dev restarts
- pages should recover without requiring the user to refresh manually

This reconnect path is best-effort, not durable delivery.

If the client misses events while disconnected, the normal page refetch behavior is what restores correct state.

## Abort And Cleanup Behavior

The subscription helper returns an unsubscribe function.

Pages call that implicitly through React effect cleanup when:

- the component unmounts
- the token changes
- the route param changes

This matters because the app should not keep background streams open after the user leaves the page.

The helper also supports a caller-provided `AbortSignal`, though the current page integrations do not need separate manual cancellation.

## Why The List Pages Refetch Instead Of Patching Every Case

The customer orders page and admin orders page both respond to stream events by refetching their data.

That is deliberate.

Why a refetch is reasonable there:

- those pages already have dedicated list-fetch APIs
- order creation can change counts, totals, and list ordering
- admin updates can affect summary numbers as well as one row

Trying to patch every derived value manually would make those pages more brittle.

A refetch keeps the logic correct with less branching.

## Customer Orders Page Behavior

In [OrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrdersPage.tsx), the page now has two linked concerns:

- initial `loadOrders()`
- ongoing stream subscription

When a stream event arrives:

- the page calls `loadOrders()` again

That keeps the page current for both:

- new order creation
- later status changes

The page uses `useEffectEvent` so the reload callback can stay current without forcing unnecessary effect churn.

## Customer Order Detail Behavior

In [OrderDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrderDetailPage.tsx), the page subscribes to the same shared stream but handles events more narrowly.

Current behavior:

- ignore `order.created`
- ignore updates for other order numbers
- when `order.updated` matches the current `orderNumber`, patch `order.status` in local state

Why this page patches locally instead of refetching:

- the most important live field on this screen is status
- the backend event already includes the new status
- a local patch is cheaper and simpler for this focused route

This gives the page immediate visible feedback if an admin changes the order status while the customer is viewing that order.

## Admin Orders Page Behavior

In [AdminOrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminOrdersPage.tsx), the page subscribes and refetches the full admin order list on stream events.

That means the admin UI updates for both:

- new incoming orders created by customers
- status changes applied by any admin session

This is important because the admin orders screen acts as an operations queue, not just a detail view.

It needs to reflect collection-wide changes, not only one row mutation.

## Relationship To Existing Mutation Logic

The admin page still updates local state immediately after a successful status mutation response.

That is still correct.

The stream layer does not replace optimistic or direct mutation handling inside the page.

Instead, it adds cross-session freshness.

Example:

- admin A changes an order to `confirmed`
- admin A sees the local immediate update from the PATCH response
- admin B, already viewing `/admin/orders`, sees the same change through the stream

So the stream complements direct mutation handling instead of replacing it.

## Authentication Dependency

The stream service depends on the same auth source as the rest of the protected frontend:

- [AuthContext.tsx](c:/Users/user/NestCraft/client/src/context/AuthContext.tsx)

That means live updates only work when the page has a valid JWT token available.

If the token is missing, the pages already fall back to their normal protected-route or error behavior.

The stream layer is not responsible for inventing auth state. It only consumes the existing token.

## Error Handling

The stream helper surfaces connection failures through `onError`.

The current page integrations log those failures to the console and keep the page usable.

That is the right current behavior because:

- a dropped live-update connection should not wipe already loaded content
- the app still has normal fetch-based data loading
- reconnect attempts continue in the background

This feature improves freshness, but it is not the only way the pages obtain data.

## What This Frontend Slice Does Not Yet Do

The current client implementation does not yet provide:

- a visible "live connection lost" banner
- user-facing reconnect state
- replay of missed events
- page-specific selective list patching
- stream subscriptions outside order-related pages

Those are reasonable future improvements if the app needs a stronger realtime UX later.

## Testing The UI

This feature is working correctly when:

- open `/orders` in one tab as a customer
- create a new order in another tab for the same account
- the orders list updates without a manual refresh

Also verify:

- open `/orders/:orderNumber`
- change that order status from an admin session
- the detail page status badge updates while the page stays open

And verify:

- open `/admin/orders` in one admin tab
- create a new order from a customer session
- the admin order queue updates automatically

Finally verify reconnect behavior:

- restart the backend while an order page is open
- wait for the stream to reconnect
- trigger another order event
- confirm the page becomes current again

## Why This Slice Matters

This frontend feature makes the order system feel active instead of static.

After this work:

- customers do not need to manually refresh to notice status movement
- admins can watch the order queue update as activity happens
- multiple open sessions stay more aligned

That is a meaningful usability upgrade even though the app is still using a deliberately simple realtime architecture.
