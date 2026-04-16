import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import PageShell from '../components/PageShell'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/products'
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      await login({ email, password })
      navigate(redirectTo)
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Login failed. Check your email and password.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell maxWidth="7xl" showHeader={false}>
      <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-5 lg:order-2 lg:pl-6">
          <Link to="/products" className="editorial-button-tertiary">
            Back to collection
          </Link>

          <div className="editorial-panel px-7 py-8 sm:px-10 sm:py-10">
            <p className="editorial-kicker">Sign in</p>
            <h2 className="editorial-heading mt-4">Welcome back.</h2>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="editorial-field-label">Email</label>
                <input
                  type="email"
                  placeholder="jordan@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="editorial-input mt-3"
                />
              </div>
              <div>
                <label className="editorial-field-label">Password</label>
                <input
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="editorial-input mt-3"
                />
              </div>

              {error ? <p className="editorial-error">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="editorial-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="mt-6 text-sm text-primary">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-secondary transition hover:text-secondary-bright"
              >
                Register
              </Link>
            </p>
          </div>
        </div>

        <div className="editorial-panel-muted relative overflow-hidden px-7 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-16 lg:order-1">
          <div className="absolute right-[-4rem] top-[-3rem] h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute left-[18%] top-[18%] h-28 w-28 rounded-full bg-[var(--shell-side-glow)] blur-2xl" />
          <div className="relative space-y-6">
            <p className="editorial-kicker">NestCraft account</p>
            <h1 className="editorial-title max-w-xl">Return to your curated home ledger.</h1>
            <p className="editorial-copy max-w-xl">
              Log in to review saved orders, reopen your cart, and continue browsing
              the current collection with your account context intact.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="editorial-stat">
                <p className="editorial-kicker text-primary">Orders</p>
                <p className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink">
                  Saved
                </p>
              </div>
              <div className="editorial-stat">
                <p className="editorial-kicker text-primary">Checkout</p>
                <p className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink">
                  Faster
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

export default LoginPage
