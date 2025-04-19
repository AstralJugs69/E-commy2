import React from 'react'
import ReactDOM from 'react-dom/client'
// Import Bootstrap CSS FIRST
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx'
import './index.css' // Your custom CSS (optional overrides)
import { AuthProvider } from './context/AuthContext'; // Import
import { CartProvider } from './context/CartContext'; // Import
import { WishlistProvider } from './context/WishlistContext'; // Import
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap App */}
      <CartProvider> {/* Wrap App */}
        <WishlistProvider> {/* Wrap App */}
          <Toaster position="top-center" />
          <App />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)