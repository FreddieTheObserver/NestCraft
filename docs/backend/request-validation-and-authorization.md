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
- `requireAdmin` for admin-only routes

Before this change, controllers were manually checking request fields and returning ad hoc `{ message: "..." }` responses.

After this change, routes reject bad requests earlier and controllers focus on business logic.

## Why This Was Necessary

Before this hardening pass, the codebase had three recurring problems:

- request-shape checks were duplicated inside controllers
- error responses were inconsistent across endpoints
- authorization logic was not strong enough for incoming admin features

That was still manageable while the project had only public product reads and basic auth. It becomes much more expensive once admin CRUD endpoints are introduced.

This pass fixed the API contract before the backend surface area grows further.

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

It also makes debugging easier because every controller now returns the same outer structure on failure.

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

Conceptually, the request flow is now:

1. route receives request
2. `validate(...)` parses body and/or params
3. invalid input is rejected immediately
4. controller receives already-validated data
5. controller calls service layer

That is the correct separation.

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
- `productIdParamsSchema`
- `createProductSchema`
- `updateProductSchema`

This validates:

- presence of the slug
- URL-safe slug format
- numeric product IDs
- admin product create payloads
- admin product patch payloads

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

```ts
productRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  validate({ body: createProductSchema }),
  createProductHandler,
);
```

```ts
productRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validate({ params: productIdParamsSchema, body: updateProductSchema }),
  updateProductHandler,
);
```

This means invalid requests never reach the controller.

That is a major quality improvement over the earlier controller-first validation pattern.

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

The important design point is that identity and authorization are separate checks:

- `requireAuth` proves the request belongs to a logged-in user
- `requireAdmin` proves that logged-in user has the right role

That separation keeps the middleware reusable.

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

Examples of checks that no longer belong in controllers:

- `if (!email || !password)`
- `if (!shippingName || !Array.isArray(items))`
- `if (!slug)`

Those are now route-contract concerns, not controller concerns.

Examples of errors that still belong in controllers:

- duplicate email
- invalid credentials
- missing category
- duplicate slug
- insufficient stock

Those are business or service errors, not request-shape errors.

## Why This Was Worth Doing Before Admin Features

Admin features would otherwise multiply the current problems:

- repeated validation logic
- inconsistent error responses
- missing authorization boundaries

Doing this first gives the backend a cleaner contract before more CRUD endpoints are added.

## What The Frontend Gains From This

This change was not only for backend cleanliness.

Because the API now returns a consistent error envelope, the frontend can:

- surface real validation messages
- distinguish validation failures from business-rule failures
- reuse one error-reader helper across multiple services

That is why this hardening pass also improved the user-facing error experience.

## Example Failure Categories

### Validation failure

Example:

- missing `password` on login
- malformed `slug` in product detail route

Expected code:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed"
  }
}
```

### Authorization failure

Example:

- no bearer token
- customer trying to call admin product create

Expected codes:

- `UNAUTHORIZED`
- `INVALID_TOKEN`
- `FORBIDDEN`

### Business-rule failure

Example:

- duplicate product slug
- duplicate email
- insufficient stock

These are valid requests structurally, but the requested action violates application rules.

## What Success Looks Like

This hardening pass is complete when:

- bad auth payloads fail in middleware, not controllers
- bad checkout payloads fail in middleware, not controllers
- invalid product slugs fail in middleware
- all controller errors use the shared `error` response format
- `requireAdmin` returns `403` for non-admin users
- frontend services can surface the returned error messages accurately
