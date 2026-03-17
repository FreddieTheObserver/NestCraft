import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AdminProductForm from '../components/AdminProductForm'
import StoreHeader from '../components/StoreHeader'
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
                  <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
                        Loading product...
                  </main>
            )
      }

      if (!product) {
            return (
                  <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
                        {error || 'Product not found'}
                  </main>
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
            <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
                  <section className="mx-auto max-w-4xl space-y-8">
                        <StoreHeader />
                        <div>
                              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                                    Admin catalog
                              </p>
                              <h1 className="mt-3 text-4xl font-semibold">Edit product</h1>
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
            </main>
      )
}

export default AdminEditProductPage
