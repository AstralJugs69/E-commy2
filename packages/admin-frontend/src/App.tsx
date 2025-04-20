import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PhoneManagementPage from './pages/PhoneManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProductManagementPage from './pages/ProductManagementPage';
import ZoneManagementPage from './pages/ZoneManagementPage';
import CategoryManagementPage from './pages/CategoryManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import UserDetailPage from './pages/UserDetailPage';
import StatisticsPage from './pages/StatisticsPage';
import AdminRequestPasswordResetPage from './pages/AdminRequestPasswordResetPage';
import AdminResetPasswordPage from './pages/AdminResetPasswordPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout'; // Import the basic layout
import { Toaster } from 'react-hot-toast';

// Helper function (can be defined here or imported)
const isAuthenticated = (): boolean => !!localStorage.getItem('admin_token');

function App() {
  return (
    <BrowserRouter>
      {/* Add Toaster here in case it's not properly initialized in main.tsx */}
      <Toaster position="top-right" />
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
    </BrowserRouter>
  );
}

export default App; 