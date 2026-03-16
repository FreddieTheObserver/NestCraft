import { useEffect, useState } from 'react';

import ProductCard from '../components/ProductCard';
import StoreHeader from '../components/StoreHeader';
import { getProducts, type Product } from '../services/products';

function ProductsPage() {
      const [products, setProducts] = useState<Product[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState("");

      useEffect(() => {
            let cancelled = false;

            async function loadProducts() {
                  try {
                        setLoading(true);
                        setError("");

                        const data = await getProducts();

                        if (!cancelled) {
                              setProducts(data);
                        }
                  } catch (error) {
                        if (!cancelled) {
                              setError(error instanceof Error ? error.message : 'Failed to load products.');
                        }
                  } finally {
                        if (!cancelled) {
                              setLoading(false);
                        }
                  }
            }

            void loadProducts()
            return () => {
                  cancelled = true;
            }
      }, []);

      if (loading) {
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
                                    The API responded successfully, but there are no active products to display yet.
                              </p>
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
                                          Browse the first live catalog powered by your Express API and Prisma data.
                                          This page is the first storefront slice of NestCraft.
                                    </p>
                              </div>
                              <div className="rounded-[1.5rem] border border-stone-200/80 bg-white/80 p-6">
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                                          Collection snapshot
                                    </p>
                                    <div className="mt-5 grid grid-cols-2 gap-4">
                                          <div>
                                                <p className="text-3xl font-semibold text-walnut">{products.length}</p>
                                                <p className="mt-1 text-sm text-stone-500">Active products</p>
                                          </div>
                                          <div>
                                                <p className="text-3xl font-semibold text-walnut">
                                                      {new Set(products.map((product) => product.category.id)).size}
                                                </p>
                                                <p className="mt-1 text-sm text-stone-500">Categories</p>
                                          </div>
                                    </div>
                              </div>
                        </div>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {products.map((product) => {
                              return <ProductCard key={product.id} product={product} />
                        })}
                        </div>
                  </section>
            </main>
      )
}

export default ProductsPage;
