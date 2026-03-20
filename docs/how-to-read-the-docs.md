# How To Read The Docs

This guide is for other people reading `NestCraft` for the first time.

The project documentation is detailed, but it is also split by purpose:

- top-level project status
- deployment and runtime notes
- backend implementation notes
- frontend implementation notes

If you read everything in random order, it will feel scattered. The right way to use these docs is to start broad, then narrow into the part of the system you care about.

## Who This Guide Is For

Use this guide if you are:

- a new collaborator joining the project
- a reviewer trying to understand what already exists
- a future maintainer trying to find the right documentation quickly
- someone returning to the project after time away

## Step 1: Start With The Project Summary

Read [README.md](c:/Users/user/NestCraft/README.md) first.

Why:

- it tells you what the project is
- it shows the current feature set
- it shows the main stack
- it shows the main route structure
- it points you into the docs tree

Do not start with backend or frontend detail docs first unless you already know the overall project shape.

What you should learn from the root README:

- what `NestCraft` does
- what has already been implemented
- what the major folders are
- where to find the deeper docs next

## Step 2: Read The Current Project Status

After the root README, read [roadmap.md](c:/Users/user/NestCraft/docs/roadmap.md).

Why:

- it explains the project in phases
- it tells you what is complete and what is not
- it gives the intended order of the work
- it helps you understand why some features were built before others

This is the best file for understanding:

- what stage the project is in
- what the last major milestone was
- what the likely next step is

If you only read one file after the root README, read the roadmap.

If your immediate question is about runtime setup or deployment, read [deployment.md](c:/Users/user/NestCraft/docs/deployment.md) right after the roadmap.

## Step 3: Decide Which Side You Care About

Once you understand the overall state, choose your reading path:

- backend path
- frontend path
- full vertical-slice path
- deployment/runtime path

Do not try to read every file at once.

The docs are easier to use if you follow the side of the stack you are actively working on.

## Step 4A: If You Are Working On Backend Code

Start with [README.md](c:/Users/user/NestCraft/docs/backend/README.md).

That file gives you the backend documentation map.

Then read in this order:

1. [database-setup-and-seeding.md](c:/Users/user/NestCraft/docs/backend/database-setup-and-seeding.md)
2. [request-validation-and-authorization.md](c:/Users/user/NestCraft/docs/backend/request-validation-and-authorization.md)
3. the route-specific doc you need

Why this order:

- database docs explain the data foundation
- validation/auth docs explain the shared backend rules
- route docs explain the specific feature behavior

### Which backend docs to read by task

If you are working on catalog reads:

- [products-api.md](c:/Users/user/NestCraft/docs/backend/products-api.md)
- [product-detail-api.md](c:/Users/user/NestCraft/docs/backend/product-detail-api.md)

If you are working on auth:

- [auth-backend.md](c:/Users/user/NestCraft/docs/backend/auth-backend.md)

If you are working on checkout or orders:

- [checkout-order-endpoint.md](c:/Users/user/NestCraft/docs/backend/checkout-order-endpoint.md)
- [orders-history-api.md](c:/Users/user/NestCraft/docs/backend/orders-history-api.md)
- [order-detail-api.md](c:/Users/user/NestCraft/docs/backend/order-detail-api.md)
- [admin-orders-backend.md](c:/Users/user/NestCraft/docs/backend/admin-orders-backend.md)
- [order-live-updates.md](c:/Users/user/NestCraft/docs/backend/order-live-updates.md)
- [order-status-enum.md](c:/Users/user/NestCraft/docs/backend/order-status-enum.md)

If you are working on admin catalog tools:

- [admin-read-endpoints.md](c:/Users/user/NestCraft/docs/backend/admin-read-endpoints.md)
- [admin-product-endpoints.md](c:/Users/user/NestCraft/docs/backend/admin-product-endpoints.md)

## Step 4B: If You Are Working On Frontend Code

Start with [README.md](c:/Users/user/NestCraft/docs/frontend/README.md).

That file gives you the frontend documentation map.

Then read in this order:

1. [api-integration.md](c:/Users/user/NestCraft/docs/frontend/api-integration.md)
2. [ui-foundations.md](c:/Users/user/NestCraft/docs/frontend/ui-foundations.md)
3. [api-error-handling.md](c:/Users/user/NestCraft/docs/frontend/api-error-handling.md)
4. the page-specific doc you need

Why this order:

