import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import ProductCard from '../components/ProductCard'
import StoreHeader from '../components/StoreHeader'
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
      <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
        <section className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">
              NestCraft catalog
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Loading products...
            </h1>
          </div>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
        <section className="mx-auto max-w-4xl rounded-[2rem] border border-red-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-500">
            Products unavailable
          </p>
          <h1 className="mt-4 text-3xl font-semibold">We could not load the catalog.</h1>
          <p className="mt-3 text-stone-600">{error}</p>
        </section>
      </main>
    )
  }

  if (products.length === 0) {
    return (
      <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
        <section className="mx-auto max-w-4xl rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
            Products
          </p>
          <h1 className="mt-4 text-3xl font-semibold">No products found.</h1>
          <p className="mt-3 text-stone-600">
            {hasActiveFilters
              ? 'No products match your current search, category, or sort combination.'
              : 'The API responded successfully, but there are no active products to display yet.'}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 inline-flex rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-walnut transition hover:border-clay hover:text-clay"
            >
              Clear filters
            </button>
          ) : null}
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-sand px-6 py-12 text-walnut sm:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl space-y-8">
        <StoreHeader />
        <div className="grid gap-8 rounded-[2rem] bg-gradient-to-r from-white/70 via-white/40 to-transparent p-8 shadow-[0_20px_50px_rgba(32,26,22,0.06)] lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-clay">
              NestCraft catalog
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Home essentials designed to feel warm, practical, and lived in.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">
              Browse the live catalog, filter by category, search by product details,
              and sort the collection to match what you want to see.
            </p>
            <p className="text-sm text-stone-500">
              {hasActiveFilters
                ? 'Showing filtered results from the active catalog.'
                : 'Showing the full active product catalog.'}
            </p>
            {isFetching ? (
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">
                Updating results...
              </p>
            ) : null}
          </div>
          <div className="rounded-[1.5rem] border border-stone-200/80 bg-white/80 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Collection snapshot
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-semibold text-walnut">{products.length}</p>
                <p className="mt-1 text-sm text-stone-500">Visible products</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-walnut">
                  {new Set(products.map((product) => product.category.id)).size}
                </p>
                <p className="mt-1 text-sm text-stone-500">Visible categories</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.75rem] border border-stone-200/80 bg-white/80 p-5 shadow-sm lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto]">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Search
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or description"
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-walnut outline-none transition focus:border-clay"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Category
            </label>
            <select
              value={category}
              onChange={(event) => updateFilters({ category: event.target.value })}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-walnut outline-none transition focus:border-clay"
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
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Sort
            </label>
            <select
              value={sort}
              onChange={(event) =>
                updateFilters({ sort: event.target.value as ProductSort })
              }
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-walnut outline-none transition focus:border-clay"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="w-full rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-walnut transition hover:border-clay hover:text-clay disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default ProductsPage
