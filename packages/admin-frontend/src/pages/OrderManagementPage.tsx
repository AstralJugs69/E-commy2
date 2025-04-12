import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Type definition for order data
interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  status: string;
  locationCheckResult: string | null;
  addressText: string;
  createdAt: string;
  user?: {
    email: string;
  };
}

const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = 'http://localhost:3001/api';

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        return;
      }

      console.log('Token found:', token); // Log token (without showing the full value)
      
      try {
        console.log('Fetching from:', `${API_BASE_URL}/admin/orders`);
        
        const response = await axios.get(`${API_BASE_URL}/admin/orders`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Orders API response status:', response.status);
        console.log('Orders API response data:', response.data);
        
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.error('Response is not an array:', response.data);
          setError('Unexpected API response format');
        }
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        if (axios.isAxiosError(err)) {
          console.error('Error response:', err.response);
          console.error('Error request:', err.request);
          console.error('Error config:', err.config);
          setError(err.response?.data?.message || err.message || 'Network error occurred');
        } else {
          setError("Unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []); // Empty dependency array means this runs once on mount

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge styling
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending call':
        return 'bg-blue-100 text-blue-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      
      <div className="mb-4">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Refresh Orders
        </button>
      </div>
      
      {isLoading && (
        <div className="flex justify-center">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      )}
      
      {!isLoading && !error && orders.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No orders found. Please check your API connection and authentication.</p>
        </div>
      )}
      
      {!isLoading && !error && orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location Check</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customerPhone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.locationCheckResult || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.user?.email || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage; 