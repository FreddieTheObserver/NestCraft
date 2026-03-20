import { useEffect, useEffectEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import PageShell from '../components/PageShell'
import StatusPanel from '../components/StatusPanel'
import { useAuth } from '../context/AuthContext'
import { subscribeToOrderStream } from '../services/orderStream'
import { getMyOrderByOrderNumber, type OrderResponse } from '../services/orders'

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

function OrderDetailPage() {
  const { orderNumber } = useParams()
  const { token } = useAuth()

  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrder = useEffectEvent(async () => {
    if (!token) {
      setOrder(null)
      setError('You must be logged in to view this order.')
      setLoading(false)
      return
    }

    if (!orderNumber) {
      setOrder(null)
      setError('Order number is missing.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const data = await getMyOrderByOrderNumber(orderNumber, token)

      setOrder(data)
    } catch (loadError) {
      setOrder(null)
      setError(loadError instanceof Error ? loadError.message : 'Failed to load order.')
    } finally {
      setLoading(false)
    }
  })

  useEffect(() => {
    void loadOrder()
  }, [orderNumber, token])

  useEffect(() => {
    if (!token || !orderNumber) {
      return
    }

    return subscribeToOrderStream({
      token,
      onEvent(event) {
        if (event.type !== 'order.updated' || event.orderNumber !== orderNumber) {
          return
        }

        setOrder((currentOrder) =>
          currentOrder
            ? {
                ...currentOrder,
                status: event.status,
              }
            : currentOrder,
        )
      },
      onError(streamError) {
        console.error('Order detail stream disconnected:', streamError)
      },
    })
  }, [orderNumber, token])

  if (loading) {
    return (
      <PageShell maxWidth="7xl">
        <StatusPanel
          eyebrow="Order detail"
          title="Loading the full order record..."
          message="Fetching the latest saved order details for this account."
        />
      </PageShell>
    )
  }

  if (error || !order) {
    return (
      <PageShell maxWidth="7xl">
        <StatusPanel
          eyebrow="Order unavailable"
          title="We could not load this order."
          message={error || 'Order not found.'}
          tone="error"
        >
          <Link to="/orders" className="editorial-button-primary mt-8">
            Back to orders
          </Link>
        </StatusPanel>
      </PageShell>
    )
  }

  return (
    <PageShell maxWidth="7xl">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="space-y-4">
          <Link to="/orders" className="editorial-button-tertiary">
            Back to orders
          </Link>
          <p className="editorial-kicker">Order detail</p>
          <h1 className="editorial-title max-w-4xl">{order.orderNumber}</h1>
          <p className="editorial-copy">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="editorial-mini-cart p-6 sm:p-7">
          <p className="editorial-kicker text-primary">Current status</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <span
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${statusTone[order.status]}`}
            >
              {statusCopy[order.status]}
            </span>
            <span className="text-3xl font-bold tracking-[-0.04em] text-ink">
              ${order.totalAmount}
            </span>
          </div>
        </div>
      </section>

      <article className="editorial-panel p-7 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
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

          <aside className="space-y-4">
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
          </aside>
        </div>
      </article>
    </PageShell>
  )
}

export default OrderDetailPage
