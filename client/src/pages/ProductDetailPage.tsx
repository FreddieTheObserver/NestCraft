import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from '../context/CartContext';

import PageShell from "../components/PageShell";
import StatusPanel from "../components/StatusPanel";
import { getProductBySlug, type Product } from "../services/products";

function ProductDetailPage() {
      const { slug } = useParams();
      const[product, setProduct] = useState<Product | null>(null);
      const[loading, setLoading] = useState(true);
      const[error, setError] = useState("");
      const [imageFailed, setImageFailed] = useState(false);
      const { addToCart } = useCart();

      useEffect(() => {
            let cancelled = false;

            async function loadProduct() {
                  if (!slug) {
                        setError('Product slug is missing.');
                        setLoading(false);
                        return;
                  }

                  try {
                        setLoading(true);
                        setError("");

                        const data = await getProductBySlug(slug);

                        if (!cancelled) {
                              setProduct(data);
                        }
                  } catch (error) {
                        if (!cancelled) {
                              setError(error instanceof Error ? error.message : 'Failed to load product');
                        }
                  } finally {
                        if (!cancelled) {
                              setLoading(false);
                        }
                  }
            }

            void loadProduct()
            return () => {
                  cancelled = true;
            }
      }, [slug])

      if (loading) {
            return (
                  <PageShell maxWidth="6xl" sectionClassName="space-y-6">
                              <Link
                                    to="/products"
                                    className="inline-flex text-sm font-semibold uppercase tracking-[0.2em] text-clay transition hover:text-walnut"
                              >
                                    Back to products
                              </Link>
                              <StatusPanel
                                    eyebrow="Loading product"
                                    title="Preparing product details..."
                                    message="Loading the latest product information from the storefront API."
                                    className="bg-white/70 shadow-[0_18px_40px_rgba(32,26,22,0.06)]"
                              />
                  </PageShell>
            )
      }

      if (error) {
            return (
                  <PageShell maxWidth="4xl" sectionClassName="space-y-6">
                              <Link
                                    to="/products"
                                    className="inline-flex text-sm font-semibold uppercase tracking-[0.2em] text-clay transition hover:text-walnut"
                              >
                                    Back to products
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
                              <Link
                                    to="/products"
                                    className="inline-flex text-sm font-semibold uppercase tracking-[0.2em] text-clay transition hover:text-walnut"
                              >
                                    Back to products
                              </Link>
                              <StatusPanel
                                    eyebrow="Product not found"
                                    title="This item is not available."
                                    message="The product may have been removed, renamed, or is currently inactive."
                              />
                  </PageShell>
            )
      }
      return (
            <PageShell maxWidth="6xl">
                        <Link
                              to="/products"
                              className="inline-flex text-sm font-semibold uppercase tracking-[0.2em] text-clay transition hover:text-walnut"
                        >
                              Back to products
                        </Link>
                        <div className="grid gap-8 rounded-[2.25rem] bg-white/70 p-6 shadow-[0_24px_60px_rgba(32,26,22,0.08)] lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
                              <div className="space-y-4">
                                    <div className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-stone-100 to-stone-200">
                                          {product.imageUrl && !imageFailed ? (
                                                <img 
                                                      src={product.imageUrl}
                                                      alt={product.name}
                                                      className="h-[20rem] w-full object-cover sm:h-[24rem] lg:h-[30rem]"
                                                      onError={() => setImageFailed(true)}
                                                />
                                          ) : (
                                                <div className="flex h-[20rem] items-center justify-center bg-gradient-to-br from-mist to-sand px-8 text-center sm:h-[24rem] lg:h-[30rem]">
                                                      <div className="space-y-3">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-clay/75">
                                                                  NestCraft
                                                            </p>
                                                            <p className="text-base text-stone-600">
                                                                  Product preview unavailable
                                                            </p>
                                                      </div>
                                                </div>
                                          )}
                                    </div>
                                    <div className="grid gap-4 rounded-[1.5rem] border border-stone-200/80 bg-white p-5 sm:grid-cols-3">
                                          <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                                                      Category
                                                </p>
                                                <p className="mt-2 text-base font-semibold text-walnut">
                                                      {product.category.name}
                                                </p>
                                          </div>
                                          <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                                                      Availability
                                                </p>
                                                <p className="mt-2 text-base font-semibold text-walnut">
                                                      {product.stock > 0 ? "In stock" : "Out of stock"}
                                                </p>
                                          </div>
                                          <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                                                      Stock count
                                                </p>
                                                <p className="mt-2 text-base font-semibold text-walnut">
                                                      {product.stock}
                                                </p>
                                          </div>
                                    </div>
                              </div>

                              <div className="flex flex-col justify-between rounded-[1.75rem] border border-stone-200/80 bg-white p-8">
                                    <div className="space-y-6">
                                          <div className="flex flex-wrap items-center gap-3">
                                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay">
                                                      {product.category.name}
                                                </p>
                                                {product.isFeatured ? (
                                                      <span className="rounded-full bg-clay/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">
                                                            Featured
                                                      </span>
                                                ) : null}
                                          </div>
                                          <div className="space-y-4">
                                                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                                                      {product.name}
                                                </h1>
                                                <p className="text-lg leading-8 text-stone-600">
                                                      {product.description}
                                                </p>
                                          </div>
                                          <div className="rounded-[1.5rem] bg-gradient-to-r from-clay to-[#7f4a26] px-6 py-5 text-white">
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                                                      Price
                                                </p>
                                                <p className="mt-2 text-4xl font-semibold">${product.price}</p>
                                          </div>
                                          <div className="grid gap-4 rounded-[1.5rem] bg-stone-50 p-5 sm:grid-cols-2">
                                                <div>
                                                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                                                            Product slug
                                                      </p>
                                                      <p className="mt-2 break-all text-sm text-stone-700">
                                                            {product.slug}
                                                      </p>
                                                </div>
                                                <div>
                                                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                                                            Store status
                                                      </p>
                                                      <p className="mt-2 text-sm text-stone-700">
                                                            {product.isActive ? "Visible in storefront" : "Hidden"}
                                                      </p>
                                                </div>
                                          </div>
                                    </div>
                                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                          <button
                                                type="button"
                                                onClick={() => 
                                                      addToCart({
                                                            id: product.id,
                                                            slug: product.slug,
                                                            name: product.name,
                                                            price: product.price,
                                                            imageUrl: product.imageUrl,
                                                      })
                                                }
                                                className="w-full rounded-full bg-walnut px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-clay"
                                          >
                                                Add to cart
                                          </button>
                                          <Link 
                                                to="/cart"
                                                className="flex w-full items-center justify-center rounded-full border border-clay/20 bg-clay/10 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-clay transition hover:border-clay hover:bg-clay hover:text-white"
                                          >
                                                View cart
                                          </Link>
                                    </div>
                              </div>
                        </div>
            </PageShell>
      )
}

export default ProductDetailPage;
