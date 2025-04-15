import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Alert, Spinner, Badge, Card, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaList, FaShoppingBag, FaRegClock } from 'react-icons/fa';
import api from '../utils/api';
import { formatDateTime, formatCurrency, getStatusBadgeVariant } from '../utils/formatters';

interface UserOrder {
  id: number; 
  status: string;
  totalAmount: number;
  createdAt: string; // ISO String
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For order list loading
  const [error, setError] = useState<string | null>(null);
  // Get auth state, including loading status
  const { token, isAuthenticated, isAuthLoading } = useAuth(); 
  const navigate = useNavigate(); // If needed for redirect

  useEffect(() => {
    const fetchOrders = async () => {
      // Wait for auth context to initialize
      if (isAuthLoading) {
        console.log("Order History: Auth context still loading, waiting...");
        return; 
      }

      // Check authentication status *after* auth loading is done
      if (!isAuthenticated || !token) {
        setError("You must be logged in to view your orders.");
        setIsLoading(false); // Stop *order list* loading
        return;
      }

      // Proceed with fetching orders
      console.log("Order History: Auth loaded, fetching orders...");
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<UserOrder[]>(`${API_BASE_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
             setError("Authentication failed. Please log in again.");
             // Optionally trigger logout here if you have the function
          } else {
            setError(err.response?.data?.message || 'Failed to fetch orders. Please try again.');
          }
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false); // Finish loading order list
      }
    };

    fetchOrders();
  // Add isAuthLoading to dependency array
  }, [token, isAuthenticated, isAuthLoading, navigate]);

  // Show spinner while auth is loading OR order list is loading
  if (isAuthLoading || isLoading) {
      return (
        <Container className="py-3 text-center">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </Container>
     );
  }

  return (
    <Container className="py-3">
      <h2 className="mb-4">My Orders</h2>

      {error && ( // Show error if occurred after loading
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}

      {!error && (
        <>
          {orders.length === 0 ? (
            <div className="empty-state">
              <FaList className="empty-state-icon" />
              <p className="empty-state-text">No Orders Yet</p>
              <p className="mb-4 text-muted">You haven't placed any orders yet. Start shopping to see your order history here.</p>
              <Link to="/" className="btn btn-primary px-4">
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {orders.map((order) => (
                <Card key={order.id} className="mb-3 shadow-sm">
                  <Card.Header>
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                      <div className="mb-1 mb-md-0">
                        <FaShoppingBag className="me-2 text-primary" />
                        <strong>Order ID:</strong>{' '}
                        <Link to={`/order/${order.id}`}>#{order.id}</Link>
                      </div>
                      <div className="mb-1 mb-md-0">
                        <FaRegClock className="me-2 text-muted" />
                        <strong>Placed:</strong> {formatDateTime(order.createdAt)}
                      </div>
                      <div>
                        <Badge bg={getStatusBadgeVariant(order.status)}
                               className="px-3 py-2"
                        >
                          {order.status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col>
                        <Card.Text as="h6" className="mb-0">
                          Total: {formatCurrency(order.totalAmount)}
                        </Card.Text>
                      </Col>
                      <Col className="text-end">
                        <Link to={`/order/${order.id}`} className="btn btn-outline-primary btn-sm px-3">
                          View Details
                        </Link>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default OrderHistoryPage; 