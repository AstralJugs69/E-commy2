import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { formatCurrency, formatDateTime } from '../utils/formatters';

// Define interfaces based on backend response structure
interface OrderProduct {
  name: string;
  price: number;
}

interface OrderItemDetail {
  id: number;
  quantity: number;
  price: number;
  productId: number;
  productName: string;
  product: OrderProduct;
}

interface OrderUser {
  email: string;
}

interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface OrderDetail {
  id: number;
  status: string;
  totalAmount: number;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  shippingDetails: ShippingDetails;
  user: OrderUser;
  items: OrderItemDetail[];
}

interface ServiceZone {
  id: number;
  name: string;
  geoJsonPolygon: string; // The raw GeoJSON string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for service zones
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  const [zoneError, setZoneError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      // Validate orderId
      if (!orderId) {
        setError("Order ID is missing");
        setIsLoading(false);
        return;
      }

      // Get token from localStorage
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_BASE_URL}/admin/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setOrder(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else if (err.response.status === 404) {
            setError(`Order with ID ${orderId} not found.`);
          } else {
            setError(err.response.data.message || 'Failed to fetch order details.');
          }
          console.error('Error fetching order details:', err.response.data);
        } else {
          setError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);
  
  // Fetch service zones
  useEffect(() => {
    const fetchServiceZones = async () => {
      setIsLoadingZones(true);
      setZoneError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        setZoneError('Authentication required. Please log in again.');
        setIsLoadingZones(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/admin/serviceareas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setZones(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setZoneError('Failed to load service zones');
          console.error('Error fetching zones:', err.response.data);
        } else {
          setZoneError('Network error loading zones');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoadingZones(false);
      }
    };

    // Only fetch zones if we have an order with location data
    if (!isLoading && order && order.latitude !== null && order.longitude !== null) {
      fetchServiceZones();
    }
  }, [isLoading, order]);

  return (
    <Container className="mt-3">
      <h2>Order Details</h2>
      
      {isLoading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading order details...</span>
          </Spinner>
        </div>
      )}
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {!isLoading && !error && order && (
        <Row>
          <Col md={6}>
            {/* Order Information */}
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Order #{order.id}</Card.Title>
                <div className="mb-3">
                  <Badge bg={
                    order.status === 'Shipped' ? 'success' :
                    order.status === 'Processing' ? 'info' :
                    order.status === 'Pending Call' ? 'warning' :
                    order.status === 'Verified' ? 'primary' :
                    order.status === 'Delivered' ? 'success' :
                    order.status === 'Cancelled' ? 'danger' :
                    'secondary'
                  }>
                    {order.status}
                  </Badge>
                </div>
                <p><strong>Date Placed:</strong> {formatDateTime(order.createdAt)}</p>
                <p><strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}</p>
                <p><strong>Location:</strong> {order.latitude && order.longitude ? 
                  `Lat: ${order.latitude}, Lon: ${order.longitude}` : 
                  'No location data available'}
                </p>
              </Card.Body>
            </Card>
            
            {/* Customer Information */}
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Customer</Card.Title>
                <p><strong>Name:</strong> {order.shippingDetails?.fullName || 'No name provided'}</p>
                <p><strong>Phone:</strong> {order.shippingDetails?.phone || 'No phone provided'}</p>
                <p><strong>Email:</strong> {order.user?.email || 'No email available'}</p>
                <p><strong>Address:</strong> {
                  order.shippingDetails?.address ? 
                  `${order.shippingDetails.address}, ${order.shippingDetails.city || ''}, ${order.shippingDetails.zipCode || ''}, ${order.shippingDetails.country || ''}` : 
                  'No address provided'
                }</p>
              </Card.Body>
            </Card>
            
            {/* Location Map */}
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Delivery Location</Card.Title>
                {order.latitude !== null && order.longitude !== null ? (
                  <div style={{ height: '300px', width: '100%' }}>
                    <MapContainer 
                      center={[order.latitude, order.longitude]} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[order.latitude, order.longitude]}>
                        <Popup>
                          Customer Location<br />
                          (Approximate)
                        </Popup>
                      </Marker>
                      
                      {/* Display service zones if available */}
                      {!isLoadingZones && !zoneError && zones.length > 0 && zones.map(zone => {
                        try {
                          const geoJsonData = JSON.parse(zone.geoJsonPolygon);
                          return (
                            <GeoJSON 
                              key={zone.id}
                              data={geoJsonData}
                              pathOptions={{ color: 'red', weight: 2, fillOpacity: 0.1 }}
                            />
                          );
                        } catch (err) {
                          console.error(`Error parsing GeoJSON for zone ${zone.id}:`, err);
                          return null;
                        }
                      })}
                    </MapContainer>
                    
                    {isLoadingZones && (
                      <div className="text-center mt-2">
                        <small>Loading service zones...</small>
                      </div>
                    )}
                    
                    {zoneError && (
                      <div className="text-center mt-2">
                        <small className="text-danger">{zoneError}</small>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert variant="info">
                    No location data available for this order.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            {/* Items Ordered */}
            <Card>
              <Card.Body>
                <Card.Title>Items</Card.Title>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.productName || item.product?.name || 'Unknown Product'}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                      <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                    </tr>
                  </tfoot>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default OrderDetailPage; 