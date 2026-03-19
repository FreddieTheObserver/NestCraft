# Frontend API Integration

This note explains how the `NestCraft` frontend talks to the backend today.

It is no longer only about the first health-check integration. It now documents the shared runtime contract used by all client service files.

## Goal

The frontend should be able to:

- call backend routes without hardcoding one deployment shape
- keep request logic out of page components
- reuse shared error parsing
- work in both local development and deployed environments

## Files Involved

Runtime and shared helpers:

- [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts)
- [vite.config.ts](c:/Users/user/NestCraft/client/vite.config.ts)
- [client/.env.example](c:/Users/user/NestCraft/client/.env.example)

Service files using the shared helper:

- [auth.ts](c:/Users/user/NestCraft/client/src/services/auth.ts)
- [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts)
- [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts)
- [adminProducts.ts](c:/Users/user/NestCraft/client/src/services/adminProducts.ts)
- [adminOrders.ts](c:/Users/user/NestCraft/client/src/services/adminOrders.ts)
- [health.ts](c:/Users/user/NestCraft/client/src/services/health.ts)

## Why Requests Are Centralized

The project now routes frontend API calls through:

- `buildApiUrl(path)`
- `apiFetch(path, init?)`
- `readApiError(response, fallback)`

in [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts).

That is better than scattering raw `fetch()` calls because it centralizes:

- API URL construction
- deployment-specific base URL logic
- shared response error parsing

This keeps page components focused on UI and state instead of transport details.

## Development Behavior

In local development, the frontend can keep requesting:

```text
/api/...
```

[vite.config.ts](c:/Users/user/NestCraft/client/vite.config.ts) proxies those requests to:

```env
VITE_API_PROXY_TARGET=http://localhost:5000
```

This means local dev still works without hardcoding backend URLs into components or service files.

## Production Behavior

The frontend runtime can also read:

```env
VITE_API_BASE_URL=
```

Current supported patterns:

- blank value -> keep relative `/api/...`
- absolute origin -> `https://api.example.com/api/...`
- absolute origin with path prefix -> `https://example.com/backend/api/...`
- relative prefix -> `/backend/api/...`

This makes the client usable in a few real deployment shapes:

- local dev with Vite proxy
- same-origin production with reverse proxy
- split frontend/backend origins

## Why Service Files Still Matter

Even with `apiFetch`, service files still own domain-specific requests.

Examples:

- [auth.ts](c:/Users/user/NestCraft/client/src/services/auth.ts) owns auth requests
- [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts) owns public catalog requests
- [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts) owns customer order requests
- [adminProducts.ts](c:/Users/user/NestCraft/client/src/services/adminProducts.ts) owns admin catalog requests
- [adminOrders.ts](c:/Users/user/NestCraft/client/src/services/adminOrders.ts) owns admin order requests

That separation is still important because API base handling and endpoint ownership are different concerns.

`api.ts` answers:

- how do we reach the backend?

Service files answer:

- which endpoint does this feature call?
- which headers does it need?
- what type does it return?

## Error Handling

Shared error parsing now lives in:

```ts
readApiError(response, fallback)
```

This lets service files surface backend-provided error messages whenever possible instead of always collapsing to one generic string.

That is especially useful for:

- auth failures
- admin authorization failures
- validation errors
- order or product fetch failures

## Current Integration Pattern

The intended pattern for new API work is:

1. add or update a service function in `client/src/services`
2. call `apiFetch(...)`, not raw `fetch(...)`
3. use `readApiError(...)` for fallback-safe error extraction
4. keep component code focused on state and rendering

This is now the standard frontend API workflow for the project.

## Relationship To Deployment

This doc covers the frontend side of the runtime contract.

For the full deployment picture, also read:

- [deployment.md](c:/Users/user/NestCraft/docs/deployment.md)

That doc explains:

- backend env parsing
- CORS expectations
- `.env.example` usage
- supported deployment shapes