- API integration explains how the client talks to the backend
- UI foundations explains the shared page shell and state-panel conventions
- API error handling explains how failures are surfaced
- page docs explain feature-specific UI behavior

### Which frontend docs to read by task

If you are working on storefront browsing:

- [products-page.md](c:/Users/user/NestCraft/docs/frontend/products-page.md)
- [product-detail-page.md](c:/Users/user/NestCraft/docs/frontend/product-detail-page.md)

If you are working on cart:

- [local-cart.md](c:/Users/user/NestCraft/docs/frontend/local-cart.md)

If you are working on auth:

- [auth-frontend.md](c:/Users/user/NestCraft/docs/frontend/auth-frontend.md)

If you are working on customer orders:

- [orders-page.md](c:/Users/user/NestCraft/docs/frontend/orders-page.md)
- [order-detail-page.md](c:/Users/user/NestCraft/docs/frontend/order-detail-page.md)
- [order-live-updates.md](c:/Users/user/NestCraft/docs/frontend/order-live-updates.md)

If you are working on admin features:

- [admin-products-ui.md](c:/Users/user/NestCraft/docs/frontend/admin-products-ui.md)
- [admin-orders-ui.md](c:/Users/user/NestCraft/docs/frontend/admin-orders-ui.md)

## Step 4D: If You Are Working On Deployment Or Runtime Config

Start with [deployment.md](c:/Users/user/NestCraft/docs/deployment.md).

Then read:

1. [README.md](c:/Users/user/NestCraft/README.md)
2. [api-integration.md](c:/Users/user/NestCraft/docs/frontend/api-integration.md)

Why this order:

- the deployment doc explains the full runtime contract
- the root README explains the main setup flow
- the frontend API integration doc explains how the client resolves API URLs

## Step 4C: If You Want To Understand One Feature End To End

Read one vertical slice at a time.

Use this pattern:

1. backend route doc
2. frontend page doc
3. related shared docs if needed

Examples:

### Product catalog

1. [products-api.md](c:/Users/user/NestCraft/docs/backend/products-api.md)
2. [products-page.md](c:/Users/user/NestCraft/docs/frontend/products-page.md)
3. [product-detail-api.md](c:/Users/user/NestCraft/docs/backend/product-detail-api.md)
4. [product-detail-page.md](c:/Users/user/NestCraft/docs/frontend/product-detail-page.md)

### Auth

1. [auth-backend.md](c:/Users/user/NestCraft/docs/backend/auth-backend.md)
2. [auth-frontend.md](c:/Users/user/NestCraft/docs/frontend/auth-frontend.md)

### Orders

1. [checkout-order-endpoint.md](c:/Users/user/NestCraft/docs/backend/checkout-order-endpoint.md)
2. [orders-history-api.md](c:/Users/user/NestCraft/docs/backend/orders-history-api.md)
3. [order-detail-api.md](c:/Users/user/NestCraft/docs/backend/order-detail-api.md)
4. [admin-orders-backend.md](c:/Users/user/NestCraft/docs/backend/admin-orders-backend.md)
5. [order-live-updates.md](c:/Users/user/NestCraft/docs/backend/order-live-updates.md)
6. [orders-page.md](c:/Users/user/NestCraft/docs/frontend/orders-page.md)
7. [order-detail-page.md](c:/Users/user/NestCraft/docs/frontend/order-detail-page.md)
8. [admin-orders-ui.md](c:/Users/user/NestCraft/docs/frontend/admin-orders-ui.md)
9. [order-live-updates.md](c:/Users/user/NestCraft/docs/frontend/order-live-updates.md)

This is the best way to understand how one feature moves through:

- route
- service
- page
- UI

## Step 5: Use The Docs By Question Type

If your question is "What exists already?"

Read:

- [README.md](c:/Users/user/NestCraft/README.md)
- [roadmap.md](c:/Users/user/NestCraft/docs/roadmap.md)

If your question is "How does this endpoint work?"

Read the matching backend route doc in [docs/backend](c:/Users/user/NestCraft/docs/backend).

If your question is "How does this page behave?"

Read the matching frontend page doc in [docs/frontend](c:/Users/user/NestCraft/docs/frontend).

If your question is "What shared rules apply everywhere?"

Read:

- [request-validation-and-authorization.md](c:/Users/user/NestCraft/docs/backend/request-validation-and-authorization.md)
- [api-error-handling.md](c:/Users/user/NestCraft/docs/frontend/api-error-handling.md)

