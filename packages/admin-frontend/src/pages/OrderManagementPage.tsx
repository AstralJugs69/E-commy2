import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Alert, Spinner, Badge, Form, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingBag } from 'react-icons/fa';
import { FaFilter } from 'react-icons/fa';
import { FaInfoCircle } from 'react-icons/fa';
import { FaCalendarAlt } from 'react-icons/fa';
import { FaPhone } from 'react-icons/fa';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaTimes } from 'react-icons/fa';
import { formatCurrency, formatDateTime, getStatusBadgeVariant } from '../utils/formatters';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface AdminOrder {
  id: number;
  status: string;
  totalAmount: number;
  shippingDetails: ShippingDetails;
  items: OrderItem[];
  createdAt: string; // ISO 8601 date string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Define allowed order statuses (must match backend)
const allowedOrderStatuses = ["Pending Call", "Verified", "Processing", "Shipped", "Delivered", "Cancelled"];

const OrderManagementPage = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<number[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]); // Changed to array
  const [dateFilter, setDateFilter] = useState<string>('today'); // Default to 'today'
  const [isUpdating, setIsUpdating] = useState(false);

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
      const params = new URLSearchParams();
      
      // Add multiple status filters if any are selected
      statusFilters.forEach(status => {
        params.append('status', status);
      });
      
      if (dateFilter) {
        params.append('dateFilter', dateFilter);
      }
      const queryString = params.toString();
      const apiUrl = `${API_BASE_URL}/admin/orders${queryString ? `?${queryString}` : ''}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Check if response.data is an array or has an 'orders' property
      const ordersArray = Array.isArray(response.data) 
        ? response.data 
        : response.data.orders || [];
      
      if (!Array.isArray(ordersArray)) {
        throw new Error('Invalid response format: expected an array of orders');
      }
      
      const processedOrders = ordersArray.map(order => ({
        ...order,
        shippingDetails: typeof order.shippingDetails === 'string'
          ? JSON.parse(order.shippingDetails)
          : order.shippingDetails
      }));
      
      setOrders(processedOrders);
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

  useEffect(() => {
    fetchOrders();
  }, [statusFilters, dateFilter]); // Re-fetch when filters change

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setIsUpdating(true);
    setError(null);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      setIsUpdating(false);
      return;
    }
    
    setUpdatingOrderIds(prev => [...prev, orderId]);
    
    try {
      await axios.put(
        `${API_BASE_URL}/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      await fetchOrders();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response.data.message || `Failed to update order ${orderId} status.`);
        }
        console.error('Error updating order status:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setUpdatingOrderIds(prev => prev.filter(id => id !== orderId));
      setIsUpdating(false);
    }
  };

  // Toggle a status filter on/off
  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status) // Remove if already selected
        : [...prev, status] // Add if not selected
    );
  };
  
  // Clear all status filters
  const clearStatusFilters = () => {
    setStatusFilters([]);
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          {dateFilter === 'today' ? "Today's Orders" : "Order Management"}
          {statusFilters.length > 0 && ` (Filtered)`}
        </h2>
      </div>
      
      <Row className="mb-3 align-items-center">
        <Col>
          <ButtonGroup size="sm" className="mb-3">
            <Button
              variant={dateFilter === 'today' ? 'primary' : 'outline-secondary'}
              onClick={() => setDateFilter('today')}
            >
              Today's Orders
            </Button>
            <Button
              variant={dateFilter === 'all' ? 'primary' : 'outline-secondary'}
              onClick={() => setDateFilter('all')}
            >
              All Orders
            </Button>
            {/* Add more date range buttons later if needed */}
          </ButtonGroup>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={6} lg={8}>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {allowedOrderStatuses.map(status => (
              <Button
                key={status}
                size="sm"
                variant={statusFilters.includes(status) ? 'primary' : 'outline-secondary'}
                onClick={() => toggleStatusFilter(status)}
                className="d-inline-flex align-items-center"
              >
                {status}
                {statusFilters.includes(status) && <FaTimes className="ms-2" />}
              </Button>
            ))}
            
            {statusFilters.length > 0 && (
              <Button 
                variant="danger" 
                size="sm"
                onClick={clearStatusFilters}
                className="ms-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Col>
      </Row>
      
      {statusFilters.length > 0 && (
        <div className="mb-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="text-muted me-2">Active filters:</span>
            {statusFilters.map(status => (
              <Badge 
                key={status} 
                bg={getStatusBadgeVariant(status)} 
                className="py-2 px-3 d-flex align-items-center"
              >
                {status}
                <Button 
                  variant="link" 
                  className="p-0 ms-2 text-white" 
                  onClick={() => toggleStatusFilter(status)}
                  aria-label={`Remove ${status} filter`}
                >
                  <FaTimes size={12} />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="mt-2 text-muted">Loading orders...</p>
        </div>
      ) : (
        <>
          {orders.length === 0 ? (
            <div className="empty-state">
              <FaShoppingBag className="empty-state-icon" />
              <p className="empty-state-text">No Orders Found</p>
              <p className="mb-4 text-muted">
                {statusFilters.length > 0
                  ? `No orders match the selected status filters.` 
                  : "You don't have any customer orders yet."}
              </p>
              {statusFilters.length > 0 && (
                <Button 
                  variant="primary" 
                  onClick={clearStatusFilters}
                  className="px-4 d-flex align-items-center gap-2 mx-auto"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover responsive className="align-middle shadow-sm">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th className="text-end">Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ width: '180px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/admin/orders/${order.id}`} className="fw-bold text-decoration-none d-flex align-items-center">
                          <FaInfoCircle className="text-primary me-1" /> {order.id}
                        </Link>
                      </td>
                      <td>
                        <div className="fw-medium">{order.shippingDetails?.fullName || '(No Name)'}</div>
                        {order.shippingDetails?.phone && (
                          <div className="text-muted small d-flex align-items-center">
                            <FaPhone className="me-1" size={12} /> {order.shippingDetails.phone}
                          </div>
                        )}
                        {order.shippingDetails?.address && (
                          <div className="text-muted small d-flex align-items-center">
                            <FaMapMarkerAlt className="me-1" size={12} /> 
                            {`${order.shippingDetails.address}, ${order.shippingDetails.city || ''}`}
                          </div>
                        )}
                      </td>
                      <td>
                        {order.items.map(item => (
                          <div key={item.id} className="small">
                            <span className="fw-medium">{item.quantity}x</span> {item.productName}
                          </div>
                        ))}
                      </td>
                      <td className="text-end fw-medium">{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(order.status)} className="px-2 py-1">
                          {order.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="small d-flex align-items-center">
                          <FaCalendarAlt className="me-1" size={12} /> 
                          {formatDateTime(order.createdAt)}
                        </div>
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingOrderIds.includes(order.id)}
                          aria-label={`Change status for order ${order.id}`}
                          className="shadow-sm border"
                        >
                          {allowedOrderStatuses.map(statusOption => (
                            <option key={statusOption} value={statusOption}>
                              {statusOption}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default OrderManagementPage; 