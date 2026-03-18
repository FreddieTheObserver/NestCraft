# Database Setup And Seeding

This document explains the database foundation for `NestCraft` and the seed process that made the first real storefront data available.

The backend stack for this part of the project is:

- PostgreSQL
- Prisma ORM
- Prisma migrations
- a TypeScript seed script

This setup came before the products API, product pages, auth, checkout, and order history. It is the first point where the project moved from static UI ideas to a real relational backend.

## Goal

The original goal of this stage was simple:

1. define the first catalog models
2. connect Prisma to PostgreSQL
3. generate a typed Prisma client
4. apply the first migration
5. seed development data

That gave the rest of the application something real to work against.

Without this stage, later features such as:

- `GET /api/products`
- `GET /api/products/:slug`
- the products page
- the product detail page
- local cart entry points

would have had to rely on mock data instead of the database.

## Files Involved

Main files:

- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)
- [seed.ts](c:/Users/user/NestCraft/server/prisma/seed.ts)
- [prisma.config.ts](c:/Users/user/NestCraft/server/prisma.config.ts)
- [package.json](c:/Users/user/NestCraft/server/package.json)
- [.env](c:/Users/user/NestCraft/server/.env)

Related runtime usage:

- [prisma.ts](c:/Users/user/NestCraft/server/src/lib/prisma.ts)
- [generated/prisma](c:/Users/user/NestCraft/server/src/generated/prisma)

## Why Prisma Was A Good Fit

Prisma was a strong choice here because the project data is relational from the start.

Even in the early catalog phase, the domain already had clear relationships:

- one category has many products
- one product belongs to one category

Later the schema grew naturally into:

- one user has many orders
- one order has many order items
- one product can appear in many order items

Prisma helps with that because it provides:

- one schema file for the data model
- generated TypeScript types
- migration support
- a typed query API inside the app

That combination is especially useful in a TypeScript ecommerce project where API shapes and database shapes need to stay aligned.

## Prisma 7 Project-Specific Setup

This project uses Prisma 7, and that matters because many older tutorials still show an older datasource pattern.

In this project:

- the `datasource` block in [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma) does not declare `url = env("DATABASE_URL")`
- connection configuration is handled through [prisma.config.ts](c:/Users/user/NestCraft/server/prisma.config.ts)
- the runtime client is created with the PostgreSQL adapter

That difference caused a real setup issue early on, so it is worth documenting clearly.

If someone copies an older Prisma example into this codebase, they can easily end up fighting the tool instead of following the project's actual configuration.

## Current Schema Context

The database has grown since the first seed was introduced.

Current Prisma models include:

- `User`
- `Category`
- `Product`
- `Order`
- `OrderItem`

But the seed script is still focused on catalog bootstrapping, not full application state.

It currently seeds:

- categories
- products

It does not seed:

- users
- orders
- order items

That is the right choice for now. Seed data is mainly there to bootstrap storefront development and testing, not to simulate production account or order history behavior.

## First Catalog Models

The first two models were:

- `Category`
- `Product`

These were enough to support:

- a real storefront listing
- category labels in the UI
- detail pages by slug
- featured products
- stock counts
- active/inactive storefront visibility

This was the correct starting boundary because it solved the catalog problem without pulling in authentication or checkout complexity too early.

## Initial Relationship Design

The first relationship was one-to-many:

- one `Category` has many `Product`s
- one `Product` belongs to one `Category`

That was intentionally simple.

Why that mattered:

- the catalog needed clear grouping
- the frontend needed category information in product responses
- it avoided premature complexity like many-to-many tagging or nested category trees

This relationship is still central to the storefront today because the product list and product detail endpoints both include category data.

## Environment Variables

Database access depends on [server/.env](c:/Users/user/NestCraft/server/.env).

Important variables include:

- `DATABASE_URL`
- `PORT`
- `CLIENT_ORIGIN`

For this stage, `DATABASE_URL` is the critical one.

If it is wrong, Prisma cannot:

- validate the schema against the database
- run migrations
- generate against the expected environment
- execute the seed script correctly

## Why The Seed Script Exists

The seed script in [seed.ts](c:/Users/user/NestCraft/server/prisma/seed.ts) exists to create a predictable development catalog.

