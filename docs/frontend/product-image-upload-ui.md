# Product Image Upload UI

This document covers the frontend implementation of admin-uploaded product images in `NestCraft`.

## Goal

Let administrators upload a product image inside the admin form and have that image show up everywhere the product is rendered.

That means the frontend must handle three separate concerns:

- upload the file to the backend
- save the returned `imageUrl` onto the product
- render uploaded image paths correctly across the app

## Why This Feature Exists

Previously the admin form used a plain text field for:

```text
Image URL
```

That worked only when the admin already had an externally hosted image.

The new UI removes that dependency and gives the admin a direct upload workflow.

## Files Involved

Upload and product services:

- [adminProducts.ts](c:/Users/user/NestCraft/client/src/services/adminProducts.ts)
- [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts)
- [images.ts](c:/Users/user/NestCraft/client/src/utils/images.ts)

Admin form and pages:

- [AdminProductForm.tsx](c:/Users/user/NestCraft/client/src/components/AdminProductForm.tsx)
- [AdminCreateProductPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminCreateProductPage.tsx)
- [AdminEditProductPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminEditProductPage.tsx)

Product image consumers:

- [ProductCard.tsx](c:/Users/user/NestCraft/client/src/components/ProductCard.tsx)
- [ProductsPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductsPage.tsx)
- [ProductDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductDetailPage.tsx)
- [AdminProductsPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminProductsPage.tsx)
- [CartItem.tsx](c:/Users/user/NestCraft/client/src/components/CartItem.tsx)
- [OrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrdersPage.tsx)
- [OrderDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrderDetailPage.tsx)
- [AdminOrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminOrdersPage.tsx)

## Frontend Flow

The upload flow works like this:

1. admin chooses a file in the form
2. the form calls `onImageUpload(file)`
3. the page calls `uploadProductImage(file, token)`
4. the backend returns `{ imageUrl }`
5. the form stores that `imageUrl` in local form state
6. the admin submits the product form
7. the product create or update request includes that `imageUrl`
8. every image-rendering screen resolves the path and displays it

The important design choice is that upload happens before the product save request.

That keeps product create and update requests in ordinary JSON form.

## Upload Service

[adminProducts.ts](c:/Users/user/NestCraft/client/src/services/adminProducts.ts) now includes:

- `UploadProductImageResponse`
- `uploadProductImage(file, token)`

This request sends:

- `multipart/form-data`
- `Authorization: Bearer <token>`

It intentionally does not set a manual `Content-Type` header.

Why:

- the browser must generate the multipart boundary itself

If the frontend set `Content-Type` manually, the upload request would be malformed.

## Why Upload Stays In The Admin Service File

The upload call lives with the admin product service rather than the public product service because:

- it is an admin-only operation
- it always requires an auth token
- it belongs to catalog management, not customer browsing

That keeps the public product service focused on read-only storefront concerns.

## Shared URL Resolution

[images.ts](c:/Users/user/NestCraft/client/src/utils/images.ts) adds:

```ts
resolveImageUrl(imageUrl)
```

This helper exists because uploaded images are stored as:

```text
/api/uploads/products/...
```

Those are not full external URLs.

### Why resolution is required

If the app rendered `/api/uploads/...` naively in every situation, behavior would vary by environment:

- local Vite dev uses a proxy for `/api`
- deployed frontend may call a different backend origin

The resolver fixes that by:

- returning absolute URLs unchanged when the value already starts with `http://` or `https://`
- passing internal upload paths through `buildApiUrl(...)`

That means one helper supports both:

- old external image URLs
- new uploaded image paths

## Admin Form Changes

[AdminProductForm.tsx](c:/Users/user/NestCraft/client/src/components/AdminProductForm.tsx) now owns the upload UI.

The form now handles:

- file picker input
- upload-in-progress state
- upload error state
- image preview
- remove image action

### New prop

The form accepts:

```ts
onImageUpload: (file: File) => Promise<string>
```

That keeps the form reusable while letting the page own token-based service calls.

### Local upload state

The form keeps:

- `uploadingImage`
- `imageError`

separate from the main submit state.

That matters because:

- uploading the image and saving the product are two different async steps
- the UI should show the correct state for each

### Preview behavior

After a successful upload, the returned `imageUrl` is stored into `form.imageUrl`.

The preview then uses:

```ts
resolveImageUrl(form.imageUrl)
```

so the admin can see the uploaded image before saving the full product form.

### Remove behavior

The remove button simply clears:

```ts
form.imageUrl = ''
```

That does not delete the uploaded file from disk.

It only clears the product's current reference to that image in the form state.

## Why The Pages Own The Upload Handler

[AdminCreateProductPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminCreateProductPage.tsx) and [AdminEditProductPage.tsx](c:/Users/user/NestCraft/client/src/pages/AdminEditProductPage.tsx) both define:

```ts
async function handleImageUpload(file: File) {
  const result = await uploadProductImage(file, token)
  return result.imageUrl
}
```

That is the correct place for the handler because:

- the page already has access to the auth token
- the form should stay focused on UI behavior
- page-level data flow remains explicit

## Rendering Uploaded Images Across The App

The upload feature would still be incomplete if only the admin form changed.

Every place that renders `product.imageUrl` needed to support the new stored path format.

That is why the shared resolver is now used in:

- catalog cards
- featured product block
- product detail page
- admin product list
- cart item cards
- customer order history
- customer order detail
- admin order list

This is important because order and cart data also reuse product image references.

## Compatibility With Existing Data

The frontend intentionally still supports old external URLs.

That means:

- seeded products with `https://...` still display
- newly uploaded `/api/uploads/...` paths also display

The app does not require immediate data cleanup to adopt the new flow.

## Error Handling

Upload failures use the same API error parsing flow as the rest of the client.

That lets the form surface backend messages like:

- invalid file type
- file too large
- unauthorized

instead of falling back to a generic failure string every time.

## UX Details

The form currently supports:

- selecting one image file at a time
- previewing the current image
- clearing the image reference
- disabling the submit button during upload

The submit button is intentionally blocked while an upload is in progress.

Why:

- saving before the upload returns would risk submitting stale form state

## What To Test

Minimum frontend verification:

- admin create page can upload an image and show preview
- admin edit page can replace an image and show the new preview
- upload errors display in the form
- submit button is disabled during upload
- clearing the image removes the preview
- saved uploaded image appears on admin products list
- saved uploaded image appears on products page
- saved uploaded image appears on product detail page
- uploaded image continues to render in cart, orders, and admin orders views
- old externally hosted images still render correctly

## What Success Looks Like

This feature is working correctly when:

- admins never need to paste external image URLs for ordinary catalog work
- the admin form gives immediate visual feedback after upload
- uploaded image paths render consistently across the storefront and admin surfaces
- the app behaves the same whether the product image is old external data or a newly uploaded file

## Next Logical Improvements

Useful frontend follow-ups after this slice:

- drag-and-drop upload affordance
- upload progress bar instead of simple status text
- image replacement confirmation
- image deletion workflow tied to backend cleanup

Those are optional refinements. The current implementation already provides the core admin workflow.
