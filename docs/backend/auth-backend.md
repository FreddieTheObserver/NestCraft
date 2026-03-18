# Backend Authentication

This document explains the current backend authentication implementation for `NestCraft`.

The auth stack is:

- Express
- TypeScript
- Prisma
- PostgreSQL
- `bcryptjs`
- `jsonwebtoken`
- route-level request validation with `zod`

This is no longer just a plan. It describes the authentication code that currently exists in the backend.

## Goal

The purpose of backend auth in this project is to establish user identity and make authorization possible.

Current backend auth scope includes:

1. user registration
2. user login
3. password hashing
4. JWT issuance
5. authenticated route protection
6. admin-only authorization support

That foundation is what enabled:

- protected checkout
- user-specific order history
- admin-only product management routes

## Why Auth Came When It Did

Auth was not the first feature in the project.

The app intentionally started with:

- database setup
- seeded products
- public product endpoints
- storefront product pages
- a local cart

That sequence was correct because browsing a catalog does not require accounts.

Auth came next when the application needed:

- order ownership
- protected flows
- user identity
- admin permissions

That timing kept early momentum high while avoiding premature security complexity.

## Files Involved

Database and configuration:

- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)
- [.env](c:/Users/user/NestCraft/server/.env)
- [env.ts](c:/Users/user/NestCraft/server/src/config/env.ts)

Auth implementation:

- [authService.ts](c:/Users/user/NestCraft/server/src/services/authService.ts)
- [authController.ts](c:/Users/user/NestCraft/server/src/controllers/authController.ts)
- [auth.ts](c:/Users/user/NestCraft/server/src/routes/auth.ts)
- [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts)

Validation and shared response helpers:

- [authSchemas.ts](c:/Users/user/NestCraft/server/src/validation/authSchemas.ts)
- [validate.ts](c:/Users/user/NestCraft/server/src/middleware/validate.ts)
- [http.ts](c:/Users/user/NestCraft/server/src/utils/http.ts)

App wiring:

- [app.ts](c:/Users/user/NestCraft/server/src/app.ts)

## User Model

The `User` model is defined in [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma).

Key fields:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `orders`
- `createdAt`
- `updatedAt`

Important rules:

- `email` is unique
- raw passwords are never stored
- `role` defaults to `"customer"`

That last field is what later made `requireAdmin` possible without redesigning the model.

## Database Step

The authentication feature required a Prisma migration that added the `User` table.

Typical commands:

```bash
npx prisma migrate dev --name add-user-auth
npx prisma generate
```

That created the model in PostgreSQL and refreshed generated Prisma types.

## Packages Used

Runtime packages:

```bash
npm install bcryptjs jsonwebtoken
```

Type support:

```bash
npm install -D @types/jsonwebtoken
```

Why they are used:

- `bcryptjs`
  - hashes passwords during register
  - compares candidate passwords during login
- `jsonwebtoken`
  - signs JWTs
  - verifies bearer tokens in middleware

## Environment Variables

Backend auth depends on `JWT_SECRET` in [server/.env](c:/Users/user/NestCraft/server/.env).

That secret is used in two places:

- token signing
- token verification

It must live in environment configuration, not in the source code.

## Auth Architecture

The current auth layer follows the same separation pattern used elsewhere in the project:

- route
- controller
- service
- middleware

Each layer has a different responsibility.

### Route responsibility

