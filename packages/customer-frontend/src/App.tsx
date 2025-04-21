import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import Layout from './components/Layout'; // Import the layout
import { useAuth } from './context/AuthContext';
import PWAPrompt from './components/PWAPrompt'; // Import PWAPrompt component

// Define the BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Lazy load all page components
const HomePage = lazy(() => import('./pages/HomePage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const RequestPasswordResetPage = lazy(() => import('./pages/RequestPasswordResetPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const CustomerOrderDetailPage = lazy(() => import('./pages/CustomerOrderDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

// Loading fallback component
const LoadingFallback = () => (
  <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 200px)' }}> 
    <Spinner animation="border" variant="primary" />
  </Container>
);

function App() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  return (
    <BrowserRouter>
      <PWAPrompt onInstallPromptAvailable={setInstallPrompt} /> {/* Pass the setter function */}
      <AppRoutes installPrompt={installPrompt} />
    </BrowserRouter>
  );
}

interface AppRoutesProps {
  installPrompt: BeforeInstallPromptEvent | null;
}

function AppRoutes({ installPrompt }: AppRoutesProps) {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Routes with layout */}
        <Route path="/" element={<Layout installPrompt={installPrompt} />}>
          {/* Index route for the homepage */}
          <Route index element={<HomePage />} />
          <Route path="cart" element={<CartPage />} />
          {/* Product detail page */}
          <Route path="product/:productId" element={<ProductDetailPage />} />
          {/* Wishlist page - requires authentication */}
          <Route path="wishlist" element={isAuthenticated ? <WishlistPage /> : <Navigate to="/login" replace />} />
          {/* Checkout route - requires authentication */}
          <Route path="checkout" element={isAuthenticated ? <CheckoutPage /> : <Navigate to="/login" replace />} />
          {/* Order Success page - needs parameter later */}
          <Route path="order/success/:orderId" element={isAuthenticated ? <OrderSuccessPage /> : <Navigate to="/login" replace />} />
          {/* Add the new route for order history */}
          <Route path="orders" element={isAuthenticated ? <OrderHistoryPage /> : <Navigate to="/login" replace />} />
          {/* Add the new route for order detail */}
          <Route path="order/:orderId" element={isAuthenticated ? <CustomerOrderDetailPage /> : <Navigate to="/login" replace />} />
          {/* Add the settings page route */}
          <Route path="settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" replace />} />
          {/* Add the about page route */}
          <Route path="about" element={<AboutPage />} />
          {/* Add other routes like product detail later */}

          {/* Optional: Catch-all within layout */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
