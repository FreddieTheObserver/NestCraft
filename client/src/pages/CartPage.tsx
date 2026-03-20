import { Link } from 'react-router-dom'

import CartItem from '../components/CartItem'
import PageShell from '../components/PageShell'
import StatusPanel from '../components/StatusPanel'
import { useCart } from '../context/CartContext'

function CartPage() {
  const { items, subtotal, totalItems, clearCart } = useCart()
  const shippingEstimate = subtotal >= 100 ? 0 : 10
  const freeShippingGap = Math.max(0, 100 - subtotal)

  if (items.length === 0) {
    return (
      <PageShell maxWidth="6xl">
        <StatusPanel
          eyebrow="Cart atelier"
          title="Your cart is still open space."
          message="Add a few NestCraft pieces and the review panel will start taking shape."
          className="max-w-4xl"
        >
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/products" className="editorial-button-primary">
              Browse collection
            </Link>
            <Link to="/orders" className="editorial-button-secondary">
              View past orders
            </Link>
          </div>
        </StatusPanel>
      </PageShell>
    )
  }

  return (
    <PageShell maxWidth="7xl">
      <section className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-7">
          <div className="space-y-5">
            <p className="editorial-kicker">Cart atelier</p>
            <h1 className="editorial-title max-w-3xl">Review the pieces you want to bring home.</h1>
            <p className="editorial-copy max-w-2xl">
              Adjust quantity, remove anything that no longer fits, and move into
              checkout when the edit feels right.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[0.85fr_0.85fr_1.3fr]">
            <div className="editorial-stat">
              <p className="editorial-kicker text-primary">Items selected</p>
              <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink">
                {totalItems}
              </p>
            </div>
            <div className="editorial-stat">
              <p className="editorial-kicker text-primary">Subtotal</p>
              <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink">
                ${subtotal.toFixed(2)}
              </p>
            </div>
            <div className="editorial-panel-muted p-5">
              <p className="editorial-kicker text-primary">Shipping note</p>
              <p className="mt-4 text-sm leading-6 text-primary">
                {freeShippingGap === 0
                  ? 'Free shipping is active for this edit.'
                  : `Add $${freeShippingGap.toFixed(2)} more to unlock free shipping.`}
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <aside className="space-y-5 self-start lg:sticky lg:top-6">
          <div className="editorial-mini-cart p-7 sm:p-8">
            <p className="editorial-kicker text-primary">Order summary</p>
            <div className="mt-8 grid gap-4">
              <div className="editorial-panel-muted p-5">
                <p className="editorial-caption">Items selected</p>
                <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-ink">
                  {totalItems}
                </p>
              </div>
              <div className="editorial-panel-muted p-5">
                <div className="flex items-center justify-between text-sm text-primary">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-primary">
                  <span>Estimated shipping</span>
                  <span>${shippingEstimate.toFixed(2)}</span>
                </div>
                <div className="mt-5 flex items-center justify-between text-xl font-bold tracking-[-0.03em] text-ink">
                  <span>Projected total</span>
                  <span>${(subtotal + shippingEstimate).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link to="/checkout" className="editorial-button-primary">
                Proceed to checkout
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="editorial-button-secondary"
              >
                Clear cart
              </button>
              <Link to="/products" className="editorial-button-tertiary">
                Continue browsing
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </PageShell>
  )
}

export default CartPage
