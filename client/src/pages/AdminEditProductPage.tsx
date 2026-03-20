import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import AdminProductForm from '../components/AdminProductForm'
import PageShell from '../components/PageShell'
import StatusPanel from '../components/StatusPanel'
import { useAuth } from '../context/AuthContext'
import {
      getAdminProducts,
      getCategories,
      updateAdminProduct,
      type AdminProduct,
      type CategoryOption,
      type ProductFormInput,
} from '../services/adminProducts'

function AdminEditProductPage() {
      const { id } = useParams()
      const navigate = useNavigate()
      const { token } = useAuth()

      const [product, setProduct] = useState<AdminProduct | null>(null)
      const [categories, setCategories] = useState<CategoryOption[]>([])
      const [loading, setLoading] = useState(true)
      const [submitting, setSubmitting] = useState(false)
      const [error, setError] = useState('')

      useEffect(() => {
            let cancelled = false

            async function loadData() {
                  if (!id) {
                        setError('Product id is missing')
                        setLoading(false)
                        return
                  }

                  try {
                        setLoading(true)
                        setError('')

                        const [categoryData, productData] = await Promise.all([
                              getCategories(),
                              getAdminProducts(token),
                        ])

                        const matchedProduct = productData.find(
                              (item) => item.id === Number(id),
                        )

                        if (!cancelled) {
                              setCategories(categoryData)
                              setProduct(matchedProduct ?? null)

                              if (!matchedProduct) {
                                    setError('Product not found')
                              }
                        }
                  } catch (error) {
                        if (!cancelled) {
                              setError(
                                    error instanceof Error
                                          ? error.message
                                          : 'Failed to load product',
                              )
                        }
                  } finally {
                        if (!cancelled) {
                              setLoading(false)
                        }
                  }
            }

            void loadData()

            return () => {
                  cancelled = true
            }
      }, [id, token])

      async function handleSubmit(data: ProductFormInput) {
            if (!product) {
                  return
            }

            try {
                  setSubmitting(true)
                  setError('')

                  await updateAdminProduct(product.id, data, token)
                  navigate('/admin/products')
            } catch (error) {
                  setError(
                        error instanceof Error ? error.message : 'Failed to update product',
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
                              title="Loading product..."
                              message="Fetching the product and category data for this form."
                        />
                  </PageShell>
            )
      }

      if (!product) {
            return (
                  <PageShell maxWidth="4xl">
                        <StatusPanel
                              eyebrow="Admin catalog unavailable"
                              title="We could not load that product."
                              message={error || 'Product not found'}
                              tone="error"
                        />
                  </PageShell>
            )
      }

      const initialValues: ProductFormInput = {
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: Number(product.price),
            stock: product.stock,
            imageUrl: product.imageUrl ?? '',
            categoryId: product.categoryId,
            isFeatured: product.isFeatured,
            isActive: product.isActive,
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
                                    <h1 className="editorial-heading mt-4">Edit the selected catalog piece.</h1>
                                    <p className="editorial-copy mt-4 max-w-xl">
                                          Update product details, storefront visibility, and merchandising flags from one place.
                                    </p>
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                          <div className="editorial-stat">
                                                <p className="editorial-kicker text-primary">Current stock</p>
                                                <p className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink">
                                                      {product.stock}
                                                </p>
                                          </div>
                                          <div className="editorial-stat">
                                                <p className="editorial-kicker text-primary">Merchandising</p>
                                                <p className="mt-4 text-3xl font-bold tracking-[-0.04em] text-ink">
                                                      {product.isFeatured ? 'Featured' : 'Standard'}
                                                </p>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        <AdminProductForm
                              initialValues={initialValues}
                              categories={categories}
                              submitLabel="Save changes"
                              loading={submitting}
                              error={error}
                              onSubmit={handleSubmit}
                        />
                  </section>
            </PageShell>
      )
}

export default AdminEditProductPage
