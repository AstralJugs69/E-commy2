import React, { useState, useEffect } from 'react';
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
import api from '../utils/api'; // Import centralized API utility

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
      const apiUrl = `/admin/orders${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(apiUrl);
      
      // Check if response.data is an array or has an 'orders' property
      const ordersArray = Array.isArray(response.data) 
        ? response.data 
        : response.data?.orders || [];
      
      // Ensure we always have an array
      if (!Array.isArray(ordersArray)) {
        console.error("Invalid response format: expected an array of orders");
        setOrders([]);
        return;
      }
      
      const processedOrders = ordersArray.map(order => ({
        ...order,
        shippingDetails: typeof order.shippingDetails === 'string'
          ? JSON.parse(order.shippingDetails)
          : order.shippingDetails
      }));
      
      setOrders(processedOrders);
    } catch (err: any) {
      if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
      } else if (err.response) {
        setError(err.response.data?.message || 'Failed to fetch orders.');
        console.error('Error fetching orders:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
      
      // Initialize with empty array to prevent mapping errors
      setOrders([]);
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
    
    setUpdatingOrderIds(prev => [...prev, orderId]);
    
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      
      await fetchOrders();
    } catch (err: any) {
      if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
      } else if (err.response) {
        setError(err.response.data?.message || `Failed to update order ${orderId} status.`);
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
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Alert variant="info">
          <div className="d-flex align-items-center">
            <FaShoppingBag className="me-3" size={24} />
            <div>
              <h5 className="mb-1">No Orders Found</h5>
              <p className="mb-0">
                {statusFilters.length > 0
                  ? "No orders match your selected filters. Try adjusting your filters or viewing all orders."
                  : "There are no orders in the system yet."}
              </p>
            </div>
          </div>
        </Alert>
          ) : (
        // Only render the table if we have orders
        <Table responsive striped bordered hover>
                <thead>
                  <tr>
              <th>Order #</th>
              <th>Date</th>
                    <th>Customer</th>
              <th>Contact</th>
              <th>Amount</th>
                    <th>Status</th>
              <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
            {orders && orders.map(order => (
                    <tr key={order.id}>
                      <td>
                  <Link to={`/admin/orders/${order.id}`} className="fw-bold text-decoration-none">
                    {order.id}
                        </Link>
                      </td>
                <td>{formatDateTime(order.createdAt)}</td>
                <td>
                  {order.shippingDetails?.fullName || "N/A"}
                        {order.shippingDetails?.address && (
                    <div className="small text-muted d-flex align-items-center">
                      <FaMapMarkerAlt className="me-1" size={10} />
                      {order.shippingDetails.city}, {order.shippingDetails.country}
                          </div>
                        )}
                      </td>
                      <td>
                  {order.shippingDetails?.phone || "N/A"}
                      </td>
                <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                  <Badge 
                    bg={getStatusBadgeVariant(order.status)}
                    className="px-2 py-1"
                  >
                          {order.status}
                        </Badge>
                      </td>
                      <td>
                  <div className="d-flex gap-2">
                        <Form.Select
                          size="sm"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingOrderIds.includes(order.id)}
                      style={{ width: '140px' }}
                      className="me-2"
                        >
                      {allowedOrderStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                          ))}
                        </Form.Select>
                    
                    <Link 
                      to={`/admin/orders/${order.id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      <FaInfoCircle className="me-1" /> Details
                    </Link>
                  </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
      )}
    </Container>
  );
};

export default OrderManagementPage; 