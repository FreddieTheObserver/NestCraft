import { useState } from 'react'
import { Link } from 'react-router-dom'

import type { Product } from '../services/products'

type ProductCardProps = {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = product.imageUrl ?? undefined
  const showImage = Boolean(imageUrl) && !imageFailed
  const stockCopy = product.stock > 0 ? `${product.stock} available` : 'Unavailable'

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <article className="rounded-[1.75rem] p-3 transition duration-500 group-hover:-translate-y-1">
        <div className="overflow-hidden rounded-[1.75rem] bg-surface-low p-3 transition-colors duration-500 group-hover:bg-surface-container">
          <div className="relative overflow-hidden rounded-[1.3rem] bg-surface-white">
            {product.isFeatured ? (
              <span className="editorial-chip-accent absolute left-4 top-4 z-10">
                Featured
              </span>
            ) : null}

            <div className="editorial-image-placeholder aspect-[4/5] overflow-hidden">
              {showImage ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="flex h-full items-center justify-center px-8 text-center">
                  <div className="space-y-3">
                    <p className="editorial-kicker text-primary">NestCraft selection</p>
                    <p className="text-sm leading-6 text-primary">
                      Product photography is unavailable for this piece.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 px-2 pb-2 pt-5">
            <div className="flex items-start justify-between gap-4">
              <p className="editorial-kicker text-primary">{product.category.name}</p>
              <span
                className={product.stock > 0 ? 'editorial-chip' : 'editorial-chip-accent'}
              >
                {stockCopy}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-[1.65rem] leading-tight tracking-[-0.03em] text-ink">
                {product.name}
              </h2>
              <p className="line-clamp-3 text-sm leading-6 text-primary">
                {product.description}
              </p>
            </div>

            <div className="grid gap-4 pt-1 sm:grid-cols-[auto_1fr] sm:items-end">
              <div>
                <p className="text-2xl font-bold tracking-[-0.03em] text-ink">
                  ${product.price}
                </p>
                <p className="mt-1 text-sm text-primary">Selected for practical warmth</p>
              </div>
              <div className="flex justify-start sm:justify-end">
                <span className="editorial-button-tertiary">View piece</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default ProductCard
