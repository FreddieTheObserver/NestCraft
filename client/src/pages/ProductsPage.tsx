import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import PageShell from '../components/PageShell'
import ProductCard from '../components/ProductCard'
import StatusPanel from '../components/StatusPanel'
import {
  getProductCategories,
  getProducts,
  type Product,
  type ProductCategory,
  type ProductSort,
} from '../services/products'

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState('')

  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const sort = (searchParams.get('sort') as ProductSort | null) ?? 'newest'
  const hasActiveFilters = Boolean(search || category || sort !== 'newest')
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      try {
        const data = await getProductCategories()

        if (!cancelled) {
          setCategories(data)
        }
      } catch {
        if (!cancelled) {
          setCategories([])
        }
      }
    }

    void loadCategories()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    if (searchInput === search) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      const value = searchInput.trim()

      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }

      setSearchParams(params, { replace: true })
    }, 350)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchInput, search, searchParams, setSearchParams])

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      try {
        setIsFetching(true)
        setError('')

        const data = await getProducts({
          search: search || undefined,
          category: category || undefined,
          sort,
        })

        if (!cancelled) {
          setProducts(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load products.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsFetching(false)
          setHasLoadedOnce(true)
        }
      }
    }

    void loadProducts()

    return () => {
      cancelled = true
    }
  }, [search, category, sort])

  function updateFilters(next: {
    search?: string
    category?: string
    sort?: ProductSort
  }) {
    const params = new URLSearchParams(searchParams)

    if (next.search !== undefined) {
      const value = next.search.trim()

      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
    }

    if (next.category !== undefined) {
      if (next.category) {
        params.set('category', next.category)
      } else {
        params.delete('category')
      }
    }

    if (next.sort !== undefined) {
      if (next.sort === 'newest') {
        params.delete('sort')
      } else {
        params.set('sort', next.sort)
      }
    }

    setSearchParams(params, { replace: true })
  }

  function clearFilters() {
    setSearchInput('')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  if (!hasLoadedOnce && isFetching) {
    return (
      <PageShell maxWidth="7xl">
        <StatusPanel
          eyebrow="NestCraft catalog"
          title="Loading the current collection..."
          message="Fetching product imagery, available categories, and the live browse controls."
          className="max-w-4xl"
        />
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell maxWidth="4xl">
        <StatusPanel
          eyebrow="Catalog unavailable"
          title="We could not load the collection."
          message={error}
          tone="error"
        />
      </PageShell>
    )
  }

  if (products.length === 0) {
    return (
      <PageShell maxWidth="4xl">
        <StatusPanel
          eyebrow="NestCraft catalog"
          title="No pieces matched this view."
          message={
            hasActiveFilters
              ? 'Try widening your search, clearing the category, or returning to the default sort.'
              : 'The storefront is reachable, but there are no active products to display yet.'
          }
        >
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="editorial-button-secondary mt-8"
            >
              Clear filters
            </button>
          ) : null}
        </StatusPanel>
      </PageShell>
    )
  }

  const featuredProduct = products.find((product) => product.isFeatured) ?? products[0]
  const visibleCategoryCount = new Set(products.map((product) => product.category.id)).size
  const totalVisibleStock = products.reduce((sum, product) => sum + product.stock, 0)
  const activeFilters = [
    search ? `Search: ${search}` : null,
    category
      ? `Category: ${categories.find((item) => item.slug === category)?.name ?? category}`
      : null,
    sort === 'price-asc'
      ? 'Price: low to high'
      : sort === 'price-desc'
        ? 'Price: high to low'
        : null,
  ].filter(Boolean) as string[]

  return (
    <PageShell maxWidth="7xl">
      <section className="grid gap-12 lg:grid-cols-[1.06fr_0.94fr] lg:items-start">
        <div className="space-y-8 pt-3 lg:pt-8">
          <div className="space-y-6">
            <p className="editorial-kicker">The Curated Canvas</p>
            <h1 className="editorial-title max-w-4xl lg:max-w-3xl">
              Modern objects for rooms that should feel composed, quiet, and useful.
            </h1>
            <p className="editorial-copy max-w-2xl">
              Browse the live NestCraft catalog by category, search what matters,
              and sort the collection without losing the calm of the space. The
              interface stays deliberately quiet so the products remain the protagonist.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div className="editorial-stat">
              <p className="editorial-kicker text-primary">Visible pieces</p>
              <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink">
                {products.length}
              </p>
              <p className="mt-2 text-sm text-primary">Live results in the current view</p>
            </div>
            <div className="editorial-stat">
              <p className="editorial-kicker text-primary">Categories</p>
              <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink">
                {visibleCategoryCount}
              </p>
            </div>
            <div className="editorial-stat">
              <p className="editorial-kicker text-primary">Available stock</p>
              <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-ink">
                {totalVisibleStock}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={featuredProduct ? `/products/${featuredProduct.slug}` : '/products'}
              className="editorial-button-primary"
            >
              View featured piece
            </Link>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="editorial-button-secondary"
              >
                Reset filters
              </button>
            ) : null}
            {isFetching ? (
              <p className="editorial-kicker text-secondary">Updating results</p>
            ) : null}
          </div>
        </div>

        <div className="relative lg:pt-2">
          <div className="editorial-panel-muted overflow-hidden p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
              <div className="space-y-5">
                <span className="editorial-chip">Editor&apos;s pick</span>
                <h2 className="font-display text-4xl leading-tight tracking-[-0.03em] text-ink">
                  {featuredProduct.name}
                </h2>
                <p className="editorial-copy">{featuredProduct.description}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="editorial-chip-accent">${featuredProduct.price}</span>
                  <span className="editorial-chip">{featuredProduct.category.name}</span>
                </div>
              </div>

              <div className="relative lg:translate-y-12">
                <div className="overflow-hidden rounded-[1.5rem] bg-surface-white shadow-lift">
                  {featuredProduct.imageUrl ? (
                    <img
                      src={featuredProduct.imageUrl}
                      alt={featuredProduct.name}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/5] items-center justify-center px-8 text-center">
                      <div className="space-y-3">
                        <p className="editorial-kicker text-primary">NestCraft</p>
                        <p className="text-sm leading-6 text-primary">
                          The current featured piece has no cover image yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="editorial-mini-cart absolute bottom-4 left-4 max-w-[16rem] p-4">
                  <p className="editorial-kicker text-primary">Current edit</p>
                  <p className="mt-3 text-sm leading-6 text-primary">
                    Start with a hero piece, then layer in quieter supporting objects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-glass p-5 sm:p-7">
        <div className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="editorial-kicker text-primary">Browse controls</p>
            <p className="text-sm leading-6 text-primary">
              Showing {products.length} piece{products.length === 1 ? '' : 's'} in this view.
            </p>
          </div>

          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {activeFilters.map((item) => (
                <span key={item} className="editorial-chip">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span className="editorial-chip-accent">Default view active</span>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.8fr_0.8fr_auto] lg:items-end">
          <div>
            <label className="editorial-field-label">Search</label>
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by product name or description"
              className="editorial-input mt-3"
            />
          </div>

          <div>
            <label className="editorial-field-label">Category</label>
            <select
              value={category}
              onChange={(event) => updateFilters({ category: event.target.value })}
              className="editorial-select mt-3"
            >
              <option value="">All categories</option>
              {categories.map((productCategory) => (
                <option key={productCategory.id} value={productCategory.slug}>
                  {productCategory.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="editorial-field-label">Sort</label>
            <select
              value={sort}
              onChange={(event) =>
                updateFilters({ sort: event.target.value as ProductSort })
              }
              className="editorial-select mt-3"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
            </select>
          </div>

          <div className="flex gap-3 lg:justify-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="editorial-button-secondary w-full disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => (
          <div
            key={product.id}
            className={
              index % 3 === 1
                ? 'xl:pt-14'
                : index % 3 === 2
                  ? 'md:pt-8 xl:pt-4'
                  : ''
            }
          >
            <ProductCard product={product} />
          </div>
        ))}
      </section>
    </PageShell>
  )
}

export default ProductsPage