If your question is "What should I work on next?"

Read:

- [roadmap.md](c:/Users/user/NestCraft/docs/roadmap.md)

If your question is "How do I configure or deploy this app?"

Read:

- [deployment.md](c:/Users/user/NestCraft/docs/deployment.md)
- [api-integration.md](c:/Users/user/NestCraft/docs/frontend/api-integration.md)

## Step 6: Read Shared Docs Before Editing Shared Behavior

Before changing anything cross-cutting, read the shared docs first.

Examples:

Before changing backend validation:

- read [request-validation-and-authorization.md](c:/Users/user/NestCraft/docs/backend/request-validation-and-authorization.md)

Before changing API error behavior:

- read [api-error-handling.md](c:/Users/user/NestCraft/docs/frontend/api-error-handling.md)

Before changing order status behavior:

- read [admin-orders-backend.md](c:/Users/user/NestCraft/docs/backend/admin-orders-backend.md)
- read [order-status-enum.md](c:/Users/user/NestCraft/docs/backend/order-status-enum.md)

Before changing live order freshness behavior:

- read [order-live-updates.md](c:/Users/user/NestCraft/docs/backend/order-live-updates.md)
- read [order-live-updates.md](c:/Users/user/NestCraft/docs/frontend/order-live-updates.md)

Before changing runtime configuration or deploy behavior:

- read [deployment.md](c:/Users/user/NestCraft/docs/deployment.md)
- read [api-integration.md](c:/Users/user/NestCraft/docs/frontend/api-integration.md)

This avoids making a local change that breaks a broader project convention.

## Step 7: Use The Docs To Locate Code Faster

These docs are not meant to replace reading the code.

They are meant to help you find the right code faster.

Each doc usually tells you:

- which files are involved
- which layer owns what
- what assumptions the code is making

So the normal workflow should be:

1. read the relevant doc
2. jump into the linked files
3. inspect the actual code
4. make or review the change

That is faster than searching the whole repo blindly.

## Step 8: Do Not Treat Old Assumptions As Current Truth

Always prefer:

- the root README
- the roadmap
- the most recently updated feature docs

over vague memory or older assumptions.

The project evolved step by step, so some earlier design intentions were replaced by later implementation details.

The docs are useful specifically because they were written to reflect the current state, not only the original plans.

## Recommended Reading Paths

### Fast orientation path

Use this if you are brand new:

1. [README.md](c:/Users/user/NestCraft/README.md)
2. [roadmap.md](c:/Users/user/NestCraft/docs/roadmap.md)
3. [README.md](c:/Users/user/NestCraft/docs/backend/README.md)
4. [README.md](c:/Users/user/NestCraft/docs/frontend/README.md)

### Backend contributor path

1. [README.md](c:/Users/user/NestCraft/README.md)
2. [roadmap.md](c:/Users/user/NestCraft/docs/roadmap.md)
3. [README.md](c:/Users/user/NestCraft/docs/backend/README.md)
4. shared backend docs
5. feature-specific backend docs

### Frontend contributor path

1. [README.md](c:/Users/user/NestCraft/README.md)
2. [roadmap.md](c:/Users/user/NestCraft/docs/roadmap.md)
3. [README.md](c:/Users/user/NestCraft/docs/frontend/README.md)
4. shared frontend docs
5. feature-specific frontend docs

### End-to-end feature understanding path

1. [roadmap.md](c:/Users/user/NestCraft/docs/roadmap.md)
2. backend doc for the feature
3. frontend doc for the feature
4. related shared docs

### Deployment and runtime path

1. [README.md](c:/Users/user/NestCraft/README.md)
2. [roadmap.md](c:/Users/user/NestCraft/docs/roadmap.md)
3. [deployment.md](c:/Users/user/NestCraft/docs/deployment.md)
4. [api-integration.md](c:/Users/user/NestCraft/docs/frontend/api-integration.md)

## Short Version

If you want the shortest useful rule:

1. read [README.md](c:/Users/user/NestCraft/README.md)
2. read [roadmap.md](c:/Users/user/NestCraft/docs/roadmap.md)
3. read [deployment.md](c:/Users/user/NestCraft/docs/deployment.md) if your work touches runtime setup
4. choose backend or frontend
5. read that folder's README
6. read only the docs for the feature you are touching

That is the correct way to read this project's documentation without getting lost.
