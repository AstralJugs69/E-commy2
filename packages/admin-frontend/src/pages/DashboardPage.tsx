import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import axios from 'axios'; // Keep for type checking
import { Container, Row, Col, Card, Alert, Spinner, Button, Table, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, getStatusBadgeVariant } from '../utils/formatters';
import LinkButton from '../components/LinkButton';
import { HiBuildingStorefront, HiUsers, HiShoppingCart, HiPhone } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket } from '../utils/socket';

interface AdminStats {
  recentOrders: {
    id: number;
    customerName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
  totalOrders: number;
  pendingOrders: number;
  verifiedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  totalUsers: number;
  availablePhones: number;
  totalZones: number;
  totalRevenue: number;
  ordersLast7Days: number;
}

interface DeliveryLocation {
  id: number;
  name: string;
  phone: string;
  district: string;
  isDefault: boolean;
}

interface AdminOrder {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  deliveryLocation?: DeliveryLocation;
  customerName: string;
  user?: {
    email: string;
  };
}

const REFRESH_INTERVAL_MS = 30000; // 30 seconds

const DashboardPage = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Live order view states
  const [activeOrders, setActiveOrders] = useState<AdminOrder[]>([]);
  const [isLoadingActive, setIsLoadingActive] = useState(true);
  const [activeError, setActiveError] = useState<string | null>(null);
  const refreshIntervalIdRef = useRef<number | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  // Reference to the socket using useRef
  const socketRef = useRef<Socket | null>(null);

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const admin_token = localStorage.getItem('admin_token');
        
