import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
// Import Bootstrap CSS FIRST
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx'
import './index.css' // Your custom CSS (optional overrides)
import { AuthProvider } from './context/AuthContext'; // Import
import { CartProvider } from './context/CartContext'; // Import
import { WishlistProvider } from './context/WishlistContext'; // Import
import { Toaster } from 'react-hot-toast';
import { Spinner } from 'react-bootstrap';
import './i18n'; // Import i18n configuration

// Simple global fallback for Suspense (including translation loading)
const GlobalLoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spinner animation="border" variant="primary" />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<GlobalLoadingFallback />}> {/* Wrap Providers/App */}
      <AuthProvider> {/* Wrap App */}
        <CartProvider> {/* Wrap App */}
          <WishlistProvider> {/* Wrap App */}
            <Toaster position="top-center" />
            <App />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Suspense>
  </React.StrictMode>,
)