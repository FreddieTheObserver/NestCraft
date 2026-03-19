import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import PageShell from '../components/PageShell';
import StatusPanel from '../components/StatusPanel';
import { useAuth } from '../context/AuthContext';
import { getMyOrderByOrderNumber, type OrderResponse } from '../services/orders';

function OrderDetailPage() {
  const { orderNumber } = useParams();
  const { token } = useAuth();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      if (!token) {
        setError('You must be logged in to view this order.');
        setLoading(false);
        return;
      }

      if (!orderNumber) {
        setError('Order number is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await getMyOrderByOrderNumber(orderNumber, token);

        if (!cancelled) {
          setOrder(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load order.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderNumber, token]);

  if (loading) {
    return (
      <PageShell maxWidth="7xl">
        <StatusPanel
          eyebrow="Order detail"
          title="Loading order..."
          message="Fetching the latest saved order details for this account."
        />
      </PageShell>
    );
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
            <Link
              to="/orders"
              className="mt-6 inline-flex rounded-full bg-walnut px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-clay"
            >
              Back to orders
            </Link>
          </StatusPanel>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="7xl">
        <div className="grid gap-6 rounded-[2rem] bg-gradient-to-r from-white/70 via-white/40 to-transparent p-8 shadow-[0_20px_50px_rgba(32,26,22,0.06)] lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <Link
              to="/orders"
              className="inline-flex rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-walnut transition hover:border-clay hover:text-clay"
            >
              Back to orders
            </Link>

            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">
              Order detail
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              {order.orderNumber}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-stone-200/80 bg-white/80 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Status
            </p>
            <p className="mt-3 text-3xl font-semibold capitalize text-walnut">{order.status}</p>
            <p className="mt-3 text-sm text-stone-500">Total ${order.totalAmount}</p>
          </div>
        </div>

        <article className="rounded-[2rem] bg-white p-8 shadow-[0_18px_40px_rgba(32,26,22,0.05)]">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
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
    </PageShell>
  );
}

export default OrderDetailPage;
