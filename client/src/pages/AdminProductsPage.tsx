import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import PageShell from '../components/PageShell'
import StatusPanel from '../components/StatusPanel'
import {
      deactivateAdminProduct,
      getAdminProducts,
      reactivateAdminProduct,
      type AdminProduct,
} from '../services/adminProducts'
import { resolveImageUrl } from '../utils/images'

function AdminProductsPage() {
      const [products, setProducts] = useState<AdminProduct[]>([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState('')
      const [actionError, setActionError] = useState('')

      useEffect(() => {
            let cancelled = false

            async function loadProducts() {
                  try {
                        setLoading(true)
                        setError('')

                        const data = await getAdminProducts()

                        if (!cancelled) {
                              setProducts(data)
                        }
                  } catch (error) {
                        if (!cancelled) {
                              setError(
                                    error instanceof Error
                                          ? error.message
                                          : 'Failed to load admin products',
                              )
                        }
                  } finally {
                        if (!cancelled) {
                              setLoading(false)
                        }
                  }
            }

            void loadProducts()

            return () => {
                  cancelled = true
            }
      }, [])

      async function handleDeactivate(id: number) {
            try {
                  setActionError('')
                  const updated = await deactivateAdminProduct(id)
                  setProducts((currentProducts) =>
                        currentProducts.map((product) =>
                              product.id === id ? updated : product,
                        ),
                  )
            } catch (error) {
                  setActionError(
                        error instanceof Error
                              ? error.message
                              : 'Failed to deactivate product',
                  )
            }
      }

      async function handleReactivate(id: number) {
            try {
                  setActionError('')
                  const updated = await reactivateAdminProduct(id)
                  setProducts((currentProducts) =>
                        currentProducts.map((product) =>
                              product.id === id ? updated : product,
                        ),
                  )
            } catch (error) {
                  setActionError(
                        error instanceof Error
                              ? error.message
                              : 'Failed to reactivate product',
                  )
            }
      }

      if (loading) {
            return (
                  <PageShell maxWidth="7xl">
                        <StatusPanel
                              eyebrow="Admin catalog"
                              title="Loading admin products..."
                              message="Fetching the full catalog with admin visibility."
                        />
                  </PageShell>
            )
      }

      if (error) {
            return (
                  <PageShell maxWidth="7xl">
                        <StatusPanel
                              eyebrow="Admin catalog unavailable"
                              title="We could not load the admin product list."
                              message={error}
                              tone="error"
                        />
                  </PageShell>
            )
      }

      const featuredCount = products.filter((product) => product.isFeatured).length
      const inactiveCount = products.filter((product) => !product.isActive).length

      return (
            <PageShell maxWidth="7xl">
                  <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                        <div className="space-y-4">
                              <p className="editorial-kicker">Admin catalog</p>
                              <h1 className="editorial-heading sm:text-5xl">Manage products</h1>
                              <p className="editorial-copy max-w-2xl">
                                    Review the live catalog, adjust merchandising flags, and keep
                                    storefront visibility consistent with the editorial direction.
                              </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                              <Link
                                    to="/admin/products/new"
                                    className="editorial-button-primary"
                              >
                                    Create product
                              </Link>
                        </div>
                  </section>

                  <section className="grid gap-4 sm:grid-cols-3">
                        <div className="editorial-stat">
                              <p className="editorial-kicker text-primary">Catalog total</p>
                              <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink">
                                    {products.length}
                              </p>
                        </div>
                        <div className="editorial-stat">
                              <p className="editorial-kicker text-primary">Featured</p>
                              <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink">
                                    {featuredCount}
                              </p>
                        </div>
                        <div className="editorial-stat">
                              <p className="editorial-kicker text-primary">Inactive</p>
                              <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink">
                                    {inactiveCount}
                              </p>
                        </div>
                  </section>

                  {actionError ? (
                        <StatusPanel
                              eyebrow="Product action failed"
                              title="We could not update that product."
                              message={actionError}
                              tone="error"
                              className="p-6"
                        />
                  ) : null}

                  {products.length === 0 ? (
                        <StatusPanel
                              eyebrow="Admin catalog"
                              title="No products are in the catalog yet."
                              message="Create the first product to start building the storefront assortment."
                        />
                  ) : (
                        <section className="grid gap-6 lg:grid-cols-2">
                              {products.map((product) => {
                                    const imageUrl = resolveImageUrl(product.imageUrl)

                                    return (
                                    <article key={product.id} className="editorial-panel p-6 sm:p-7">
                                          <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
                                                <div className="overflow-hidden rounded-[1.25rem] bg-surface-low">
                                                      {imageUrl ? (
                                                            <img
                                                                  src={imageUrl}
                                                                  alt={product.name}
                                                                  className="aspect-[4/5] h-full w-full object-cover"
                                                            />
                                                      ) : (
                                                            <div className="flex aspect-[4/5] items-center justify-center px-4 text-center text-xs uppercase tracking-[0.18em] text-primary">
                                                                  No image
                                                            </div>
                                                      )}
                                                </div>

                                                <div className="space-y-5">
                                                      <div className="space-y-3">
                                                            <div className="flex flex-wrap gap-3">
                                                                  <span className="editorial-chip">{product.category.name}</span>
                                                                  <span
                                                                        className={product.isActive ? 'editorial-chip-accent' : 'editorial-chip'}
                                                                  >
                                                                        {product.isActive ? 'Active' : 'Inactive'}
                                                                  </span>
                                                                  {product.isFeatured ? (
                                                                        <span className="editorial-chip-accent">Featured</span>
                                                                  ) : null}
                                                            </div>

                                                            <h2 className="font-display text-3xl leading-tight tracking-[-0.03em] text-ink">
                                                                  {product.name}
                                                            </h2>
                                                            <p className="text-sm leading-6 text-primary">{product.slug}</p>
                                                      </div>

                                                      <div className="grid gap-4 sm:grid-cols-2">
                                                            <div className="editorial-panel-muted p-4">
                                                                  <p className="editorial-kicker text-primary">Stock</p>
                                                                  <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-ink">
                                                                        {product.stock}
                                                                  </p>
                                                            </div>
                                                            <div className="editorial-panel-muted p-4">
                                                                  <p className="editorial-kicker text-primary">Price</p>
                                                                  <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-ink">
                                                                        ${product.price}
                                                                  </p>
                                                            </div>
                                                      </div>

                                                      <div className="flex flex-wrap gap-3">
                                                            <Link
                                                                  to={`/admin/products/${product.id}/edit`}
                                                                  className="editorial-button-secondary"
                                                            >
                                                                  Edit
                                                            </Link>

                                                            {product.isActive ? (
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => void handleDeactivate(product.id)}
                                                                        className="inline-flex items-center justify-center rounded-lg bg-error-soft px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-error transition duration-300 hover:-translate-y-0.5"
                                                                  >
                                                                        Deactivate
                                                                  </button>
                                                            ) : (
                                                                  <button
                                                                        type="button"
                                                                        onClick={() => void handleReactivate(product.id)}
                                                                        className="inline-flex items-center justify-center rounded-lg bg-secondary/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-secondary transition duration-300 hover:-translate-y-0.5"
                                                                  >
                                                                        Reactivate
                                                                  </button>
                                                            )}
                                                      </div>
                                                </div>
                                          </div>
                                    </article>
                              )})}
                        </section>
                  )}
            </PageShell>
      )
}

export default AdminProductsPage
