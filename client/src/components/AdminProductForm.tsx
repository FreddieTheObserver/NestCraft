import { useEffect, useState } from 'react'

import type { CategoryOption, ProductFormInput } from '../services/adminProducts'

type AdminProductFormProps = {
      initialValues: ProductFormInput
      categories: CategoryOption[]
      submitLabel: string
      loading: boolean
      error: string
      onSubmit: (data: ProductFormInput) => Promise<void>
}

function AdminProductForm({
      initialValues,
      categories,
      submitLabel,
      loading,
      error,
      onSubmit,
}: AdminProductFormProps) {
      const [form, setForm] = useState<ProductFormInput>(initialValues)

      useEffect(() => {
            setForm(initialValues)
      }, [initialValues])

      async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
            event.preventDefault()
            await onSubmit(form)
      }

      return (
            <form
                  onSubmit={handleSubmit}
                  className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm"
            >
                  <div className="grid gap-5 sm:grid-cols-2">
                        <input
                              type="text"
                              placeholder="Product name"
                              value={form.name}
                              onChange={(event) => setForm({ ...form, name: event.target.value })}
                              className="rounded-xl border border-stone-300 px-4 py-3"
                        />
                        <input
                              type="text"
                              placeholder="Slug"
                              value={form.slug}
                              onChange={(event) => setForm({ ...form, slug: event.target.value })}
                              className="rounded-xl border border-stone-300 px-4 py-3"
                        />
                  </div>

                  <textarea
                        placeholder="Description"
                        value={form.description}
                        onChange={(event) => setForm({ ...form, description: event.target.value })}
                        rows={5}
                        className="w-full rounded-xl border border-stone-300 px-4 py-3"
                  />

                  <div className="grid gap-5 sm:grid-cols-3">
                        <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              placeholder="Price"
                              value={form.price}
                              onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                              className="rounded-xl border border-stone-300 px-4 py-3"
                        />
                        <input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="Stock"
                              value={form.stock}
                              onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })}
                              className="rounded-xl border border-stone-300 px-4 py-3"
                        />
                        <select
                              value={form.categoryId}
                              onChange={(event) =>
                                    setForm({ ...form, categoryId: Number(event.target.value) })
                              }
                              className="rounded-xl border border-stone-300 px-4 py-3"
                        >
                              {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                          {category.name}
                                    </option>
                              ))}
                        </select>
                  </div>

                  <input
                        type="text"
                        placeholder="Image URL"
                        value={form.imageUrl}
                        onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                        className="w-full rounded-xl border border-stone-300 px-4 py-3"
                  />

                  <div className="flex flex-wrap gap-6 text-sm text-stone-600">
                        <label className="inline-flex items-center gap-2">
                              <input
                                    type="checkbox"
                                    checked={form.isFeatured}
                                    onChange={(event) =>
                                          setForm({ ...form, isFeatured: event.target.checked })
                                    }
                              />
                              Featured
                        </label>

                        <label className="inline-flex items-center gap-2">
                              <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(event) =>
                                          setForm({ ...form, isActive: event.target.checked })
                                    }
                              />
                              Active
                        </label>
                  </div>

                  {error ? <p className="text-sm text-red-500">{error}</p> : null}

                  <button
                        type="submit"
                        disabled={loading}
                        className="rounded-full bg-walnut px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-clay"
                  >
                        {loading ? 'Saving...' : submitLabel}
                  </button>
            </form>
      )
}

export default AdminProductForm
