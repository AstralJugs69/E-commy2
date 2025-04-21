import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout'; // Import the basic layout
import { Toaster } from 'react-hot-toast';

// Lazy load all page components
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PhoneManagementPage = lazy(() => import('./pages/PhoneManagementPage'));
const OrderManagementPage = lazy(() => import('./pages/OrderManagementPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const ProductManagementPage = lazy(() => import('./pages/ProductManagementPage'));
const ZoneManagementPage = lazy(() => import('./pages/ZoneManagementPage'));
const CategoryManagementPage = lazy(() => import('./pages/CategoryManagementPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));
const UserDetailPage = lazy(() => import('./pages/UserDetailPage'));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));
const AdminRequestPasswordResetPage = lazy(() => import('./pages/AdminRequestPasswordResetPage'));
const AdminResetPasswordPage = lazy(() => import('./pages/AdminResetPasswordPage'));
const ProfileSettingsPage = lazy(() => import('./pages/ProfileSettingsPage'));

// Loading fallback component
const LoadingFallback = () => (
  <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 200px)' }}> 
    <Spinner animation="border" variant="primary" />
  </Container>
);

// Helper function (can be defined here or imported)
const isAuthenticated = (): boolean => !!localStorage.getItem('admin_token');

function App() {
  return (
    <BrowserRouter>
      {/* Add Toaster here in case it's not properly initialized in main.tsx */}
      <Toaster position="top-right" />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Login Route */}
          <Route
            path="/login"
            element={isAuthenticated() ? <Navigate to="/admin/dashboard" replace /> : <LoginPage />}
          />

          {/* Public Password Reset Routes */}
          <Route path="/request-password-reset" element={<AdminRequestPasswordResetPage />} />
          <Route path="/reset-password/:token" element={<AdminResetPasswordPage />} />

          {/* Protected Admin Section Wrapper */}
          <Route element={<ProtectedRoute />}> {/* Checks Auth */}
            <Route path="/admin" element={<AdminLayout />}> {/* Applies Layout */}
              {/* Index route for /admin */}
              <Route index element={<Navigate to="dashboard" replace />} />
              {/* Nested Admin Pages */}
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="statistics" element={<StatisticsPage />} />
              <Route path="phones" element={<PhoneManagementPage />} />
              <Route path="orders" element={<OrderManagementPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />
              <Route path="products" element={<ProductManagementPage />} />
              <Route path="categories" element={<CategoryManagementPage />} />
              <Route path="zones" element={<ZoneManagementPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="users/:userId" element={<UserDetailPage />} />
              <Route path="profile" element={<ProfileSettingsPage />} />
            </Route>
          </Route>

          {/* Catch-all / Fallback Route - Only redirect to login if not already on login-related pages */}
          <Route
            path="*"
            element={isAuthenticated() ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App; 