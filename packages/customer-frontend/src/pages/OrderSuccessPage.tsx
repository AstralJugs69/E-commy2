import { useEffect, useState } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  productName: string;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingDetails: {
    fullName: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    phone: string;
  };
}

const OrderSuccessPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationNumber, setVerificationNumber] = useState<string | null>(null);
  const [numberLoading, setNumberLoading] = useState(true);
  const [numberError, setNumberError] = useState<string | null>(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchOrderDetails = async () => {
    if (!orderId || !token) {
      setError('Order ID or authentication token is missing');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationNumber = async () => {
    if (!orderId) {
      setNumberError('Order ID is missing');
      setNumberLoading(false);
      return;
    }
    
    if (!token) {
      setNumberError('Authentication error. Cannot fetch details.');
      setNumberLoading(false);
      return;
    }
    
    setNumberLoading(true);
    setNumberError(null);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/assign-number/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.verificationPhoneNumber) {
        setVerificationNumber(response.data.verificationPhoneNumber);
      } else {
        setNumberError('Could not retrieve verification number.');
      }
    } catch (err) {
      console.error('Error fetching verification number:', err);
      let errMsg = 'Failed to get verification number.';
      
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const responseMessage = err.response?.data?.message;
        
        if (status === 401) {
          errMsg = 'Authentication error: ' + (responseMessage || 'Unauthorized');
        } else if (status === 403) {
          errMsg = 'Access denied: ' + (responseMessage || 'Forbidden');
        } else if (status === 404) {
          errMsg = 'Order not found or no number available';
        } else if (status === 409) {
          errMsg = 'Conflict: ' + (responseMessage || 'Number could not be assigned');
        } else if (status === 503) {
          errMsg = 'Verification service unavailable. Please try again later.';
        } else {
          errMsg = responseMessage || 'Unknown error occurred';
        }
      }
      
      setNumberError(errMsg);
    } finally {
      setNumberLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, token, API_BASE_URL]);

  useEffect(() => {
    if (orderId && token) {
      fetchVerificationNumber();
    }
  }, [orderId, token, API_BASE_URL]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading your order details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-3">
        <Alert variant="danger">{error}</Alert>
        <Link to="/" className="btn btn-primary mt-3">
          Return to Home
        </Link>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-3">
        <Alert variant="warning">Order not found</Alert>
        <Link to="/" className="btn btn-primary mt-3">
          Return to Home
        </Link>
      </Container>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="text-success">Order Placed Successfully!</h2>
        <p className="lead">Thank you for your purchase.</p>
        <p>Your Order ID is: <strong>{orderId}</strong></p>
      </div>

      {numberLoading && (
        <div className="text-center mb-4">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Retrieving verification information...</span>
        </div>
      )}

      {numberError && (
        <Alert variant="danger" className="mb-4">
          {numberError}
        </Alert>
      )}

      {!numberLoading && !numberError && verificationNumber && (
        <Card bg="warning" text="dark" className="text-center my-4">
          <Card.Body>
            <Card.Title>ACTION REQUIRED: Verify Your Order</Card.Title>
            <Card.Text>
              To complete your order, please call the following number immediately for verification:
            </Card.Text>
            <h3 className="display-6 my-3">
              <a href={`tel:${verificationNumber}`}>{verificationNumber}</a>
            </h3>
            <Card.Text>
              <small>Failure to call may result in order cancellation.</small>
            </Card.Text>
          </Card.Body>
        </Card>
      )}

      {!numberLoading && !numberError && !verificationNumber && (
        <Alert variant="warning" className="mb-4">
          Could not retrieve the verification phone number. Please contact support with your Order ID: {orderId}.
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header as="h5">Order Summary</Card.Header>
        <Card.Body>
          <div className="mb-3">
            <strong>Order ID:</strong> {order.id}
          </div>
          <div className="mb-3">
            <strong>Date:</strong> {formattedDate}
          </div>
          <div className="mb-3">
            <strong>Status:</strong> <span className="badge bg-success">{order.status}</span>
          </div>
          <div className="mb-3">
            <strong>Total Amount:</strong> €{order.totalAmount.toFixed(2)}
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Items Ordered</Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>€{item.price.toFixed(2)}</td>
                    <td>€{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Shipping Details</Card.Header>
        <Card.Body>
          <div className="mb-2"><strong>Name:</strong> {order.shippingDetails.fullName}</div>
          <div className="mb-2"><strong>Address:</strong> {order.shippingDetails.address}</div>
          <div className="mb-2"><strong>City:</strong> {order.shippingDetails.city}</div>
          <div className="mb-2"><strong>Zip Code:</strong> {order.shippingDetails.zipCode}</div>
          <div className="mb-2"><strong>Country:</strong> {order.shippingDetails.country}</div>
          <div className="mb-2"><strong>Phone:</strong> {order.shippingDetails.phone}</div>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>
        <Link to="/account/orders" className="btn btn-outline-secondary">
          View All Orders
        </Link>
      </div>
    </Container>
  );
};

export default OrderSuccessPage; 