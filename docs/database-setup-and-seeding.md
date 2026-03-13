# Database Setup And Seeding

This note documents the first database setup for `NestCraft` using:

- `PostgreSQL`
- `Prisma ORM`
- `Prisma migrations`
- `TypeScript seed script`

It covers what was created, why it exists, and how the setup works.

## Goal

The first database milestone for `NestCraft` is:

1. define the first ecommerce models
2. generate the Prisma client
3. create the database tables
4. insert sample category and product data

This gives the project real catalog data before building the products API and frontend product pages.

## Files Involved

The main files for this setup are:

- [schema.prisma](c:/Users/user/NestCraft/server/prisma/schema.prisma)
- [seed.ts](c:/Users/user/NestCraft/server/prisma/seed.ts)
- [package.json](c:/Users/user/NestCraft/server/package.json)
- [.env](c:/Users/user/NestCraft/server/.env)
- [prisma.config.ts](c:/Users/user/NestCraft/server/prisma.config.ts)

## Why Prisma Is Used

Prisma is the ORM layer between the application and PostgreSQL.

It is useful here because it gives:

- a clear schema file for database design
- generated TypeScript client code
- migrations for database changes
- strongly typed queries

For an ecommerce app, this is helpful because the data is relational:

- one category has many products
- one product belongs to one category

## Initial Models

The first two models are:

- `Category`
- `Product`

These are enough to support:

- a product listing page
- a product detail page
- category filtering
- featured product sections

### Category

The `Category` model stores product groupings such as:

- Lighting
- Decor
- Storage

Important fields:

- `id`: primary key
- `name`: display name
- `slug`: URL-friendly identifier
- `imageUrl`: optional image for category cards
- `products`: relation to many products
- `createdAt`, `updatedAt`: timestamps

### Product

The `Product` model stores sellable items.

Important fields:

- `id`: primary key
- `name`: product title
- `slug`: URL-friendly product identifier
- `description`: product text for detail pages
- `price`: money value, stored as `Decimal`
- `stock`: inventory count
- `imageUrl`: optional image
- `isFeatured`: whether to show it in featured sections
- `isActive`: whether the product should be visible in the storefront
- `categoryId`: foreign key
- `category`: relation to one category
- `createdAt`, `updatedAt`: timestamps

## Relationship Design

The relationship is one-to-many:

- one `Category` has many `Product`s
- one `Product` belongs to one `Category`

This is the right starting point for `NestCraft` because it keeps the catalog simple while supporting real browsing and filtering.

## Prisma 7 Setup Note

This project uses Prisma 7.

That matters because Prisma 7 handles database connection differently from older Prisma examples you may find online.

Important differences:

- the datasource `url` is not kept in `schema.prisma`
- connection settings are read from [prisma.config.ts](c:/Users/user/NestCraft/server/prisma.config.ts)
- the runtime Prisma client uses a PostgreSQL adapter

That is why the Prisma client setup also includes:

- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`

## Environment Variables

The database connection lives in [server/.env](c:/Users/user/NestCraft/server/.env).

Important variables:

- `PORT`
- `CLIENT_ORIGIN`
- `DATABASE_URL`

`DATABASE_URL` points Prisma and PostgreSQL to the `nestcraft` database.

## Seed File Purpose

The seed script lives in [seed.ts](c:/Users/user/NestCraft/server/prisma/seed.ts).

Its job is to insert sample data for development.

Why seed data is useful:

- avoids manual row entry in the database
- gives consistent sample products
- lets frontend work begin with real API data
- makes testing easier

## How The Seed Script Works

The seed script follows this sequence:

1. connect Prisma to PostgreSQL
2. delete existing products
3. delete existing categories
4. create categories
5. create products linked to category IDs
6. disconnect Prisma

The delete order matters:

- `Product` must be deleted before `Category`
- otherwise foreign key constraints can block deletion

## Why Price Uses Decimal

The `price` field is stored as `Decimal` in Prisma.

That is important because money should not be stored as `Float`.

Reason:

- floating point values can introduce rounding errors
- ecommerce totals need predictable precision

In seed data, decimal values are safely passed as strings such as:

- `"49.99"`
- `"24.99"`

## Migration Step

Before seeding, the database tables must exist.

That is why the migration step came before the seed step.

Command used:

```bash
npx prisma migrate dev --name init-product-category
```

Explanation:
This creates the initial migration files and applies them to PostgreSQL so the `Category` and `Product` tables exist.

## Client Generation Step

Command used:

```bash
npx prisma generate
```

Explanation:
This generates the Prisma client from the Prisma schema so TypeScript can query the database using typed methods.

## Seed Command

The seed command is defined in [package.json](c:/Users/user/NestCraft/server/package.json):

```json
"seed": "tsx prisma/seed.ts"
```

Explanation:
This runs the TypeScript seed file directly through `tsx`.

Command used:

```bash
npm run seed
```

Explanation:
This inserts the sample NestCraft categories and products into PostgreSQL.

## What Was Seeded

The first seed includes:

- categories such as `Lighting`, `Decor`, and `Storage`
- several sample home-item products
- product-category relationships through `categoryId`

This is enough to support the first products API.

## Common Errors Encountered

### 1. Misspelled environment variable

Using a wrong env key such as `DATABAE_URL` breaks schema validation.

Lesson:
- environment variable names must match exactly

### 2. Old Prisma syntax from earlier versions

Adding `url = env("DATABASE_URL")` inside `schema.prisma` caused an error because Prisma 7 no longer supports that there.

Lesson:
- check Prisma version behavior before following older tutorials

### 3. Seeding before migration

The seed failed when the `Product` table did not exist yet.

Lesson:
- migrate first
- seed second

### 4. ESM import path issue

The generated Prisma client import for ESM needed the `.js` extension in the seed file.

Lesson:
- with ESM, compiled import paths must be explicit

## Development Workflow Used

The recommended Git workflow for this stage is:

1. create a feature branch
2. implement schema changes
3. run migration
4. run seed
5. verify with Prisma Studio
6. commit and merge when working

This keeps `main` stable while database work is being tested.

## Verification Checklist

The database setup is considered successful when:

- Prisma schema validates
- Prisma client generates
- migration applies successfully
- seed runs successfully
- Prisma Studio shows category and product data

## Next Step

After this database milestone, the next backend feature should be:

- `GET /api/products`

That endpoint will return the seeded product data to the frontend and become the first real catalog API for `NestCraft`.
