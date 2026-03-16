# API Error Handling

This document covers the frontend changes that let the UI surface backend validation and API errors accurately instead of hiding them behind generic messages.

## Goal

Stop turning all failed requests into vague client-side strings like:

- `"Failed to login"`
- `"Failed to fetch orders"`
- `"Failed to fetch product"`

when the backend already provides a structured and more useful message.

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

The backend could return a useful response like:

```json
{
  "error": {
    "code": "EMAIL_ALREADY_IN_USE",
    "message": "Email already in use"
  }
}
```

But the frontend service would discard it and throw:

```ts
throw new Error("Failed to register")
```

That created two problems:

- users saw worse messages than the backend already had
- validation and business-rule failures became impossible to distinguish in the UI

## The Shared Reader

The helper in [api.ts](c:/Users/user/NestCraft/client/src/utils/api.ts) solves this.

Current logic:

1. try to parse the response body as JSON
2. read `error.message` first
3. fall back to top-level `message`
4. if parsing fails, use the provided fallback string

Conceptually:

```ts
return data.error?.message ?? data.message ?? fallback
```

That gives the frontend a single place to understand backend error payloads.

## Why A Shared Helper Was Better Than Repeating This In Every Service

Without a shared helper:

- every service would need its own JSON parsing logic
- every service could drift into slightly different behavior
- future API response changes would require multiple edits

With the helper:

- behavior is centralized
- service files stay small
- error parsing remains consistent

## Service-Layer Changes

These service files now use `readApiError(...)`:

- [auth.ts](c:/Users/user/NestCraft/client/src/services/auth.ts)
- [orders.ts](c:/Users/user/NestCraft/client/src/services/orders.ts)
- [products.ts](c:/Users/user/NestCraft/client/src/services/products.ts)

That means the service layer now does two things on failure:

1. read the backend error payload
2. throw a new `Error` using the best available message

This keeps page components free from raw `Response` parsing.

## Error Categories The Frontend Can Now Surface Better

### Validation errors

Example backend response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed"
  }
}
```

### Authorization errors

Examples:

- `UNAUTHORIZED`
- `INVALID_TOKEN`
- `FORBIDDEN`

### Business-rule errors

Examples:

- `EMAIL_ALREADY_IN_USE`
- `SLUG_ALREADY_IN_USE`
- `CATEGORY_NOT_FOUND`
- `INSUFFICIENT_STOCK`

These are all structurally different kinds of failures, but the frontend can now at least show the correct human-readable message instead of flattening them into one generic string.

## Page-Level Changes

Pages now use the actual thrown error message:

```ts
catch (error) {
  setError(error instanceof Error ? error.message : "Fallback message")
}
```

This pattern now affects:

- login page
- register page
- checkout page
- products page
- product detail page
- orders page

Why this matters:

- pages stay simple
- user feedback improves immediately
- fallback behavior still exists if something unexpected is thrown

## Examples Of Improved UX

Before:

- duplicate register -> `"Register failed. Try another email."`
- bad login -> `"Login failed. Check your email and password."`
- invalid checkout payload -> `"Failed to place order. Please check your details and try again."`

After:

- duplicate register -> `"Email already in use"`
- invalid token -> `"Invalid or expired token"`
- duplicate slug in admin product create -> `"Slug already in use"`
- out-of-stock checkout -> `"One or more items are out of stock"`

This is a direct improvement in clarity without changing the page architecture much.

## Relationship To Backend Error Format

This frontend pattern depends on the backend using the shared `sendError(...)` shape:

```json
{
  "error": {
    "code": "...",
    "message": "..."
  }
}
```

That means frontend and backend are now loosely coupled around one error contract.

If the backend error shape changes later, `readApiError(...)` is the main place to update.

## Fallback Strategy

The helper still takes a fallback string for a reason.

Not every failed response is guaranteed to be:

- valid JSON
- in the expected structure

Examples:

- proxy issue
- unexpected HTML error page
- runtime failure outside the normal API envelope

So the behavior is:

- prefer backend message
- otherwise use a safe generic fallback

That is the correct defensive behavior.

## Text Cleanup

This pass also cleaned up the corrupted separator text in [OrdersPage.tsx](c:/Users/user/NestCraft/client/src/pages/OrdersPage.tsx).

Bad old output:

```text
Qty 1 · $49.99 each
```

when encoding went wrong, it rendered as broken characters.

Current output:

```text
Qty 1 - $49.99 each
```

Using ASCII separators is the safer choice in this repo because it avoids mixed encoding artifacts.

## What Success Looks Like

This frontend hardening is working when:

- backend validation messages reach the UI
- auth, orders, and products all use the same parsing logic
- pages no longer swallow useful backend errors
- generic fallback strings are only used when parsing the response is not possible
- corrupted text artifacts no longer appear in the relevant screens

## Future Improvements

Later, if you want richer UI behavior, the next step would be to preserve not just `message` but also:

- `error.code`
- `error.details`

That would allow:

- field-level form error rendering
- more specific UI branching
- smarter retry behavior

For now, message-level propagation is the right level of complexity.
