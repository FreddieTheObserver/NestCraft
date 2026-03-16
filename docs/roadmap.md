# NestCraft Roadmap

This roadmap reflects the current state of the project, not the original starting plan.

## Current State

These slices are already implemented:

- foundation setup
  - Vite + React + TypeScript client
  - Express + TypeScript backend
  - PostgreSQL + Prisma
- product catalog
  - seeded `Category` and `Product` data
  - `GET /api/products`
  - `GET /api/products/:slug`
  - products page
  - product detail page
- cart
  - local cart state
  - `localStorage` persistence
  - cart page
- auth
  - register
  - login
  - logout
  - protected routes
- checkout skeleton
  - `POST /api/orders`
  - checkout page
  - order creation from cart
- account/order history
  - `GET /api/orders/me`
  - orders page
- backend hardening
  - route-level validation
  - shared API error shape
  - `requireAuth`
  - `requireAdmin`
- admin backend product endpoints
  - `POST /api/products`
  - `PATCH /api/products/:id`
  - `PATCH /api/products/:id/deactivate`

## Current Position

The project is now past the MVP storefront foundation stage.

The next highest-value work is:

1. frontend admin product management
2. admin order management
3. browse/search/filter improvements
4. polish and deployment

## Recommended Next Branch

Use this next:

```bash
git checkout -b feature/admin-products-ui
```

That branch should focus on the frontend side of admin product management:

- admin products list page
- create product form
- edit product form
- admin route protection

## Phase Breakdown

## Phase 1: Foundation

Status: complete

Built:

- project structure
- frontend and backend bootstrapping
- environment setup
- Prisma integration
- health route
- shared conventions

Why it mattered:

- every later feature depends on a stable base
- TypeScript and Prisma decisions affect all later code

## Phase 2: Product Catalog

Status: complete

Built:

- `Category` and `Product` Prisma models
- migrations and seed data
- `GET /api/products`
- `GET /api/products/:slug`
- products grid page
- product detail page

Why it mattered:

- products are the center of the storefront
- later cart, checkout, and admin flows all depend on catalog data

## Phase 3: Cart

Status: complete for local-cart version

Built:

- add to cart
- quantity updates
- remove from cart
- subtotal calculation
- cart persistence in `localStorage`

What is intentionally deferred:

- server-side cart
- cart merge across devices

Why deferred:

- backend cart is tightly coupled to auth and account persistence
- local cart was the right first implementation

## Phase 4: Authentication

Status: complete for basic auth

Built:

- `User` model
- register/login endpoints
- JWT issuance
- auth context
- protected routes
- shared header logout behavior

What is intentionally deferred:

- password reset
- email verification
- OAuth providers
- refresh-token rotation

## Phase 5: Checkout Skeleton

Status: complete for first order flow

Built:

- `Order` and `OrderItem` models
- `POST /api/orders`
- shipping form
- server-side total calculation
- stock decrement
- order confirmation state

Why this matters:

- the app can now complete a basic purchase flow
- order history becomes possible only after checkout exists

## Phase 6: Order History

Status: complete for customer view

Built:

- `GET /api/orders/me`
- protected orders page
- purchase history UI
- item links back to product detail pages

What is still missing:

- dedicated order detail page
- customer-facing order numbers

## Phase 7: Backend Hardening

Status: complete for current routes

Built:

- route-level validation with `zod`
- shared API error format
- `requireAuth`
- `requireAdmin`
- frontend API error propagation
- cleanup of text/encoding issues

Why this was done before admin UI:

- admin routes need stricter authorization boundaries
- validation and error handling would otherwise become duplicated quickly

## Phase 8: Admin Product Management

Status: backend complete, frontend pending

Backend complete:

- admin-only create product endpoint
- admin-only update product endpoint
- soft delete through `isActive: false`
- reactivation supported via generic update endpoint

Frontend next:

- admin products dashboard
- create form
- edit form
- activate/deactivate controls
- admin-only navigation entry points

Why this is next:

- catalog maintenance should stop depending on direct database edits
- this is the first real store-owner workflow

## Phase 9: Admin Order Management

Status: not started

Planned work:

- admin orders list
- status updates
- pending / confirmed / cancelled workflow

Why it comes after admin products:

- catalog management is the more immediate operational need
- order status management is easier once admin routing patterns already exist

## Phase 10: Browse Improvements

Status: not started

Planned work:

- category filter
- search
- sort
- better catalog browsing UX

Why it is not first anymore:

- the project already has a usable basic storefront
- admin tooling is more urgent right now than browse polish

## Phase 11: Deployment and Final Polish

Status: not started

Planned work:

- shared layouts cleanup
- loading/error/empty state polish
- responsive refinement
- production env setup
- deployment

## Recommended Working Pattern

Continue using vertical slices:

1. define the data and route contract
2. build the backend path
3. test the endpoint
4. build the frontend page or component
5. connect the UI to the endpoint
6. handle loading, error, and empty states
7. document the slice

This has worked well so far and should remain the default workflow.

## Branching Strategy

Keep doing:

- one feature branch per slice
- merge to `main` only after the slice works end to end

Recommended pattern:

```bash
git checkout -b feature/<feature-name>
git add .
git commit -m "<feature message>"
git push origin feature/<feature-name>
git checkout main
git merge feature/<feature-name>
git push origin main
```

## Near-Term Backlog

Priority order:

1. frontend admin product management
2. admin order management
3. search/filter/sort
4. order detail page
5. customer-facing order numbers
6. deployment polish

## Features To Defer

Do not prioritize these yet:

- Stripe
- coupons
- reviews
- wishlist
- analytics
- email system
- inventory sync

These belong after the admin and storefront core are stable.