        if (!admin_token) {
          setError('Authentication token not found. Please log in again.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Ensure the token is properly formatted
        const formattedToken = admin_token.startsWith('Bearer ') 
          ? admin_token 
          : `Bearer ${admin_token}`;
        
        const response = await api.get('/admin/stats');
        
        setStats(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            // Handle unauthorized error
            localStorage.removeItem('admin_token');
            setError('Your session has expired. Please log in again.');
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          } else if (err.response) {
            setError(err.response.data.message || 'Failed to fetch dashboard data');
            console.error('Error fetching dashboard data:', err.response.data);
          } else {
            setError('Network error. Please check your connection.');
            console.error('Network error:', err);
          }
        } else {
          setError('An unexpected error occurred.');
          console.error('Error fetching dashboard data:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);

  const fetchActiveOrders = async () => {
    setIsLoadingActive(true);
    setActiveError(null);
    
    try {
      const admin_token = localStorage.getItem('admin_token');
      
      if (!admin_token) {
        setActiveError('Authentication token not found. Please log in again.');
        return;
      }

      // Ensure the token is properly formatted
      const formattedToken = admin_token.startsWith('Bearer ') 
        ? admin_token 
        : `Bearer ${admin_token}`;
      
      // Pass status params correctly for backend array handling
      const statusesToFetch = ['Pending Call', 'Verified', 'Processing', 'Shipped'];
      const apiUrl = `/admin/orders?${statusesToFetch.map(s => `status=${encodeURIComponent(s)}`).join('&')}&dateFilter=today`;
      console.log(`Fetching active orders from ${apiUrl}`);
      
      // Fetch orders with all relevant statuses
      const response = await api.get(apiUrl);
      
      // Update state with fetched orders - handle both array format and paginated format
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Handle direct array response
          setActiveOrders(response.data);
        } else if (Array.isArray(response.data.orders)) {
          // Handle paginated response with orders array
        setActiveOrders(response.data.orders);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Handle standard paginated response format with data array
          setActiveOrders(response.data.data);
        } else {
          console.error('Unexpected response format:', response.data);
          setActiveError('Invalid data format received from server.');
        }
      } else {
        setActiveError('No data received from server.');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setActiveError('Your session has expired. Please log in again.');
        } else if (err.response) {
          setActiveError(err.response.data.message || 'Failed to fetch active orders');
          console.error('Error fetching active orders:', err.response.data);
        } else {
          setActiveError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
      } else {
        setActiveError('An unexpected error occurred.');
        console.error('Error fetching active orders:', err);
      }
    } finally {
      setIsLoadingActive(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const admin_token = localStorage.getItem('admin_token');
      
      if (!admin_token) {
        setActiveError('Authentication token not found. Please log in again.');
        return;
      }

      // Ensure the token is properly formatted
      const formattedToken = admin_token.startsWith('Bearer ') 
        ? admin_token 
        : `Bearer ${admin_token}`;
      
      // Update the order status
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      
      // Refresh the orders after status update
      fetchActiveOrders();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setActiveError(err.response?.data?.message || 'Failed to update order status');
        console.error('Error updating order status:', err);
      } else {
        setActiveError('An unexpected error occurred.');
        console.error('Error updating order status:', err);
      }
    }
  };

  // Initialize socket connection and set up listeners
  useEffect(() => {
    // Initialize the socket connection
    socketRef.current = initSocket();
    
    // Set up event listeners for WebSocket events
    if (socketRef.current) {
      const socket = socketRef.current;
      
      // Listen for new order events
      socket.on('new_order_created', (newOrder) => {
        console.log('New order received via WebSocket:', newOrder);
        toast.success(`New order #${newOrder.id} received!`);
        
        // Update the active orders state to include the new order
        setActiveOrders((prevOrders) => {
          // Check if the order already exists in the list
          if (prevOrders.some(order => order.id === newOrder.id)) {
            return prevOrders;
          }
          // Add the new order to the beginning of the list
          return [newOrder, ...prevOrders];
        });
        
        // Refresh dashboard stats to reflect the new order
        fetchDashboardData();
      });
      
      // Listen for order status update events
      socket.on('order_status_updated', (updatedOrder) => {
        console.log('Order status updated via WebSocket:', updatedOrder);
        toast.success(`Order #${updatedOrder.id} updated to ${updatedOrder.status}!`);
        
        // Update the order in the active orders list
        setActiveOrders((prevOrders) => {
          // Find the index of the updated order
          const orderIndex = prevOrders.findIndex(order => order.id === updatedOrder.id);
          
          // If the order is not in the list, don't update anything
          if (orderIndex === -1) return prevOrders;
          
          // Create a copy of the previous orders array
          const updatedOrders = [...prevOrders];
          
          // Update the order at the found index
          updatedOrders[orderIndex] = {
            ...updatedOrders[orderIndex],
            ...updatedOrder
          };
          
          return updatedOrders;
        });
        
        // Refresh dashboard stats to reflect the updated order status
        fetchDashboardData();
      });
      
      // Set socket connection status
      socket.on('connect', () => {
        setSocketConnected(true);
        toast.success('Connected to real-time order updates!');
      });
      
      socket.on('disconnect', () => {
        setSocketConnected(false);
      });
    }
    
    // Clean up on component unmount
    return () => {
      // Remove event listeners and disconnect socket
      if (socketRef.current) {
        const socket = socketRef.current;
        socket.off('new_order_created');
        socket.off('order_status_updated');
        socket.off('connect');
        socket.off('disconnect');
      }
      
      disconnectSocket();
    };
  }, []);

  // Set up auto-refresh for active orders
  useEffect(() => {
    // Initial fetch
    fetchActiveOrders();
    
    // Set up interval for refreshing active orders
    refreshIntervalIdRef.current = window.setInterval(() => {
      fetchActiveOrders();
    }, REFRESH_INTERVAL_MS);
    
    // Clean up interval on component unmount
    return () => {
      if (refreshIntervalIdRef.current !== null) {
        clearInterval(refreshIntervalIdRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p>Loading dashboard data...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  // JSX for conditional rendering based on socket connection
  const renderSocketStatus = () => {
    if (socketConnected) {
      return (
        <Alert variant="success" className="py-2 d-flex align-items-center">
          <div className="me-2 d-flex align-items-center">
            <span className="badge rounded-pill bg-success-subtle border border-success-subtle text-success-emphasis me-2">•</span>
          </div>
          <small>Real-time updates active</small>
        </Alert>
      );
    } else {
      return (
        <Alert variant="warning" className="py-2 d-flex align-items-center">
          <div className="me-2 d-flex align-items-center">
            <span className="badge rounded-pill bg-warning-subtle border border-warning-subtle text-warning-emphasis me-2">•</span>
          </div>
          <small>Real-time updates disconnected. Refreshing every {REFRESH_INTERVAL_MS / 1000} seconds.</small>
        </Alert>
      );
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Dashboard</h1>
      
      {/* Socket connection status indicator */}
      <Row className="mb-4">
        <Col>
          {renderSocketStatus()}
        </Col>
      </Row>
      
      {/* Stats Overview Cards */}
      <Row className="mb-4">
        {/* Orders Stats Card */}
        <Col lg={3} md={6} className="mb-4 mb-lg-0">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-4">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <HiShoppingCart className="text-primary" size={24} />
                </div>
                <div>
                  <h6 className="mb-0">Orders</h6>
                  <h3 className="mb-0">{stats?.totalOrders || 0}</h3>
                </div>
              </div>
              <div className="mt-auto">
                <div className="d-flex justify-content-between text-muted small">
                  <span>Past 7 days: {stats?.ordersLast7Days || 0}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Revenue Stats Card */}
        <Col lg={3} md={6} className="mb-4 mb-lg-0">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-4">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <HiShoppingCart className="text-success" size={24} />
                </div>
                <div>
                  <h6 className="mb-0">Revenue</h6>
                  <h3 className="mb-0">{formatCurrency(stats?.totalRevenue || 0)}</h3>
                </div>
              </div>
              <div className="mt-auto">
                <div className="d-flex justify-content-between text-muted small">
                  <span>Processing: {stats?.processingOrders || 0} orders</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Products Stats Card */}
        <Col lg={3} md={6} className="mb-4 mb-lg-0">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-4">
                <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                  <HiBuildingStorefront className="text-info" size={24} />
                </div>
                <div>
                  <h6 className="mb-0">Products</h6>
                  <h3 className="mb-0">{stats?.totalProducts || 0}</h3>
                </div>
              </div>
              <div className="mt-auto">
                <div className="d-flex justify-content-between text-muted small">
                  <span>Zones: {stats?.totalZones || 0}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Users Stats Card */}
        <Col lg={3} md={6} className="mb-4 mb-lg-0">
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-4">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                  <HiUsers className="text-warning" size={24} />
                </div>
        <div>
                  <h6 className="mb-0">Users</h6>
                  <h3 className="mb-0">{stats?.totalUsers || 0}</h3>
                </div>
              </div>
              <div className="mt-auto">
                <div className="d-flex justify-content-between text-muted small">
                  <span>Phone Lines: {stats?.availablePhones || 0} available</span>
        </div>
      </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Pending Verification Calls Section */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h3 className="h5 mb-0">Pending Verification Calls</h3>
        </Card.Header>
        <Card.Body>
          {isLoadingActive ? (
            <div className="text-center my-4">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Loading pending verification calls...</span>
            </div>
          ) : activeError ? (
            <Alert variant="danger">{activeError}</Alert>
          ) : activeOrders.length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-3">
              {activeOrders
                .filter(order => order.status === 'Pending Call')
                .map(order => (
                <Col key={order.id}>
                  <Card className="h-100 border">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <span>
                        <strong>Order #{order.id}</strong>
                      </span>
                      <Badge bg={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Customer:</strong> {order.deliveryLocation?.name || order.customerName || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Phone:</strong> {order.deliveryLocation?.phone || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Total:</strong> {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="mb-2">
                        <strong>Created:</strong> {formatDate(order.createdAt)}
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <div className="d-flex justify-content-between gap-2">
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handleStatusChange(order.id, 'Verified')}
                        >
                          Mark Verified
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleStatusChange(order.id, 'Cancelled')}
                        >
                          Cancel Order
                        </Button>
                        <LinkButton 
                          to={`/admin/orders/${order.id}`}
                          variant="outline-secondary" 
                          size="sm"
                          className="ms-auto"
                        >
                          Details
                        </LinkButton>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              No orders awaiting phone verification calls for today.
            </Alert>
          )}
        </Card.Body>
        <Card.Footer className="text-muted">
          <small>Auto-refreshes every {REFRESH_INTERVAL_MS / 1000} seconds</small>
        </Card.Footer>
      </Card>
      
      {/* Verified Orders Section */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h3 className="h5 mb-0">Verified (Ready to Process)</h3>
        </Card.Header>
        <Card.Body>
          {isLoadingActive ? (
            <div className="text-center my-4">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Loading verified orders...</span>
            </div>
          ) : activeError ? (
            <Alert variant="danger">{activeError}</Alert>
          ) : activeOrders.length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-3">
              {activeOrders
                .filter(order => order.status === 'Verified')
                .map(order => (
                <Col key={order.id}>
                  <Card className="h-100 border">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <span>
                        <strong>Order #{order.id}</strong>
                      </span>
                      <Badge bg={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Customer:</strong> {order.deliveryLocation?.name || order.customerName || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Phone:</strong> {order.deliveryLocation?.phone || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Total:</strong> {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="mb-2">
                        <strong>Created:</strong> {formatDate(order.createdAt)}
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <div className="d-flex justify-content-between gap-2">
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleStatusChange(order.id, 'Processing')}
                        >
                          Start Processing
                        </Button>
                        <Button 
                          variant="outline-warning" 
                          size="sm"
                          onClick={() => handleStatusChange(order.id, 'Pending Call')}
                        >
                          Rollback to Pending
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleStatusChange(order.id, 'Cancelled')}
                        >
                          Cancel Order
                        </Button>
                        <LinkButton 
                          to={`/admin/orders/${order.id}`}
                          variant="outline-secondary" 
                          size="sm"
                          className="ms-auto"
                        >
                          Details
                        </LinkButton>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              No verified orders found for today.
            </Alert>
          )}
        </Card.Body>
        <Card.Footer className="text-muted">
          <small>Auto-refreshes every {REFRESH_INTERVAL_MS / 1000} seconds</small>
        </Card.Footer>
      </Card>
      
      {/* Processing Orders Section */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h3 className="h5 mb-0">Processing Orders</h3>
        </Card.Header>
        <Card.Body>
          {isLoadingActive ? (
            <div className="text-center my-4">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Loading processing orders...</span>
            </div>
          ) : activeError ? (
            <Alert variant="danger">{activeError}</Alert>
          ) : activeOrders.length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-3">
              {activeOrders
                .filter(order => order.status === 'Processing')
                .map(order => (
                <Col key={order.id}>
                  <Card className="h-100 border">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <span>
                        <strong>Order #{order.id}</strong>
                      </span>
                      <Badge bg={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Customer:</strong> {order.deliveryLocation?.name || order.customerName || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Phone:</strong> {order.deliveryLocation?.phone || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Total:</strong> {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="mb-2">
                        <strong>Created:</strong> {formatDate(order.createdAt)}
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <div className="d-flex justify-content-between gap-2">
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleStatusChange(order.id, 'Shipped')}
                        >
                          Mark Shipped
                        </Button>
                        <Button 
                          variant="outline-warning" 
                          size="sm"
                          onClick={() => handleStatusChange(order.id, 'Verified')}
                        >
                          Rollback to Verified
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleStatusChange(order.id, 'Cancelled')}
                        >
                          Cancel Order
                        </Button>
                        <LinkButton 
                          to={`/admin/orders/${order.id}`}
                          variant="outline-secondary" 
                          size="sm"
                          className="ms-auto"
                        >
                          Details
                        </LinkButton>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              No orders in processing state found for today.
            </Alert>
          )}
        </Card.Body>
        <Card.Footer className="text-muted">
          <small>Auto-refreshes every {REFRESH_INTERVAL_MS / 1000} seconds</small>
        </Card.Footer>
      </Card>
      
      {/* Shipped Orders Section */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-light">
          <h3 className="h5 mb-0">Shipped (Awaiting Delivery Confirmation)</h3>
        </Card.Header>
        <Card.Body>
          {isLoadingActive ? (
            <div className="text-center my-4">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Loading shipped orders...</span>
            </div>
          ) : activeError ? (
            <Alert variant="danger">{activeError}</Alert>
          ) : activeOrders.length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-3">
              {activeOrders
                .filter(order => order.status === 'Shipped')
                .map(order => (
                <Col key={order.id}>
                  <Card className="h-100 border">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <span>
                        <strong>Order #{order.id}</strong>
                      </span>
                      <Badge bg={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Customer:</strong> {order.deliveryLocation?.name || order.customerName || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Phone:</strong> {order.deliveryLocation?.phone || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Total:</strong> {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="mb-2">
                        <strong>Created:</strong> {formatDate(order.createdAt)}
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <div className="d-flex justify-content-between gap-2">
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handleStatusChange(order.id, 'Delivered')}
                        >
                          Mark Delivered
                        </Button>
                        <Button 
                          variant="outline-warning" 
                          size="sm"
                          onClick={() => handleStatusChange(order.id, 'Processing')}
                        >
                          Rollback to Processing
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleStatusChange(order.id, 'Cancelled')}
                        >
                          Cancel Order
                        </Button>
                        <LinkButton 
                          to={`/admin/orders/${order.id}`}
                          variant="outline-secondary" 
                          size="sm"
                          className="ms-auto"
                        >
                          Details
                        </LinkButton>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              No shipped orders awaiting delivery confirmation found for today.
            </Alert>
          )}
        </Card.Body>
        <Card.Footer className="text-muted">
          <small>Auto-refreshes every {REFRESH_INTERVAL_MS / 1000} seconds</small>
        </Card.Footer>
      </Card>
      
      {/* Recent Orders */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-transparent py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Orders</h5>
                <Link to="/admin/orders">
                  <Button variant="outline-secondary" size="sm">View All</Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              {stats && stats.recentOrders && stats.recentOrders.length > 0 ? (
                <Table hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customerName}</td>
                        <td>{formatCurrency(order.totalAmount)}</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <LinkButton 
                            to={`/admin/orders/${order.id}`}
                            variant="outline-secondary" 
                            size="sm"
                          >
                            View
                          </LinkButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-3">No recent orders found.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage; 