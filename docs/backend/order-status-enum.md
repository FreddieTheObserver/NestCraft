# Order Status Enum Migration

This document explains the order-status enum refactor in `NestCraft`.

The goal of this change was to stop treating order status as a loose database string and move it to a stricter model enforced by:

- Prisma schema typing
- PostgreSQL enum constraints
- generated TypeScript types

This was done after the admin-order backend endpoints were in place, but before the frontend admin-orders UI was built. That timing matters because it prevents raw string status values from spreading further across the codebase.

## Why The Change Was Needed

Before this refactor, `Order.status` was a plain string column.

That meant:

- the route validator limited status values at the HTTP layer
- but the database itself still accepted the column as generic text
- backend service signatures also treated status more loosely than necessary

The application was functionally safe enough because validation already existed, but the data model was still weaker than it should have been.

That created three problems:

1. the schema did not express the real allowed values
2. Prisma could not generate a stronger type for order status
3. future frontend and backend code would keep repeating raw string unions

The enum refactor fixed that.

## Final Status Model

The Prisma schema now defines:

[schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)

```prisma
enum OrderStatus {
  pending
  confirmed
  cancelled
}

model Order {
  status OrderStatus @default(pending)
}
```

So the status contract is now explicit at the schema level:

- `pending`
- `confirmed`
- `cancelled`

## Why This Is Better

Moving to a Prisma enum gives the project three separate protections:

1. request validation
2. compile-time typing
3. database enforcement

Request validation still rejects bad HTTP input early.

Prisma now generates a backend `OrderStatus` type, so services and controllers no longer have to accept a generic `string`.

PostgreSQL now enforces that only allowed status values can live in the `Order.status` column.

That is a stronger contract than a text column plus controller discipline.

## Safe Migration Strategy

This migration was not allowed to wipe existing data.

The default Prisma-generated migration path tried to drop and recreate the `status` column, which would have caused data loss for existing orders. That was explicitly rejected.

Instead, the migration was created and then edited manually to perform an in-place cast.

The applied migration is:

[migration.sql](c:/Users/user/NestCraft/server/prisma/migrations/20260318093000_convert_order_status_to_enum/migration.sql)

```sql
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Order"
ALTER COLUMN "status" TYPE "OrderStatus"
USING ("status"::"OrderStatus");

ALTER TABLE "Order"
ALTER COLUMN "status" SET DEFAULT 'pending';
```

## Why The Migration Is Safe

This SQL does not drop the `status` column.

It performs an in-place conversion:

1. create the enum type
2. temporarily remove the old default
3. cast existing text values into the enum
4. restore the default as the enum-backed `pending`

That means existing rows are preserved as long as their stored values already match the allowed enum values.

## Pre-Migration Safety Check

Before the migration was applied, the existing data had to be checked.

The important question was:

Do all current orders use only these values?

- `pending`
- `confirmed`
- `cancelled`

If any other value existed, the cast would fail.

That is why status values were checked first. Only after confirming the current data was compatible was the migration applied.

## Backend Type Changes

After Prisma client generation, the backend stopped using loose string status typing in the admin-order update path.

### Service layer

[orderService.ts](c:/Users/user/NestCraft/server/src/services/orderService.ts)

`updateOrderStatus(...)` now accepts Prisma `OrderStatus` instead of plain `string`.

That matters because the service contract now matches the database contract.

### Controller layer

[orderController.ts](c:/Users/user/NestCraft/server/src/controllers/orderController.ts)

`updateOrderStatusHandler(...)` now types the request body with Prisma `OrderStatus`.

That means the controller, service, and schema now all agree on the same status model.

## Frontend Type Changes

The frontend does not import Prisma types directly, so it now uses a local union type.

[orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts)

```ts
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled'
```

And `OrderResponse.status` now uses that union instead of a generic string.

This keeps the frontend typed without creating a cross-project shared type dependency between client and server.

## Why Route Validation Still Remains

The enum migration did not replace request validation.

[orderSchemas.ts](c:/Users/user/NestCraft/server/src/validation/orderSchemas.ts) still validates:

```ts
z.enum(["pending", "confirmed", "cancelled"])
```

That is still correct because:

- invalid HTTP payloads should fail before controller logic runs
- validation errors should return clean `400` responses
- database constraints should not be the first layer handling bad requests

The validator and the enum solve different problems.

## What This Change Improves For The Next Slice

This refactor was done before the frontend admin-orders UI on purpose.

That timing avoids:

- spreading raw string literals across more frontend files
- duplicating weak status typing in admin components
- having to refactor both UI and backend status handling at the same time later

The next admin-orders UI can now rely on a cleaner backend contract.

## Scope Boundary

This refactor intentionally did not do more than it needed to.

It did not:

- redesign the order lifecycle
- add more statuses
- add status-history tracking
- change customer-facing order behavior

It only tightened the status model from string to enum.

That narrow scope was the right choice because it reduced migration risk and kept the branch easy to reason about.

## Verification

After the migration and type updates, the important checks were:

- Prisma migration applies successfully
- Prisma client regenerates successfully
- backend TypeScript check passes
- frontend TypeScript check passes
- admin order status update still works through `PATCH /api/admin/orders/:id/status`

That is the correct verification set for this refactor.

## Summary

The order-status enum migration changed the project from:

- validated string status at the HTTP layer only

to:

- validated request input
- enum-backed Prisma schema
- enum-backed PostgreSQL column
- stronger generated backend typing
- explicit frontend status union

This is a small refactor, but it materially improves the correctness of the order-management model.
