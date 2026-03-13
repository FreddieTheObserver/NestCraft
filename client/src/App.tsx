import { useEffect, useState } from 'react'

import { getHealth } from './services/health'

type HealthState = {
  status: 'loading' | 'success' | 'error'
  message: string
}

function App() {
  const [health, setHealth] = useState<HealthState>({
    status: 'loading',
    message: 'Checking backend connection...',
  })

  useEffect(() => {
    let cancelled = false

    const loadHealth = async () => {
      try {
        const response = await getHealth()

        if (!cancelled) {
          setHealth({
            status: 'success',
            message: `${response.message} (${response.status})`,
          })
        }
      } catch {
        if (!cancelled) {
          setHealth({
            status: 'error',
            message: 'Frontend is running, but the backend is not reachable yet.',
          })
        }
      }
    }

    void loadHealth()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-sand px-6 py-16 text-walnut sm:px-10 lg:px-16">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-clay">
              NestCraft
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
              Home essentials, built on a clean PERN foundation.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone-700">
              The starter scaffolding is cleaned up. Next, you can wire routing,
              API services, and the first product pages without carrying
              default Vite demo code forward.
            </p>
            <div className="rounded-2xl border border-clay/15 bg-white/80 px-5 py-4 text-sm shadow-sm">
              <p className="font-semibold text-walnut">API status</p>
              <p
                className={
                  health.status === 'error'
                    ? 'mt-2 text-red-600'
                    : 'mt-2 text-stone-700'
                }
              >
                {health.message}
              </p>
            </div>
          </div>
          <aside className="rounded-[2rem] border border-clay/10 bg-white/70 p-8 shadow-[0_18px_50px_rgba(32,26,22,0.08)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Current client stack
            </p>
            <ul className="mt-5 space-y-3 text-base text-stone-700">
              <li>React 19 + TypeScript</li>
              <li>Vite 8</li>
              <li>Tailwind CSS 3</li>
              <li>Ready for routing and API services</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default App
