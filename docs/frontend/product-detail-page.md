# Product Detail Page

This note documents the first product detail page for `NestCraft`.

Route:

```text
/products/:slug
```

API source:

```http
GET /api/products/:slug
```

## Goal

Render one real product from the backend using a slug-based storefront URL.

Example:

```text
/products/oak-bedside-lamp
```

## Files Involved

- [ProductDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductDetailPage.tsx)
- [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts)
- [ProductCard.tsx](c:/Users/user/NestCraft/client/src/components/ProductCard.tsx)
- [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx)

## Request Flow

The detail page flow is:

1. route matches `/products/:slug`
2. `useParams()` reads the slug
3. page calls the products service
4. service fetches `/api/products/:slug`
5. backend returns one product object
6. page renders the product detail layout

## Why Slug-Based Routing Matters

For a storefront, slug-based routes are better because:

- links are readable
- product pages look more professional
- URLs are easier to share
- route names align with product names

## Page Responsibilities

The detail page should handle:

- loading state
- error state
- not found state
- product image or fallback
- category label
- product name
- description
- price
- stock status
- back navigation to the products page

## UI Design Intent

The page should feel more like ecommerce than a plain JSON rendering.

That is why the layout includes:

- a large image area
- a structured product info panel
- prominent price styling
- stock and category metadata
- a visual add-to-cart button placeholder

The button is only visual for now because cart logic is a later feature.

## What Success Looks Like

The detail page is successful when:

- clicking a product card opens the detail route
- the correct product loads by slug
- invalid slugs show a proper error or not found state
- the UI remains usable even when the product image fails to load
