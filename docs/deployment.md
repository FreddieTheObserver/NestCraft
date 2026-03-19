# Deployment And Runtime

This document explains the deployment-oriented polish that now exists in `NestCraft`.

It covers two things:

- how the frontend and backend are configured at runtime
- what UI polish was added so the current product is more consistent before a real hosted deploy

This is a cross-cutting doc because the deployment contract spans:

- Vite
- frontend service calls
- backend env parsing
- backend CORS rules

## Current Deployment Shape

The project is still a split application:

- React frontend in [client](c:/Users/user/NestCraft/client)
- Express + Prisma backend in [server](c:/Users/user/NestCraft/server)
- PostgreSQL database

Local development still assumes:

- frontend on `http://localhost:5173`
- backend on `http://localhost:5000`

Production can now use either:

- same-origin `/api` requests behind a reverse proxy
- a dedicated backend origin configured through a frontend env var

## Files Involved

Frontend runtime:

- [vite.config.ts](c:/Users/user/NestCraft/client/vite.config.ts)
- [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts)
- [auth.ts](c:/Users/user/NestCraft/client/src/services/auth.ts)
- [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts)
- [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts)
- [adminProducts.ts](c:/Users/user/NestCraft/client/src/services/adminProducts.ts)
- [adminOrders.ts](c:/Users/user/NestCraft/client/src/services/adminOrders.ts)
- [health.ts](c:/Users/user/NestCraft/client/src/services/health.ts)
- [client/.env.example](c:/Users/user/NestCraft/client/.env.example)

Backend runtime:

- [env.ts](c:/Users/user/NestCraft/server/src/config/env.ts)
- [app.ts](c:/Users/user/NestCraft/server/src/app.ts)
- [server/.env.example](c:/Users/user/NestCraft/server/.env.example)

UI polish:

- [PageShell.tsx](c:/Users/user/NestCraft/client/src/components/PageShell.tsx)
- [StatusPanel.tsx](c:/Users/user/NestCraft/client/src/components/StatusPanel.tsx)

## Frontend Runtime Contract

The frontend no longer hardcodes raw `fetch()` calls throughout the app.

All client API requests now flow through:

- `buildApiUrl(path)`
- `apiFetch(path, init?)`

in [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts).

That gives the project one place to control how API URLs are built.

### `VITE_API_BASE_URL`

The main production-facing env var is:

```env
VITE_API_BASE_URL=
```

Behavior:

- blank value: request relative `/api/...`
- absolute value like `https://api.example.com`: request that backend origin directly
- absolute value with path prefix like `https://example.com/backend`: request that prefixed API path
- relative prefix like `/backend`: request `/backend/api/...`

This makes the client flexible enough for a few deployment shapes without changing application code.

### `VITE_API_PROXY_TARGET`

The local-development proxy target is:

```env
VITE_API_PROXY_TARGET=http://localhost:5000
```

This is used by [vite.config.ts](c:/Users/user/NestCraft/client/vite.config.ts).

It matters only for local Vite dev mode.

During local development, the browser still calls:

```text
/api/...
```

and Vite proxies those requests to the backend target.

## Backend Runtime Contract

The backend now validates env access in [env.ts](c:/Users/user/NestCraft/server/src/config/env.ts) instead of reading loose `process.env` values all over the app.

### Required env vars

These must exist:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/nestcraft
JWT_SECRET=replace_this_with_a_long_random_secret
```

If either is missing, backend startup should fail immediately.

That is intentional. Silent startup with missing runtime config is worse than an early explicit crash.

### Optional env vars with defaults

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

`PORT` defaults to `5000`.

`CLIENT_ORIGIN` defaults to `http://localhost:5173`.

`CLIENT_ORIGIN` can now be a comma-separated list when more than one browser origin needs access:

```env
CLIENT_ORIGIN=http://localhost:5173,https://nestcraft.example.com
```

## CORS Behavior

[app.ts](c:/Users/user/NestCraft/server/src/app.ts) now checks the incoming browser origin against the parsed `clientOrigins` list.

Current behavior:

- requests with no `Origin` header are allowed
- requests from allowed browser origins are allowed
- unknown origins are rejected by CORS

Allowing requests with no `Origin` header is useful for:

- server-to-server requests
- CLI tools
- local debugging tools that are not running in a browser

## UI Polish Included In This Branch

This branch also tightened the current UI before a real deployment.

### Shared shell

[PageShell.tsx](c:/Users/user/NestCraft/client/src/components/PageShell.tsx) now owns the common storefront page frame:

- page background
- outer spacing
- centered content width
- shared header insertion

That removed repeated `main` and `section` wrappers from multiple pages.

### Shared state panels

[StatusPanel.tsx](c:/Users/user/NestCraft/client/src/components/StatusPanel.tsx) now standardizes:

- loading panels
- error panels
- empty-state panels

That gives the product, cart, checkout, orders, and admin pages a more consistent state language.

### Responsive admin cleanup

The admin catalog and admin order pages now use the same shell and improved responsive handling.

The admin product list adds horizontal scrolling guidance for narrow viewports, which is a pragmatic first step for dense table-style screens.

## How To Configure Local Development

### Backend

Copy the example file:

```text
server/.env.example -> server/.env
```

Set real values for:

- `DATABASE_URL`
- `JWT_SECRET`

### Frontend

Copy the example file if you need to override defaults:

```text
client/.env.example -> client/.env
```

For ordinary local development, the default example is already enough:

- leave `VITE_API_BASE_URL` blank
- keep `VITE_API_PROXY_TARGET=http://localhost:5000`

## Recommended Production Shapes

The current code supports two practical deployment patterns.

### Same-origin reverse proxy

Example:

- frontend served from `https://shop.example.com`
- reverse proxy forwards `/api/*` to the backend service

In that model:

- `VITE_API_BASE_URL` can stay blank
- backend `CLIENT_ORIGIN` should include `https://shop.example.com`

### Split frontend and backend origins

Example:

- frontend at `https://shop.example.com`
- backend at `https://api.example.com`

In that model:

- set `VITE_API_BASE_URL=https://api.example.com`
- set backend `CLIENT_ORIGIN=https://shop.example.com`

## What Still Remains Before A Real Deployment

This branch improves deployment readiness, but it does not perform the actual hosted release.

Still remaining:

- choose a frontend host
- choose a backend host
- provision a production PostgreSQL database
- set real production secrets
- run a smoke test against live URLs

## Verification Checklist

Before calling the project deploy-ready, verify:

- the frontend can load products with local Vite proxying
- authenticated flows still work with `Authorization` headers
- admin pages still work through the centralized `apiFetch`
- the backend refuses startup when `DATABASE_URL` or `JWT_SECRET` is missing
- browser requests from a disallowed origin are rejected by CORS
- the client works with either blank `VITE_API_BASE_URL` or a real API origin