That matters because it removes a large amount of setup friction:

- no manual insert statements
- no hand-entering categories or products through Studio
- no frontend waiting on fake placeholders

It also creates stable, known entities such as:

- `oak-bedside-lamp`
- `ceramic-table-vase`
- `linen-cushion-cover`

Those slugs became useful across the stack for:

- detail page routing
- API testing
- early manual QA

## How The Seed Script Works

The current seed flow is:

1. create a Prisma client using the PostgreSQL adapter
2. delete all existing products
3. delete all existing categories
4. create catalog categories
5. create products with `createMany`
6. disconnect the Prisma client

The delete order matters.

Products must be deleted before categories because:

- `Product` has a foreign key to `Category`
- deleting categories first would violate the relation

That is a simple but important example of how relational constraints shape even development scripts.

## Seed Data Shape

The current seed creates categories such as:

- `Lighting`
- `Decor`
- `Storage`

And products such as:

- `Oak Bedside Lamp`
- `Ceramic Table Vase`
- `Linen Cushion Cover`
- `Bamboo Storage Basket`
- `Modular Shelf Bin`

These are enough to support:

- a multi-card storefront grid
- featured and non-featured product display
- several categories in the collection snapshot
- multiple detail pages by slug
- meaningful cart and checkout testing

The dataset is intentionally small. The goal is not to simulate a production catalog. The goal is to provide a stable, readable development catalog.

## Price Storage And Decimal Usage

Product price is stored as `Decimal` in Prisma.

That is important because ecommerce pricing should not use floating-point storage.

Why:

- floats are vulnerable to precision errors
- totals and subtotals need predictable arithmetic
- order snapshots should preserve accurate price values

In the seed script, prices are passed as strings such as:

- `"49.99"`
- `"34.50"`
- `"19.99"`

That is the normal safe pattern when Prisma fields are `Decimal`.

## Commands Used

Generate the Prisma client:

```bash
npx prisma generate
```

Create and apply the initial migration:

```bash
npx prisma migrate dev --name init-product-category
```

Run the seed:

```bash
npm run seed
```

Inspect the data manually:

```bash
npx prisma studio
```

Useful validation step:

```bash
npx prisma validate
```

## Common Errors Encountered During Setup

### Misspelled environment variable

An early failure came from a misspelled database env name such as `DATABAE_URL`.

This kind of error is easy to overlook because it looks close enough to the correct value to pass casual review.

### Using older Prisma datasource syntax

Trying to use older Prisma examples inside `schema.prisma` caused configuration errors because this project is wired for Prisma 7's current pattern.

### Seeding before migrating

The seed script cannot create catalog rows if the underlying tables do not exist yet.

That means the correct order is:

1. validate schema
2. run migration
3. generate client
4. run seed

Not the other way around.

### ESM import issues

The seed file runs inside the project's ESM setup, so runtime imports needed `.js` extensions.

That was another real issue during the first seed implementation.

## Why This Stage Was More Than Setup

This was not just infrastructure work.

It was the point where the backend became usable by the frontend.

The seed data allowed the project to move from:

- empty UI shells
- hypothetical endpoint design

to:

- actual product responses
- actual detail routes
- real images, prices, and stock values in the interface

That shift is why the database and seed stage mattered so much.

## Current Relevance

Even though the project now has:

- auth
- cart
- checkout
- order history
- admin product endpoints

the seed process still matters because it remains the fastest way to restore a predictable local catalog.

That is useful for:

- frontend UI work
- backend endpoint testing
- debugging product-detail routes
- verifying admin product behavior against existing seeded items

## Verification Checklist

This stage is working correctly when:

- Prisma schema validates
- Prisma client generates
- migrations apply successfully
- the seed script runs without errors
- Prisma Studio shows categories and products
- `GET /api/products` returns seeded products
- `GET /api/products/:slug` returns expected seeded detail records

## What Came After This

This database foundation unlocked the rest of the stack:

- products API
- slug-based product detail API
- storefront product pages
- local cart
- auth
- checkout
- order history
- admin product management

That is why this document is effectively the first backend foundation note for the whole project.
