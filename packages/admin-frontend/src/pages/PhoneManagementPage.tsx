import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Type definition for phone number data
interface PhoneNumber {
  id: number;
  numberString: string;
  status: 'Available' | 'Busy' | 'Offline';
}

const PhoneManagementPage: React.FC = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = 'http://localhost:3001/api';

  // Determine the next status in the rotation
  const getNextStatus = (currentStatus: PhoneNumber['status']): PhoneNumber['status'] => {
    if (currentStatus === 'Available') return 'Busy';
    if (currentStatus === 'Busy') return 'Offline';
    return 'Available'; // Offline -> Available
  };

  // Fetch phone numbers data
  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/admin/phonenumbers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPhoneNumbers(response.data as PhoneNumber[]);
      } catch (err: any) {
        console.error("Error fetching phone numbers:", err);
        setError(axios.isAxiosError(err) && err.response 
          ? err.response.data.message 
          : "Failed to fetch phone numbers.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhoneNumbers();
  }, []); // Empty dependency array means this runs once on mount

  // Handle status toggle
  const handleStatusToggle = async (id: number, currentStatus: PhoneNumber['status']) => {
    const nextStatus = getNextStatus(currentStatus);
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/admin/phonenumbers/${id}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Re-fetch the entire list on success
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/phonenumbers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhoneNumbers(response.data as PhoneNumber[]);
      setIsLoading(false);
      
    } catch (err: any) {
      console.error(`Error updating status for phone number ${id}:`, err);
      setError(axios.isAxiosError(err) && err.response 
        ? err.response.data.message 
        : "Failed to update status.");
    }
  };

  // Get status-specific styling
  const getStatusStyle = (status: PhoneNumber['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'Offline':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  // Get button style based on next status
  const getButtonStyle = (nextStatus: PhoneNumber['status']) => {
    switch (nextStatus) {
      case 'Available':
        return 'bg-green-500 hover:bg-green-600';
      case 'Busy':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Offline':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Phone Number Management</h1>
      
      {isLoading && (
        <div className="flex justify-center">
          <p className="text-gray-500">Loading phone numbers...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      )}
      
      {!isLoading && !error && phoneNumbers.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No phone numbers found.</p>
        </div>
      )}
      
      {!isLoading && !error && phoneNumbers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {phoneNumbers.map((number) => {
                const nextStatus = getNextStatus(number.status);
                return (
                  <tr key={number.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {number.numberString}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(number.status)}`}>
                        {number.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleStatusToggle(number.id, number.status)}
                        className={`text-white ${getButtonStyle(nextStatus)} px-3 py-1 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      >
                        Set to {nextStatus}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PhoneManagementPage; 