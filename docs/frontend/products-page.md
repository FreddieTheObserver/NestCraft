# Products Page

This document explains the current storefront catalog page in `NestCraft`.

Route:

```text
/products
```

API sources:

```http
GET /api/products
GET /api/categories
```

This page started as a simple "fetch and render the catalog" screen. It now supports real browsing behavior:

- search
- category filtering
- sorting
- URL-synced state

That makes it the real discovery page of the storefront rather than just the first API demo page.

## Goal

The purpose of this page is to render a public product grid from the real API and let users narrow what they see without leaving the page.

The current implementation does all of the following:

- fetch products from the public catalog endpoint
- fetch categories for the filter UI
- read search/category/sort state from URL query params
- update the URL when filters change
- reload products whenever the URL state changes
- debounce search updates
- render loading, error, empty, and success states
- display a filter-aware collection summary
- use the shared storefront header
- link every card into the product-detail flow

## Files Involved

Page and UI:

- [ProductsPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductsPage.tsx)
- [ProductCard.tsx](c:/Users/user/NestCraft/client/src/components/ProductCard.tsx)
- [StoreHeader.tsx](c:/Users/user/NestCraft/client/src/components/StoreHeader.tsx)

API integration:

- [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts)
- [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts)

Route wiring:

- [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx)

## Why This Page Matters

This page is the center of public product discovery.

It now proves several important integrations at once:

- the products endpoint supports browse queries
- the categories endpoint supports filter options
- the frontend service layer can build query strings cleanly
- the router and the UI stay synchronized through URL query params
- browser refresh and back/forward behavior preserve the browse state

That is a more complete storefront behavior than the earlier "load all products once" version.

## Request Flow

The current flow for `/products` is:

1. React Router matches `/products`
2. `ProductsPage` reads the current search params
3. categories are fetched for the filter controls
4. products are fetched with the current `search`, `category`, and `sort`
5. the response is stored in local state
6. each product is rendered through `ProductCard`
7. changing the filters updates the URL and triggers the next product fetch

That means the URL is now part of the page state model.

## Why The Service Layer Changed

The products fetch logic still does not live directly inside the page.

It lives in [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts).

That service now owns:

- `getProducts(filters)`
- `getProductCategories()`
- public browse-related types such as `ProductSort` and `ProductCategory`

This is the correct location because:

- query-string construction should not clutter the page component
- category fetch belongs to the public product domain, not the admin domain
- the page should stay focused on UI state and rendering

## Why Categories Were Added To The Public Products Service

The category fetch used for the public filter UI is intentionally defined in [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts), not imported from [adminProducts.ts](c:/Users/user/NestCraft/client/src/services/adminProducts.ts).

That separation matters because:

- categories are part of public browsing now
- admin services should not become accidental dependencies for the storefront
- public and admin product concerns should stay separate

## URL Query Params As The Source Of Truth

The most important architectural change on this page is that filtering is now driven by `useSearchParams()`.

The current URL-driven state is:

- `search`
- `category`
- `sort`

This is better than keeping a second disconnected filter state because:

- refresh preserves the current browse state
- copy/pasting the URL preserves the current browse state
- browser back/forward navigation behaves naturally
- the page always has one clear source of truth

This is the cleanest approach for a page-level browse UI in a React Router app.

## Why Search Uses A Separate Local Input State

Even though the URL is the source of truth, the page also keeps a local `searchInput` state.

That exists for one reason:

- typing into the search box should not trigger a network request on every single keystroke

The page now:

1. lets the user type into `searchInput`
2. waits briefly through a debounce
3. updates the URL
4. refetches products from the new URL state

Without that separation, the page felt like it was "refreshing" every time a letter was typed.

## Why Search Is Debounced

The current debounce exists to improve perceived stability.

Without it:

- every keystroke changed the URL
- every URL change triggered a fetch
- every fetch made the page feel visually noisy

The debounced approach gives the user a moment to finish typing before the next product request runs.

That keeps the page responsive without overcomplicating the implementation.

## Why Category And Sort Update Immediately

Category and sort controls still update the URL immediately.

That is correct because:

