import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Button, Card, Table, Alert, Spinner, Modal, Badge, Dropdown } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';
import LocationMap from '../components/LocationMap';

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
  const { t } = useTranslation();

  // Delivery location selection state
  const [savedLocations, setSavedLocations] = useState<DeliveryLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationErrorState, setLocationErrorState] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  // Derived label for delivery location dropdown
  const selectedLocation = savedLocations.find(loc => loc.id.toString() === selectedLocationId);
  const currentLocationLabel = selectedLocation
    ? `${selectedLocation.name} (${selectedLocation.district}) - ${selectedLocation.phone}${selectedLocation.isDefault ? ' (Default)' : ''}`
    : '-- Select Delivery Location --';

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
  const [isLoadingIPLocation, setIsLoadingIPLocation] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  
  // Label for district dropdown in the modal
  const currentDistrictLabel = newLocationData.district || '-- Select District --';

  // Add any location checking error state
  const [locationError, setLocationError] = useState<string | null>(null);

  // New location within service zone state
  const [isLocationWithinServiceZone, setIsLocationWithinServiceZone] = useState(false);

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cartItems.length === 0) {
      navigate('/cart');
    }

    // Get precise location using HTML5 Geolocation API
    getUserPreciseLocation();
  }, [cartItems, navigate]);

  // Function to get precise location using HTML5 Geolocation API
  const getUserPreciseLocation = () => {
    setIsLoadingIPLocation(true);
    setLocationError(null); // Clear any previous location errors
    setIsLocationWithinServiceZone(false); // Reset service zone state
    
    // Check if geolocation is available in the browser
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsLoadingIPLocation(false);
      return;
    }

    // Using the Geolocation API to get the precise location
      navigator.geolocation.getCurrentPosition(
          // Success handler
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          lat: latitude,
          lng: longitude
        });
        
        // Check if the new location is in service zone
        try {
          const response = await api.post('/location/check-zone', {
            lat: latitude,
            lng: longitude
          });
          
          if (!response.data.isInServiceZone) {
            setLocationError("Your location is outside our service areas. We currently cannot deliver to your location.");
            setIsLocationWithinServiceZone(false); // Ensure this is false when error is present
            // Make sure we're consistent between error states
            toast.error('Your location is outside our service areas.');
          } else {
            // Clear any previous location errors if location is valid
            setLocationError(null);
            setIsLocationWithinServiceZone(true); // Explicitly set to true when valid
            toast.success('Your location has been updated successfully!');
          }
        } catch (err) {
          console.error("Error checking service zone:", err);
          setLocationError("Failed to verify if your location is in our service area. Please try again.");
          setIsLocationWithinServiceZone(false); // Ensure this is false when error occurs
          toast.error('Failed to verify if your location is in our service area');
        }
        
          setIsLoadingIPLocation(false);
        },
      // Error handler
        (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Failed to get your location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try again later.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting your location.';
        }
        
        setLocationError(errorMessage);
        toast.error(errorMessage);
        setIsLoadingIPLocation(false);
        
        // Fall back to IP-based location
          fetchIPBasedLocation();
        },
      // Options
        {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
        }
      );
  };

  // Function to fetch IP-based location using free service
  const fetchIPBasedLocation = async () => {
    setIsLoadingIPLocation(true);
    
    try {
      // Use a free IP geolocation API
      const response = await axios.get('https://ipapi.co/json/');
      
      if (response.data && response.data.latitude && response.data.longitude) {
        const locationData = {
          lat: response.data.latitude,
          lng: response.data.longitude
        };
        
        console.log("IP-based location detected:", locationData);
        setLocation(locationData);
      } else {
        // Fallback to a secondary API if the first one fails
        try {
          const fallbackResponse = await axios.get('https://geolocation-db.com/json/');
          
          if (fallbackResponse.data && fallbackResponse.data.latitude && fallbackResponse.data.longitude) {
            const locationData = {
              lat: fallbackResponse.data.latitude,
              lng: fallbackResponse.data.longitude
            };
            
            console.log("IP-based location detected (fallback):", locationData);
            setLocation(locationData);
          } else {
            console.error("Could not determine location from IP address");
          }
        } catch (fallbackError) {
          console.error("Error with fallback geolocation service:", fallbackError);
        }
      }
    } catch (error) {
      console.error("Error fetching IP-based location:", error);
    } finally {
      setIsLoadingIPLocation(false);
    }
  };

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
      const response = await api.get('/districts');
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
      // Add detailed request data logging
      console.log("ORDER DATA (DETAILED):", JSON.stringify(orderData, null, 2));
      console.log("Order items count:", orderData.items.length);
      console.log("Delivery location ID:", orderData.deliveryLocationId, "Type:", typeof orderData.deliveryLocationId);
      console.log("Total amount:", orderData.totalAmount, "Type:", typeof orderData.totalAmount);
      
      // Validate item data client-side
      orderData.items.forEach((item: any, index: number) => {
        console.log(`Item ${index} validation:`, {
          productId: item.productId, 
          productIdType: typeof item.productId, 
          quantity: item.quantity, 
          quantityType: typeof item.quantity,
          price: item.price,
          priceType: typeof item.price
        });
      });

      console.log("Sending order data with location:", orderData);

      // Use the configured api instance instead of direct axios calls
      const response = await api.post('/orders', orderData);

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
        
        // Log detailed validation errors if present
        if (error.response.data.errors) {
          console.error("VALIDATION ERRORS (DETAILED):", JSON.stringify(error.response.data.errors, null, 2));
          
          // Check for specific field errors
          const fieldErrors = error.response.data.errors.fieldErrors;
          if (fieldErrors) {
            Object.entries(fieldErrors).forEach(([field, messages]) => {
              console.error(`Field '${field}' errors:`, messages);
            });
          }
        }
        
        // Check for zone availability error
        const isZoneAvailabilityError = 
          (errorMessage.toLowerCase().includes('service not available') || 
           errorMessage.toLowerCase().includes('outside service area') || 
           errorMessage.toLowerCase().includes('zone'));
          
        if (isZoneAvailabilityError) {
          toast.error(errorMessage || 'Service is not available in your area.');
          setError(errorMessage || 'Service is not available in your area.');
          setLoading(false);
          return;
        }
        
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

  // Check if the location is within the service zone
  const checkLocationServiceZone = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      if (!location?.lat || !location?.lng) {
        setLocationError("Location coordinates are missing. Please allow location access.");
        setIsLocationWithinServiceZone(false);
        setIsLoadingLocation(false);
        return false;
      }

      const response = await api.post('/location/check-service-zone', {
        latitude: location.lat,
        longitude: location.lng
      });

      setIsLoadingLocation(false);
      
      // If not in service zone, set an appropriate error message
      if (!response.data.isWithinServiceZone) {
        setLocationError("Your location is outside our service areas. We cannot deliver to this address.");
        setIsLocationWithinServiceZone(false);
        return false;
      }
      
      // Only set this to true if we've confirmed it's in the service zone
      setIsLocationWithinServiceZone(true);
      setLocationError(null);
      return true;
    } catch (error) {
      console.error('Error checking service zone:', error);
      setLocationError("Failed to check if your location is within our service zone. Please try again.");
      setIsLocationWithinServiceZone(false);
      setIsLoadingLocation(false);
      return false;
    }
  };

  // Update the handleSubmit function to check location first
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
    setLocationError(null); // Clear location errors
    
    // Check if a delivery location is selected
    if (!selectedLocationId) {
      setValidationError('Please select a delivery location.');
      return;
    }

    setLoading(true);

    // Check location against service zones first
    const locationValid = await checkLocationServiceZone();
    if (!locationValid) {
      setLoading(false);
      return;
    }

    try {
      // Convert deliveryLocationId to integer
      const locationId = parseInt(selectedLocationId, 10);
      if (isNaN(locationId) || locationId <= 0) {
        throw new Error(`Invalid delivery location ID: ${selectedLocationId}`);
      }

    const orderData = {
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
        deliveryLocationId: locationId,
        location: location, // IP-based location is silently attached here
      totalAmount: totalPrice
    };

      console.log("Order data prepared:", orderData);

    // Attempt order placement with the prepared data
    await attemptOrderPlacement(orderData);
    } catch (err) {
      console.error("Error preparing order data:", err);
      setValidationError('Failed to prepare order data. Please try again.');
      setLoading(false);
    }
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
                
                {/* Display location error alert - only show this when there's an actual error */}
                {locationError && (
                  <Alert variant="danger" className="mb-3">
                    <Alert.Heading>Location Error</Alert.Heading>
                    <p>{locationError}</p>
                    <div className="d-flex justify-content-end">
                      <Button onClick={getUserPreciseLocation} variant="outline-danger">
                        Retry Location Check
                      </Button>
                    </div>
                  </Alert>
                )}
                
                {/* Location status indicator - only shown when no error is present */}
                {!locationError && (
                  <>
                    {isLoadingLocation ? (
                      <Alert variant="info" className="mb-3">
                      <Spinner animation="border" size="sm" className="me-2" />
                        Checking if your location is within our service zone...
                    </Alert>
                    ) : isLocationWithinServiceZone ? (
                      <Alert variant="success" className="mb-3">
                        <FaCheckCircle className="me-2" />
                        Your location is available for accurate delivery
                    </Alert>
                  ) : (
                      <Alert variant="warning" className="mb-3">
                        <FaExclamationTriangle className="me-2" />
                        We couldn't determine if your location is within our service area
                        <div className="d-flex justify-content-end mt-2">
                          <Button onClick={getUserPreciseLocation} variant="outline-warning" size="sm">
                            Retry Location Check
                          </Button>
                        </div>
                    </Alert>
                  )}
                  </>
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
                  ) : (
                    <div className="mb-3">
                      <label htmlFor="location" className="form-label">
                        {t('checkout.location')}
                      </label>
                      <div className="dropdown w-100">
                        <button
                          className="btn btn-outline-secondary dropdown-toggle w-100 d-flex justify-content-between align-items-center"
                          type="button"
                          id="locationDropdown"
                          onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                          aria-expanded={locationDropdownOpen}
                          data-testid="location-dropdown"
                        >
                          {currentLocationLabel || t('checkout.selectLocation')}
                          <i className="bi bi-caret-down-fill"></i>
                        </button>
                        <div
                          className={`dropdown-menu w-100 ${locationDropdownOpen ? 'show animate-dropdown' : ''}`}
                          aria-labelledby="locationDropdown"
                          onClick={(e) => {
                            // Don't close dropdown when clicking on the menu itself (for scrolling)
                            if (e.target === e.currentTarget) {
                              e.stopPropagation();
                            }
                          }}
                        >
                          {savedLocations.map((location) => (
                            <div
                              key={location.id}
                              className={`dropdown-item ${selectedLocationId === location.id.toString() ? 'active' : ''}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedLocationId(location.id.toString());
                                // Close dropdown after selection
                                setTimeout(() => {
                                  setLocationDropdownOpen(false);
                                }, 150);
                              }}
                              data-testid={`location-option-${location.id}`}
                            >
                              {location.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Form.Group>

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
                  <Dropdown className="district-dropdown" onSelect={(eventKey, event) => {
                    if (event) {
                      event.preventDefault();
                      event.stopPropagation();
                    }
                    setNewLocationData(prev => ({ ...prev, district: eventKey || '' }));
                  }}>
                    <Dropdown.Toggle variant={formErrors.district ? 'outline-danger' : 'outline-secondary'} id="newLocationDistrictDropdown" className="w-100 d-flex justify-content-between align-items-center district-dropdown-toggle" disabled={isLoadingDistricts}>
                      {currentDistrictLabel}
                    </Dropdown.Toggle>
                    <Dropdown.Menu 
                      style={{ width: '100%' }} 
                      className="district-dropdown-menu animate-dropdown w-100"
                      onClick={(e) => {
                        // Prevent the dropdown from closing when clicking inside it for scrolling
                        if (e.target === e.currentTarget) {
                          e.stopPropagation();
                        }
                      }}
                    >
                      <Dropdown.Header>Select District</Dropdown.Header>
                      {isLoadingDistricts ? (
                        <Dropdown.Item disabled>Loading...</Dropdown.Item>
                      ) : districtError ? (
                        <Dropdown.Item disabled className="text-danger">Error loading districts</Dropdown.Item>
                      ) : districts.length > 0 ? (
                        districts.map(d => (
                          <Dropdown.Item 
                            key={d} 
                            eventKey={d} 
                            active={newLocationData.district === d} 
                            className="district-dropdown-item"
                            onClick={(e) => {
                              // Prevent event bubbling to parent elements
                              e.preventDefault();
                              e.stopPropagation();
                              
                              // Set the form state directly
                              setNewLocationData(prev => ({ ...prev, district: d }));
                              
                              // Close dropdown manually after a short delay
                              const dropdown = document.getElementById('newLocationDistrictDropdown');
                              if (dropdown) {
                                setTimeout(() => {
                                  dropdown.click();
                                }, 150);
                              }
                            }}
                          >
                            {d}
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item disabled>No districts available</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
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
