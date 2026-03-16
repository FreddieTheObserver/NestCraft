import { createBrowserRouter } from 'react-router-dom'

import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProtectedRoute from '../components/ProtectedRoute';

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
            path: '/login',
            element: <LoginPage />,
      },
      {
            path: '/register',
            element: <RegisterPage />,
      },
      {
            path: '/cart',
            element: (
                  <ProtectedRoute>
                        <CartPage />
                  </ProtectedRoute>
            ),
      },
      {
            path: '/checkout',
            element: (
                  <ProtectedRoute>
                        <CheckoutPage />
                  </ProtectedRoute>
            ),
      },
      {
            path: '/orders',
            element: (
                  <ProtectedRoute>
                        <OrdersPage />
                  </ProtectedRoute>
            ),
      },
]);
