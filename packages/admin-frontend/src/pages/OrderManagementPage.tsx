import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Table, Alert, Spinner, Badge, Form, Row, Col, Button, ButtonGroup, Pagination, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaFilter, FaInfoCircle, FaCalendarAlt, FaPhone, FaMapMarkerAlt, FaTimes, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { formatCurrency, formatDateTime, getStatusBadgeVariant } from '../utils/formatters';
import api from '../utils/api';

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
  customerName?: string;
  customerPhone?: string;
  deliveryDistrict?: string;
  shippingDetails?: ShippingDetails;
  items?: OrderItem[];
  createdAt: string; // ISO 8601 date string
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginatedResponse {
  data: AdminOrder[];
  meta: PaginationMeta;
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
  
  // Enhanced state for pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');

  const fetchOrders = useCallback(async (page = 1) => {
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
      
      // Add pagination parameters
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());
      
      // Add sorting parameters
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      // Add search parameter if provided
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get(`/admin/orders?${params.toString()}`);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // This is a paginated response
        const paginatedResponse = response.data as PaginatedResponse;
        
        const processedOrders = paginatedResponse.data.map(order => ({
          ...order,
          shippingDetails: typeof order.shippingDetails === 'string'
            ? JSON.parse(order.shippingDetails)
            : (order.shippingDetails || {}),
          items: Array.isArray(order.items) ? order.items : []
        }));
        
        setOrders(processedOrders);
        setCurrentPage(paginatedResponse.meta.currentPage);
        setTotalPages(paginatedResponse.meta.totalPages);
        setTotalItems(paginatedResponse.meta.totalItems);
        setItemsPerPage(paginatedResponse.meta.itemsPerPage);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle legacy/non-paginated response format
        const ordersArray = response.data;
        
        const processedOrders = ordersArray.map(order => ({
          ...order,
          shippingDetails: typeof order.shippingDetails === 'string'
            ? JSON.parse(order.shippingDetails)
            : (order.shippingDetails || {}),
          items: Array.isArray(order.items) ? order.items : []
        }));
        
        setOrders(processedOrders);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(ordersArray.length);
        setItemsPerPage(ordersArray.length);
      } else if (response.data && response.data.orders && Array.isArray(response.data.orders)) {
        // Another possible legacy format
        const ordersArray = response.data.orders;
      
      const processedOrders = ordersArray.map((order: any) => ({
        ...order,
        shippingDetails: typeof order.shippingDetails === 'string'
          ? JSON.parse(order.shippingDetails)
            : (order.shippingDetails || {}),
          items: Array.isArray(order.items) ? order.items : []
      }));
      
      setOrders(processedOrders);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(ordersArray.length);
        setItemsPerPage(ordersArray.length);
      } else {
        // If we get here, we don't have a recognized response format
        setOrders([]);
        console.error('Unrecognized API response format:', response.data);
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response.data?.message || 'Failed to fetch orders.');
        }
        console.error('Error fetching orders:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
      // Set orders to empty array to prevent "map of undefined" error
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilters, dateFilter, itemsPerPage, sortBy, sortOrder, searchTerm]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
    fetchOrders(1);
  }, [statusFilters, dateFilter, sortBy, sortOrder, searchTerm, fetchOrders]);

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInputValue);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInputValue]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchOrders(newPage);
    // Scroll to top of the page
    window.scrollTo(0, 0);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setIsUpdating(true);
    setError(null);
    
    setUpdatingOrderIds(prev => [...prev, orderId]);
    
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      
      // Refresh orders with current page and filters
      await fetchOrders(currentPage);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response.data?.message || `Failed to update order ${orderId} status.`);
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

  // Clear search input
  const clearSearch = () => {
    setSearchInputValue('');
    setSearchTerm('');
  };

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if same column is clicked
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to descending order
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Render sort icon for the column
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <FaSort className="ms-1 text-muted" />;
    }
    return sortOrder === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />;
  };

  // Create pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    // Function to determine which page items to show
    const getPageItems = () => {
      const items = [];
      
      // Always show first page
      items.push(
        <Pagination.Item 
          key="first" 
          active={currentPage === 1}
          onClick={() => handlePageChange(1)}
        >
          1
        </Pagination.Item>
      );
      
      // Add ellipsis if needed
      if (currentPage > 3) {
        items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
      }
      
      // Add pages around current page
      for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page++) {
        if (page === 1 || page === totalPages) continue; // Skip first and last pages
        items.push(
          <Pagination.Item 
            key={page} 
            active={currentPage === page}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Pagination.Item>
        );
      }
      
      // Add ellipsis if needed
      if (currentPage < totalPages - 2) {
        items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
      }
      
      // Always show last page if more than 1 page
      if (totalPages > 1) {
        items.push(
          <Pagination.Item 
            key="last" 
            active={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </Pagination.Item>
        );
      }
      
      return items;
    };
    
    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.Prev 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {getPageItems()}
          <Pagination.Next 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    );
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
        <Col md={6}>
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
            <Button
              variant={dateFilter === 'week' ? 'primary' : 'outline-secondary'}
              onClick={() => setDateFilter('week')}
            >
              This Week
            </Button>
            <Button
              variant={dateFilter === 'month' ? 'primary' : 'outline-secondary'}
              onClick={() => setDateFilter('month')}
            >
              This Month
            </Button>
          </ButtonGroup>
        </Col>
        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Search orders by ID, customer name, or address..."
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
            />
            {searchInputValue && (
              <Button 
                variant="outline-secondary" 
                onClick={clearSearch}
                title="Clear search"
              >
                <FaTimes />
              </Button>
            )}
            <Button variant="outline-primary">
              <FaSearch />
            </Button>
          </InputGroup>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={12}>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="me-2 d-flex align-items-center">
              <FaFilter className="me-1" /> Status:
            </span>
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
                {statusFilters.length > 0 || searchTerm
                  ? `No orders match the selected filters or search criteria.` 
                  : "You don't have any customer orders yet."}
              </p>
              {(statusFilters.length > 0 || searchTerm) && (
                <div className="d-flex gap-2 justify-content-center">
              {statusFilters.length > 0 && (
                <Button 
                      variant="outline-primary" 
                  onClick={clearStatusFilters}
                >
                      Clear Status Filters
                    </Button>
                  )}
                  {searchTerm && (
                    <Button 
                      variant="outline-primary" 
                      onClick={clearSearch}
                    >
                      Clear Search
                </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
            <div className="table-responsive">
              <Table hover responsive className="align-middle shadow-sm">
                <thead>
                  <tr>
                    <th 
                      style={{ width: '80px', cursor: 'pointer' }}
                      onClick={() => handleSort('id')}
                      className="user-select-none"
                    >
                      <div className="d-flex align-items-center">
                        ID {renderSortIcon('id')}
                      </div>
                    </th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th 
                      className="text-end user-select-none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('totalAmount')}
                    >
                      <div className="d-flex align-items-center justify-content-end">
                        Total {renderSortIcon('totalAmount')}
                      </div>
                    </th>
                    <th 
                      className="user-select-none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('status')}
                    >
                      <div className="d-flex align-items-center">
                        Status {renderSortIcon('status')}
                      </div>
                    </th>
                    <th 
                      className="user-select-none"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="d-flex align-items-center">
                        Date {renderSortIcon('createdAt')}
                      </div>
                    </th>
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
                        <div className="fw-medium">{order.shippingDetails?.fullName || order.customerName || '(No Name)'}</div>
                        {(order.shippingDetails?.phone || order.customerPhone) && (
                          <div className="text-muted small d-flex align-items-center">
                            <FaPhone className="me-1" size={12} /> {order.shippingDetails?.phone || order.customerPhone}
                          </div>
                        )}
                        {(order.shippingDetails?.address || order.deliveryDistrict) && (
                          <div className="text-muted small d-flex align-items-center">
                            <FaMapMarkerAlt className="me-1" size={12} /> 
                            {order.shippingDetails?.address 
                              ? `${order.shippingDetails.address}, ${order.shippingDetails.city || ''}`
                              : order.deliveryDistrict}
                          </div>
                        )}
                      </td>
                      <td>
                        {order.items && order.items.length > 0 ? (
                          order.items.map(item => (
                          <div key={item.id} className="small">
                            <span className="fw-medium">{item.quantity}x</span> {item.productName}
                          </div>
                          ))
                        ) : (
                          <div className="small text-muted">No items</div>
                        )}
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
              
              {/* Pagination controls */}
              {renderPagination()}
              
              {/* Display total items */}
                <div className="text-center mt-3 text-muted small">
                Showing {orders.length} of {totalItems} orders
                </div>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default OrderManagementPage; 