[auth.ts](c:/Users/user/NestCraft/server/src/routes/auth.ts) defines the public auth endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`

These routes also attach validation middleware before controller execution.

### Controller responsibility

[authController.ts](c:/Users/user/NestCraft/server/src/controllers/authController.ts) handles HTTP concerns:

- read already-validated input
- call the service
- translate known service failures into status codes
- return JSON

It does not:

- hash passwords
- talk to Prisma directly for auth logic
- parse bearer tokens

### Service responsibility

[authService.ts](c:/Users/user/NestCraft/server/src/services/authService.ts) owns auth business logic:

- find user by email
- detect duplicate email
- hash password
- compare password hashes
- sign JWTs
- shape the safe response object

### Middleware responsibility

[authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts) owns request-time token checks and authorization checks.

That separation is important. It keeps controller code thin and makes auth reusable across many routes.

## Register Flow

The current register flow is:

1. request hits `POST /api/auth/register`
2. `validate({ body: registerSchema })` checks the body shape
3. controller receives validated `name`, `email`, and `password`
4. controller calls `registerUser(...)`
5. service checks whether the email already exists
6. service hashes the password with bcrypt
7. service creates the user
8. service signs a JWT
9. controller returns safe user data plus token

This means that by the time the service runs, the request shape is already trusted. The service only has to care about business rules, not whether `email` is missing.

## Login Flow

The current login flow is:

1. request hits `POST /api/auth/login`
2. route-level validation checks `email` and `password`
3. controller calls `loginUser(...)`
4. service looks up the user by email
5. service compares the incoming password to `passwordHash`
6. if valid, service signs a JWT
7. controller returns safe user data plus token

If credentials are invalid:

- the service throws `INVALID_CREDENTIALS`
- the controller maps that to `401`

## Password Hashing

Passwords are never stored directly.

The register path uses bcrypt to convert the raw password into a hash before it is written to PostgreSQL.

The login path never compares raw strings against the database. It compares the submitted password against the stored hash.

This is baseline security behavior. It is not optional.

## JWT Design

The auth service signs a token that currently contains:

- `userId`
- `role`

This is enough for the current project stage because the backend needs to know:

- who the user is
- whether the user is an admin

The token currently expires after seven days.

This is a practical tradeoff for the current implementation. The project does not yet implement refresh tokens or server-side token revocation.

## Safe Response Shape

Successful register and login responses return this shape:

```json
{
  "user": {
    "id": 1,
    "name": "Jane",
    "email": "jane@example.com",
    "role": "customer"
  },
  "token": "..."
}
```

This shape matters because the frontend auth context depends on it directly.

What is intentionally excluded:

- `passwordHash`

The backend should never return it.

## Route-Level Validation

Auth request validation now happens at the route level with `zod`.

That is a meaningful improvement over the earlier controller-heavy approach.

Validation now checks things like:

- name length
- valid email format
- minimum password length

Because the route validates input first, the controller no longer needs repetitive checks such as:

- `if (!email || !password)`
- `if (!name || !email || !password)`

That work now belongs to the validation layer, not the controller.

## Shared Error Format

Auth errors now use the shared API error format from [http.ts](c:/Users/user/NestCraft/server/src/utils/http.ts).

Example:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid credentials"
  }
}
```

This matters because the frontend can now parse and show backend messages consistently instead of flattening everything into generic failure text.

## Auth Middleware

[authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts) provides two important middleware functions.

### `requireAuth`

This middleware:

- reads the `Authorization` header
- expects `Bearer <token>`
- verifies the JWT
- attaches the decoded payload to `req.user`

Failure cases:

- missing header or wrong prefix -> `401`
- invalid or expired token -> `401`

### `requireAdmin`

This middleware assumes `requireAuth` has already run.

It checks:

- whether `req.user` exists
- whether `req.user.role === "admin"`

Failure cases:

- no authenticated user -> `401`
- authenticated but not admin -> `403`

This is what currently protects the admin product write endpoints.

## Role Changes And Token Refresh

One practical detail matters here:

If you change a user's `role` manually in the database from `customer` to `admin`, the old JWT does not update automatically.

The user must log in again so a new token is issued with the new `role` value.

Why:

- the middleware reads the role from the token payload
- it does not re-read the user row from the database on every request

This behavior matters when testing admin-only routes.

## What Backend Auth Enables

Once backend auth existed, the project could safely support:

- protected checkout
- order ownership
- `/api/orders/me`
- admin-only product creation and updates

That made auth one of the structural turning points in the backend.

## What Backend Auth Does Not Do Yet

The current backend auth implementation does not yet include:

- refresh tokens
- password reset
- email verification
- OAuth providers
- server-side logout or token revocation

Those are legitimate future features, but they were correctly deferred because they are not required for the current application stage.

## Status Behavior

Expected auth status behavior:

- `201` for successful register
- `200` for successful login
- `400` for validation failure
- `401` for invalid credentials
- `409` for duplicate email
- `500` for unexpected server failure

## Testing

Register:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secret123"}'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'
```

Protected route verification:

```http
GET /api/orders/me
Authorization: Bearer <token>
```

Admin verification:

- promote a user to `admin` in the database
- log in again
- call an admin-only route such as `POST /api/products`

## What Success Looks Like

Backend auth is working when:

- the `User` table exists
- password hashes are stored instead of raw passwords
- register creates new users
- login issues tokens
- duplicate email is blocked
- wrong credentials are rejected
- protected routes require valid bearer tokens
- admin routes reject non-admin users

## Why This Layer Matters

The backend catalog made the storefront possible.

The backend auth layer made the storefront accountable.

It is the point where the app stopped being just public product browsing and became a system with:

- user identity
- protected purchase flow
- owned orders
- controlled admin actions

That is why this part of the backend is foundational rather than optional.
