# API Error Handling

This document covers the frontend changes that allow the UI to display backend validation and API errors more accurately.

## Goal

Stop throwing generic client-side error strings like `"Failed to login"` when the backend already provides a more specific error message.

## Files Involved

- [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts)
- [auth.ts](c:/Users/user/NestCraft/client/src/services/auth.ts)
- [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts)
- [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts)
- [LoginPage.tsx](c:/Users/user/NestCraft/client/src/pages/LoginPage.tsx)
- [RegisterPage.tsx](c:/Users/user/NestCraft/client/src/pages/RegisterPage.tsx)
- [CheckoutPage.tsx](c:/Users/user/NestCraft/client/src/pages/CheckoutPage.tsx)
- [ProductsPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductsPage.tsx)
- [ProductDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductDetailPage.tsx)
- [OrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrdersPage.tsx)

## The Problem Before

The backend could return useful responses like:

```json
{
  "error": {
    "code": "EMAIL_ALREADY_IN_USE",
    "message": "Email already in use"
  }
}
```

But the frontend services were discarding that message and throwing generic errors instead.

That meant users saw low-value UI messages even when the API had better information.

## The Shared Reader

The helper in [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts) reads the backend error payload and extracts the best available message.

It checks:

- `error.message`
- fallback `message`
- a provided fallback string if parsing fails

This keeps the error-reading logic in one place instead of duplicating it in every service.

## Service-Layer Changes

These service files now use `readApiError(...)`:

- [auth.ts](c:/Users/user/NestCraft/client/src/services/auth.ts)
- [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts)
- [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts)

That means when the server returns a structured error, the service throws:

- the server's message first
- the generic fallback only if parsing fails

## Page-Level Changes

The page components were updated to use the actual thrown error message:

```ts
catch (error) {
  setError(error instanceof Error ? error.message : "Fallback message");
}
```

This now affects:

- login
- register
- checkout
- product list
- product detail
- orders page

## Result

The UI now reflects backend validation more accurately.

Examples:

- invalid email -> the page can show the server validation message
- duplicate register -> the page can show `"Email already in use"`
- invalid checkout payload -> the page can show the server's order validation message

## Text Cleanup

During this pass, the corrupted separator text in [OrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrdersPage.tsx) was also cleaned up.

Bad:

```text
Qty 1 Â· $49.99 each
```

Current:

```text
Qty 1 - $49.99 each
```

Using ASCII separators here is safer than leaving mixed encoding artifacts in the UI.

## What Success Looks Like

This frontend hardening is working when:

- backend validation messages reach the UI
- generic fallback strings are only used when needed
- product, auth, and order pages all surface real API feedback
- corrupted text artifacts are no longer visible
