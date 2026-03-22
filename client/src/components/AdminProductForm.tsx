import { useEffect, useState } from 'react'

import type { CategoryOption, ProductFormInput } from '../services/adminProducts'
import { resolveImageUrl } from '../utils/images'

type AdminProductFormProps = {
  initialValues: ProductFormInput
  categories: CategoryOption[]
  submitLabel: string
  loading: boolean
  error: string
  onImageUpload: (file: File) => Promise<string>
  onSubmit: (data: ProductFormInput) => Promise<void>
}

function AdminProductForm({
  initialValues,
  categories,
  submitLabel,
  loading,
  error,
  onImageUpload,
  onSubmit,
}: AdminProductFormProps) {
  const [form, setForm] = useState<ProductFormInput>(initialValues)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')

  useEffect(() => {
    setForm(initialValues)
    setImageError('')
  }, [initialValues])

  const previewImageUrl = resolveImageUrl(form.imageUrl)

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]

    if (!file) {
      return
    }

    try {
      setUploadingImage(true)
      setImageError('')

      const imageUrl = await onImageUpload(file)

      setForm((currentForm) => ({
        ...currentForm,
        imageUrl,
      }))
    } catch (uploadError) {
      setImageError(
        uploadError instanceof Error ? uploadError.message : 'Failed to upload image',
      )
    } finally {
      setUploadingImage(false)
      input.value = ''
    }
  }

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

      <div className="grid gap-4">
        <div>
          <label className="editorial-field-label">Product image</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(event) => void handleImageChange(event)}
            className="editorial-input mt-3 file:mr-4 file:rounded-lg file:border-0 file:bg-secondary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-secondary"
          />
          <p className="mt-2 text-sm text-primary">
            Upload JPG, PNG, WEBP, or AVIF up to 5MB.
          </p>
        </div>

        {previewImageUrl ? (
          <div className="overflow-hidden rounded-[1.25rem] bg-surface-low">
            <img
              src={previewImageUrl}
              alt={form.name || 'Product preview'}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center rounded-[1.25rem] bg-surface-low px-6 text-center text-sm text-primary">
            No image uploaded yet.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setForm((currentForm) => ({ ...currentForm, imageUrl: '' }))}
            disabled={uploadingImage || !form.imageUrl}
            className="editorial-button-tertiary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove image
          </button>
          {uploadingImage ? (
            <p className="editorial-kicker text-secondary">Uploading image...</p>
          ) : null}
        </div>

        {imageError ? <p className="editorial-error">{imageError}</p> : null}
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
        disabled={loading || uploadingImage}
        className="editorial-button-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploadingImage ? 'Uploading image...' : loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}

export default AdminProductForm
