import { createContext, useContext, useEffect, useState } from 'react';

type CartItem = {
      id: number,
      slug: string,
      name: string,
      price: string,
      imageUrl: string | null,
      quantity: number
}

type AddToCartInput = Omit<CartItem, 'quantity'>

type CartContextValue = {
      items: CartItem[],
      addToCart: (product:AddToCartInput) => void,
      removeFromCart: (id: number) => void,
      updateQuantity: (id: number, quantity: number) => void,
      clearCart: () => void,
      totalItems: number,
      subtotal: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function CartProvider({ children }: {children: React.ReactNode }) {
      const[items, setItems] = useState<CartItem[]>([]);

      useEffect(() => {
            const storedCart = localStorage.getItem('cart');

            if (storedCart) {
                  setItems(JSON.parse(storedCart));
            }
      }, []);
      
      useEffect(() => {
            localStorage.setItem('cart', JSON.stringify(items));
      }, [items]);

      function addToCart(product: AddToCartInput) {
            setItems((currentItems) => {
                  const existingItem = currentItems.find((item) => item.id === product.id);

                  if (existingItem) {
                        return currentItems.map((item) =>
                              item.id === product.id
                              ? {...item, quantity: item.quantity + 1}
                              : item
                        )
                  };

                  return [...currentItems, {...product, quantity: 1 }];
            })
      }

      function removeFromCart(id: number) {
            setItems((currentItems) => currentItems.filter((item) => item.id !== id));
      }

      function updateQuantity(id: number, quantity: number) {
            if (quantity < 1) {
                  removeFromCart(id);
                  return;
            }

            setItems((currentItems) =>
                  currentItems.map((item) => 
                  item.id === id ? { ...item, quantity } : item
                  )
            )
      }

      function clearCart() {
            setItems([]);
      }

      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

      const subtotal = items.reduce(
            (sum, item) => sum + Number(item.price) * item.quantity,
            0
      )

      return (
            <CartContext.Provider
                  value={{
                        items,
                        addToCart,
                        removeFromCart,
                        updateQuantity,
                        clearCart,
                        totalItems,
                        subtotal,
                  }}
            >
                  {children}
            </CartContext.Provider>
      )
}

function useCart() {
      const context = useContext(CartContext);

      if (!context) {
            throw new Error('useCart must be used inside CartProvider');
      }
      return context;
}

export { CartProvider, useCart };
export type { CartItem }