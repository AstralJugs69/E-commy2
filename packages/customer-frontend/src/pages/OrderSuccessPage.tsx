import { useEffect, useState, useRef } from 'react';
import { Container, Card, Alert, Spinner, Accordion } from 'react-bootstrap';
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

interface DeliveryLocation {
  id: number;
  name: string;
  phone: string;
  district: string;
  isDefault: boolean;
  userId: number;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  deliveryLocation?: DeliveryLocation;
}

const MAX_RETRIES = 5; // Max number of retry attempts
const RETRY_DELAY_MS = 10000; // 10 seconds

const OrderSuccessPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationNumber, setVerificationNumber] = useState<string | null>(null);
  const [numberLoading, setNumberLoading] = useState(true);
  const [numberError, setNumberError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID
  
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

  const fetchVerificationNumber = async (currentRetry = 0) => { // Pass currentRetry
    if (!orderId || !token) {
      setNumberError('Order ID is missing');
      setNumberLoading(false);
      return;
    }
    
    // Clear previous specific number error *if* retrying
    if (currentRetry > 0) {
      setNumberError(null);
    } else {
      // Only set loading true on the first attempt
      setNumberLoading(true);
      setNumberError(null);
      setRetryCount(0); // Reset retry count on initial call
    }
    
    // Clear previous timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    console.log(`Attempt ${currentRetry + 1} to fetch verification number for order ${orderId}...`);
    
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
        setNumberError(null); // Clear any previous retry messages
        setNumberLoading(false); // Success, stop loading
        console.log("Verification number retrieved successfully.");
      } else {
        // Should not happen if backend sends correct data on 200
        setNumberError("Could not retrieve verification number (invalid response).");
        setNumberLoading(false);
      }
    } catch (err) {
      console.error(`Attempt ${currentRetry + 1} failed:`, err);
      let errorMsg = "Failed to get verification number.";
      let canRetry = false;
      
      if (axios.isAxiosError(err) && err.response) {
        // --- Check for specific "No lines available" error ---
        // Option A: Check status code (if backend returns 503 specifically for this)
        if (err.response.status === 503) {
          canRetry = true;
          errorMsg = `No verification lines currently available. Retrying in ${RETRY_DELAY_MS / 1000}s... (Attempt ${currentRetry + 2}/${MAX_RETRIES + 1})`;
        }
        // Option B: Check specific message (if backend returns consistent message)
        // else if (err.response.data?.message?.includes("No verification phone lines")) {
        //     canRetry = true;
        //     errorMsg = `No lines available, retrying... (Attempt ${currentRetry + 2}/${MAX_RETRIES + 1})`;
        // }
        else {
          // Handle other errors (401, 404, 500 etc.) - Do not retry these
          errorMsg = err.response.data?.message || `Error: ${err.response.status}`;
          if (err.response.status === 401) errorMsg = "Authentication error.";
          if (err.response.status === 404) errorMsg = "Order details not found for number assignment.";
        }
      } else {
        // Network error - Maybe allow retry? Or maybe not? Let's not retry network errors for now.
        errorMsg = "Network error while fetching number.";
      }
      
      // --- Handle Retry Logic ---
      if (canRetry && currentRetry < MAX_RETRIES) {
        setRetryCount(currentRetry + 1);
        setNumberError(errorMsg); // Show temporary retry message
        // Set timeout for next retry
        timeoutRef.current = setTimeout(() => {
          fetchVerificationNumber(currentRetry + 1);
        }, RETRY_DELAY_MS);
        // Keep numberLoading as true while retrying
        setNumberLoading(true);
      } else {
        // Max retries reached or non-retryable error
        if (canRetry) { // If it failed after max retries
          setNumberError(`Still no lines available after ${MAX_RETRIES + 1} attempts. Please contact support.`);
        } else { // Other error
          setNumberError(errorMsg);
        }
        setNumberLoading(false); // Stop loading on final failure
      }
    }
    // Removed finally block - loading state is handled within try/catch now
  };

  useEffect(() => {
    fetchOrderDetails();
    
    // Clear previous timeouts when component unmounts or dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [orderId, token, API_BASE_URL]);

  useEffect(() => {
    if (orderId && token) {
      fetchVerificationNumber(0); // Start initial fetch (attempt 0)
    } else if (!token) {
      setNumberError("Authentication error. Cannot fetch details.");
      setNumberLoading(false);
    }
    // Dependency array remains [orderId, token] - fetch runs when these change
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
    <Container className="py-3">
      <div className="text-center mb-3">
        <h2 className="text-success fw-bold">Order Placed Successfully!</h2>
        <p>Your Order ID: <strong className="text-primary fs-5">#{orderId}</strong></p>
      </div>

      {/* --- Verification Number Section --- MOVED TO TOP */}
      <Card className="mb-3 shadow-sm border-danger">
        <Card.Header as="h5" className="bg-light text-danger">Phone Verification Required</Card.Header>
        <Card.Body className="p-3 text-center">
          {numberLoading && (
            <div className="py-2">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Checking verification line availability...</span>
              {/* Display retry message if applicable */}
              {retryCount > 0 && <p className="text-muted small mt-2">{numberError}</p>}
            </div>
          )}

          {!numberLoading && numberError && (
            <Alert variant={retryCount >= MAX_RETRIES ? "danger" : "warning"}>
              {numberError}
            </Alert>
          )}

          {!numberLoading && !numberError && verificationNumber && (
            <div className="py-2">
              <Card.Text className="mb-2">
                To complete your order, please call this number immediately:
              </Card.Text>
              <div className="bg-light py-3 px-2 rounded mb-2">
                <h3 className="fw-bold mb-0">
                  <a href={`tel:${verificationNumber}`} className="text-primary text-decoration-none">
                    {verificationNumber}
                  </a>
                </h3>
              </div>
              <Card.Text>
                <small className="text-danger fw-bold">Failure to call may result in order cancellation.</small>
              </Card.Text>
            </div>
          )}
          
          {!numberLoading && !numberError && !verificationNumber && (
            <Alert variant="warning">
              Could not retrieve the verification phone number. Please contact support with your Order ID: {orderId}.
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-3 shadow-sm">
        <Card.Header as="h5" className="bg-light">Order Summary</Card.Header>
        <Card.Body className="p-3">
          <div className="row">
            <div className="col-6">
              <p className="mb-2"><strong>Order ID:</strong> {order.id}</p>
              <p className="mb-2"><strong>Date:</strong> {formattedDate}</p>
            </div>
            <div className="col-6">
              <p className="mb-2">
                <strong>Status:</strong> <span className="badge bg-success px-2 py-1 ms-1">{order.status}</span>
              </p>
              <p className="mb-2"><strong>Total Amount:</strong> €{order.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Items Ordered</Accordion.Header>
          <Accordion.Body className="p-3">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '40%' }}>Product</th>
                    <th style={{ width: '20%' }} className="text-center">Quantity</th>
                    <th style={{ width: '20%' }} className="text-end">Price</th>
                    <th style={{ width: '20%' }} className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.productName || `Product #${item.productId}`}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">€{item.price.toFixed(2)}</td>
                      <td className="text-end">€{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light fw-bold">
                  <tr>
                    <td colSpan={3} className="text-end">Total:</td>
                    <td className="text-end">€{order.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>Delivery Location</Accordion.Header>
          <Accordion.Body className="p-3">
            {order.deliveryLocation ? (
              <>
                <p className="mb-2">
                  <strong>Name:</strong> {order.deliveryLocation.name}
                  {order.deliveryLocation.isDefault && (
                    <span className="badge bg-info ms-2 px-2">Default Location</span>
                  )}
                </p>
                <p className="mb-2"><strong>District:</strong> {order.deliveryLocation.district}</p>
                <p className="mb-2"><strong>Phone:</strong> {order.deliveryLocation.phone}</p>
              </>
            ) : (
              <Alert variant="warning">No delivery location information available</Alert>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <div className="d-flex justify-content-center gap-3 mt-3 mb-4">
        <Link to="/" className="btn btn-secondary rounded px-2 py-1 fw-medium" style={{ width: '120px', fontSize: '0.9rem' }}>
          Continue Shopping
        </Link>
        <Link to="/orders" className="btn btn-primary rounded px-2 py-1 fw-medium" style={{ width: '120px', fontSize: '0.9rem' }}>
          View Order History
        </Link>
      </div>
    </Container>
  );
};

export default OrderSuccessPage; 