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
    <form onSubmit={handleSubmit} className="editorial-panel grid gap-6 p-7 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="editorial-field-label">Product name</label>
          <input
            type="text"
            placeholder="Floor lamp"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="editorial-input mt-3"
          />
        </div>

        <div>
          <label className="editorial-field-label">Slug</label>
          <input
            type="text"
            placeholder="floor-lamp"
            value={form.slug}
            onChange={(event) => setForm({ ...form, slug: event.target.value })}
            className="editorial-input mt-3"
          />
        </div>
      </div>

      <div>
        <label className="editorial-field-label">Description</label>
        <textarea
          placeholder="Describe the material, tone, and practical use of the piece."
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          rows={5}
          className="editorial-textarea mt-3"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="editorial-field-label">Price</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="129.00"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
            className="editorial-input mt-3"
          />
        </div>

        <div>
          <label className="editorial-field-label">Stock</label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="12"
            value={form.stock}
            onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })}
            className="editorial-input mt-3"
          />
        </div>

        <div>
          <label className="editorial-field-label">Category</label>
          <select
            value={form.categoryId}
            onChange={(event) =>
              setForm({ ...form, categoryId: Number(event.target.value) })
            }
            className="editorial-select mt-3"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="editorial-field-label">Image URL</label>
        <input
          type="text"
          placeholder="https://..."
          value={form.imageUrl}
          onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
          className="editorial-input mt-3"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="editorial-panel-muted flex items-center gap-3 px-4 py-4 text-sm text-primary">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(event) =>
              setForm({ ...form, isFeatured: event.target.checked })
            }
            className="h-4 w-4 accent-secondary"
          />
          Featured in the storefront edit
        </label>

        <label className="editorial-panel-muted flex items-center gap-3 px-4 py-4 text-sm text-primary">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm({ ...form, isActive: event.target.checked })
            }
            className="h-4 w-4 accent-secondary"
          />
          Visible in the storefront
        </label>
      </div>

      {error ? <p className="editorial-error">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="editorial-button-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}

export default AdminProductForm
