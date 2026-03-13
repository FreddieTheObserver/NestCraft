import { useState } from 'react'
import { Link } from 'react-router-dom';

import type { Product } from '../services/products';

type ProductCardProps = {
      product: Product;
}

function ProductCard({ product }: ProductCardProps) {
      const [imageFailed, setImageFailed] = useState(false)
      const imageUrl = product.imageUrl ?? undefined
      const showImage = Boolean(imageUrl) && !imageFailed

      return (
            <Link to={`/products/${product.slug}`} className="block">
                  <article className="group overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-[0_20px_60px_rgba(32,26,22,0.08)] transition-transform duration-300 hover:-translate-y-1">
                              <div className="h-56 w-full overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 sm:h-60">
                                    {showImage ? (
                                          <img
                                                src={imageUrl}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={() => setImageFailed(true)}
                                          />
                                    ):(
                                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-mist to-sand px-6 text-center">
                                                <div className="space-y-2">
                                                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-clay/75">
                                                            NestCraft
                                                      </p>
                                                      <p className="text-sm text-stone-600">
                                                            Image preview unavailable
                                                      </p>
                                                </div>
                                          </div>
                                    )}
                              </div>

                        <div className="space-y-3 p-5">
                              <div className="flex items-start justify-between gap-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
                                          {product.category.name}
                                    </p>
                                    {product.isFeatured ? (
                                          <span className="rounded-full bg-clay/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">
                                                Featured
                                          </span>
                                    ) : null}
                              </div>
                              <h2 className="text-xl font-semibold leading-tight text-walnut">
                                    {product.name}
                              </h2>
                              <p className="line-clamp-2 text-sm leading-6 text-stone-500">
                                    {product.description}
                              </p>
                              <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                                    <p className="text-lg font-semibold text-clay">${product.price}</p>
                                    <p className="text-sm text-stone-500">
                                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                    </p>
                              </div>
                        </div>
                  </article>
            </Link>
      )
}

export default ProductCard;
