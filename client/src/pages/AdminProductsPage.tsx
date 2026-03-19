import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import PageShell from '../components/PageShell'
import StatusPanel from '../components/StatusPanel'
import { useAuth } from '../context/AuthContext'
import {
      deactivateAdminProduct,
      getAdminProducts,
      reactivateAdminProduct,
      type AdminProduct,
} from '../services/adminProducts'

function AdminProductsPage() {
      const { token } = useAuth()
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

                        const data = await getAdminProducts(token)

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
      }, [token])

      async function handleDeactivate(id: number) {
            try {
                  setActionError('')
                  const updated = await deactivateAdminProduct(id, token)
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
                  const updated = await reactivateAdminProduct(id, token)
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

      return (
            <PageShell maxWidth="7xl">
                        <div className="flex flex-col gap-4 rounded-[2rem] bg-white/80 p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                                          Admin catalog
                                    </p>
                                    <h1 className="mt-3 text-4xl font-semibold">Manage products</h1>
                              </div>

                              <Link
                                    to="/admin/products/new"
                                    className="inline-flex items-center justify-center rounded-full bg-walnut px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-clay"
                              >
                                    Create product
                              </Link>
                        </div>

                        {actionError ? (
                              <StatusPanel
                                    eyebrow="Product action failed"
                                    title="We could not update that product."
                                    message={actionError}
                                    tone="error"
                                    className="p-6"
                              />
                        ) : null}

                        <div className="rounded-[2rem] border border-stone-200 bg-white shadow-sm">
                              <div className="border-b border-stone-200 px-6 py-4 text-sm text-stone-500 xl:hidden">
                                    Scroll horizontally to review product inventory and actions on smaller screens.
                              </div>
                              <div className="overflow-x-auto">
                              <div className="min-w-[960px]">
                              <div className="grid grid-cols-[1.6fr_0.9fr_0.8fr_0.8fr_1fr] gap-4 border-b border-stone-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                                    <span>Product</span>
                                    <span>Category</span>
                                    <span>Stock</span>
                                    <span>Status</span>
                                    <span>Actions</span>
                              </div>

                              <div className="divide-y divide-stone-200">
                                    {products.map((product) => (
                                          <div
                                                key={product.id}
                                                className="grid grid-cols-[1.6fr_0.9fr_0.8fr_0.8fr_1fr] gap-4 px-6 py-5"
                                          >
                                                <div>
                                                      <p className="font-semibold text-walnut">{product.name}</p>
                                                      <p className="mt-1 text-sm text-stone-500">{product.slug}</p>
                                                      {product.isFeatured ? (
                                                            <span className="mt-2 inline-block rounded-full bg-clay/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">
                                                                  Featured
                                                            </span>
                                                      ) : null}
                                                </div>

                                                <p className="text-sm text-stone-600">{product.category.name}</p>
                                                <p className="text-sm text-stone-600">{product.stock}</p>
                                                <p className="text-sm font-semibold text-walnut">
                                                      {product.isActive ? 'Active' : 'Inactive'}
                                                </p>

                                                <div className="flex flex-wrap gap-2">
                                                      <Link
                                                            to={`/admin/products/${product.id}/edit`}
                                                            className="rounded-full border border-stone-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-walnut"
                                                      >
                                                            Edit
                                                      </Link>

                                                      {product.isActive ? (
                                                            <button
                                                                  type="button"
                                                                  onClick={() => void handleDeactivate(product.id)}
                                                                  className="rounded-full border border-red-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-500"
                                                            >
                                                                  Deactivate
                                                            </button>
                                                      ) : (
                                                            <button
                                                                  type="button"
                                                                  onClick={() => void handleReactivate(product.id)}
                                                                  className="rounded-full border border-emerald-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600"
                                                            >
                                                                  Reactivate
                                                            </button>
                                                      )}
                                                </div>
                                          </div>
                                    ))}
                              </div>
                              </div>
                              </div>
                        </div>
            </PageShell>
      )
}

export default AdminProductsPage
