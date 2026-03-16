# Local Cart With localStorage

This document covers the first cart implementation for `NestCraft`.

This cart is intentionally frontend-only.

## Goal

Support the first real ecommerce interaction:

1. open a product detail page
2. add a product to cart
3. view cart contents
4. update quantity
5. remove items
6. keep the cart after page refresh

This version does not use backend cart APIs yet.

## Why The Cart Is Frontend-Only First

The cart stays in the client at this stage because it is the simplest useful version.

Benefits:

- faster to build
- easier to debug
- no cart tables or cart endpoints needed yet
- no guest/cart merge complexity
- enough to validate the storefront purchase flow

Backend cart logic is better added later, after account persistence requirements are stronger.

## Files Involved

- [CartContext.tsx](c:/Users/user/NestCraft/client/src/context/CartContext.tsx)
- [CartPage.tsx](c:/Users/user/NestCraft/client/src/pages/CartPage.tsx)
- [CartItem.tsx](c:/Users/user/NestCraft/client/src/components/CartItem.tsx)
- [main.tsx](c:/Users/user/NestCraft/client/src/main.tsx)
- [ProductDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductDetailPage.tsx)
- [StoreHeader.tsx](c:/Users/user/NestCraft/client/src/components/StoreHeader.tsx)

## Cart State Shape

The cart uses a deliberately minimal item shape:

```ts
type CartItem = {
  id: number
  slug: string
  name: string
  price: string
  imageUrl: string | null
  quantity: number
}
```

Why these fields exist:

- `id`
  - stable identity for quantity updates and removal
- `slug`
  - lets the UI link back to product detail
- `name`
  - display label in cart and checkout
- `price`
  - used for subtotal calculation
- `imageUrl`
  - allows small product thumbnails
- `quantity`
  - tracks purchase intent

Why the entire product object is not stored:

- the cart only needs a small subset of product data
- minimal cart state is easier to persist and reason about

## Why Context Is Used

Cart state must be shared across multiple parts of the app:

- product detail page
- cart page
- header cart count
- checkout page

That is why the state lives in [CartContext.tsx](c:/Users/user/NestCraft/client/src/context/CartContext.tsx) instead of one page component.

The context exposes:

- `items`
- `addToCart`
- `removeFromCart`
- `updateQuantity`
- `clearCart`
- `totalItems`
- `subtotal`

This makes the cart a reusable application-level state container.

## How localStorage Is Used

The cart is persisted with `localStorage` under the key:

- `cart`

Two effects make this work:

1. load the stored cart when the app starts
2. save the cart whenever `items` changes

This is why cart contents survive page refreshes.

Why this was the right early choice:

- no backend dependency
- no auth dependency
- simple mental model

## Add-To-Cart Flow

The add-to-cart action currently begins on the product detail page.

Flow:

1. user opens `/products/:slug`
2. user clicks `Add to cart`
3. `useCart().addToCart(...)` is called
4. the context checks whether that product already exists
5. if it exists, quantity is incremented
6. if it does not exist, a new item is inserted with `quantity: 1`
7. updated cart state is written to `localStorage`

This gives the storefront its first real purchase-intent interaction.

## Quantity And Removal Logic

The cart item component handles:

- increment quantity
- decrement quantity
- remove item entirely

Important rule:

- if quantity becomes less than `1`, the item is removed

That is a good default behavior because carts do not need zero-quantity lines.

## Derived Values

Two values are derived from `items`:

- `totalItems`
- `subtotal`

### Total items

This is the sum of all quantities and is useful for:

- header cart badge
- quick cart summary text

### Subtotal

Subtotal is calculated in [CartContext.tsx](c:/Users/user/NestCraft/client/src/context/CartContext.tsx):

```ts
const subtotal = items.reduce(
  (sum, item) => sum + Number(item.price) * item.quantity,
  0
)
```

How it works:

- `item.price` is stored as a string because product prices come from the API that way
- `Number(item.price)` converts it into a numeric value for calculation
- each line total is aggregated into the subtotal

The displayed subtotal is then formatted later with:

```ts
subtotal.toFixed(2)
```

## App Wiring

The whole app is wrapped with `CartProvider` in [main.tsx](c:/Users/user/NestCraft/client/src/main.tsx).

That is what allows any page or component to call:

- `useCart()`

Without that provider, cart hooks would fail because there would be no context instance above the component tree.

## Why This Cart Still Works Well Even After Auth Was Added

The project later added authentication, but the cart remained local-first.

That is still a valid decision because:

- checkout already has access to the logged-in user when needed
- local cart is good enough for the current storefront flow
- server-side cart persistence would add significantly more complexity

The current user flow is still coherent:

1. browse catalog
2. add products to local cart
3. log in if needed
4. go to checkout
5. create real order in backend

## What This Does Not Do Yet

This cart does not yet support:

- user-specific carts on the server
- cart sync across devices
- guest-to-user cart merge
- abandoned-cart recovery
- persisted server cart state after logout/login across browsers

Those belong to a later phase if the project needs them.

## What To Test

The local cart system is working when:

- a product can be added from the detail page
- `/cart` shows the item
- quantity can be increased and decreased
- items can be removed
- subtotal updates correctly
- refreshing the page keeps the cart
- cart count updates in the shared header

## What Success Looks Like

This local-cart implementation is complete enough for the current project stage when:

- browsing naturally leads into cart usage
- the cart behaves predictably across refreshes
- checkout can consume cart items without extra transformation complexity

## What Comes Next

The next features that build directly on this cart are:

- checkout UX improvements
- admin/product polish around inventory behavior
- eventual server-side cart only if account-based persistence becomes necessary
