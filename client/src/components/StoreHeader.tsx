import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import ThemeToggle from './ThemeToggle'

function StoreHeader() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const introCopy = isAuthenticated && user
    ? `${user.name}${user.role === 'admin' ? ' · Admin' : ''}`
    : 'Curated home objects'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function getNavLinkClassName(isActive: boolean) {
    return [
      'group relative inline-flex items-center gap-2 pb-2 text-[0.72rem] font-bold uppercase tracking-[0.24em] transition',
      'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:rounded-full after:bg-secondary after:transition-transform after:duration-300',
      isActive
        ? 'text-ink after:scale-x-100'
        : 'text-primary after:scale-x-0 hover:text-ink group-hover:after:scale-x-100',
    ].join(' ')
  }

  return (
    <header className="editorial-glass overflow-hidden px-6 py-5 sm:px-8">
      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[auto_1fr_auto] xl:items-end xl:gap-8">
        <div className="min-w-0 space-y-1">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-primary/80">
            {introCopy}
          </p>
          <div className="flex items-end gap-3">
            <Link
              to="/products"
              className="inline-block font-display text-3xl tracking-[-0.045em] text-ink transition hover:text-secondary sm:text-[2.5rem]"
            >
              NestCraft
            </Link>
            {totalItems > 0 ? (
              <span className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-secondary">
                {totalItems} in cart
              </span>
            ) : null}
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 xl:justify-center">
          <NavLink to="/products" className={({ isActive }) => getNavLinkClassName(isActive)}>
            Catalog
          </NavLink>

          <NavLink to="/cart" className={({ isActive }) => getNavLinkClassName(isActive)}>
            Cart
          </NavLink>

          {isAuthenticated ? (
            <NavLink to="/orders" className={({ isActive }) => getNavLinkClassName(isActive)}>
              Orders
            </NavLink>
          ) : null}

          {isAuthenticated && user?.role === 'admin' ? (
            <>
              <NavLink
                to="/admin/products"
                className={({ isActive }) => getNavLinkClassName(isActive)}
              >
                Products
              </NavLink>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) => getNavLinkClassName(isActive)}
              >
                Operations
              </NavLink>
            </>
          ) : null}
        </nav>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <ThemeToggle className="mr-1" />

          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center px-0 py-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-primary transition hover:text-ink"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-0 py-2 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-primary transition hover:text-ink"
              >
                Login
              </Link>
              <Link to="/register" className="editorial-button-primary px-4 py-2.5 text-[0.72rem]">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default StoreHeader
