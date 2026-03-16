# Request Validation And Authorization

This document covers the validation and authorization hardening added to the backend before admin features.

## Goal

Move request-shape validation out of controllers, standardize API error responses, and prepare the backend for admin-only routes.

## Files Involved

- [validate.ts](c:/Users/user/NestCraft/server/src/middleware/validate.ts)
- [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts)
- [http.ts](c:/Users/user/NestCraft/server/src/utils/http.ts)
- [authSchemas.ts](c:/Users/user/NestCraft/server/src/validation/authSchemas.ts)
- [orderSchemas.ts](c:/Users/user/NestCraft/server/src/validation/orderSchemas.ts)
- [productSchemas.ts](c:/Users/user/NestCraft/server/src/validation/productSchemas.ts)
- [auth.ts](c:/Users/user/NestCraft/server/src/routes/auth.ts)
- [order.ts](c:/Users/user/NestCraft/server/src/routes/order.ts)
- [product.ts](c:/Users/user/NestCraft/server/src/routes/product.ts)

## What Changed

The backend now has:

- route-level request validation using `zod`
- a shared JSON error format through `sendError(...)`
- `requireAuth` for authenticated routes
- `requireAdmin` for future admin-only routes

Before this change, controllers were manually checking request fields and returning ad hoc `{ message: "..." }` responses.

After this change, routes reject bad requests earlier and controllers focus on business logic.

## Shared Error Format

The helper in [http.ts](c:/Users/user/NestCraft/server/src/utils/http.ts) standardizes error responses.

Current format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "issues": [
        {
          "path": "email",
          "message": "Email must be valid"
        }
      ]
    }
  }
}
```

This matters because the frontend can now parse one consistent error shape across auth, products, and orders.

## Validation Middleware

The middleware in [validate.ts](c:/Users/user/NestCraft/server/src/middleware/validate.ts) accepts optional schemas for:

- `body`
- `params`

It parses the request with `zod` before the controller runs.

If parsing fails:

- the request is rejected with `400`
- the response uses `code: "VALIDATION_ERROR"`
- the response includes field-level issue details

This is the key architectural change in the validation pass.

## Schemas Added

### Auth

In [authSchemas.ts](c:/Users/user/NestCraft/server/src/validation/authSchemas.ts):

- `registerSchema`
- `loginSchema`

These validate:

- required fields
- email format
- password length

### Orders

In [orderSchemas.ts](c:/Users/user/NestCraft/server/src/validation/orderSchemas.ts):

- `createOrderSchema`

This validates:

- shipping fields
- notes length
- order item shape
- minimum quantity
- at least one item in the order

### Products

In [productSchemas.ts](c:/Users/user/NestCraft/server/src/validation/productSchemas.ts):

- `productSlugParamsSchema`

This validates:

- presence of the slug
- URL-safe slug format

## Route-Level Usage

Validation is now wired directly into the route layer.

Examples:

```ts
authRouter.post("/register", validate({ body: registerSchema }), register);
authRouter.post("/login", validate({ body: loginSchema }), login);
```

```ts
orderRouter.post("/", requireAuth, validate({ body: createOrderSchema }), createOrderHandler);
```

```ts
productRouter.get("/:slug", validate({ params: productSlugParamsSchema }), getProduct);
```

This means invalid requests never reach the controller.

## Authorization Middleware

The authorization layer in [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts) now has two responsibilities:

### `requireAuth`

Reject requests without a valid bearer token.

Failure cases:

- missing token -> `401 UNAUTHORIZED`
- invalid token -> `401 INVALID_TOKEN`

### `requireAdmin`

Reject authenticated users who are not admins.

Failure case:

- non-admin user -> `403 FORBIDDEN`

This middleware is the foundation for admin product routes and admin order management later.

## Controller Cleanup

Controllers were simplified after validation moved to the route layer.

That means:

- no more repeated `if (!email || !password)` checks in auth controllers
- no more repeated request-shape checks in the order controller
- no more manual slug validation in the product controller

Controllers now focus on:

- calling the service layer
- mapping business errors to HTTP responses
- returning success data

## Why This Was Worth Doing Before Admin Features

Admin features would otherwise multiply the current problems:

- repeated validation logic
- inconsistent error responses
- missing authorization boundaries

Doing this first gives the backend a cleaner contract before more CRUD endpoints are added.

## What Success Looks Like

This hardening pass is complete when:

- bad auth payloads fail in middleware, not controllers
- bad checkout payloads fail in middleware, not controllers
- invalid product slugs fail in middleware
- all controller errors use the shared `error` response format
- `requireAdmin` returns `403` for non-admin users
