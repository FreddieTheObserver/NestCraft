# Admin Products UI

This document covers the frontend admin product management implementation in `NestCraft`.

Main admin routes:

- `/admin/products`
- `/admin/products/new`
- `/admin/products/:id/edit`

This slice is the first store-owner workflow on the frontend. It is the point where catalog management stops depending on direct database edits and starts happening through the application UI.

## Goal

The purpose of the admin products UI is to let an authenticated admin user:

- review the full catalog
- see active and inactive products
- create products
- edit products
- upload product images
- deactivate products
- reactivate products

That turns the project from a storefront-only experience into a basic two-sided ecommerce system:

- customer-facing browsing and checkout
- store-owner-facing catalog management

## Backend Dependencies

This frontend feature depends on the backend admin endpoints that already exist:

- `GET /api/admin/products`
- `GET /api/categories`
- `POST /api/uploads/products`
- `POST /api/products`
- `PATCH /api/products/:id`
- `PATCH /api/products/:id/deactivate`

It also depends on backend auth and authorization:

- `requireAuth`
- `requireAdmin`

Without those backend pieces, the frontend admin UI would be forced into hardcoded category IDs or incomplete product visibility.

## Files Involved

Route protection:

- [AdminRoute.tsx](c:/Users/user/NestCraft/client/src/components/AdminRoute.tsx)

Service layer:

- [adminProducts.ts](c:/Users/user/NestCraft/client/src/services/adminProducts.ts)
- [images.ts](c:/Users/user/NestCraft/client/src/utils/images.ts)

Reusable form:

- [AdminProductForm.tsx](c:/Users/user/NestCraft/client/src/components/AdminProductForm.tsx)

Pages:

- [AdminProductsPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminProductsPage.tsx)
- [AdminCreateProductPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminCreateProductPage.tsx)
- [AdminEditProductPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminEditProductPage.tsx)

Shared app wiring:

- [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx)
- [PageShell.tsx](c:/Users/user/NestCraft/client/src/components/PageShell.tsx)
- [StatusPanel.tsx](c:/Users/user/NestCraft/client/src/components/StatusPanel.tsx)
- [StoreHeader.tsx](c:/Users/user/NestCraft/client/src/components/StoreHeader.tsx)
- [AuthContext.tsx](c:/Users/user/NestCraft/client/src/context/AuthContext.tsx)

## Route Protection

The admin UI uses a dedicated route wrapper instead of reusing the ordinary authenticated route.

[AdminRoute.tsx](c:/Users/user/NestCraft/client/src/components/AdminRoute.tsx) checks:

- whether the user is authenticated
- whether `user.role === "admin"`

Behavior:

- unauthenticated users are redirected to `/login`
- authenticated non-admin users are redirected to `/products`
- admins can access the admin pages

This separation matters because:

- `ProtectedRoute` only checks login state
- `AdminRoute` checks authorization

Those are different concerns and should stay separate.

## Route Structure

The route configuration in [index.tsx](c:/Users/user/NestCraft/client/src/routes/index.tsx) defines three admin pages:

- `/admin/products`
- `/admin/products/new`
- `/admin/products/:id/edit`

This route layout is deliberate:

- the list page is the dashboard and entry point
- the create page is a dedicated form flow
- the edit page uses the product ID in the URL

That gives the admin area a predictable CRUD-style structure without overcomplicating the router.

## Why There Is A Dedicated Admin Service File

Admin product operations live in [adminProducts.ts](c:/Users/user/NestCraft/client/src/services/adminProducts.ts).

That file owns:

- admin product fetch
- category fetch
- create product request
- update product request
- deactivate product request
- reactivate helper

This logic was intentionally kept separate from the public [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts) service.

Why:

- public catalog reads and admin catalog management are different concerns
- admin operations need authorization headers and different endpoint targets
- keeping them separate prevents the public service file from becoming a mixed-purpose dump

## Service Responsibilities

### `getAdminProducts(token)`

Calls:

```http
GET /api/admin/products
```

Used by:

- admin products list page
- admin edit page

Why the token is required:

- the backend protects this route with `requireAuth` and `requireAdmin`

### `getCategories()`

Calls:

```http
GET /api/categories
```

Used by:

- create product page
- edit product page

Why this endpoint matters:

- product forms need real category options
- hardcoding category IDs in the frontend would be fragile and wrong

### `createAdminProduct(data, token)`

Calls:

```http
POST /api/products
```

Used by:

- create product page

### `updateAdminProduct(id, data, token)`

Calls:

```http
PATCH /api/products/:id
```

Used by:

- edit product page
- reactivation helper

### `deactivateAdminProduct(id, token)`

Calls:

```http
PATCH /api/products/:id/deactivate
```

Used by:

- admin products list page

### `reactivateAdminProduct(id, token)`

This is implemented as a thin wrapper around `updateAdminProduct(...)` with:

```json
{ "isActive": true }
```

That matches the current backend design, where deactivation has a dedicated route but reactivation uses the generic update endpoint.

## Why Types Stay In The Admin Service File

The current admin-specific types are defined locally in [adminProducts.ts](c:/Users/user/NestCraft/client/src/services/adminProducts.ts).

That includes:

- `AdminProduct`
- `CategoryOption`
- `ProductFormInput`

This is reasonable at the current project stage because these types are still tightly coupled to the admin product slice.

The project does not yet need a shared global `types/` layer for them.

## Admin Products List Page

[AdminProductsPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminProductsPage.tsx) is the main admin catalog dashboard.

