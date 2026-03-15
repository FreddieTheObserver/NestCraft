# Backend Authentication

This note documents the backend authentication implementation plan for `NestCraft`.

The backend auth flow is built with:

- `Prisma`
- `PostgreSQL`
- `bcryptjs`
- `jsonwebtoken`
- `Express`
- `TypeScript`

## Goal

Support the first secure account system for the app.

The backend auth scope includes:

1. register
2. login
3. JWT generation
4. protected route middleware

This is the minimum backend auth foundation needed before building frontend login and register pages.

## Why Auth Comes After Cart

The local cart can work entirely in the frontend.

Authentication comes next because it unlocks:

- customer accounts
- protected routes
- admin features later
- future order ownership
- future backend cart persistence if needed

## User Model

The first auth model is `User`.

Recommended fields:

- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

Important rules:

- `email` must be unique
- passwords must never be stored as plain text
- `role` should default to `"customer"`

## Files Involved

The backend auth implementation should use these files:

- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)
- [.env](c:/Users/user/NestCraft/server/.env)
- [env.ts](c:/Users/user/NestCraft/server/src/config/env.ts)
- [authService.ts](c:/Users/user/NestCraft/server/src/services/authService.ts)
- [authController.ts](c:/Users/user/NestCraft/server/src/controllers/authController.ts)
- [auth.ts](c:/Users/user/NestCraft/server/src/routes/auth.ts)
- [authMiddleware.ts](c:/Users/user/NestCraft/server/src/middleware/authMiddleware.ts)
- [app.ts](c:/Users/user/NestCraft/server/src/app.ts)

## Database Step

First, add the `User` model to Prisma.

Then run:

```bash
npx prisma migrate dev --name add-user-auth
npx prisma generate
```

Explanation:

- the migration creates the `User` table
- Prisma client generation refreshes the typed API

## Packages Required

Install:

```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/jsonwebtoken
```

Explanation:

- `bcryptjs` hashes and verifies passwords
- `jsonwebtoken` signs and verifies JWTs

## Environment Variables

Add this to [server/.env](c:/Users/user/NestCraft/server/.env):

```env
JWT_SECRET=replace_this_with_a_long_random_secret
```

Explanation:
The JWT secret is used to sign tokens and verify them later in middleware.

## Register Flow

The backend register flow should be:

1. receive `name`, `email`, and `password`
2. check if the email already exists
3. hash the password
4. create the user in the database
5. sign a JWT
6. return safe user data plus token

Important:

- return `passwordHash` never
- return only safe fields such as `id`, `name`, `email`, and `role`

## Login Flow

The backend login flow should be:

1. receive `email` and `password`
2. find the user by email
3. compare the incoming password with `passwordHash`
4. if valid, sign a JWT
5. return safe user data plus token

If credentials are invalid:

- return `401`

## Why Password Hashing Matters

Passwords should never be stored directly in PostgreSQL.

Instead:

- hash them with `bcryptjs`
- store the hash
- compare input passwords against the hash during login

This is a basic security requirement.

## Why JWT Is Used

JWT is used for the first auth implementation because it is:

- simple
- common in PERN apps
- easy to connect to a React frontend

The token should include a small payload such as:

- `userId`
- `role`

## Controller Responsibilities

The auth controller should:

- validate request body fields
- call the service
- return the appropriate status code
- translate service errors into useful API responses

Recommended status behavior:

- `201` for successful register
- `200` for successful login
- `400` for missing input
- `401` for invalid credentials
- `409` for duplicate email
- `500` for unexpected failures

## Service Responsibilities

The auth service should:

- interact with Prisma
- hash passwords
- compare password hashes
- sign JWTs
- return safe user + token data

This keeps controllers small and focused on HTTP handling.

## Route Responsibilities

The backend should expose:

```http
POST /api/auth/register
POST /api/auth/login
```

The route file should only map these paths to the controller functions.

## Auth Middleware

The auth middleware is for future protected routes.

Its job is:

1. read the `Authorization` header
2. check for `Bearer <token>`
3. verify the JWT
4. attach decoded user data to the request
5. reject invalid or missing tokens

This will later be used for:

- admin routes
- user account routes
- protected checkout steps

## Testing

After backend auth is written, test with:

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secret123"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'
```

## What Success Looks Like

Backend auth is considered ready when:

- the `User` table exists
- register works
- login works
- duplicate email is blocked
- wrong password is rejected
- JWT is returned
- password hashes are stored instead of raw passwords

## Next Step

After backend auth works, the next frontend auth slice should be:

- auth service
- auth context
- register page
- login page
- protected route component
