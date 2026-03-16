import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import StoreHeader from '../components/StoreHeader'
import { useAuth } from '../context/AuthContext'
import { getMyOrders, type OrderResponse } from '../services/orders'

function OrdersPage() {
      const { token } = useAuth()
      const [orders, setOrders] = useState<OrderResponse[]>([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState('')

      useEffect(() => {
            let cancelled = false

            async function loadOrders() {
                  if (!token) {
                        setError('You must be logged in to view your orders.')
                        setLoading(false)
                        return
                  }

                  try {
                        setLoading(true)
                        setError('')

                        const data = await getMyOrders(token)

                        if (!cancelled) {
                              setOrders(data)
                        }
                  } catch (error) {
                        if (!cancelled) {
                              setError(error instanceof Error ? error.message : 'Failed to load your orders.')
                        }
                  } finally {
                        if (!cancelled) {
                              setLoading(false)
                        }
                  }
            }

            void loadOrders()

            return () => {
                  cancelled = true
            }
      }, [token])

      if (loading) {
            return (
                  <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
                        <section className="mx-auto max-w-7xl space-y-8">
                              <StoreHeader />
                              <div className="rounded-[2rem] bg-white p-10 shadow-sm">
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                                          Your orders
                                    </p>
                                    <h1 className="mt-4 text-4xl font-semibold">Loading purchase history...</h1>
                              </div>
                        </section>
                  </main>
            )
      }

      if (error) {
            return (
                  <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
                        <section className="mx-auto max-w-7xl space-y-8">
                              <StoreHeader />
                              <div className="rounded-[2rem] border border-red-200 bg-white p-10 shadow-sm">
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-500">
                                          Orders unavailable
                                    </p>
                                    <h1 className="mt-4 text-4xl font-semibold">We could not load your orders.</h1>
                                    <p className="mt-4 text-stone-600">{error}</p>
                              </div>
                        </section>
                  </main>
            )
      }

      if (orders.length === 0) {
            return (
                  <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
                        <section className="mx-auto max-w-7xl space-y-8">
                              <StoreHeader />
                              <div className="rounded-[2rem] bg-white p-10 shadow-sm">
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                                          Your orders
                                    </p>
                                    <h1 className="mt-4 text-4xl font-semibold">No purchases yet.</h1>
                                    <p className="mt-4 text-stone-600">
                                          Once you complete checkout, your orders will appear here.
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
                  <section className="mx-auto max-w-7xl space-y-8">
                        <StoreHeader />
                        <div className="grid gap-8 rounded-[2rem] bg-gradient-to-r from-white/70 via-white/40 to-transparent p-8 shadow-[0_20px_50px_rgba(32,26,22,0.06)] lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                              <div className="space-y-4">
                                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">
                                          Purchase history
                                    </p>
                                    <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                                          Review the orders you have placed with NestCraft.
                                    </h1>
                                    <p className="max-w-2xl text-base leading-7 text-stone-600">
                                          This page shows the server-saved orders created through the checkout endpoint.
                                    </p>
                              </div>
                              <div className="rounded-[1.5rem] border border-stone-200/80 bg-white/80 p-6">
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                                          Order snapshot
                                    </p>
                                    <div className="mt-5 grid grid-cols-2 gap-4">
                                          <div>
                                                <p className="text-3xl font-semibold text-walnut">{orders.length}</p>
                                                <p className="mt-1 text-sm text-stone-500">Orders placed</p>
                                          </div>
                                          <div>
                                                <p className="text-3xl font-semibold text-walnut">
                                                      ${orders.reduce((sum, order) => sum + Number(order.totalAmount), 0).toFixed(2)}
                                                </p>
                                                <p className="mt-1 text-sm text-stone-500">Total spent</p>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        <div className="space-y-6">
                              {orders.map((order) => (
                                    <article
                                          key={order.id}
                                          className="rounded-[2rem] bg-white p-8 shadow-[0_18px_40px_rgba(32,26,22,0.05)]"
                                    >
                                          <div className="flex flex-col gap-5 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay">
                                                            Order #{order.id}
                                                      </p>
                                                      <h2 className="mt-3 text-2xl font-semibold text-walnut">
                                                            {order.items.length} item(s) in this order
                                                      </h2>
                                                      <p className="mt-2 text-sm text-stone-500">
                                                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                                                      </p>
                                                </div>
                                                <div className="rounded-[1.5rem] bg-stone-50 px-5 py-4 text-right">
                                                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                                            Status
                                                      </p>
                                                      <p className="mt-2 text-lg font-semibold text-walnut">{order.status}</p>
                                                      <p className="mt-2 text-sm text-stone-500">
                                                            Total ${order.totalAmount}
                                                      </p>
                                                </div>
                                          </div>

                                          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                                                <div className="space-y-4">
                                                      {order.items.map((item) => (
                                                            <div
                                                                  key={item.id}
                                                                  className="flex items-center gap-4 rounded-[1.5rem] border border-stone-200/80 p-4"
                                                            >
                                                                  <div className="h-20 w-20 overflow-hidden rounded-xl bg-stone-100">
                                                                        {item.product.imageUrl ? (
                                                                              <img
                                                                                    src={item.product.imageUrl}
                                                                                    alt={item.product.name}
                                                                                    className="h-full w-full object-cover"
                                                                              />
                                                                        ) : (
                                                                              <div className="flex h-full items-center justify-center text-xs text-stone-500">
                                                                                    No image
                                                                              </div>
                                                                        )}
                                                                  </div>
                                                                  <div className="min-w-0 flex-1">
                                                                        <Link
                                                                              to={`/products/${item.product.slug}`}
                                                                              className="text-lg font-semibold text-walnut transition hover:text-clay"
                                                                        >
                                                                              {item.product.name}
                                                                        </Link>
                                                                        <p className="mt-1 text-sm text-stone-500">
                                                                              Qty {item.quantity} - ${item.unitPrice} each
                                                                        </p>
                                                                  </div>
                                                                  <p className="text-sm font-semibold text-walnut">
                                                                        ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                                                                  </p>
                                                            </div>
                                                      ))}
                                                </div>

                                                <aside className="rounded-[1.5rem] bg-stone-50 p-5">
                                                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                                                            Delivery details
                                                      </p>
                                                      <div className="mt-4 space-y-3 text-sm text-stone-600">
                                                            <p><strong className="text-walnut">Name:</strong> {order.shippingName}</p>
                                                            <p><strong className="text-walnut">Email:</strong> {order.shippingEmail}</p>
                                                            <p><strong className="text-walnut">Phone:</strong> {order.shippingPhone}</p>
                                                            <p><strong className="text-walnut">City:</strong> {order.shippingCity}</p>
                                                            <p><strong className="text-walnut">Address:</strong> {order.shippingAddress}</p>
                                                            {order.notes ? (
                                                                  <p><strong className="text-walnut">Notes:</strong> {order.notes}</p>
                                                            ) : null}
                                                      </div>
                                                      <div className="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
                                                            <div className="flex items-center justify-between text-stone-600">
                                                                  <span>Subtotal</span>
                                                                  <span>${order.subtotal}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-stone-600">
                                                                  <span>Shipping</span>
                                                                  <span>${order.shippingFee}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between font-semibold text-walnut">
                                                                  <span>Total</span>
                                                                  <span>${order.totalAmount}</span>
                                                            </div>
                                                      </div>
                                                </aside>
                                          </div>
                                    </article>
                              ))}
                        </div>
                  </section>
            </main>
      )
}

export default OrdersPage
