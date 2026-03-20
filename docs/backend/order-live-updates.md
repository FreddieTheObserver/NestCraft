# Order Live Updates Backend

This document covers the backend implementation for live order updates in `NestCraft`.

Primary live-update endpoint:

```http
GET /api/orders/stream
```

Related write paths that publish events:

- `POST /api/orders`
- `PATCH /api/admin/orders/:id/status`

## Goal

The purpose of this slice is to let the backend push order lifecycle changes to already-open clients without requiring polling.

That matters for three screens:

- customer purchase history
- customer order detail
- admin order operations

Before this feature, those screens only changed after:

- a manual refresh
- a route reload
- a second explicit fetch after a mutation

After this feature, the backend can notify connected clients immediately when:

- a new order is created
- an existing order status changes

## Why This Uses Server-Sent Events

The live-update transport is Server-Sent Events, not WebSockets.

That is a pragmatic fit for the current project because the feature only needs:

- server-to-client delivery
- simple text streaming over HTTP
- a small event surface

It does not need:

- client-to-server realtime messages
- presence tracking
- bidirectional sockets
- a broker-backed message bus

SSE keeps the implementation small enough to fit the current app stage while still giving the frontend realtime updates.

## Files Involved

Routing:

- [order.ts](c:/Users/user/NestCraft/server/src/routes/order.ts)
- [adminOrder.ts](c:/Users/user/NestCraft/server/src/routes/adminOrder.ts)

Controller:

- [orderStreamController.ts](c:/Users/user/NestCraft/server/src/controllers/orderStreamController.ts)
- [orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts)

Event plumbing:

- [orderEvents.ts](c:/Users/user/NestCraft/server/src/lib/orderEvents.ts)

Write paths that publish:

- [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts)

Shared auth and app wiring:

- [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts)
- [app.ts](c:/Users/user/NestCraft/server/src/app.ts)

## High-Level Flow

The backend live-update path works like this:

1. a logged-in client opens `GET /api/orders/stream`
2. `requireAuth` verifies the bearer token and attaches `req.user`
3. `streamOrderEventsHandler` keeps the HTTP connection open as an SSE response
4. the handler subscribes the connection into an in-memory subscriber map
5. order writes call broadcast helpers after successful database changes
6. the event layer fans the event out to matching subscribers
7. the browser updates the UI without a full page refresh

This is intentionally in-process.

There is no external queue, Redis pub/sub layer, or durable event store in this version.

## Route Structure

The stream route lives in the normal customer order router:

```ts
orderRouter.get("/stream", requireAuth, streamOrderEventsHandler);
```

This means the full path is:

```http
GET /api/orders/stream
```

Why it belongs under `/api/orders`:

- the stream is still order-domain behavior
- it is authenticated user context, not a public feed
- both customers and admins already have order access through auth

## Important Route-Order Detail

In [order.ts](c:/Users/user/NestCraft/server/src/routes/order.ts), the static stream route must stay above:

```ts
"/:orderNumber"
```

Why:

- Express matches routes top to bottom
- if `/:orderNumber` came first, `/stream` would be treated as an order number candidate
- the request would be sent into the wrong route path

So the correct order is:

1. `/me`
2. `/stream`
3. `/:orderNumber`

## Authentication Model

The stream route uses the same JWT-based authentication middleware as the rest of the protected order layer.

That means:

- missing token -> `401`
- invalid or expired token -> `401`
- valid token -> request is allowed to subscribe

This is important because the stream can expose operational order activity. It must not be available anonymously.

The stream controller reads:

- `req.user.userId`
- `req.user.role`

Those two fields become the subscriber identity used for event filtering.

## SSE Response Behavior

The controller in [orderStreamController.ts](c:/Users/user/NestCraft/server/src/controllers/orderStreamController.ts) does four key things:

1. sets SSE headers
2. flushes headers immediately
3. registers the connection in the subscriber map
4. tears the subscription down when the request closes

Current SSE headers:

- `Content-Type: text/event-stream`
- `Cache-Control: no-cache, no-transform`
- `Connection: keep-alive`
- `X-Accel-Buffering: no`

These headers matter because they reduce the chance that proxies or middle layers will buffer the stream and delay delivery.

The controller also writes:

- an initial connection comment
- periodic heartbeat comments every 15 seconds

Why the heartbeat exists:

- to keep the connection warm through intermediaries
- to reduce the chance of idle timeout behavior
- to give the client an active stream even when no order events are happening

Heartbeat comments are not business events. They are transport keepalive messages.

## Event Model

The current event union in [orderEvents.ts](c:/Users/user/NestCraft/server/src/lib/orderEvents.ts) has two event types:

### `order.created`

Payload:

- `type`
- `orderNumber`
- `userId`

This is emitted after a new order is successfully created.

### `order.updated`

Payload:

- `type`
- `orderNumber`
- `userId`
- `status`

