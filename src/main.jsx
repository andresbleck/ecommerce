import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, CartProvider } from './components/Components';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider>
    <CartProvider>
      <App/>
    </CartProvider>
  </RouterProvider>
);
