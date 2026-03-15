import type { CartItem as CartItemType } from '../context/CartContext';
import { useCart } from '../context/CartContext';

type CartItemProps = {
      item: CartItemType;
}

function CartItem({ item }: CartItemProps) {
      const { removeFromCart, updateQuantity } = useCart();

      return (
            <article className="flex gap-4 rounded-[1.5rem] bg-white p-4 shadow-sm">
                  <div className="h-24 w-24 overflow-hidden rounded-xl bg-stone-100">
                        {item.imageUrl ? (
                              <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                              />
                        ) : (
                              <div className="flex h-full items-center justify-center text-xs text-stone-500">
                                    No image
                              </div>
                        )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                        <div>
                              <h2 className="text-lg font-semibold text-walnut">{item.name}</h2>
                              <p className="text-sm text-stone-500">${item.price}</p>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                              <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="rounded-full border border-stone-300 px-3 py-1">
                                          -
                              </button>

                              <span>{item.quantity}</span>

                              <button
                                    type="button"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="rounded-full border border-stone-300 px-3 py-1">
                                          +
                              </button>

                              <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    className="ml-auto text-sm font-semibold text-red-500">
                                          Remove
                              </button>
                        </div>
                  </div>
            </article>
      )
}

export default CartItem;