This is emitted after an existing order status is successfully changed by an admin.

The event payload intentionally stays small.

It does not attempt to push the entire order record through the stream. That keeps the event bus simpler and leaves the frontend free to:

- refetch a full collection
- refetch one order
- patch a small piece of state

depending on the page.

## In-Memory Subscriber Registry

The event layer stores active subscribers in an in-memory `Map`.

Each subscriber tracks:

- generated subscription ID
- `userId`
- `role`
- `send(event)` callback

This design is appropriate for the current project stage because it is:

- simple
- easy to reason about
- cheap to maintain

It also carries an important limitation:

- subscribers exist only inside one running server process

That means this version is correct for:

- local development
- one-process deployment

It is not yet a multi-instance realtime architecture.

If the app later runs across multiple backend instances, this in-memory fan-out would need to be replaced or supplemented with shared infrastructure.

## Event Visibility Rules

Not every subscriber should receive every event.

The event layer applies role-aware filtering:

- admins receive all order events
- customers receive only events where `event.userId === subscriber.userId`

That is the core access rule for the stream.

Why this matters:

- customers should never see another customer's orders
- admins do need full visibility into the operational order queue

This is enforced in the event layer itself, not left up to the frontend.

## Publish Points

The event bus only publishes after successful service-layer writes.

### Order creation

In [orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts), `createOrder(...)` now:

1. completes the Prisma transaction
2. receives the final saved order with the generated `orderNumber`
3. calls `broadcastOrderCreated(order.orderNumber, order.userId)`

This ordering is important.

The event is sent only after:

- stock checks pass
- stock decrements succeed
- order rows are committed
- the final public `orderNumber` exists

That prevents the stream from announcing orders that later fail to persist.

### Order status update

In the same service file, `updateOrderStatus(...)` now:

1. confirms the order exists
2. updates the status in the database
3. calls `broadcastOrderUpdated(order.orderNumber, order.userId, order.status)`

This also happens after the write succeeds.

So the stream reflects committed state, not requested state.

## Why Publishing Stays In The Service Layer

The controller does not publish stream events directly.

That is correct because the service layer owns:

- the write boundary
- the success/failure outcome
- the final saved entity data

If publishing were done in the controller, it would be easier to accidentally emit events before the authoritative write actually completed.

Putting broadcasts in the service layer keeps the event publication aligned with the domain action.

## Error And Cleanup Behavior

The stream controller cleans up subscriptions when the request or response closes.

That matters because stale subscribers would otherwise accumulate in memory.

The broadcast layer also removes subscribers whose `send(...)` callback throws.

This gives the implementation two cleanup paths:

- normal connection close cleanup
- defensive cleanup on failed writes to a broken stream

## What The Stream Does Not Do

This backend slice does not currently provide:

- event persistence
- replay for missed events
- last-event IDs
- durable delivery guarantees
- reconnect resume semantics
- order delete events
- admin filtering subscriptions
- a shared broker across multiple backend instances

That is acceptable for the current product stage because the client can recover by refetching standard HTTP endpoints after reconnecting.

## Security Boundary Summary

The live-update backend is secure when these rules hold:

- only authenticated requests can connect
- subscriber identity is derived from the verified JWT
- event filtering happens on the server
- customers only receive their own events
- admins receive all events by role

Those rules are what make the stream safe to expose to both customer and admin UIs through the same endpoint.

## Testing The Stream Manually

### Customer stream

Open a stream with a customer token:

```bash
curl -N http://localhost:5000/api/orders/stream \
  -H "Accept: text/event-stream" \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN"
```

Then create an order for that same user.

Verify:

- the stream stays open
- heartbeat comments appear periodically
- a new `order.created` event appears

### Admin stream

Open a stream with an admin token:

```bash
curl -N http://localhost:5000/api/orders/stream \
  -H "Accept: text/event-stream" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Then:

- create an order as any customer
- update an order status as admin

Verify:

- the admin stream receives both `order.created` and `order.updated`

### Negative checks

Verify:

- no token -> `401`
- invalid token -> `401`
- customer token does not receive another customer's events

## Relationship To Existing Order APIs

The stream does not replace the normal REST endpoints.

The standard HTTP endpoints remain the source of full record loading:

- `GET /api/orders/me`
- `GET /api/orders/:orderNumber`
- `GET /api/admin/orders`

The stream only acts as a lightweight notification channel telling the frontend:

- something changed
- which order changed
- whether the change was creation or status update

That separation is intentional.

REST still owns authoritative reads. The stream only improves freshness.

## Why This Slice Matters

This backend feature upgrades the order system from static request/response screens to live operational behavior.

After this work:

- customers can see newly created orders appear without a manual refresh
- customer order detail can react to status changes while open
- admins can see the order queue reflect live activity

That gives the order system a more realistic ecommerce feel without adding a much larger realtime architecture.
