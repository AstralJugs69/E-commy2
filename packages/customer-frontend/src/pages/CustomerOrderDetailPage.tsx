import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaMapMarkerAlt, FaRegClock, FaBoxOpen, FaTruck } from 'react-icons/fa';
import api from '../utils/api';
import { formatDateTime, formatCurrency, getStatusBadgeVariant, getOrderStatusDescription } from '../utils/formatters';

// Interfaces based on expected API response for GET /api/orders/:id
interface OrderItem {
  id: number;
  quantity: number;
  price: number; // Price per item at time of order
  productId: number;
  product: { // Assuming backend includes product name via relation
    name: string;
  };
}

interface ShippingDetails { 
  fullName: string;
  address: string; // Assuming address is a single string from textarea
  phone: string;
  // Add other fields like city, zip, country if they are stored separately
}

interface CustomerOrder {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string; // ISO String
  shippingDetails: ShippingDetails | null; 
  items: OrderItem[];
  // Other fields like userId, latitude, longitude might be present but not displayed
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const CustomerOrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { token, isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (isAuthLoading) {
        console.log("Order Detail: Auth context still loading, waiting...");
        return; 
      }

      if (!isAuthenticated || !token) {
        setError("Authentication required to view order details.");
        setIsLoading(false);
        return;
      }

      if (!orderId) {
        setError("Order ID is missing from the URL.");
        setIsLoading(false);
        return;
      }

      console.log(`Order Detail: Auth loaded, fetching order ${orderId}...`);
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<CustomerOrder>(`${API_BASE_URL}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        if (axios.isAxiosError(err)) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError("You are not authorized to view this order.");
            } else if (err.response?.status === 404) {
                setError("Order not found.");
            } else {
                setError(err.response?.data?.message || 'Failed to fetch order details.');
            }
        } else {
            setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();

  }, [orderId, token, isAuthenticated, isAuthLoading, navigate]);

  if (isAuthLoading || isLoading) {
      return (
        <Container className="py-4 text-center">
             <Spinner animation="border" role="status">
                 <span className="visually-hidden">Loading...</span>
             </Spinner>
         </Container>
      );
  }

  return (
    <Container className="py-3">
      <h2 className="mb-4">Order Details</h2>

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {!error && order && (
        <Card className="shadow-sm">
          <Card.Header>
            <Row className="align-items-center">
              <Col xs={12} sm={6} className="mb-2 mb-sm-0">
                <strong>Order #</strong> {order.id}
              </Col>
              <Col xs={12} sm={6} className="text-sm-end">
                <Badge bg={getStatusBadgeVariant(order.status)}>{order.status || 'Unknown'}</Badge>
                <div className="text-muted small mt-1">{getOrderStatusDescription(order.status)}</div>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Row className="g-4 mb-4">
              <Col xs={12} md={6} className="mb-3 mb-md-0">
                <h5 className="border-bottom pb-2">Order Summary</h5>
                <p className="mb-2"><strong>Date Placed:</strong> {formatDateTime(order.createdAt)}</p>
                <p><strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}</p>
                {order.status === 'Pending Call' && (
                  <p className="text-danger small mt-2">
                    Remember to call the verification number provided after checkout to complete your order.
                  </p>
                )}
              </Col>
              <Col xs={12} md={6}>
                <h5 className="border-bottom pb-2">Shipping Details</h5>
                {order.shippingDetails ? (
                    <>
                        <p className="mb-2"><strong>Name:</strong> {order.shippingDetails.fullName}</p>
                        <p className="mb-2"><strong>Phone:</strong> {order.shippingDetails.phone}</p>
                        <p className="mb-0"><strong>Address:</strong> {order.shippingDetails.address || 'N/A'}</p>
                        {/* Add City, Zip, Country if available */}
                    </>
                ) : (
                    <p className="mb-0">Not Available</p>
                )}
              </Col>
            </Row>
            
            <h5 className="border-bottom pb-2 mb-3">Items Ordered</h5>
            {order.items && order.items.length > 0 ? (
              <div className="table-responsive">
                <Table striped bordered hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Qty</th>
                      <th className="text-center">Price</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="text-break">{item.product?.name || 'Product not found'}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-center">{formatCurrency(item.price)}</td>
                        <td className="text-end">{formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p>No items found for this order.</p>
            )}
          </Card.Body>
        </Card>
      )}

      {!error && !order && !isLoading && (
          <Alert variant="warning">Order data could not be loaded.</Alert>
      )}
    </Container>
  );
};

export default CustomerOrderDetailPage; 