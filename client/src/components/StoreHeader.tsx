import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function StoreHeader() {
      const navigate = useNavigate()
      const { user, isAuthenticated, logout } = useAuth()
      const { totalItems } = useCart()

      function handleLogout() {
            logout()
            navigate('/login')
      }

      return (
            <header className="mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-[1.75rem] border border-white/60 bg-white/70 px-6 py-5 shadow-[0_18px_40px_rgba(32,26,22,0.05)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                  <div>
                        <Link
                              to="/products"
                              className="text-sm font-semibold uppercase tracking-[0.28em] text-clay transition hover:text-walnut"
                        >
                              NestCraft
                        </Link>
                        <p className="mt-2 text-sm text-stone-500">
                              {isAuthenticated && user
                                    ? `Signed in as ${user.name}`
                                    : 'Thoughtful home essentials for everyday living.'}
                        </p>
                  </div>

                  <nav className="flex flex-wrap items-center gap-3">
                        <Link
                              to="/products"
                              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-walnut transition hover:border-clay hover:text-clay"
                        >
                              Products
                        </Link>
                        <Link
                              to="/cart"
                              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-walnut transition hover:border-clay hover:text-clay"
                        >
                              Cart ({totalItems})
                        </Link>
                        {isAuthenticated ? (
                              <Link
                                    to="/orders"
                                    className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-walnut transition hover:border-clay hover:text-clay"
                              >
                                    Orders
                              </Link>
                        ) : null}
                        {isAuthenticated && user?.role === 'admin' ? (
                              <Link
                                    to="/admin/products"
                                    className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-walnut transition hover:border-clay hover:text-clay"
                              >
                                    Admin
                              </Link>
                        ) : null}

                        {isAuthenticated ? (
                              <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-full bg-walnut px-5 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-clay"
                              >
                                    Logout
                              </button>
                        ) : (
                              <>
                                    <Link
                                          to="/login"
                                          className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-walnut transition hover:border-clay hover:text-clay"
                                    >
                                          Login
                                    </Link>
                                    <Link
                                          to="/register"
                                          className="rounded-full bg-walnut px-5 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-clay"
                                    >
                                          Register
                                    </Link>
                              </>
                        )}
                  </nav>
            </header>
      )
}

export default StoreHeader
