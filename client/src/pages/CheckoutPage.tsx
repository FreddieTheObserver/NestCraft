import { useState } from 'react'
import { Link } from 'react-router-dom'

import PageShell from '../components/PageShell'
import StatusPanel from '../components/StatusPanel'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder, type OrderResponse } from '../services/orders'

function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user, token } = useAuth()

  const [shippingName, setShippingName] = useState(user?.name ?? '')
  const [shippingEmail, setShippingEmail] = useState(user?.email ?? '')
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null)

  const shippingFee = subtotal >= 100 ? 0 : 10
  const totalAmount = subtotal + shippingFee

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      setError('You must be logged in to place an order.')
      return
    }

    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const order = await createOrder(
        {
          shippingName,
          shippingEmail,
          shippingPhone,
          shippingCity,
          shippingAddress,
          notes: notes || undefined,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
        token,
      )

      setCreatedOrder(order)
      clearCart()
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Failed to place order. Please check your details and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (createdOrder) {
    return (
      <PageShell maxWidth="6xl">
        <StatusPanel
          eyebrow="Order confirmed"
          title="Your order is now part of the NestCraft ledger."
          message={`Order ${createdOrder.orderNumber} was created successfully and is currently ${createdOrder.status}.`}
        >
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="editorial-panel p-5">
              <p className="editorial-kicker text-primary">Subtotal</p>
              <p className="mt-4 text-2xl font-bold tracking-[-0.03em] text-ink">
                ${createdOrder.subtotal}
              </p>
            </div>
            <div className="editorial-panel p-5">
              <p className="editorial-kicker text-primary">Shipping</p>
              <p className="mt-4 text-2xl font-bold tracking-[-0.03em] text-ink">
                ${createdOrder.shippingFee}
              </p>
            </div>
            <div className="editorial-panel p-5">
              <p className="editorial-kicker text-primary">Total</p>
              <p className="mt-4 text-2xl font-bold tracking-[-0.03em] text-ink">
                ${createdOrder.totalAmount}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/products" className="editorial-button-primary">
              Continue shopping
            </Link>
            <Link
              to={`/orders/${createdOrder.orderNumber}`}
              className="editorial-button-secondary"
            >
              View order details
            </Link>
          </div>
        </StatusPanel>
      </PageShell>
    )
  }

  if (items.length === 0) {
    return (
      <PageShell maxWidth="6xl">
        <StatusPanel
          eyebrow="Checkout"
          title="Checkout needs a few selected pieces first."
          message="Add products to your cart before moving into shipping and order creation."
        >
          <Link to="/products" className="editorial-button-primary mt-8">
            Browse products
          </Link>
        </StatusPanel>
      </PageShell>
    )
  }

  return (
    <PageShell maxWidth="7xl">
      <section className="grid gap-12 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="editorial-kicker">Checkout</p>
            <h1 className="editorial-title max-w-3xl">Shipping details for your current edit.</h1>
            <p className="editorial-copy max-w-2xl">
              Complete the delivery fields below and the backend will convert your
              cart into a saved order with a customer-facing order number.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="editorial-panel p-7 sm:p-9">
              <div className="space-y-2">
                <p className="editorial-kicker text-primary">Contact</p>
                <p className="text-sm leading-6 text-primary">
                  Use the customer details that should travel with this order record.
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="editorial-field-label">Full name</label>
                  <input
                    type="text"
                    value={shippingName}
                    onChange={(event) => setShippingName(event.target.value)}
                    placeholder="Jordan Ellis"
                    className="editorial-input mt-3"
                  />
                </div>
                <div>
                  <label className="editorial-field-label">Email</label>
                  <input
                    type="email"
                    value={shippingEmail}
                    onChange={(event) => setShippingEmail(event.target.value)}
                    placeholder="jordan@example.com"
                    className="editorial-input mt-3"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="editorial-field-label">Phone</label>
                  <input
                    type="text"
                    value={shippingPhone}
                    onChange={(event) => setShippingPhone(event.target.value)}
                    placeholder="+1 555 0134"
                    className="editorial-input mt-3"
                  />
                </div>
                <div>
                  <label className="editorial-field-label">City</label>
                  <input
                    type="text"
                    value={shippingCity}
                    onChange={(event) => setShippingCity(event.target.value)}
                    placeholder="Copenhagen"
                    className="editorial-input mt-3"
                  />
                </div>
              </div>
            </div>

            <div className="editorial-panel-muted p-7 sm:p-9">
              <div className="space-y-2">
                <p className="editorial-kicker text-primary">Delivery</p>
                <p className="text-sm leading-6 text-primary">
                  Add the address and any context the delivery team should keep with the order.
                </p>
              </div>

              <div className="mt-6">
                <label className="editorial-field-label">Shipping address</label>
                <textarea
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                  placeholder="Street, building, unit, and delivery details"
                  className="editorial-textarea mt-3 min-h-32"
                />
              </div>

              <div className="mt-5">
                <label className="editorial-field-label">Optional notes</label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Access codes, delivery preferences, or receiving notes"
                  className="editorial-textarea mt-3 min-h-24"
                />
              </div>
            </div>

            {error ? <p className="editorial-error">{error}</p> : null}

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="editorial-button-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Placing order...' : 'Place order'}
              </button>
              <Link to="/cart" className="editorial-button-secondary">
                Back to cart
              </Link>
            </div>
          </form>
        </div>

        <aside className="space-y-5 self-start lg:sticky lg:top-6">
          <div className="editorial-mini-cart p-7 sm:p-8">
            <p className="editorial-kicker text-primary">Order summary</p>
            <div className="mt-4 rounded-xl bg-surface-white/60 p-4">
              <p className="text-sm leading-6 text-primary">
                Orders above $100 move through checkout with free shipping already applied.
              </p>
            </div>
            <div className="mt-6 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg bg-surface-white p-4 shadow-ambient">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
                        {item.name}
                      </p>
                      <p className="mt-2 text-sm text-primary">Qty {item.quantity}</p>
                    </div>
                    <p className="text-lg font-bold tracking-[-0.02em] text-ink">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-surface-white p-5 shadow-ambient">
              <div className="flex items-center justify-between text-sm text-primary">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-primary">
                <span>Shipping</span>
                <span>${shippingFee.toFixed(2)}</span>
              </div>
              <div className="mt-5 flex items-center justify-between text-xl font-bold tracking-[-0.03em] text-ink">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </PageShell>
  )
}

export default CheckoutPage
