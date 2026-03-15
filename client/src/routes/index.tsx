import { createBrowserRouter } from 'react-router-dom'

import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';

export const router = createBrowserRouter([
      {
            path: '/',
            element: <ProductsPage />,
      },
      {
            path: '/products',
            element: <ProductsPage />,
      },
      {
            path: '/products/:slug',
            element: <ProductDetailPage />,
      },
      {
            path: '/cart',
            element: <CartPage />,
      }
])