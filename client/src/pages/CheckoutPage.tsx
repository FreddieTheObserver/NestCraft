import { useState } from 'react'
import { Link } from 'react-router-dom'

import StoreHeader from '../components/StoreHeader'
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
            } catch {
                  setError('Failed to place order. Please check your details and try again.')
            } finally {
                  setLoading(false)
            }
      }

      if (createdOrder) {
            return (
                  <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
                        <section className="mx-auto max-w-6xl space-y-8">
                              <StoreHeader />
                              <div className="rounded-[2rem] bg-white p-10 shadow-sm">
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                                          Order confirmed
                                    </p>
                                    <h1 className="mt-4 text-4xl font-semibold">
                                          Your order has been placed successfully.
                                    </h1>
                                    <p className="mt-4 text-stone-600">
                                          Order #{createdOrder.id} is now in <strong>{createdOrder.status}</strong> status.
                                    </p>
                                    <div className="mt-8 grid gap-4 rounded-[1.5rem] bg-stone-50 p-6 sm:grid-cols-3">
                                          <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                                      Subtotal
                                                </p>
                                                <p className="mt-2 text-lg font-semibold">${createdOrder.subtotal}</p>
                                          </div>
                                          <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                                      Shipping
                                                </p>
                                                <p className="mt-2 text-lg font-semibold">${createdOrder.shippingFee}</p>
                                          </div>
                                          <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                                      Total
                                                </p>
                                                <p className="mt-2 text-lg font-semibold text-clay">${createdOrder.totalAmount}</p>
                                          </div>
                                    </div>
                                    <div className="mt-8 flex flex-wrap gap-3">
                                          <Link
                                                to="/products"
                                                className="rounded-full bg-walnut px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-clay"
                                          >
                                                Continue shopping
                                          </Link>
                                          <Link
                                                to="/cart"
                                                className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-walnut transition hover:border-clay hover:text-clay"
                                          >
                                                Back to cart
                                          </Link>
                                    </div>
                              </div>
                        </section>
                  </main>
            )
      }

      if (items.length === 0) {
            return (
                  <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
                        <section className="mx-auto max-w-6xl space-y-8">
                              <StoreHeader />
                              <div className="rounded-[2rem] bg-white p-10 shadow-sm">
                                    <h1 className="text-4xl font-semibold">Checkout needs cart items</h1>
                                    <p className="mt-4 text-stone-600">
                                          Add products to your cart before moving into checkout.
                                    </p>
                                    <Link
                                          to="/products"
                                          className="mt-6 inline-flex rounded-full bg-walnut px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-clay"
                                    >
                                          Browse products
                                    </Link>
                              </div>
                        </section>
                  </main>
            )
      }

      return (
            <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
                  <section className="mx-auto max-w-6xl space-y-8">
                        <StoreHeader />
                        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                              <div className="rounded-[2rem] bg-white p-8 shadow-sm">
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                                          Checkout
                                    </p>
                                    <h1 className="mt-4 text-4xl font-semibold">Shipping information</h1>
                                    <p className="mt-3 text-stone-600">
                                          This is the first checkout skeleton for NestCraft. It creates an order from the current cart.
                                    </p>

                                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                                          <input
                                                type="text"
                                                value={shippingName}
                                                onChange={(event) => setShippingName(event.target.value)}
                                                placeholder="Full name"
                                                className="w-full rounded-xl border border-stone-300 px-4 py-3"
                                          />
                                          <input
                                                type="email"
                                                value={shippingEmail}
                                                onChange={(event) => setShippingEmail(event.target.value)}
                                                placeholder="Email"
                                                className="w-full rounded-xl border border-stone-300 px-4 py-3"
                                          />
                                          <input
                                                type="text"
                                                value={shippingPhone}
                                                onChange={(event) => setShippingPhone(event.target.value)}
                                                placeholder="Phone number"
                                                className="w-full rounded-xl border border-stone-300 px-4 py-3"
                                          />
                                          <input
                                                type="text"
                                                value={shippingCity}
                                                onChange={(event) => setShippingCity(event.target.value)}
                                                placeholder="City"
                                                className="w-full rounded-xl border border-stone-300 px-4 py-3"
                                          />
                                          <textarea
                                                value={shippingAddress}
                                                onChange={(event) => setShippingAddress(event.target.value)}
                                                placeholder="Shipping address"
                                                className="min-h-32 w-full rounded-xl border border-stone-300 px-4 py-3"
                                          />
                                          <textarea
                                                value={notes}
                                                onChange={(event) => setNotes(event.target.value)}
                                                placeholder="Optional order notes"
                                                className="min-h-24 w-full rounded-xl border border-stone-300 px-4 py-3"
                                          />

                                          {error ? <p className="text-sm text-red-500">{error}</p> : null}

                                          <div className="flex flex-wrap gap-3 pt-2">
                                                <button
                                                      type="submit"
                                                      disabled={loading}
                                                      className="rounded-full bg-walnut px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-clay"
                                                >
                                                      {loading ? 'Placing order...' : 'Place order'}
                                                </button>
                                                <Link
                                                      to="/cart"
                                                      className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-walnut transition hover:border-clay hover:text-clay"
                                                >
                                                      Back to cart
                                                </Link>
                                          </div>
                                    </form>
                              </div>

                              <aside className="rounded-[2rem] bg-white p-8 shadow-sm">
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                                          Order summary
                                    </p>
                                    <div className="mt-6 space-y-4">
                                          {items.map((item) => (
                                                <div
                                                      key={item.id}
                                                      className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4"
                                                >
                                                      <div>
                                                            <p className="font-semibold text-walnut">{item.name}</p>
                                                            <p className="mt-1 text-sm text-stone-500">
                                                                  Qty {item.quantity}
                                                            </p>
                                                      </div>
                                                      <p className="font-semibold text-walnut">
                                                            ${(Number(item.price) * item.quantity).toFixed(2)}
                                                      </p>
                                                </div>
                                          ))}
                                    </div>

                                    <div className="mt-8 space-y-3 rounded-[1.5rem] bg-stone-50 p-5">
                                          <div className="flex items-center justify-between text-stone-600">
                                                <span>Subtotal</span>
                                                <span>${subtotal.toFixed(2)}</span>
                                          </div>
                                          <div className="flex items-center justify-between text-stone-600">
                                                <span>Shipping</span>
                                                <span>${shippingFee.toFixed(2)}</span>
                                          </div>
                                          <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-lg font-semibold text-walnut">
                                                <span>Total</span>
                                                <span>${totalAmount.toFixed(2)}</span>
                                          </div>
                                    </div>
                              </aside>
                        </div>
                  </section>
            </main>
      )
}

export default CheckoutPage
