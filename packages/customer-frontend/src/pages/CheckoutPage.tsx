import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Button, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Make sure the API URL is defined
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface Address {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  userId: number;
}

const CheckoutPage: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ShippingInfo>({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  // Address selection state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedAddressOption, setSelectedAddressOption] = useState('new');

  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cartItems.length === 0) {
      navigate('/cart');
    }

    // Get user location if supported
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set a user-friendly error message based on the error code
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Location access denied. Delivery location will not be used.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Location information unavailable. Delivery location will not be used.");
              break;
            case error.TIMEOUT:
              setLocationError("Location request timed out. Delivery location will not be used.");
              break;
            default:
              setLocationError("An unknown error occurred. Delivery location will not be used.");
          }
        },
        // Options for geolocation request
        {
          enableHighAccuracy: false, // Don't need high accuracy for delivery
          timeout: 5000, // 5 seconds timeout
          maximumAge: 0 // Don't use cached position
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser. Delivery location will not be used.");
    }
  }, [cartItems, navigate]);

  // Fetch saved addresses
  useEffect(() => {
    if (!token) return;

    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);
      setAddressError(null);

      try {
        const response = await axios.get(`${API_URL}/api/addresses`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const addresses = response.data;
        setSavedAddresses(addresses);
        
        // If there's a default address, select it automatically
        const defaultAddress = addresses.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressOption(defaultAddress.id.toString());
        } else if (addresses.length > 0) {
          // If no default but addresses exist, select the first one
          setSelectedAddressOption(addresses[0].id.toString());
        } else {
          // If no addresses, select 'new'
          setSelectedAddressOption('new');
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setAddressError('Failed to load your saved addresses.');
        // Fall back to manual entry
        setSelectedAddressOption('new');
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddressOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAddressOption(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('You must be logged in to place an order');
      navigate('/login');
      return;
    }

    // Validate based on selected option
    setValidationError(null); // Clear previous validation errors
    setError(null); // Clear previous errors
    
    // Get shipping details based on the selected option
    let shippingDetails: ShippingInfo;
    
    if (selectedAddressOption === 'new') {
      // Using manually entered address
      if (!formData.fullName.trim() || !formData.phone.trim()) {
        setValidationError('Please fill in all required fields: Name and Phone.');
        return; // Stop submission
      }
      shippingDetails = { ...formData };
    } else {
      // Using a saved address
      const selectedAddress = savedAddresses.find(
        addr => addr.id.toString() === selectedAddressOption
      );
      
      if (!selectedAddress) {
        setValidationError('Selected address not found. Please choose another address or enter manually.');
        return; // Stop submission
      }
      
      shippingDetails = {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        zipCode: selectedAddress.zipCode,
        country: selectedAddress.country
      };
    }

    try {
      setLoading(true);

      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingDetails,
        location: location || undefined,
        totalAmount: totalPrice
      };

      // Use the API_URL constant defined at the top of the file
      const response = await axios.post(
        `${API_URL}/api/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // --- BEGIN DEBUG LOGGING ---
      console.log("Checkout API Response Status:", response.status);
      console.log("Checkout API Response Headers:", response.headers);
      console.log("Checkout API Response Data:", response.data);
      console.log("Checking specifically for response.data.orderId:", response.data?.orderId);
      // --- END DEBUG LOGGING ---

      // Check if orderId exists in the response data
      if (response.data?.orderId) {
        console.log("SUCCESS PATH: Order ID found in response. Navigating...");
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/order/success/${response.data.orderId}`);
      } else {
        console.error("ERROR PATH: Order ID *missing* in successful response!", response.data);
        toast.error('Failed to create order (Invalid confirmation from server)');
        setError("Order placed, but couldn't get confirmation ID.");
      }
    } catch (error) {
      console.error("ERROR PATH: API call caught an error object:", error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.message || 'Unknown error';
        console.error("ERROR DETAILS:", {
          status: error.response.status,
          data: error.response.data
        });
        toast.error(`Order failed: ${errorMessage}`);
        setError(errorMessage);
      } else {
        toast.error('Failed to place order. Please check your connection and try again.');
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container className="py-3">
        <Alert variant="warning">
          Your cart is empty. Add some products before checkout.
        </Alert>
        <Button variant="primary" onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <h2 className="mb-4">Checkout</h2>
      
      <Row>
        <Col lg={7} className="mb-4">
          <Card className="mb-4 h-100">
            <Card.Header>
              <h5 className="mb-0">Shipping Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {validationError && (
                  <Alert variant="danger" className="mb-3">
                    {validationError}
                  </Alert>
                )}
                
                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}
                
                {addressError && (
                  <Alert variant="warning" className="mb-3">
                    {addressError}
                  </Alert>
                )}
                
                {/* Saved Addresses Selection */}
                {isLoadingAddresses ? (
                  <div className="text-center mb-3">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Loading saved addresses...</span>
                  </div>
                ) : savedAddresses.length > 0 && (
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Choose a Delivery Address</Form.Label>
                    
                    {savedAddresses.map(address => (
                      <Form.Check 
                        key={address.id}
                        type="radio"
                        id={`address-${address.id}`}
                        name="addressOption"
                        className="mb-2 border-bottom pb-2"
                        value={address.id.toString()}
                        checked={selectedAddressOption === address.id.toString()}
                        onChange={handleAddressOptionChange}
                        label={
                          <div>
                            <div className="fw-bold">{address.fullName}</div>
                            <div>{address.phone}</div>
                            <div className="text-muted small">
                              {address.address}, {address.city}, {address.zipCode}, {address.country}
                              {address.isDefault && <span className="ms-2 text-success">(Default)</span>}
                            </div>
                          </div>
                        }
                      />
                    ))}
                    
                    <Form.Check 
                      type="radio"
                      id="address-new"
                      name="addressOption"
                      className="mt-3"
                      value="new"
                      checked={selectedAddressOption === 'new'}
                      onChange={handleAddressOptionChange}
                      label={<span className="fw-bold">Enter a new address</span>}
                    />
                  </Form.Group>
                )}
                
                {/* Manual address form - conditionally disabled */}
                <Form.Group className="mb-3">
                  {(savedAddresses.length > 0) && selectedAddressOption !== 'new' && (
                    <div className="mb-3 pb-3 border-bottom">
                      <Alert variant="info" className="py-2">
                        Using selected address for delivery.
                      </Alert>
                    </div>
                  )}
                  
                  <Row>
                    <Col xs={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          disabled={selectedAddressOption !== 'new'}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          disabled={selectedAddressOption !== 'new'}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          disabled={selectedAddressOption !== 'new'}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>ZIP Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          disabled={selectedAddressOption !== 'new'}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          disabled={selectedAddressOption !== 'new'}
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12} sm={6} className="mb-3">
                      <Form.Group>
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          disabled={selectedAddressOption !== 'new'}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form.Group>

                {locationError && (
                  <Alert variant="warning" className="mb-3">
                    {locationError}
                  </Alert>
                )}

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table responsive className="table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td className="text-truncate" style={{ maxWidth: '140px' }}>{item.name}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">€{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={2}>Total:</th>
                      <th className="text-end">€{totalPrice.toFixed(2)}</th>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              {location && (
                <Alert variant="success" className="mb-0 mt-3">
                  <small>
                    <strong>Delivery Location Detected</strong><br />
                    Your order will be delivered based on your current location.
                  </small>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
