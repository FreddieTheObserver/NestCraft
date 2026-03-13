# Products Page

This note documents the first frontend catalog page for `NestCraft`.

Route:

```text
/products
```

API source:

```http
GET /api/products
```

## Goal

Render a real product grid from the backend instead of hardcoded frontend data.

The first version of the page should:

- fetch products on load
- show loading, error, and empty states
- render cards from live API data

## Files Involved

- [ProductsPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductsPage.tsx)
- [ProductCard.tsx](c:/Users/user/NestCraft/client/src/components/ProductCard.tsx)
- [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts)
- [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx)

## Request Flow

The products page flow is:

1. route loads `ProductsPage`
2. page calls the products service
3. service fetches `/api/products`
4. backend returns JSON
5. page stores data in state
6. card components render each product

## Why Use A Service File

The fetch logic lives in `services/products.ts` instead of inside the page component.

Benefits:

- page code stays focused on UI
- API logic stays reusable
- later auth headers and query params are easier to manage

## Why Use A Card Component

Each product is rendered through `ProductCard`.

Benefits:

- keeps the page component smaller
- makes the product UI reusable
- prepares the app for featured grids and home page sections later

## UI Responsibilities

The products page should handle:

- the catalog heading
- summary information
- grid layout
- loading state
- error state
- empty state

The card component should handle:

- image or image fallback
- category label
- product title
- description preview
- price
- stock text

## What Success Looks Like

The products page is successful when:

- `/products` renders without errors
- real products come from the backend
- clicking a card leads to a detail page
- broken images fall back gracefully

## Relationship To The Product Detail Page

Each product card should link to:

```text
/products/:slug
```

That connects the list page and detail page into one storefront flow.
