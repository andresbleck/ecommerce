import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { RouterProvider, CartProvider } from './components/Components';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider>
    <CartProvider>
      <App/>
      <Analytics/>
    </CartProvider>
  </RouterProvider>
);
