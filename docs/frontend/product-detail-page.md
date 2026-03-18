# Product Detail Page

This document explains the current product detail page in `NestCraft`.

Route:

```text
/products/:slug
```

API source:

```http
GET /api/products/:slug
```

This page is where the catalog becomes a purchase flow instead of just a browsing grid.

## Goal

The purpose of the product detail page is to render one product using a readable slug-based route and give the user a direct path into cart behavior.

Example:

```text
/products/oak-bedside-lamp
```

The current page lets a user:

- load a product by slug
- inspect its description and pricing
- see availability and stock
- add it to the local cart
- move directly to the cart page

## Files Involved

Page and routing:

- [ProductDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductDetailPage.tsx)
- [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx)

API integration:

- [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts)
- [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts)

Cart integration:

- [CartContext.tsx](c:/Users/user/NestCraft/client/src/context/CartContext.tsx)

Shared UI:

- [StoreHeader.tsx](c:/Users/user/NestCraft/client/src/components/StoreHeader.tsx)

## Why This Page Matters

The products page proves the catalog exists.

The product detail page proves the catalog is usable.

This is the page where the user moves from:

- seeing a list of items

to:

- considering one item in enough detail to act on it

That makes this page the first real conversion-oriented screen in the storefront.

## Request Flow

The current flow is:

1. React Router matches `/products/:slug`
2. `useParams()` reads the `slug`
3. `ProductDetailPage` calls `getProductBySlug(slug)`
4. the service fetches `/api/products/:slug`
5. the backend returns the matching active product with category data
6. the page stores the result and renders the detail layout

This follows the same page architecture pattern as the rest of the frontend:

- route
- page
- service
- API

## Why Slugs Are Used

The detail route uses `slug`, not `id`.

That is the better choice for a storefront because:

- URLs are readable
- the route looks like a public product URL rather than an internal record ID
- links are easier to share
- the route aligns naturally with product names

This decision also shaped the backend detail endpoint and the seeded product data.

## State Management On The Page

[ProductDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductDetailPage.tsx) manages:

- `product`
- `loading`
- `error`
- `imageFailed`

Each state exists for a specific reason.

`product`:

- stores the loaded backend response

`loading`:

- controls the initial fetch lifecycle

`error`:

- communicates failed requests or missing slug conditions

`imageFailed`:

- allows the UI to fall back cleanly when a remote image URL fails to load

That last state matters because the product page should still be usable even if the image host is unreliable.

## UI Responsibilities

The page currently handles:

- shared storefront header
- back navigation to `/products`
- loading layout
- error layout
- not-found layout
- large media area
- category, availability, and stock summary cards
- price presentation
- development-oriented metadata such as slug and storefront visibility
- `Add to cart` action
- `View cart` action

This makes it a real product page rather than a raw data render.

## Layout Intent

The current layout is intentionally more substantial than the first placeholder version.

It uses:

- a large media block on the left
- a structured information panel on the right
- clear price emphasis
- a separate metadata section
- bottom action buttons with strong visual priority

That design direction matters because a product page should support product evaluation and purchase intent, not just show fields.

## Image Fallback Behavior

The page does not assume product images are always reliable.

If:

- `product.imageUrl` is missing
- or the browser fails to load the image

the page renders a styled fallback block instead of broken browser image UI.

That is important for robustness because remote image URLs can fail for reasons unrelated to the app itself.

## Cart Integration

The product detail page now has real cart behavior.

This is no longer a visual placeholder.

When the user clicks `Add to cart`, the page calls `addToCart(...)` from [CartContext.tsx](c:/Users/user/NestCraft/client/src/context/CartContext.tsx) with the minimal cart item data:

- `id`
- `slug`
- `name`
- `price`
- `imageUrl`

The cart context then:

- adds the item if it is new
- increments quantity if it already exists
- persists cart state in `localStorage`

That means the detail page is directly connected to the actual cart flow.

## Relationship To The Cart Page

The action row includes both:

- `Add to cart`
- `View cart`

That gives the user two immediate options:

- continue the shopping flow by placing the item in cart
- move straight to `/cart`

This is the first clear purchase-intent loop in the app:

1. browse catalog
2. open detail page
3. add item to cart
4. continue browsing or go to cart

## Development-Oriented Metadata

The page still shows:

- product slug
- storefront visibility via `isActive`

This is useful during development because it makes backend state easier to verify from the UI.

That information may later be simplified or hidden for the public storefront, but it is currently helpful while the app is still being built and tested.

## Error Handling

The page benefits from the shared API error handling added elsewhere in the frontend.

That means when the backend returns a meaningful structured error, the user can see that message instead of only getting a generic fallback.

This is especially useful for cases like:

- invalid slug
- product not found
- server-side failures

## What This Page Does Not Do Yet

The current product detail page does not yet include:

- quantity selector before add-to-cart
- image gallery or multiple product images
- related products
- product reviews
- expanded specifications

Those are reasonable future improvements, but they are not necessary for the current storefront stage.

The current page already solves the key requirement: make one live product purchasable in the local-cart flow.

## What To Test

This page is working correctly when:

- clicking a product card opens the correct slug route
- the correct product loads from the backend
- invalid slugs produce an error or not-found state
- image failure falls back cleanly
- `Add to cart` updates the local cart
- `View cart` routes to `/cart`
- the shared header still behaves correctly on the page

## Why This Page Was An Important Milestone

This page is where the project moved from:

- catalog browsing

to:

- actionable shopping behavior

It is the point where backend detail data, frontend routing, and cart state all started working together on one screen.

That makes it one of the most important storefront pages in the whole project.

## Reasonable Next Improvements

The next likely enhancements are:

- quantity selection
- related products by category
- better media support
- richer specification content
- review or rating support later if needed

But those are iterative improvements. The core product-detail behavior is already in place.
