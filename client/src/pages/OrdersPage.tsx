import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import PageShell from '../components/PageShell'
import StatusPanel from '../components/StatusPanel'
import { useAuth } from '../context/AuthContext'
import { getMyOrders, type OrderResponse } from '../services/orders'

const statusCopy = {
  pending: 'Pending review',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
} as const

const statusTone = {
  pending: 'bg-secondary/10 text-secondary',
  confirmed: 'bg-surface-high text-ink',
  cancelled: 'bg-error-soft text-error',
} as const

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
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load your orders.',
          )
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
      <PageShell maxWidth="7xl">
        <StatusPanel
          eyebrow="Your orders"
          title="Loading your purchase archive..."
          message="Fetching saved NestCraft orders for this account."
        />
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell maxWidth="7xl">
        <StatusPanel
          eyebrow="Orders unavailable"
          title="We could not load your orders."
          message={error}
          tone="error"
        />
      </PageShell>
    )
  }

  if (orders.length === 0) {
    return (
      <PageShell maxWidth="7xl">
        <StatusPanel
          eyebrow="Your orders"
          title="No purchases yet."
          message="Complete checkout once and your order history will begin building here."
        >
          <Link to="/products" className="editorial-button-primary mt-8">
            Browse products
          </Link>
        </StatusPanel>
      </PageShell>
    )
  }

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
  const pendingCount = orders.filter((order) => order.status === 'pending').length

  return (
    <PageShell maxWidth="7xl">
      <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <div className="space-y-4">
          <p className="editorial-kicker">Purchase history</p>
          <h1 className="editorial-title max-w-4xl">A calm ledger of everything you have ordered.</h1>
          <p className="editorial-copy max-w-2xl">
            Review saved order numbers, revisit product choices, and keep track of
            the order statuses returned by the backend.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="editorial-stat">
            <p className="editorial-kicker text-primary">Orders placed</p>
            <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink">
              {orders.length}
            </p>
          </div>
          <div className="editorial-stat">
            <p className="editorial-kicker text-primary">Pending</p>
            <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink">
              {pendingCount}
            </p>
          </div>
          <div className="editorial-stat">
            <p className="editorial-kicker text-primary">Total spent</p>
            <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink">
              ${totalSpent.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        {orders.map((order) => (
          <article key={order.id} className="editorial-panel p-7 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <div className="space-y-3">
                  <p className="editorial-kicker">{order.orderNumber}</p>
                  <h2 className="font-display text-4xl leading-tight tracking-[-0.03em] text-ink">
                    {order.items.length} item(s) in this order
                  </h2>
                  <p className="editorial-copy">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-surface-low p-4 transition-colors hover:bg-surface-container"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-xl bg-surface-white">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[0.7rem] uppercase tracking-[0.16em] text-primary">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/products/${item.product.slug}`}
                            className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink transition hover:text-secondary"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-2 text-sm text-primary">
                            Qty {item.quantity} - ${item.unitPrice} each
                          </p>
                        </div>

                        <p className="text-sm font-bold uppercase tracking-[0.12em] text-ink">
                          ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="space-y-4">
                <div className="editorial-mini-cart p-5">
                  <p className="editorial-kicker text-primary">Status</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span
                      className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${statusTone[order.status]}`}
                    >
                      {statusCopy[order.status]}
                    </span>
                    <span className="text-lg font-bold tracking-[-0.02em] text-ink">
                      ${order.totalAmount}
                    </span>
                  </div>
                </div>

                <div className="editorial-panel-muted p-5">
                  <p className="editorial-kicker text-primary">Delivery details</p>
                  <div className="mt-4 space-y-2 text-sm leading-6 text-primary">
                    <p>{order.shippingName}</p>
                    <p>{order.shippingEmail}</p>
                    <p>{order.shippingPhone}</p>
                    <p>{order.shippingCity}</p>
                    <p>{order.shippingAddress}</p>
                    {order.notes ? <p>Notes: {order.notes}</p> : null}
                  </div>
                </div>

                <div className="editorial-panel-muted p-5">
                  <div className="flex items-center justify-between text-sm text-primary">
                    <span>Subtotal</span>
                    <span>${order.subtotal}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-primary">
                    <span>Shipping</span>
                    <span>${order.shippingFee}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between text-lg font-bold tracking-[-0.02em] text-ink">
                    <span>Total</span>
                    <span>${order.totalAmount}</span>
                  </div>
                </div>

                <Link
                  to={`/orders/${order.orderNumber}`}
                  className="editorial-button-primary w-full"
                >
                  View order details
                </Link>
              </aside>
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  )
}

export default OrdersPage
