import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PhoneManagementPage from './pages/PhoneManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import ZoneManagementPage from './pages/ZoneManagementPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout'; // Import the basic layout

// Helper function (can be defined here or imported)
const isAuthenticated = (): boolean => !!localStorage.getItem('admin_token');

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route - Redirect if already logged in */}
        <Route path="/login" element={
          isAuthenticated() ? <Navigate to="/admin/dashboard" replace /> : <LoginPage />
        } />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}> {/* Step 1: Check Authentication */}
          <Route element={<AdminLayout />}> {/* Step 2: Apply Admin Layout */}
            {/* Redirect /admin base path to dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            {/* Specific Admin Pages */}
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/phones" element={<PhoneManagementPage />} />
            <Route path="/admin/orders" element={<OrderManagementPage />} />
            <Route path="/admin/zones" element={<ZoneManagementPage />} />
          </Route>
        </Route>

        {/* Catch-all / Fallback Route */}
        <Route path="*" element={
          isAuthenticated() ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 