import { useEffect, useState, useRef } from 'react';
import { Container, Card, Alert, Spinner, Accordion, Badge } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  imageUrl?: string;
}

interface DeliveryLocation {
  id: number;
  name: string;
  phone: string;
  district: string;
  isDefault: boolean;
  userId: number;
}

interface AssignedPhoneNumber {
  numberString: string;
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
  verificationPhoneNumber?: string;
  assignedPhoneNumber?: AssignedPhoneNumber | null;
}

const OrderSuccessPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numberError, setNumberError] = useState<string | null>(null);

  const verificationNumber = order?.assignedPhoneNumber?.numberString || order?.verificationPhoneNumber || '';

  const fetchOrderDetails = async () => {
    if (!orderId || !token) {
      setError("Missing order ID or authentication token");
      setLoading(false);
      return;
    }

    try {
      console.log(`Fetching order details for order ${orderId}...`);
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        // Deep debug logging
        console.log("============ ORDER DETAILS FROM API ============");
        console.log(JSON.stringify(response.data, null, 2));
        console.log("==============================================");

        setOrder(response.data);
        
        // Verification phone number debugging - check both possible sources
        const phoneNumber = response.data.assignedPhoneNumber?.numberString || response.data.verificationPhoneNumber;
        if (!phoneNumber) {
          console.warn("⚠️ NO VERIFICATION PHONE NUMBER FOUND");
          setNumberError("No verification phone number was assigned to this order. Please contact support.");
        } else {
          console.log(`✅ Verification phone number: ${phoneNumber}`);
        }

        // Delivery location debugging
        if (response.data.deliveryLocation) {
          console.log(`✅ Delivery location found: ${JSON.stringify(response.data.deliveryLocation)}`);
        } else {
          console.warn("⚠️ NO DELIVERY LOCATION FOUND");
        }

        // Order items debugging
        if (response.data.items && response.data.items.length > 0) {
          console.log(`✅ Order items found: ${response.data.items.length} items`);
          response.data.items.forEach((item: any, index: number) => {
            console.log(`Item ${index + 1}: ${JSON.stringify(item)}`);
          });
        } else {
          console.warn("⚠️ NO ORDER ITEMS FOUND");
        }
      } else {
        console.error("❌ Invalid or empty response data");
        setError("Invalid order data received");
      }
    } catch (err) {
      console.error("❌ Error fetching order:", err);
      if (axios.isAxiosError(err) && err.response) {
        console.error("Response error data:", err.response.data);
        console.error("Response status:", err.response.status);
        
        if (err.response.status === 401) {
          setError("You must be logged in to view this order");
        } else if (err.response.status === 404) {
          setError("Order not found");
        } else {
          setError(err.response.data?.message || "Failed to fetch order details");
        }
      } else {
        setError("Network error while fetching order details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
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
        <Badge bg={order.status === 'Pending Call' ? 'warning' : 'success'} className="px-3 py-2 fs-6 mb-3">
          {order.status}
        </Badge>
      </div>

      {verificationNumber ? (
        <Card className="mb-4 shadow border-danger">
          <Card.Header as="h5" className="bg-danger text-white">Important: Phone Verification Required</Card.Header>
          <Card.Body className="p-4 text-center">
            <div className="py-2">
              <Card.Title className="mb-3 fs-5">
                To complete your order, please call this verification number:
              </Card.Title>
              <div className="bg-light py-3 px-2 rounded mb-3 border">
                <h2 className="fw-bold mb-0">
                  <a href={`tel:${verificationNumber}`} className="text-primary text-decoration-none">
                    {verificationNumber}
                  </a>
                </h2>
              </div>
              <Card.Text>
                <span className="text-danger fw-bold">
                  Failure to call may result in order cancellation
                </span>
                <p className="mt-2 small text-muted">
                  Call this number to confirm your order. Tap the number above to dial automatically.
                </p>
              </Card.Text>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Verification Phone Number Missing</Alert.Heading>
          <p>
            No verification phone number was assigned to this order. Please contact customer
            support with your Order ID: <strong>{orderId}</strong>.
          </p>
        </Alert>
      )}

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
              <p className="mb-2"><strong>Total Amount:</strong> €{(order.totalAmount || 0).toFixed(2)}</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-3 shadow-sm">
        <Card.Header as="h5" className="bg-light">Delivery Information</Card.Header>
        <Card.Body className="p-3">
          {order.deliveryLocation ? (
            <>
              <p className="mb-2">
                <strong>Name:</strong> {order.deliveryLocation.name}
                {order.deliveryLocation.isDefault && (
                  <span className="badge bg-info ms-2 px-2">Default</span>
                )}
              </p>
              <p className="mb-2"><strong>District:</strong> {order.deliveryLocation.district}</p>
              <p className="mb-2"><strong>Contact Phone:</strong> {order.deliveryLocation.phone}</p>
            </>
          ) : (
            <Alert variant="warning">
              No delivery location information is available for this order.
              Please contact customer support if this is unexpected.
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-3 shadow-sm">
        <Card.Header as="h5" className="bg-light">Items Ordered</Card.Header>
        <Card.Body className="p-3">
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
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.productName || `Product #${item.productId}`}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">€{(item.price || 0).toFixed(2)}</td>
                      <td className="text-end">€{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">No items found in this order</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan={3} className="text-end">Total:</td>
                  <td className="text-end">€{(order.totalAmount || 0).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-center gap-3 mt-4 mb-4">
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