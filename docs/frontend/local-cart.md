# Local Cart With localStorage

This note documents the first cart implementation for `NestCraft`.

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
- no authentication required
- no cart tables or cart endpoints needed yet
- easy to test the shopping flow

Backend cart logic is better added later, after authentication.

## Files Involved

- [CartContext.tsx](c:/Users/user/NestCraft/client/src/context/CartContext.tsx)
- [CartPage.tsx](c:/Users/user/NestCraft/client/src/pages/CartPage.tsx)
- [CartItem.tsx](c:/Users/user/NestCraft/client/src/components/CartItem.tsx)
- [main.tsx](c:/Users/user/NestCraft/client/src/main.tsx)
- [ProductDetailPage.tsx](c:/Users/user/NestCraft/client/src/pages/ProductDetailPage.tsx)

## Cart State Shape

The cart uses a minimal item shape:

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

- `id`: internal identity for updates and removal
- `slug`: lets the UI link back to a product page
- `name`: displays the product title
- `price`: used for subtotal calculation
- `imageUrl`: shows a cart thumbnail
- `quantity`: tracks how many units are in the cart

## Why Context Is Used

The cart needs to be shared across multiple pages.

That is why the state lives in `CartContext` instead of inside one page component.

The context exposes:

- `items`
- `addToCart`
- `removeFromCart`
- `updateQuantity`
- `clearCart`
- `totalItems`
- `subtotal`

## How localStorage Is Used

The cart is persisted with `localStorage`.

Two effects make this work:

1. load the cart from `localStorage` when the app starts
2. save the cart to `localStorage` whenever items change

That is why the cart survives page refreshes.

## Add To Cart Flow

The add-to-cart action starts in the product detail page.

Flow:

1. user opens `/products/:slug`
2. user clicks `Add to cart`
3. `useCart().addToCart(...)` is called
4. context checks whether the item already exists
5. if it exists, quantity increases
6. if not, a new cart item is created with `quantity: 1`
7. updated cart is stored in state and saved to `localStorage`

## Quantity And Removal Logic

The cart item component handles:

- increment quantity
- decrement quantity
- remove item entirely

Important rule:

- if quantity becomes less than `1`, the item is removed from the cart

## Price Calculation

The subtotal is calculated in [CartContext.tsx](c:/Users/user/NestCraft/client/src/context/CartContext.tsx).

The calculation is:

```ts
const subtotal = items.reduce(
  (sum, item) => sum + Number(item.price) * item.quantity,
  0
)
```

How it works:

- `Number(item.price)` converts the stored price string into a number
- `item.quantity` gives the number of units
- each line total is added into one running subtotal

The displayed subtotal is then formatted in the cart page with:

```ts
subtotal.toFixed(2)
```

## App Wiring

The whole app is wrapped with `CartProvider` in [main.tsx](c:/Users/user/NestCraft/client/src/main.tsx).

That is what allows any page or component to call `useCart()`.

Without that provider, cart hooks would fail.

## What Success Looks Like

The local cart system is working when:

- a product can be added from the detail page
- `/cart` shows the item
- quantity can be increased and decreased
- items can be removed
- subtotal updates correctly
- refreshing the page keeps the cart

## What This Does Not Do Yet

This cart does not yet support:

- user-specific carts on the server
- cart sync across devices
- guest-to-user cart merge
- checkout persistence in the database

Those belong to a later phase after authentication.

## Next Step After Local Cart

The next good follow-up is usually:

- navbar with cart count

After that:

- authentication
- checkout skeleton
- later backend cart persistence if needed
