import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import PageShell from '../components/PageShell'
import { useAuth } from '../context/AuthContext'

function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/products'
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      await register({ name, email, password })
      navigate(redirectTo)
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : 'Register failed. Try another email.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell maxWidth="7xl" showHeader={false}>
      <section className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
        <div className="space-y-5">
          <Link to="/products" className="editorial-button-tertiary">
            Back to collection
          </Link>

          <div className="editorial-panel px-7 py-8 sm:px-10 sm:py-10">
          <p className="editorial-kicker">Create account</p>
          <h2 className="editorial-heading mt-4">Join the NestCraft account area.</h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="editorial-field-label">Name</label>
              <input
                type="text"
                placeholder="Jordan Ellis"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="editorial-input mt-3"
              />
            </div>
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
                placeholder="Create a password"
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
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-sm text-primary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-secondary transition hover:text-secondary-bright"
            >
                Login
              </Link>
            </p>
          </div>
        </div>

        <div className="editorial-panel-muted relative overflow-hidden px-7 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-16">
          <div className="absolute left-[-3rem] top-[3rem] h-44 w-44 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute right-[12%] top-[12%] h-28 w-28 rounded-full bg-[var(--shell-side-glow)] blur-2xl" />
          <div className="relative space-y-6">
            <p className="editorial-kicker">NestCraft membership</p>
            <h1 className="editorial-title max-w-xl">
              Save orders, return faster, and keep your personal collection trail.
            </h1>
            <p className="editorial-copy max-w-xl">
              Registration unlocks the account area, order history, and the full
              protected customer flow without changing the calm tone of the storefront.
            </p>
            <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
              <div className="editorial-stat">
                <p className="editorial-kicker text-primary">Archive</p>
                <p className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink">
                  Personal
                </p>
              </div>
              <div className="editorial-stat">
                <p className="editorial-kicker text-primary">Store flow</p>
                <p className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink">
                  Protected
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

export default RegisterPage