- they are discrete selections, not freeform typing
- users expect instant response after choosing an option
- they do not have the same rapid-input problem as search text

So the page uses:

- debounced updates for search
- immediate updates for category and sort

That is the right behavior split.

## State Model On The Page

[ProductsPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductsPage.tsx) now manages:

- `products`
- `categories`
- `error`
- `hasLoadedOnce`
- `isFetching`
- `searchInput`

This supports:

- initial full-page loading
- background refetching while results stay visible
- category filter options
- debounced search input
- filter-aware empty states

This is more complex than the earlier page, but it is justified by the added browsing behavior.

## Why Loading Was Split Into Two States

The page no longer uses one simple `loading` boolean for everything.

It now distinguishes between:

- first load
- later refetches

That change matters because once filters exist, the page should not disappear into a full loading screen every time the user changes a control.

Current behavior:

- first load -> full loading screen
- later filter changes -> keep the page visible and show a small "Updating results..." indicator

That is the correct UX for browse filtering.

## Filter Controls

The page now renders three controls:

- search input
- category select
- sort select

And one supporting action:

- clear filters

### Search input

Used for:

- product name
- product description matching

### Category select

Populated from `GET /api/categories`

Used for:

- narrowing the catalog to one category slug

### Sort select

Current options:

- newest
- price low to high
- price high to low

### Clear filters

Resets the URL search params back to the default unfiltered browse state.

## Collection Snapshot

The page still shows a collection summary panel, but it is now filter-aware.

It shows:

- visible product count
- visible category count

Those values are derived from the current filtered result set, not from the entire underlying database.

That is correct because the user should see a summary of what is currently on the page.

## Filter-Aware Page Copy

The page hero now reflects whether filters are active.

It shows:

- a default "full catalog" message when no filters are active
- a filtered-results message when search/category/sort is in effect

This matters because the page should acknowledge when the user is not viewing the whole catalog anymore.

## Loading, Error, And Empty States

The page now supports more nuanced states than before.

### Initial loading

Shown before the first product response has been loaded.

### Background fetch

Shown as a small in-page "Updating results..." indicator while filtered results are being refreshed.

### Error state

Shown if the current product request fails.

### Empty state

Now has two meanings:

- there are no active products in the catalog at all
- there are products in the catalog, but none match the current filters

The UI now distinguishes these two cases instead of always using the same message.

## Why The Empty State Needed To Change

Before filters existed, "No products found" only meant:

- there are no active products

Now it can also mean:

- your filters eliminated all results

So the copy had to change. Otherwise the page would tell the user the catalog is empty when the real issue is only the current filter combination.

The page now also exposes a `Clear filters` action directly from the empty state when filters are active.

## Relationship To `ProductCard`

The page still delegates single-product rendering to [ProductCard.tsx](c:/Users/user/NestCraft/client/src/components/ProductCard.tsx).

That remains the correct split.

The page owns:

- browsing state
- page layout
- filter controls
- loading/error/empty states

The card owns:

- one product's visual presentation

So the browse upgrade did not need to change the product card abstraction.

## Error Handling

The page still benefits from the shared frontend API error reader in [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts).

That means invalid browse query responses or backend failures can still surface useful messages rather than generic failures.

This is important now that `/api/products` has a real query contract and can fail on invalid input.

## What To Test

The products page is working correctly when:

- `/products` loads the full active catalog
- typing in search updates results after a short delay
- category selection updates results immediately
- sort selection updates results immediately
- the URL reflects the current browse state
- refreshing the page preserves the current browse state
- back/forward navigation preserves the current browse state
- empty state shows the correct message when filters remove all matches
- `Clear` resets the page to the default browse state

## Why This Page Is A Bigger Milestone Than It Looks

This change moved the catalog page from:

- "render a list of products"

to:

- "support real product discovery behavior"

That is a meaningful shift in the storefront maturity of the project.

It is also one of the first places where:

- backend query design
- frontend URL state
- user experience behavior

all had to work together cleanly.

## What Comes Next

After this browse improvement slice, the next likely improvements are:

- order detail page
- customer-facing order numbers
- visual refinement of the storefront
- deeper browse polish if needed

The core browse contract is now in place.
