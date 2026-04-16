# Phase 1 Hardening Design

## Goal

Phase 1 hardens the existing NestCraft application without changing the core stack.

This phase should:

- keep React + Vite + Express + Prisma as the active implementation stack
- fix the current architectural and contract issues in the app
- improve deployment-readiness for a same-origin deployment shape
- replace the current token-in-localStorage auth model with cookie-based sessions
- keep the product scope focused on the current storefront and admin workflows
- add enough automated verification that future refactors are safer

This phase should not introduce the modern tooling migration yet.

Non-goals for Phase 1:

- TanStack Query
- Zustand
- Orval or OpenAPI codegen
- Turborepo
- pnpm workspaces
- server-side cart persistence
- payments
- reviews, wishlist, analytics, or other new product surfaces
- multi-instance realtime redesign

The output of this phase should be a cleaner and more production-shaped codebase whose interfaces are stable enough for a later tooling upgrade.

## Current Problems Being Addressed

- Public product routes currently also own admin product writes, which weakens route ownership and makes the API less clear.
- Query validation does not consistently feed the actual controller and service path.
- Auth depends on JWTs returned to the browser and stored in `localStorage`.
- Client route guards trust cached user role data instead of server-verified session state.
- The cart is protected by auth even though it is a local browser concern.
- Admin edit flows fetch entire collections when they only need one entity.
- Admin lists do not support pagination or filtering, which will age poorly as data grows.
- The project has almost no automated regression coverage for its most important backend contracts.

## Architecture Decisions

### Keep The Stack Stable

The project should remain:

- React frontend in `client/`
- Express backend in `server/`
- Prisma + PostgreSQL persistence

The hardening phase should improve boundaries and contracts inside the existing stack rather than replacing the stack itself.

### Route Ownership

Public catalog routes should be owned by `server/src/routes/product.ts` only:

- `GET /api/products`
- `GET /api/products/:slug`

Admin product routes should move under `server/src/routes/adminProduct.ts`:

- `GET /api/admin/products`
- `GET /api/admin/products/:id`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `PATCH /api/admin/products/:id/deactivate`

Admin order routes should stay under `server/src/routes/adminOrder.ts`, but gain query-driven list capabilities:

- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`

Auth routes should continue to live under `server/src/routes/auth.ts`, but the contract should change from token issuance to session management:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

This gives each route file a single clear concern:

- public catalog
- admin catalog
- admin operations
- auth/session lifecycle

### Validation Ownership

Validation must become the source of truth for the backend request path.

Current behavior parses validated query values into `res.locals`, but some controllers still use raw `req.query`. That split must be removed. Controllers and services should only consume validated values.

The hardening phase should normalize one backend pattern:

- middleware validates request input
- controllers read validated input
- services receive typed, already-normalized data

### Frontend State Ownership

Auth state should stop owning a raw token and should instead own:

- whether the session bootstrap has completed
- the current authenticated user, if any
- login/register/logout actions that talk to the backend

Cart state should remain client-owned for this phase, because the cart is still intentionally local and does not yet need server persistence.

The frontend should continue to separate:

- auth/session state
- cart state
- page-local form and loading state

This keeps the hardening refactor scoped and avoids introducing a new global state system too early.

## Auth And Session Design

### Session Model

The current auth model should be replaced with cookie-based sessions for the same-origin deployment target.

Required behavior:

- login and register should set an `httpOnly` auth cookie
- the cookie should be `sameSite`-safe for same-origin deployment
- the client should no longer store JWTs or session tokens in `localStorage`
- logout should invalidate the cookie server-side
- page refresh should restore auth by calling `GET /api/auth/session`

The backend may still use signed tokens internally, but the browser should not manage them directly.

### Frontend Auth Bootstrap

`client/src/context/AuthContext.tsx` should be refactored to:

- bootstrap auth state from `GET /api/auth/session`
- track an initialization/loading phase
- expose `user`, `isAuthenticated`, and auth actions
- clear stale state when the server returns `401`

`ProtectedRoute` and `AdminRoute` should block only after auth bootstrap completes, so the app does not incorrectly redirect during initial session resolution.

### HTTP Behavior

Auth-sensitive frontend requests should use cookie-aware fetch behavior:

- same-origin requests can rely on browser cookie behavior by default
- if explicit credentials settings are needed, use `credentials: 'include'`

Unauthorized and forbidden responses must remain distinct:

- `401`: not authenticated
- `403`: authenticated but not allowed

That distinction should drive frontend behavior:

- `401` clears auth state and redirects when appropriate
- `403` shows access denial without pretending the session is missing

## Product And Admin API Design

### Public Catalog

Public product browsing remains unchanged in product scope, but should be contract-cleaner:

- validated query params should actually drive product filtering and sorting
- public controllers should not contain admin-only write responsibilities

### Admin Products

Admin product management should gain a dedicated single-record read contract:

- `GET /api/admin/products/:id`

This is needed because edit screens should not fetch the full admin catalog to locate one product.

Admin product list endpoints should support pagination and optional filtering:

- page
- page size
- active status
- featured status
- search

The exact filter set should stay modest in this phase. The goal is operational clarity, not building a full admin search system.

### Admin Orders

Admin order list endpoints should support pagination and basic filters:

- page
- page size
- status
- search by order number or customer identity where reasonable

This improves scalability without adding new product scope.

### Response Shape

The current shared error envelope should remain:

- `error.code`
- `error.message`
- optional structured details

List endpoints that gain pagination should move to paginated response shapes rather than returning raw arrays. The contract should make room for:

- items
- page
- page size
- total count
- total pages

This change should only be applied where pagination is introduced, not blindly across every endpoint.

## Guest Cart And Checkout Behavior

### Public Cart

`/cart` should become public.

Reason:

- the cart is currently local browser state
- users should be able to browse and review selections before logging in
- auth at cart-view time is unnecessary friction for a storefront

### Checkout Gate

The user should be able to reach checkout intent without losing cart state, but order creation itself still requires authentication.

The behavior should be:

- guest can browse products
- guest can add to cart
- guest can view cart
- guest can proceed toward checkout
- guest who needs auth is redirected to login
- successful login returns the user to checkout
- the local cart remains intact across that redirect

This is a better fit for the current local-cart design than forcing auth at the cart boundary.

### No Server Cart Yet

Phase 1 should not introduce a server-side cart.

That would expand the refactor into a different product decision involving:

- user-linked draft carts
- merge semantics between guest and authenticated carts
- persistence rules across devices

Those concerns are valid, but they are not required to harden the current app.

## Realtime Order Updates

The current SSE design should stay in place for now, but it should be treated as a same-instance operational feature, not a horizontally scalable realtime system.

Phase 1 should:

- keep SSE for order freshness
- make frontend usage cleaner and less wasteful where possible
- avoid redesigning the event system for distributed infrastructure

This phase does not need Redis, queues, websocket infrastructure, or cross-instance fan-out.

## Deployment Shape

The primary deployment target for this phase is same-origin:

- frontend and backend served under one domain
- API available at `/api`

This simplifies:

- cookie auth
- CORS behavior
- frontend API configuration
- session handling

The runtime contract should prefer same-origin first and keep split-origin flexibility as a secondary concern, not the main deployment target for Phase 1.

## Frontend Changes

The frontend refactor should focus on behavior correctness and contract alignment, not on introducing a new state/query library.

Required frontend changes:

- refactor auth context to session bootstrap model
- update auth service methods to session endpoints
- remove token storage from `localStorage`
- make cart public
- support return-to-checkout login flow
- adapt admin products page to paginated admin responses
- adapt admin edit product page to dedicated single-product fetch
- adapt admin orders page to paginated/filterable responses
- keep current UI language and visual style unless specific UX fixes are needed to support the new flows

Frontend state management should remain intentionally simple in this phase.

## Backend Changes

Required backend changes:

- implement cookie-based auth/session flow
- add auth session bootstrap endpoint
- add logout endpoint
- normalize validated-input consumption
- separate admin product writes into admin routes
- add admin product detail endpoint
- add paginated admin product list support
- add paginated admin order list support
- keep public catalog routes focused and clean

The backend should preserve the existing request flow discipline:

- routes
- middleware
- controllers
- services
- Prisma

## Testing Strategy

### Backend Tests First

Backend integration tests should be the first real test layer because the biggest risks are contract and auth changes.

Coverage should include:

- register success and duplicate-email rejection
- login success and invalid-credentials rejection
- session bootstrap with and without valid auth cookie
- logout invalidating the session
- protected route rejection without auth
- admin route rejection for non-admin users
- public product list/detail behavior
- admin product create/update/deactivate/detail behavior
- admin list pagination and filter handling
- order creation authorization rules
- order ownership rules for customer detail access
- stock protection during order creation

### Frontend Test Scope

Frontend test coverage should stay lighter in Phase 1.

Good candidates:

- auth bootstrap and route guard behavior
- guest cart access
- guest-to-login-to-checkout redirect flow
- admin edit page using single-item fetch instead of full-list fetch

The point is to protect the most failure-prone behavior, not to exhaustively test every presentational component.

### CI

Phase 1 should add a basic CI path that runs at least:

- frontend lint
- frontend build
- backend build
- backend tests
- frontend tests if added in this phase

The repo currently needs this protection before larger refactors begin.

## Delivery Order

Implementation should happen in this sequence:

1. Fix existing contract and validation bugs in the current backend flow.
2. Introduce cookie-based auth/session endpoints and server-side logout.
3. Refactor frontend auth bootstrap and route guards away from token storage.
4. Make cart public and implement return-to-checkout login flow.
5. Move admin product writes to admin route ownership and add admin detail read endpoint.
6. Add pagination and modest filtering to admin product and admin order lists.
7. Update frontend admin pages to the new contracts.
8. Add backend integration tests.
9. Add CI to enforce the new verification path.

This sequence reduces risk because it stabilizes contracts before layering on broader UI adaptation and automated verification.

## Why Modern Tooling Is Deferred

The project will likely benefit from modern tooling later, but not during this phase.

Reason:

- TanStack Query is more valuable once auth/session and paginated contracts are stable
- Orval or OpenAPI codegen is more valuable once the API surface is cleaned up
- Zustand is unnecessary if auth and cart ownership remain well-bounded
- Turborepo and pnpm workspaces are more valuable after the repo structure and verification tasks are stabilized

Phase 1 should produce a backend and frontend contract worth automating.

Phase 2 can then introduce:

- `pnpm` workspaces
- Turborepo
- TanStack Query
- Orval-generated client contracts
- optional state simplification where needed

That ordering gives the tooling a stable target instead of forcing the app redesign and the tooling migration to compete with each other.

## Success Criteria

Phase 1 is successful when:

- auth no longer depends on `localStorage` token storage
- the client restores session state from the server on refresh
- `/cart` is public and checkout login handoff works
- validated request input actually drives controller and service behavior
- admin product write routes live under admin route ownership
- admin edit screens use single-item read endpoints
- admin list views support pagination
- core backend flows are covered by automated tests
- CI runs the new verification path
- the app remains deployable under a same-origin `/api` shape

## Follow-On Phase

After Phase 1 is complete and stable, the next design phase should cover modern tooling migration:

- monorepo/workspace setup with `pnpm`
- Turborepo pipeline tasks
- OpenAPI generation and client codegen
- TanStack Query for server-state management
- selective frontend state reshaping where it is justified

That later migration should be done on top of the hardened contracts created here, not in parallel with them.
