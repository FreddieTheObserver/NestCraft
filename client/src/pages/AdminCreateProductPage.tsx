import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
            <PageShell maxWidth="4xl">
                  <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                              Admin catalog
                        </p>
                        <h1 className="mt-3 text-4xl font-semibold">Create product</h1>
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
            </PageShell>
      )
}

export default AdminCreateProductPage
