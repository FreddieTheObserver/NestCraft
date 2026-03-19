import { Link } from 'react-router-dom';

import CartItem from '../components/CartItem';
import PageShell from '../components/PageShell';
import StatusPanel from '../components/StatusPanel';
import { useCart } from '../context/CartContext';

function CartPage() {
      const { items, subtotal, totalItems, clearCart } = useCart();

      if (items.length === 0) {
            return (
                  <PageShell maxWidth="6xl">
                        <StatusPanel
                              eyebrow="Your cart"
                              title="Your cart is empty"
                              message="Add a few products to start building your NestCraft order."
                              className="max-w-4xl"
                        />
                  </PageShell>
            )
      }

      return (
            <PageShell maxWidth="6xl">
                        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-4">
                              <h1 className="text-4xl font-semibold">Your cart</h1>
                              <p className="text-stone-600">{totalItems} item(s)</p>

                              <div className="space-y-4">
                                    {items.map((item) => (
                                          <CartItem key={item.id} item={item} />
                                    ))}
                              </div>
                        </div>

                        <aside className="rounded-[2rem] bg-white p-8 shadow-sm">
                              <h2 className="text-2xl font-semibold">Summary</h2>
                              <div className="mt-6 flex items-center justify-between">
                                    <span className="text-stone-600">Subtotal</span>
                                    <span className="text-xl font-semibold">${subtotal.toFixed(2)}</span>
                              </div>

                              <Link
                                    to="/checkout"
                                    className="mt-6 flex w-full items-center justify-center rounded-full bg-walnut px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-clay"
                              >
                                    Proceed to checkout
                              </Link>

                              <button
                                    type="button"
                                    onClick={clearCart}
                                    className="mt-4 w-full rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-walnut"
                              >
                                    Clear cart
                              </button>
                        </aside>
                        </div>
            </PageShell>
      )
}

export default CartPage;