Its responsibilities are:

- load all admin-visible products
- show category, stock, featured status, and active/inactive state
- link to the edit page
- trigger deactivate
- trigger reactivate
- show action errors separately from load errors

This page is intentionally the hub of the admin product flow.

Why this page matters:

- it proves the admin read endpoint works
- it gives the admin a complete catalog view
- it becomes the starting point for create, edit, deactivate, and reactivate actions

It now uses the shared `PageShell` and `StatusPanel` components so admin catalog states match the rest of the app.

## Why Action Errors Are Separate

The page keeps:

- `error`
- `actionError`

separate.

That is useful because:

- a failed initial load is a page-level failure
- a failed deactivate/reactivate action is a local action failure

Those are not the same kind of error, and the UI should not treat them the same way.

## Responsive Catalog Table

The admin product list is still a dense table-style screen, so the current responsive treatment is pragmatic rather than magical.

The page now:

- wraps the inventory table in horizontal overflow
- adds a narrow-screen hint for smaller viewports

That is a better first deployment-polish step than pretending a dense operations table can collapse cleanly into an ordinary phone card layout without redesigning the workflow.

## Shared Product Form

[AdminProductForm.tsx](c:/Users/user/NestCraft/client/src/components/AdminProductForm.tsx) is the reusable form component shared by create and edit pages.

It handles:

- name
- slug
- description
- price
- stock
- category selection
- product image upload and preview
- featured flag
- active flag

Why this component exists:

- create and edit need the same field set
- repeating the form in both pages would create noisy duplication
- a shared form keeps the page components focused on loading and submission logic

## Why `useEffect` Syncs `initialValues`

The form component uses `useEffect` to update local form state when `initialValues` changes.

That is necessary because:

- create and edit pages load data asynchronously
- the form may render before categories or product data are ready

Without that synchronization, the form would lock itself to the first render's initial state.

## Product Image Upload Flow

The shared form now uploads product images before the final product save request.

That flow is:

1. admin chooses a file in the form
2. form calls `onImageUpload(file)`
3. page uploads the file through `uploadProductImage(file, token)`
4. backend returns `{ imageUrl }`
5. form stores the returned `imageUrl`
6. create or edit submission includes that `imageUrl`

For the full frontend upload-specific documentation, see [product-image-upload-ui.md](c:/Users/user/NestCraft/docs/frontend/product-image-upload-ui.md).

## Create Product Page

[AdminCreateProductPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminCreateProductPage.tsx) is responsible for:

- loading categories
- preparing blank form defaults
- providing the image upload handler
- submitting the form to `POST /api/products`
- redirecting back to `/admin/products` on success

It does not own field-level UI. The shared form component handles that.

This page is mostly:

- category loading
- request lifecycle
- navigation after success

That is the correct division of responsibilities.

## Edit Product Page

[AdminEditProductPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminEditProductPage.tsx) is responsible for:

- reading `id` from the route
- loading categories
- loading admin products
- finding the matching product by `id`
- mapping the product into `ProductFormInput`
- providing the image upload handler
- submitting the update

## Important Current Limitation

The edit page currently does not have a dedicated backend endpoint like:

```http
GET /api/admin/products/:id
```

Because of that, the edit page uses:

- `getAdminProducts(token)`
- then finds the matching product locally by `id`

This works, but it is not the ideal long-term design.

The cleaner next backend improvement would be:

```http
GET /api/admin/products/:id
```

That would make the edit page more efficient and more refresh-safe.

## Store Header Integration

[StoreHeader.tsx](c:/Users/user/NestCraft/client/src/components/StoreHeader.tsx) now exposes an `Admin` link when:

- the user is authenticated
- `user.role === "admin"`

That matters because admin pages should be reachable from the same shared app shell, not hidden behind manual URL entry.

## Relationship To Auth Context

The admin UI reads:

- `user`
- `token`

from [AuthContext.tsx](c:/Users/user/NestCraft/client/src/context/AuthContext.tsx).

That means this feature depends directly on the frontend auth implementation and the backend JWT payload including the correct `role`.

One important behavior follows from that:

- if a user's role is changed in the database manually, they must log in again so the token contains `role: "admin"`

Otherwise the admin route guard and the backend admin middleware will disagree with what the database says now.

## Error Handling

This admin slice reuses the shared frontend API error handling through [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts).

That means admin pages can surface backend error messages such as:

- duplicate slug
- category not found
- authorization failures

instead of only showing generic fallback strings.

That is especially important in admin flows, where actionable validation messages matter more than in simple public browsing pages.

## What To Test

This feature is working correctly when:

- admin users can open `/admin/products`
- non-admin users are redirected away from admin pages
- the list shows active and inactive products
- create and edit forms can upload an image before save
- create form loads categories and creates products
- edit form loads the current product and updates it
- deactivate works
- reactivate works
- inactive products disappear from the public storefront
- reactivated products reappear in the public storefront

## Why This Slice Matters

This is the first frontend feature built for the store owner rather than the customer.

That is a major transition in the project.

Up to this point, most of the app was about:

- browsing
- buying
- account ownership

This slice adds:

- catalog operations
- admin-only navigation
- content management behavior

That makes it one of the most important architectural milestones after checkout and order history.

## What Comes After This

The next logical feature after admin product management is:

- admin order management

That should likely include:

- admin orders list
- order status updates
- pending / confirmed / cancelled workflow

Because once admins can manage the catalog, the next operational need is managing the orders created from that catalog.
