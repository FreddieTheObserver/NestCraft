import { createBrowserRouter } from 'react-router-dom'

import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminProductsPage from '../pages/AdminProductsPage';
import AdminCreateProductPage from '../pages/AdminCreateProductPage';
import AdminEditProductPage from '../pages/AdminEditProductPage';
import AdminOrdersPage from '../pages/AdminOrdersPage';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import OrderDetailPage from '../pages/OrderDetailPage';

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
      {
            path: '/admin/products',
            element: (
                  <AdminRoute>
                        <AdminProductsPage />
                  </AdminRoute>
            ),
      },
      {
            path: '/admin/products/new',
            element: (
                  <AdminRoute>
                        <AdminCreateProductPage />
                  </AdminRoute>
            ),
      },
      {
            path: '/admin/products/:id/edit',
            element: (
                  <AdminRoute>
                        <AdminEditProductPage />
                  </AdminRoute>
            ),
      },
      {
            path: '/admin/orders',
            element: (
                  <AdminRoute>
                        <AdminOrdersPage />
                  </AdminRoute>
            ),
      },
      {
            path: '/orders/:orderNumber',
            element: (
                  <ProtectedRoute>
                        <OrderDetailPage />
                  </ProtectedRoute>
            )
      }
]);
