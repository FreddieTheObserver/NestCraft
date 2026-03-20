import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import AdminProductForm from '../components/AdminProductForm'
import PageShell from '../components/PageShell'
import StatusPanel from '../components/StatusPanel'
import { useAuth } from '../context/AuthContext'
import {
      createAdminProduct,
      getCategories,
      type CategoryOption,
      type ProductFormInput,
} from '../services/adminProducts'

const initialValues: ProductFormInput = {
      name: '',
      slug: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: '',
      categoryId: 0,
      isFeatured: false,
      isActive: true,
}

function AdminCreateProductPage() {
      const navigate = useNavigate()
      const { token } = useAuth()
      const [categories, setCategories] = useState<CategoryOption[]>([])
      const [loading, setLoading] = useState(true)
      const [submitting, setSubmitting] = useState(false)
      const [error, setError] = useState('')

      useEffect(() => {
            let cancelled = false

            async function loadCategories() {
                  try {
                        setLoading(true)
                        setError('')

                        const data = await getCategories()

                        if (!cancelled) {
                              setCategories(data)
                        }
                  } catch (error) {
                        if (!cancelled) {
                              setError(
                                    error instanceof Error
                                          ? error.message
                                          : 'Failed to load categories',
                              )
                        }
                  } finally {
                        if (!cancelled) {
                              setLoading(false)
                        }
                  }
            }

            void loadCategories()

            return () => {
                  cancelled = true
            }
      }, [])

      async function handleSubmit(data: ProductFormInput) {
            try {
                  setSubmitting(true)
                  setError('')

                  const payload = {
                        ...data,
                        categoryId: data.categoryId || categories[0]?.id || 0,
                  }

                  await createAdminProduct(payload, token)
                  navigate('/admin/products')
            } catch (error) {
                  setError(
                        error instanceof Error ? error.message : 'Failed to create product',
                  )
            } finally {
                  setSubmitting(false)
            }
      }

      if (loading) {
            return (
                  <PageShell maxWidth="4xl">
                        <StatusPanel
                              eyebrow="Admin catalog"
                              title="Loading product form..."
                              message="Fetching categories before the form can open."
                        />
                  </PageShell>
            )
      }

      if (categories.length === 0) {
            return (
                  <PageShell maxWidth="4xl">
                        <StatusPanel
                              eyebrow="Admin catalog"
                              title="No categories are available yet."
                              message="Create at least one category before adding products."
                        />
                  </PageShell>
            )
      }

      return (
            <PageShell maxWidth="6xl">
                  <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
                        <div className="space-y-5 lg:sticky lg:top-6">
                              <Link to="/admin/products" className="editorial-button-tertiary">
                                    Back to catalog
                              </Link>

                              <div className="editorial-panel-muted p-7 sm:p-8">
                                    <p className="editorial-kicker">Admin catalog</p>
                                    <h1 className="editorial-heading mt-4">Create a new catalog piece.</h1>
                                    <p className="editorial-copy mt-4 max-w-xl">
                                          Add a new product with the same editorial language used throughout the storefront.
                                    </p>
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                          <div className="editorial-stat">
                                                <p className="editorial-kicker text-primary">Categories</p>
                                                <p className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink">
                                                      {categories.length}
                                                </p>
                                          </div>
                                          <div className="editorial-stat">
                                                <p className="editorial-kicker text-primary">Default state</p>
                                                <p className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink">
                                                      Active
                                                </p>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        <AdminProductForm
                              initialValues={{
                                    ...initialValues,
                                    categoryId: categories[0]?.id ?? 0,
                              }}
                              categories={categories}
                              submitLabel="Create product"
                              loading={submitting}
                              error={error}
                              onSubmit={handleSubmit}
                        />
                  </section>
            </PageShell>
      )
}

export default AdminCreateProductPage
