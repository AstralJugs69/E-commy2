import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Basic Navbar */}
      <nav className="bg-blue-600 text-white p-4 mb-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <span className="font-bold text-xl">Admin Panel</span>
          <div className="space-x-4">
            <Link to="/admin/dashboard" className="hover:text-blue-200">Dashboard</Link>
            <Link to="/admin/phones" className="hover:text-blue-200">Phones</Link>
            <Link to="/admin/orders" className="hover:text-blue-200">Orders</Link>
            <Link to="/admin/zones" className="hover:text-blue-200">Zones</Link>
            <button 
              onClick={handleLogout} 
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area - Renders the nested route component */}
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 