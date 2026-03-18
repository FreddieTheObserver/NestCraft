# NestCraft

NestCraft is a full-stack ecommerce practice project built with a React frontend and an Express + Prisma backend.

The project currently includes:

- public product catalog
- slug-based product detail pages
- local cart with `localStorage` persistence
- register/login/logout
- protected checkout flow
- order creation and order history
- backend validation and role-aware authorization
- admin-only backend product write endpoints
- frontend admin product management
- backend admin order management
- frontend admin order management
- browse/search/filter improvements
- enum-backed order status model

## Stack

Frontend:

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS

Backend:

- Express
- TypeScript
- Prisma
- PostgreSQL
- `bcryptjs`
- `jsonwebtoken`
- `zod`

## Current Feature Status

Implemented:

- database setup with Prisma migrations and seed data
- `GET /api/products`
- `GET /api/products/:slug`
- products page
- product detail page
- local cart
- basic auth
- `POST /api/orders`
- `GET /api/orders/me`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- backend request validation
- `requireAuth`
- `requireAdmin`
- admin-only backend product endpoints
- frontend admin products UI
- frontend admin orders UI
- products page search/category/sort controls
- Prisma enum-backed order status

Next likely step:

- order detail page

For a more detailed project status, see [roadmap.md](c:/Users/user/NestCraft/docs/roadmap.md).

## Repository Structure

```text
NestCraft/
  client/   React frontend
  server/   Express + Prisma backend
  docs/     project documentation
```

## Getting Started

### 1. Install dependencies

In one terminal:

```bash
cd server
npm install
```

In another terminal:

```bash
cd client
npm install
```

### 2. Configure environment variables

Create or update [server/.env](c:/Users/user/NestCraft/server/.env) with at least:

```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_here
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

The backend expects a working PostgreSQL database before migrations or seed commands are run.

### 3. Run Prisma migration and seed

From [server](c:/Users/user/NestCraft/server):

```bash
npx prisma migrate dev
npx prisma generate
npm run seed
```

If you want to inspect data manually:

```bash
npx prisma studio
```

### 4. Run the backend

From [server](c:/Users/user/NestCraft/server):

```bash
npm run dev
```

### 5. Run the frontend

From [client](c:/Users/user/NestCraft/client):

```bash
npm run dev
```

Default local URLs:

- frontend: `http://localhost:5173`
- backend: `http://localhost:5000`

## Main Scripts

Backend scripts in [server/package.json](c:/Users/user/NestCraft/server/package.json):

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run seed`

Frontend scripts in [client/package.json](c:/Users/user/NestCraft/client/package.json):

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Important Backend Routes

Public:

- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/categories`
- `POST /api/auth/register`
- `POST /api/auth/login`

Authenticated:

- `POST /api/orders`
- `GET /api/orders/me`

Admin-only:

- `GET /api/admin/products`
- `GET /api/admin/orders`
- `POST /api/products`
- `PATCH /api/products/:id`
- `PATCH /api/products/:id/deactivate`
- `PATCH /api/admin/orders/:id/status`

## Documentation Map

Top-level project status:

- [how-to-read-the-docs.md](c:/Users/user/NestCraft/docs/how-to-read-the-docs.md)
- [roadmap.md](c:/Users/user/NestCraft/docs/roadmap.md)

Backend notes:

- [README.md](c:/Users/user/NestCraft/docs/backend/README.md)
- [admin-read-endpoints.md](c:/Users/user/NestCraft/docs/backend/admin-read-endpoints.md)
- [admin-orders-backend.md](c:/Users/user/NestCraft/docs/backend/admin-orders-backend.md)
- [order-status-enum.md](c:/Users/user/NestCraft/docs/backend/order-status-enum.md)
- [database-setup-and-seeding.md](c:/Users/user/NestCraft/docs/backend/database-setup-and-seeding.md)
- [products-api.md](c:/Users/user/NestCraft/docs/backend/products-api.md)
- [product-detail-api.md](c:/Users/user/NestCraft/docs/backend/product-detail-api.md)
- [auth-backend.md](c:/Users/user/NestCraft/docs/backend/auth-backend.md)
- [checkout-order-endpoint.md](c:/Users/user/NestCraft/docs/backend/checkout-order-endpoint.md)
- [orders-history-api.md](c:/Users/user/NestCraft/docs/backend/orders-history-api.md)
- [request-validation-and-authorization.md](c:/Users/user/NestCraft/docs/backend/request-validation-and-authorization.md)
- [admin-product-endpoints.md](c:/Users/user/NestCraft/docs/backend/admin-product-endpoints.md)

Frontend notes:

- [README.md](c:/Users/user/NestCraft/docs/frontend/README.md)
- [admin-orders-ui.md](c:/Users/user/NestCraft/docs/frontend/admin-orders-ui.md)
- [admin-products-ui.md](c:/Users/user/NestCraft/docs/frontend/admin-products-ui.md)
- [api-integration.md](c:/Users/user/NestCraft/docs/frontend/api-integration.md)
- [api-error-handling.md](c:/Users/user/NestCraft/docs/frontend/api-error-handling.md)
- [products-page.md](c:/Users/user/NestCraft/docs/frontend/products-page.md)
- [product-detail-page.md](c:/Users/user/NestCraft/docs/frontend/product-detail-page.md)
- [local-cart.md](c:/Users/user/NestCraft/docs/frontend/local-cart.md)
- [auth-frontend.md](c:/Users/user/NestCraft/docs/frontend/auth-frontend.md)
- [orders-page.md](c:/Users/user/NestCraft/docs/frontend/orders-page.md)

## Development Notes

- The cart is currently frontend-local and persisted in `localStorage`.
- Authentication uses JWTs and role-aware middleware on the backend.
- Order totals are calculated on the server, not trusted from the frontend.
- Order status is enforced by a Prisma/PostgreSQL enum and still validated at the request layer.
- Product soft delete is implemented with `isActive`.
- Reactivation currently happens through the generic update endpoint by sending `{ "isActive": true }`.
- Public catalog browsing now uses query params for `search`, `category`, and `sort`.

## Current Workflow Recommendation

Use small feature branches and ship one vertical slice at a time:

1. define the route and data contract
2. build the backend path
3. test the endpoint
4. build the frontend page or component
5. connect loading, error, and empty states
6. document the slice

That pattern matches how the project has been built so far.
