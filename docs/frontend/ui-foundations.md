# UI Foundations

This document explains the shared UI building blocks added during deployment polish.

The goal of this work was not a visual redesign. It was to make the existing app more consistent, easier to maintain, and safer to ship.

## Goal

Before this cleanup, many pages repeated the same outer shell and handled loading or error states with slightly different ad hoc panels.

The UI foundations work introduced two shared components:

- [PageShell.tsx](c:/Users/user/NestCraft/client/src/components/PageShell.tsx)
- [StatusPanel.tsx](c:/Users/user/NestCraft/client/src/components/StatusPanel.tsx)

Those components now define the common page framing and state-panel language for the app.

## Files Involved

Shared components:

- [PageShell.tsx](c:/Users/user/NestCraft/client/src/components/PageShell.tsx)
- [StatusPanel.tsx](c:/Users/user/NestCraft/client/src/components/StatusPanel.tsx)
- [StoreHeader.tsx](c:/Users/user/NestCraft/client/src/components/StoreHeader.tsx)

Representative pages using them:

- [ProductsPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductsPage.tsx)
- [ProductDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductDetailPage.tsx)
- [CartPage.tsx](c:/Users/user/NestCraft/client/src/pages/CartPage.tsx)
- [CheckoutPage.tsx](c:/Users/user/NestCraft/client/src/pages/CheckoutPage.tsx)
- [OrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrdersPage.tsx)
- [OrderDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrderDetailPage.tsx)
- [AdminProductsPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminProductsPage.tsx)
- [AdminOrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminOrdersPage.tsx)
- [AdminCreateProductPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminCreateProductPage.tsx)
- [AdminEditProductPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminEditProductPage.tsx)

## Why `PageShell` Exists

`PageShell` owns the repeated structural frame that used to be duplicated across many pages:

- the `main` background
- page padding
- centered content width
- shared header placement

That matters because shell duplication creates easy drift:

- different padding values
- slightly different max widths
- missing header placement

By moving that into one component, most pages now express only:

- which max width they need
- whether they want the shared header
- what actual content belongs inside the page

## `PageShell` Width Modes

The shell currently supports three width presets:

- `4xl`
- `6xl`
- `7xl`

The choice is pragmatic:

- forms and narrow content use `4xl`
- medium-detail pages use `6xl`
- dashboards and dense lists use `7xl`

This is enough for the current project without adding a larger layout system.

## Why `StatusPanel` Exists

`StatusPanel` standardizes the common non-happy-path states:

- loading
- error
- empty

Those states appear across almost every real app route, so they should not all invent their own one-off markup.

`StatusPanel` gives pages a consistent structure:

- eyebrow
- title
- optional message
- optional custom children
- optional error tone

That makes it much easier to keep account pages, admin pages, and storefront pages aligned.

## Current Usage Pattern

The intended pattern for most pages is:

1. wrap the page in `PageShell`
2. render `StatusPanel` for loading, error, or empty states
3. render page-specific content only after data is ready

That keeps page components focused on route logic and domain UI rather than shell duplication.

## Admin-Side Polish

The admin pages benefited the most from this cleanup.

### Admin product pages

The admin catalog pages now share the same shell and status language as the rest of the app.

The product list also adds a horizontal-scroll wrapper and a small narrow-screen hint, which is a practical responsive treatment for a dense inventory table.

### Admin orders page

The admin orders page now:

- uses the shared shell and status panels
- shows the customer-facing `orderNumber` as the primary visible order label
- keeps the internal numeric `id` as secondary admin-only context

That keeps customer and admin order references more consistent while preserving the operational ID that the backend still uses for status updates.

## Relationship To `StoreHeader`

Most pages no longer import `StoreHeader` directly.

Instead, `PageShell` composes it for them.

That is the correct default because the header is part of the shared application frame, not usually part of the page's unique business logic.

If a future page truly needs a custom shell, `PageShell` supports `showHeader={false}`.

## What Not To Do

For new pages, avoid:

- rebuilding the `main` and `section` shell by hand
- hand-rolling a one-off loading card
- embedding raw `fetch()` status text directly in the page body

Those patterns were exactly what this cleanup was meant to remove.

## Recommended Pattern For New Pages

When adding a new page:

1. choose the correct `PageShell` width
2. use `StatusPanel` for loading, error, and empty states
3. keep data fetching in a service file
4. keep route-specific content inside the page body only after the state is ready

That should remain the default frontend page structure for `NestCraft`.
