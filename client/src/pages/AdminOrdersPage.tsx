import { useEffect, useState } from 'react'

import PageShell from '../components/PageShell'
import StatusPanel from '../components/StatusPanel'
import { useAuth } from '../context/AuthContext'
import {
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
} from '../services/adminOrders'
import type { OrderStatus } from '../services/orders'

const statusCopy: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
}

const statusTone: Record<OrderStatus, string> = {
  pending: 'bg-secondary/10 text-secondary',
  confirmed: 'bg-surface-high text-ink',
  cancelled: 'bg-error-soft text-error',
}

function AdminOrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadOrders() {
      try {
        setLoading(true)
        setError('')

        const data = await getAdminOrders(token)

        if (!cancelled) {
          setOrders(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to fetch admin orders',
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

  async function handleStatusChange(id: number, status: OrderStatus) {
    try {
      setUpdatingId(id)
      setError('')

      const updatedOrder = await updateAdminOrderStatus(id, status, token)

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === id ? updatedOrder : order)),
      )
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Failed to update order status',
      )
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <PageShell maxWidth="7xl">
        <StatusPanel
          eyebrow="Admin orders"
          title="Loading incoming orders..."
          message="Fetching the full operational order queue."
        />
      </PageShell>
    )
  }

  if (error && orders.length === 0) {
    return (
      <PageShell maxWidth="7xl">
        <StatusPanel
          eyebrow="Admin orders unavailable"
          title="We could not load the order queue."
          message={error}
          tone="error"
        />
      </PageShell>
    )
  }

  const pendingCount = orders.filter((order) => order.status === 'pending').length
  const confirmedCount = orders.filter((order) => order.status === 'confirmed').length
  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0,
  )

  return (
    <PageShell maxWidth="7xl">
      <div className="editorial-panel-muted grid gap-8 p-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div className="space-y-4">
          <p className="editorial-kicker">Admin orders</p>
          <h1 className="editorial-heading sm:text-5xl">
            Review incoming orders and move them through the store workflow.
          </h1>
          <p className="editorial-copy max-w-2xl">
            This page shows every saved order in the system, including customer
            details, item summaries, totals, and the current order status.
          </p>
        </div>

        <div className="editorial-mini-cart p-6">
          <p className="editorial-kicker text-primary">
            Operations snapshot
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-semibold text-ink">{orders.length}</p>
              <p className="mt-1 text-sm text-primary">Orders in system</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-ink">{pendingCount}</p>
              <p className="mt-1 text-sm text-primary">Pending review</p>
            </div>
            <div className="rounded-xl bg-surface-white/60 p-4">
              <p className="text-3xl font-semibold text-ink">{confirmedCount}</p>
              <p className="mt-1 text-sm text-primary">Confirmed</p>
            </div>
            <div className="rounded-xl bg-surface-low p-4">
              <p className="editorial-kicker text-primary">
                Gross order value
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <StatusPanel
          eyebrow="Order update failed"
          title="We could not update that order."
          message={error}
          tone="error"
          className="p-6"
        />
      ) : null}

      {orders.length === 0 ? (
        <StatusPanel
          eyebrow="Admin orders"
          title="No orders have been placed yet."
          message="When customers complete checkout, their orders will appear here for review and status management."
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <article key={order.id} className="editorial-panel p-8">
              <div className="flex flex-col gap-5 pb-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="editorial-kicker">
                    {order.orderNumber}
                  </p>
                  <h2 className="mt-3 font-display text-4xl leading-tight tracking-[-0.03em] text-ink">
                    {order.user.name} placed {order.items.length} item(s)
                  </h2>
                  <p className="mt-2 text-sm text-primary">
                    {order.user.email} -{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-primary/70">
                    Internal ID #{order.id}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-[auto_auto] xl:min-w-[360px]">
                  <div className={`rounded-xl px-5 py-4 ${statusTone[order.status]}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                      Status
                    </p>
                    <p className="mt-2 text-lg font-semibold">{statusCopy[order.status]}</p>
                    <p className="mt-2 text-sm text-primary">Total ${order.totalAmount}</p>
                  </div>

                  <div className="rounded-xl bg-surface-low px-5 py-4">
                    <label
                      htmlFor={`status-${order.id}`}
                      className="editorial-field-label"
                    >
                      Update status
                    </label>
                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(event) =>
                        void handleStatusChange(
                          order.id,
                          event.target.value as OrderStatus,
                        )
                      }
                      className="editorial-select mt-3"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-xl bg-surface-low p-4 transition-colors hover:bg-surface-container"
                    >
                      <div className="h-20 w-20 overflow-hidden rounded-xl bg-surface-white">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-primary">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-display text-2xl leading-tight tracking-[-0.02em] text-ink">
                          {item.product.name}
                        </p>
                        <p className="mt-1 text-sm text-primary">
                          Qty {item.quantity} - ${item.unitPrice} each
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-ink">
                        ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <aside className="editorial-panel-muted p-5">
                  <p className="editorial-kicker text-primary">
                    Delivery details
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-primary">
                    <p>
                      <strong className="text-ink">Name:</strong> {order.shippingName}
                    </p>
                    <p>
                      <strong className="text-ink">Email:</strong> {order.shippingEmail}
                    </p>
                    <p>
                      <strong className="text-ink">Phone:</strong> {order.shippingPhone}
                    </p>
                    <p>
                      <strong className="text-ink">City:</strong> {order.shippingCity}
                    </p>
                    <p>
                      <strong className="text-ink">Address:</strong> {order.shippingAddress}
                    </p>
                    {order.notes ? (
                      <p>
                        <strong className="text-ink">Notes:</strong> {order.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-5 space-y-2 pt-4 text-sm">
                    <div className="flex items-center justify-between text-primary">
                      <span>Subtotal</span>
                      <span>${order.subtotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-primary">
                      <span>Shipping</span>
                      <span>${order.shippingFee}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-ink">
                      <span>Total</span>
                      <span>${order.totalAmount}</span>
                    </div>
                  </div>
                </aside>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  )
}

export default AdminOrdersPage
