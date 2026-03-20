import type { CartItem as CartItemType } from '../context/CartContext'
import { useCart } from '../context/CartContext'

type CartItemProps = {
  item: CartItemType
}

function CartItem({ item }: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCart()
  const itemTotal = (Number(item.price) * item.quantity).toFixed(2)

  return (
    <article className="editorial-panel-muted p-5 sm:p-6">
      <div className="grid gap-5 md:grid-cols-[150px_1fr] xl:grid-cols-[150px_1fr_auto]">
        <div className="overflow-hidden rounded-[1.25rem] bg-surface-white">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="aspect-[4/5] h-full w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center px-4 text-center text-xs uppercase tracking-[0.18em] text-primary">
            No image
          </div>
        )}
        </div>

        <div className="flex flex-col justify-between gap-6">
          <div className="space-y-2">
            <p className="editorial-kicker text-primary">Cart selection</p>
            <h2 className="font-display text-3xl leading-tight tracking-[-0.02em] text-ink">
              {item.name}
            </h2>
            <p className="text-sm leading-6 text-primary">
              ${item.price} each. Adjust quantity here without leaving the review flow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-surface-white p-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="editorial-button-secondary min-w-11 px-0"
              >
                -
              </button>

              <span className="min-w-10 text-center text-sm font-bold uppercase tracking-[0.12em] text-ink">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="editorial-button-secondary min-w-11 px-0"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => removeFromCart(item.id)}
              className="editorial-button-tertiary"
            >
              Remove
            </button>
          </div>
        </div>

        <div className="editorial-mini-cart flex flex-col justify-between gap-3 p-5 xl:min-w-[12rem]">
          <p className="editorial-kicker text-primary">Item total</p>
          <p className="text-3xl font-bold tracking-[-0.04em] text-ink">
            ${itemTotal}
          </p>
          <p className="text-sm leading-6 text-primary">
            Quantity changes update the running total immediately.
          </p>
        </div>
      </div>
    </article>
  )
}

export default CartItem
