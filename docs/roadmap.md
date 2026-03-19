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
  - `GET /api/orders/:orderNumber`
  - order detail page
  - customer-facing order numbers
- backend hardening
  - route-level validation
  - shared API error shape
  - `requireAuth`
  - `requireAdmin`
- admin product management
  - `GET /api/admin/products`
  - `GET /api/categories`
  - `POST /api/products`
  - `PATCH /api/products/:id`
  - `PATCH /api/products/:id/deactivate`
  - frontend admin products dashboard
  - create and edit product pages
  - activate/deactivate controls
- admin order management
  - `GET /api/admin/orders`
  - `PATCH /api/admin/orders/:id/status`
  - enum-backed order status
  - frontend admin orders page
  - status update UI
- browse improvements
  - `GET /api/products` query support
  - search
  - category filter
  - sort
  - URL-synced browse state
- deployment polish
  - shared page shell
  - shared status panels
  - admin responsive cleanup
  - runtime-configured client API base handling
  - validated backend env parsing
  - configurable CORS allowlist
  - `.env.example` files
  - deployment notes

## Current Position

The project is now past the MVP storefront foundation stage and has completed the first pass of deployment-oriented polish.

The next highest-value work is:

1. execute a real hosted deployment
2. visual design refinement
3. deeper browse polish if needed

## Recommended Next Branch

Use this next:

```bash
git checkout -b feature/real-deployment
```

That branch should focus on the concrete launch step:

- choosing frontend and backend hosts
- provisioning production environment variables
- connecting a production database
- smoke testing the live app

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
- `GET /api/orders/:orderNumber`
- order detail page
- customer-facing order numbers
- item links back to product detail pages

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

Status: complete for first admin catalog version

Backend complete:

- admin-only create product endpoint
- admin-only update product endpoint
- soft delete through `isActive: false`
- reactivation supported via generic update endpoint
- admin read endpoint for full product list
- categories endpoint for product forms

Frontend complete:

- admin products dashboard
- create form
- edit form
- activate/deactivate controls
- admin-only navigation entry points

Why this mattered:

- catalog maintenance should stop depending on direct database edits
- this is the first real store-owner workflow

## Phase 9: Admin Order Management

Status: complete for first operational version

Backend complete:

- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- admin-only route protection for order operations
- route-level validation for status changes
- enum-backed `Order.status`

Frontend complete:

- admin orders list
- status update UI
- pending / confirmed / cancelled workflow presentation

Why this mattered:

- store operations now extend beyond catalog management
- admins can review and update real incoming orders through the app UI
- the project now has both customer and store-owner order flows

## Phase 10: Browse Improvements

Status: complete for first browseable version

Built:

- category filter
- search
- sort
- backend query support on `GET /api/products`
- URL-synced browse state
- debounced search updates
- filter-aware empty state

Why this mattered:

- the storefront now supports real product discovery instead of only a flat catalog list
- URL-driven browse state makes refresh and navigation behavior cleaner
- the catalog page now behaves more like a real ecommerce browse screen

## Phase 11: Deployment and Final Polish

Status: in progress

Completed in this phase:

- shared layouts cleanup
- loading/error/empty state polish
- responsive refinement
- production env setup
- documented runtime contract

Still remaining for the real hosted launch:

- choose deployment providers
- provision the production database
- set real production secrets
- run the first live smoke test

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

1. real deployment target
2. visual design refinement
3. deeper browse polish if needed

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
