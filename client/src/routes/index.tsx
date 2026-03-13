import { createBrowserRouter } from 'react-router-dom'

import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';

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
])