import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import PageShell from '../components/PageShell'
import StatusPanel from '../components/StatusPanel'
import { useCart } from '../context/CartContext'
import { getProductBySlug, type Product } from '../services/products'
import { resolveImageUrl } from '../utils/images'

function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageFailed, setImageFailed] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      if (!slug) {
        setError('Product slug is missing.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const data = await getProductBySlug(slug)

        if (!cancelled) {
          setProduct(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : 'Failed to load product',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProduct()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <PageShell maxWidth="6xl" sectionClassName="space-y-6">
        <Link to="/products" className="editorial-button-tertiary">
          Back to catalog
        </Link>
        <StatusPanel
          eyebrow="Loading product"
          title="Preparing the full product story..."
          message="Fetching the latest imagery, pricing, and stock information."
        />
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell maxWidth="4xl" sectionClassName="space-y-6">
        <Link to="/products" className="editorial-button-tertiary">
          Back to catalog
        </Link>
        <StatusPanel
          eyebrow="Product unavailable"
          title="We could not load this product."
          message={error}
          tone="error"
        />
      </PageShell>
    )
  }

  if (!product) {
    return (
      <PageShell maxWidth="4xl" sectionClassName="space-y-6">
        <Link to="/products" className="editorial-button-tertiary">
          Back to catalog
        </Link>
        <StatusPanel
          eyebrow="Product not found"
          title="This piece is not currently available."
          message="It may have been removed, renamed, or taken out of the active collection."
        />
      </PageShell>
    )
  }

  const stockCopy = product.stock > 0 ? 'Ready to ship' : 'Currently unavailable'
  const purchaseNote =
    product.stock > 0
      ? 'Ships once your order is confirmed and handed into the NestCraft queue.'
      : 'This piece is temporarily out of the active shipping flow.'
  const imageUrl = resolveImageUrl(product.imageUrl)

  return (
    <PageShell maxWidth="7xl">
      <Link to="/products" className="editorial-button-tertiary">
        Back to catalog
      </Link>

      <section className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="space-y-6 lg:sticky lg:top-8">
          <div className="overflow-hidden rounded-[1.75rem] bg-surface-white shadow-lift">
            {imageUrl && !imageFailed ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="editorial-image-placeholder flex aspect-[4/5] items-center justify-center px-8 text-center">
                <div className="space-y-3">
                  <p className="editorial-kicker text-primary">NestCraft</p>
                  <p className="text-sm leading-6 text-primary">
                    Product imagery is unavailable for this piece.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="editorial-stat">
              <p className="editorial-kicker text-primary">Category</p>
              <p className="mt-4 text-lg font-semibold text-ink">{product.category.name}</p>
            </div>
            <div className="editorial-stat">
              <p className="editorial-kicker text-primary">Availability</p>
              <p className="mt-4 text-lg font-semibold text-ink">{stockCopy}</p>
            </div>
            <div className="editorial-stat">
              <p className="editorial-kicker text-primary">Stock count</p>
              <p className="mt-4 text-lg font-semibold text-ink">{product.stock}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 lg:pl-10">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <span className="editorial-chip">{product.category.name}</span>
              {product.isFeatured ? (
                <span className="editorial-chip-accent">Featured in the current edit</span>
              ) : null}
            </div>
            <h1 className="editorial-title max-w-3xl">{product.name}</h1>
            <p className="editorial-copy max-w-2xl">{product.description}</p>
          </div>

          <div className="editorial-mini-cart p-7 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-[0.86fr_1.14fr] sm:items-end">
              <div>
                <p className="editorial-kicker text-primary">Price</p>
                <p className="mt-4 text-5xl font-bold tracking-[-0.05em] text-ink">
                  ${product.price}
                </p>
              </div>
              <div className="space-y-3">
                <p className="editorial-copy">{purchaseNote}</p>
                <span
                  className={product.stock > 0 ? 'editorial-chip-accent' : 'editorial-chip'}
                >
                  {stockCopy}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                disabled={product.stock === 0}
                onClick={() =>
                  addToCart({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                  })
                }
                className="editorial-button-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to cart
              </button>
              <Link to="/cart" className="editorial-button-secondary">
                Review cart
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="editorial-panel p-6">
              <p className="editorial-kicker text-primary">Product slug</p>
              <p className="mt-4 break-all text-sm leading-6 text-primary">{product.slug}</p>
            </div>
            <div className="editorial-panel p-6">
              <p className="editorial-kicker text-primary">Store status</p>
              <p className="mt-4 text-sm leading-6 text-primary">
                {product.isActive ? 'Visible in the storefront' : 'Currently hidden'}
              </p>
            </div>
          </div>

          <div className="editorial-panel-muted p-7 sm:p-8">
            <p className="editorial-kicker text-primary">Collection note</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-primary">
              NestCraft pieces are intended to read as part of a room, not as noise
              inside it. Start with one anchor object, then build outward only if the
              space still feels calm.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

export default ProductDetailPage
