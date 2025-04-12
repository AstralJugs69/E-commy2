import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Alert, Spinner, Badge } from 'react-bootstrap';

interface AdminOrder {
  id: number;
  customerName: string;
  customerPhone: string;
  status: string;
  locationCheckResult: string | null;
  createdAt: string; // ISO 8601 date string
}

const API_BASE_URL = 'http://localhost:3001/api';

const OrderManagementPage = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setOrders(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else {
            setError(err.response.data.message || 'Failed to fetch orders.');
          }
          console.error('Error fetching orders:', err.response.data);
        } else {
          setError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDateTime = (isoString: string): string => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <Container className="mt-3">
      <h2>Order Management</h2>
      
      {isLoading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {!isLoading && !error && (
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Location Check</th>
              <th>Date Placed</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.customerPhone}</td>
                  <td>
                    <Badge bg={
                      order.status === 'Verified' ? 'success' :
                      order.status === 'Pending Call' ? 'warning' :
                      'secondary'
                    }>
                      {order.status}
                    </Badge>
                  </td>
                  <td>{order.locationCheckResult || 'N/A'}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default OrderManagementPage; 