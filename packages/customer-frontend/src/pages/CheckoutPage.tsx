import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Button, Card, Table, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../utils/api';

// Make sure the API URL is defined
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface DeliveryLocation {
  id: number;
  name: string;
  phone: string;
  district: string;
  isDefault: boolean;
  userId: number;
}

const CheckoutPage: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  // Delivery location selection state
  const [savedLocations, setSavedLocations] = useState<DeliveryLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationErrorState, setLocationErrorState] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  // Add Location Modal state
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [addLocationError, setAddLocationError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [newLocationData, setNewLocationData] = useState({
    name: '',
    phone: '',
    district: ''
  });

  // Districts state
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [districtError, setDistrictError] = useState<string | null>(null);

  // New retry mechanism state variables
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxRetries = 3; // Maximum number of retry attempts
  const retryDelay = 5000; // 5 seconds delay between retries

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
          const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("Successfully captured geolocation:", locationData);
          setLocation(locationData);
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

  // Fetch saved delivery locations
  useEffect(() => {
    if (!token) return;
    
    fetchLocations();
  }, [token]);

  // Fetch districts
  useEffect(() => {
    fetchDistricts();
  }, []);

  // Function to fetch saved delivery locations
  const fetchLocations = async () => {
    setIsLoadingLocations(true);
    setLocationErrorState(null);

    try {
      const response = await api.get('/addresses');
      
      const locations = response.data;
      setSavedLocations(locations);
      
      // If there's a default location, select it automatically
      const defaultLocation = locations.find((loc: DeliveryLocation) => loc.isDefault);
      if (defaultLocation) {
        setSelectedLocationId(defaultLocation.id.toString());
      } else if (locations.length > 0) {
        // If no default but locations exist, select the first one
        setSelectedLocationId(locations[0].id.toString());
      } else {
        // If no locations, leave as empty string
        setSelectedLocationId('');
      }
    } catch (err) {
      console.error('Error fetching delivery locations:', err);
      setLocationErrorState('Failed to load your saved delivery locations.');
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Function to fetch districts
  const fetchDistricts = async () => {
    setIsLoadingDistricts(true);
    setDistrictError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/districts`);
      setDistricts(response.data);
      
      // Initialize the new location form with the first district
      if (response.data.length > 0) {
        setNewLocationData(prev => ({
          ...prev,
          district: response.data[0]
        }));
      }
    } catch (err) {
      console.error('Error fetching districts:', err);
      setDistrictError('Failed to load districts.');
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  // New Location Modal handlers
  const handleShowAddModal = () => {
    setShowAddLocationModal(true);
    setAddLocationError(null);
    setFormErrors({});
  };

  const handleCloseAddModal = () => {
    setShowAddLocationModal(false);
    setAddLocationError(null);
    setFormErrors({});
  };

  const handleNewLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLocationData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveNewLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const errors: {[key: string]: string} = {};
    if (!newLocationData.name.trim()) errors.name = "Location name is required";
    if (!newLocationData.phone.trim()) errors.phone = "Phone number is required";
    if (!newLocationData.district.trim()) errors.district = "District is required";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsAddingLocation(true);
    setAddLocationError(null);
    
    try {
      // Create new location
      const response = await api.post('/addresses', newLocationData);
      
      toast.success("New delivery location added!");
      
      // Refresh locations and select the newly added one
      const locationsResponse = await api.get('/addresses');
      setSavedLocations(locationsResponse.data);
      
      // Select the newly added location
      if (response.data && response.data.id) {
        setSelectedLocationId(response.data.id.toString());
      }
      
      // Close the modal
      setShowAddLocationModal(false);
    } catch (err) {
      console.error('Error adding new location:', err);
      if (axios.isAxiosError(err) && err.response) {
        // Check if the error response contains field-specific validation errors
        if (err.response.data.errors && typeof err.response.data.errors === 'object') {
          setFormErrors(err.response.data.errors);
        } else {
          setAddLocationError(err.response.data.message || 'Failed to add delivery location.');
        }
      } else {
        setAddLocationError('Network error. Please check your connection.');
      }
    } finally {
      setIsAddingLocation(false);
    }
  };

  // New function to attempt order placement that can be reused for retries
  const attemptOrderPlacement = async (orderData: any) => {
    try {
      console.log("Sending order data with location:", orderData);

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
        setLoading(false);
      }
    } catch (error) {
      console.error("ERROR PATH: API call caught an error object:", error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.message || 'Unknown error';
        console.error("ERROR DETAILS:", {
          status: error.response.status,
          data: error.response.data
        });
        
        // Modify the isPhoneUnavailableError condition to include the "internal server error" message
        const isPhoneUnavailableError = 
          (error.response.status === 503 || error.response.status === 500) || 
          (errorMessage.toLowerCase().includes('no available phone numbers') || 
           errorMessage.toLowerCase().includes('verification line') ||
           errorMessage.toLowerCase().includes('internal server error') ||
           errorMessage.toLowerCase().includes('server error'));
        
        if (isPhoneUnavailableError && retryCount < maxRetries) {
          // Increment retry count
          const newRetryCount = retryCount + 1;
          setRetryCount(newRetryCount);
          setIsRetrying(true);
          
          // Show retry message to user with more visible toast
          const retryMessage = `No verification line available currently. Retrying... (Attempt ${newRetryCount}/${maxRetries + 1})`;
          // Dismiss any existing error toasts first
          toast.dismiss();
          // Use a persistent toast that doesn't auto-dismiss
          toast.loading(retryMessage, { 
            id: 'retry-toast',
            duration: Infinity // Make the toast stay until explicitly dismissed
          });
          setError(retryMessage);
          
          // Retry after delay
          setTimeout(() => {
            // Dismiss the loading toast before retrying
            toast.dismiss('retry-toast');
            attemptOrderPlacement(orderData);
          }, retryDelay);
        } else if (isPhoneUnavailableError && retryCount >= maxRetries) {
          // Max retries reached
          setIsRetrying(false);
          const maxRetriesMessage = "We couldn't find an available verification line after several attempts. Please try placing your order again later or contact support.";
          toast.error(maxRetriesMessage);
          setError(maxRetriesMessage);
          setLoading(false);
        } else {
          // Other error, not related to phone verification
          toast.error(`Order failed: ${errorMessage}`);
          setError(errorMessage);
          setIsRetrying(false);
          setLoading(false);
        }
      } else {
        // Network or other non-axios error
        toast.error('Failed to place order. Please check your connection and try again.');
        setError('Network error. Please check your connection and try again.');
        setIsRetrying(false);
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('You must be logged in to place an order');
      navigate('/login');
      return;
    }

    // Reset retry state at the beginning of a new checkout attempt
    setRetryCount(0);
    setIsRetrying(false);

    // Validate based on selected option
    setValidationError(null); // Clear previous validation errors
    setError(null); // Clear previous errors
    
    // Check if a delivery location is selected
    if (!selectedLocationId) {
      setValidationError('Please select a delivery location.');
      return;
    }

    setLoading(true);

    const orderData = {
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      deliveryLocationId: parseInt(selectedLocationId, 10),
      location: location, // Ensure location is included (will be undefined if not available)
      totalAmount: totalPrice
    };

    // Attempt order placement with the prepared data
    await attemptOrderPlacement(orderData);
  };

  if (cartItems.length === 0) {
    return (
      <Container className="py-3">
        <Alert variant="warning">
          Your cart is empty. Add some products before checkout.
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/')} className="rounded-pill px-4 py-2">
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
              <h5 className="mb-0">Delivery Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {validationError && (
                  <Alert variant="danger" className="mb-3">
                    {validationError}
                  </Alert>
                )}
                
                {error && (
                  <Alert variant={isRetrying ? "warning" : "danger"} className="mb-3">
                    {isRetrying && (
                      <div className="d-flex align-items-center mb-2">
                        <Spinner animation="border" size="sm" className="me-2" />
                        <strong>Retry in progress</strong>
                      </div>
                    )}
                    {error}
                  </Alert>
                )}
                
                {locationErrorState && (
                  <Alert variant="warning" className="mb-3">
                    {locationErrorState}
                  </Alert>
                )}
                
                {/* Delivery Location Selection */}
                <Form.Group className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="fw-bold mb-0">Select Delivery Location</Form.Label>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={handleShowAddModal}
                      className="d-flex align-items-center rounded-pill px-3 py-2"
                      disabled={isLoadingLocations || isLoadingDistricts}
                    >
                      <FaPlus className="me-2" /> Add New Location
                    </Button>
                  </div>
                  
                  {isLoadingLocations ? (
                    <div className="text-center my-4 py-3">
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Loading delivery locations...</span>
                    </div>
                  ) : savedLocations.length > 0 ? (
                    <Form.Select 
                      value={selectedLocationId}
                      onChange={(e) => setSelectedLocationId(e.target.value)}
                      required
                      className="mb-3"
                    >
                      <option value="" disabled>-- Select Delivery Location --</option>
                      {savedLocations.map(location => (
                        <option key={location.id} value={location.id.toString()}>
                          {`${location.name} (${location.district}) - ${location.phone}`}
                          {location.isDefault ? ' (Default)' : ''}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Alert variant="info" className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FaMapMarkerAlt className="me-2 text-primary" size={18} />
                        <span className="fw-medium">You don't have any saved delivery locations.</span>
                      </div>
                      <p className="mb-0">Please add a delivery location to continue with checkout.</p>
                    </Alert>
                  )}
                </Form.Group>
                
                {locationError && (
                  <Alert variant="warning" className="mb-3">
                    {locationError}
                  </Alert>
                )}

                <Button 
                  type="submit"
                  variant={isRetrying ? "warning" : "primary"}
                  className="w-100 mt-3 rounded-pill py-2"
                  disabled={loading || isRetrying || !selectedLocationId}
                >
                  {loading || isRetrying ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      {isRetrying ? `Automatic retry in progress (${retryCount}/${maxRetries + 1})` : 'Processing...'}
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
              <Table responsive className="mb-3">
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
                      <td>{item.name}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={2}>Total</th>
                    <th className="text-end">${totalPrice.toFixed(2)}</th>
                  </tr>
                </tfoot>
              </Table>
              <div className="d-grid gap-2">
                <Link to="/cart" className="btn btn-outline-secondary">
                  Edit Cart
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Add New Location Modal */}
      <Modal show={showAddLocationModal} onHide={handleCloseAddModal} centered>
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-semibold">Add New Delivery Location</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {addLocationError && (
            <Alert variant="danger" className="mb-3">
              {addLocationError}
            </Alert>
          )}
          
          {districtError && (
            <Alert variant="warning" className="mb-3">
              {districtError}
            </Alert>
          )}
          
          <Form onSubmit={handleSaveNewLocation} noValidate>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-medium">Location Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Home, Work, etc."
                    name="name"
                    value={newLocationData.name}
                    onChange={handleNewLocationChange}
                    required
                    isInvalid={!!formErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-medium">Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Phone number"
                    name="phone"
                    value={newLocationData.phone}
                    onChange={handleNewLocationChange}
                    required
                    isInvalid={!!formErrors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col>
                <Form.Group>
                  <Form.Label className="fw-medium">District</Form.Label>
                  <Form.Select
                    name="district"
                    value={newLocationData.district}
                    onChange={handleNewLocationChange}
                    required
                    isInvalid={!!formErrors.district}
                    disabled={isLoadingDistricts}
                  >
                    {isLoadingDistricts ? (
                      <option value="">Loading districts...</option>
                    ) : (
                      <>
                        <option value="" disabled>-- Select District --</option>
                        {districts.map((district) => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </>
                    )}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.district}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isAddingLocation || isLoadingDistricts}
                className="rounded-pill py-2 fw-medium"
              >
                {isAddingLocation ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Saving...
                  </>
                ) : 'Add Location'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CheckoutPage;
