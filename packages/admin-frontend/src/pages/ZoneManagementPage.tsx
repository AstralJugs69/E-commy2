import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Table, Form, Button, Alert, Spinner, Row, Col, Card, InputGroup, ListGroup, Badge } from 'react-bootstrap';
import L, { LatLngExpression, Layer } from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, FeatureGroup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';

// Map loading fallback component
const MapLoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '500px', backgroundColor: '#f8f9fa' }}>
    <Spinner animation="border" variant="primary" />
    <span className="ms-2">Loading map...</span>
  </div>
);

// Add interface for city data
interface City {
  id: number;
  name: string;
  region: string;
  lat: number;
  lng: number;
  population?: number;
}

interface ServiceZone {
  id: number;
  name: string;
  geoJsonPolygon: string; // The raw GeoJSON string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Custom EditControl component to replace react-leaflet-draw
interface EditControlProps {
  position: L.ControlPosition;
  onCreated: (e: any) => void;
  onEdited: (e: any) => void;
  onDeleted: (e: any) => void;
  featureGroupRef?: React.RefObject<L.FeatureGroup>;
  draw?: {
    polyline?: false | L.DrawOptions.PolylineOptions;
    polygon?: false | L.DrawOptions.PolygonOptions;
    rectangle?: false | L.DrawOptions.RectangleOptions;
    circle?: false | L.DrawOptions.CircleOptions;
    marker?: false | L.DrawOptions.MarkerOptions;
    circlemarker?: false | L.DrawOptions.CircleMarkerOptions;
  };
  edit?: {
    featureGroup?: L.FeatureGroup;
    edit?: boolean | any;
    remove?: boolean;
  };
}

const EditControl: React.FC<EditControlProps> = (props) => {
  return (
    <MapHookWrapper {...props} />
  );
};

// Separate component to use the useMap hook
const MapHookWrapper: React.FC<EditControlProps> = (props) => {
  const { position, onCreated, onEdited, onDeleted, draw, edit, featureGroupRef } = props;
  const map = useMap();
  
  useEffect(() => {
    const featureGroup = edit?.featureGroup || (featureGroupRef?.current as L.FeatureGroup | undefined);
    if (!featureGroup) return;
    
    // Initialize the draw control
    const drawControl = new L.Control.Draw({
      position,
      draw: draw as any, // Use any to bypass type checking for now
      edit: featureGroup ? {
        featureGroup,
        edit: edit?.edit || false,
        remove: edit?.remove || false
      } as any : undefined
    });
    
    // Add the draw control to the map
    map.addControl(drawControl);
    
    // Set up event handlers
    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEdited);
    map.on(L.Draw.Event.DELETED, onDeleted);
    
    // Cleanup
    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEdited);
      map.off(L.Draw.Event.DELETED, onDeleted);
      map.removeControl(drawControl);
    };
  }, [map, position, draw, edit, onCreated, onEdited, onDeleted, featureGroupRef]);
  
  return null;
};

const ZoneManagementPage = () => {
  // State for zone list
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  
  // State for adding new zone
  const [newZoneName, setNewZoneName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // State for drawn/edited polygon
  const [editableLayerGeoJson, setEditableLayerGeoJson] = useState<any>(null);
  
  // Map visibility state
  const [showMap, setShowMap] = useState(false);
  
  // Ref for editable layer group
  const editableFG = useRef<L.FeatureGroup | null>(null);

  // Add state for city-based zone creation
  const [creationMethod, setCreationMethod] = useState<'draw' | 'city'>('draw');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [citySearchError, setCitySearchError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(5); // Default 5km radius

  // Map center coordinates (Addis Ababa)
  const mapCenter: LatLngExpression = [9.02, 38.75];
  const mapZoom = 11;

  useEffect(() => {
    fetchZones();
  }, []);
  
  // Show map after data is loaded
  useEffect(() => {
    if (!isLoadingList) {
      setShowMap(true);
    }
  }, [isLoadingList]);

  const fetchZones = async () => {
    setIsLoadingList(true);
    setListError(null);

    const token = localStorage.getItem('admin_token');
    if (!token) {
      setListError('Authentication required. Please log in again.');
      setIsLoadingList(false);
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
        if (err.response.status === 401) {
          setListError('Your session has expired. Please log in again.');
        } else {
          setListError(err.response.data.message || 'Failed to fetch service zones.');
        }
        console.error('Error fetching zones:', err.response.data);
      } else {
        setListError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsLoadingList(false);
    }
  };

  // Event handler for when a shape is created
  const _onCreated = (e: any) => {
    const layer = e.layer;
    // Clear any existing layers
    editableFG.current?.clearLayers();
    
    // Add the new layer
    editableFG.current?.addLayer(layer);
    
    // Set the GeoJSON representation in state
    const geoJson = layer.toGeoJSON();
    setEditableLayerGeoJson(geoJson);
  };

  // Event handler for when a shape is edited
  const _onEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      // Update the GeoJSON representation in state
      const geoJson = layer.toGeoJSON();
      setEditableLayerGeoJson(geoJson);
    });
  };

  // Event handler for when a shape is deleted
  const _onDeleted = () => {
    setEditableLayerGeoJson(null);
  };

  // Add function to search cities
  const searchCities = async () => {
    if (!citySearchQuery.trim()) {
      setCities([]);
      return;
    }
    
    setIsSearchingCities(true);
    setCitySearchError(null);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setCitySearchError('Authentication required. Please log in again.');
      setIsSearchingCities(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/cities`, {
        params: { query: citySearchQuery },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCities(response.data.cities);
      if (response.data.cities.length === 0) {
        setCitySearchError('No cities found matching your search.');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setCitySearchError(err.response.data.message || 'Failed to search cities.');
        console.error('Error searching cities:', err.response.data);
      } else {
        setCitySearchError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsSearchingCities(false);
    }
  };

  // Add function to select a city
  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    // Clear any previously drawn polygons
    editableFG.current?.clearLayers();
    setEditableLayerGeoJson(null);
  };

  // Add function to create zone from selected city
  const handleAddCityZone = async () => {
    if (!selectedCity) {
      setCreateError('Please select a city first.');
      return;
    }
    
    if (!newZoneName.trim()) {
      setCreateError('Please enter a name for the zone.');
      return;
    }
    
    setIsCreating(true);
    setCreateError(null);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setCreateError('Authentication required. Please log in again.');
      setIsCreating(false);
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/serviceareas/from-city`,
        {
          cityId: selectedCity.id,
          name: newZoneName,
          radiusKm: radiusKm
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Add new zone to the list
      setZones(prevZones => [...prevZones, response.data]);
      
      // Reset form
      setNewZoneName('');
      setSelectedCity(null);
      setRadiusKm(5); // Reset to default
      
      // Switch back to draw mode
      setCreationMethod('draw');
      
      // Fetch zones to refresh the list
      fetchZones();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setCreateError(err.response.data.message || 'Failed to create service zone.');
        console.error('Error creating zone:', err.response.data);
      } else {
        setCreateError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Modify the handleAddZone function to handle both methods
  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (creationMethod === 'city') {
      handleAddCityZone();
      return;
    }
    
    // Rest of the existing code for draw-based zone creation
    // Basic validation
    if (!newZoneName.trim()) {
      setCreateError('Zone name is required.');
      return;
    }
    
    if (!editableLayerGeoJson) {
      setCreateError('Please draw a zone area on the map.');
      return;
    }
    
    setIsCreating(true);
    setCreateError(null);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setCreateError('Authentication required. Please log in again.');
      setIsCreating(false);
      return;
    }
    
    try {
      await axios.post(
        `${API_BASE_URL}/admin/serviceareas`, 
        { 
          name: newZoneName, 
          geoJsonPolygon: JSON.stringify(editableLayerGeoJson)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Success - clear form and refresh the list
      setNewZoneName('');
      setEditableLayerGeoJson(null);
      editableFG.current?.clearLayers();
      fetchZones();
      
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400) {
          setCreateError('Validation failed: ' + (err.response.data.message || 'Please check your input.'));
        } else if (err.response.status === 409) {
          setCreateError('A zone with this name already exists.');
        } else {
          setCreateError(err.response.data.message || 'Failed to create service zone.');
        }
        console.error('Error creating zone:', err.response.data);
      } else {
        setCreateError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Container className="mt-3">
      <Row>
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Body>
              <h3>Add New Service Zone</h3>
              
              {/* Add toggle for creation method */}
              <Form.Group className="mb-3">
                <div className="d-flex">
                  <Form.Check
                    type="radio"
                    id="creation-draw"
                    name="creation-method"
                    label="Draw on Map"
                    checked={creationMethod === 'draw'}
                    onChange={() => setCreationMethod('draw')}
                    className="me-3"
                  />
                  <Form.Check
                    type="radio"
                    id="creation-city"
                    name="creation-method"
                    label="Select City"
                    checked={creationMethod === 'city'}
                    onChange={() => setCreationMethod('city')}
                  />
                </div>
              </Form.Group>
              
              <Form onSubmit={handleAddZone}>
                <Form.Group className="mb-3" controlId="newZoneName">
                  <Form.Label className="fw-medium text-neutral-700">Zone Name</Form.Label>
                  <Form.Control 
                    type="text"
                    required
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)} 
                    className="py-2"
                  />
                </Form.Group>

                {creationMethod === 'draw' ? (
                <div className="mt-3">
                  <p className="mb-1 fw-medium text-neutral-700">Zone Area</p>
                  <Alert variant="info">
                    Use the drawing tools on the map to create a polygon zone.
                  </Alert>
                </div>
                ) : (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium text-neutral-700">Search for City</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          value={citySearchQuery}
                          onChange={(e) => setCitySearchQuery(e.target.value)}
                          placeholder="Enter city name..."
                        />
                        <Button 
                          variant="outline-secondary" 
                          onClick={searchCities}
                          disabled={isSearchingCities}
                        >
                          {isSearchingCities ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                              Searching...
                            </>
                          ) : 'Search'}
                        </Button>
                      </InputGroup>
                    </Form.Group>
                    
                    {citySearchError && (
                      <Alert variant="warning" className="mb-3">{citySearchError}</Alert>
                    )}
                    
                    {cities.length > 0 && (
                      <div className="mb-3">
                        <Form.Label className="fw-medium text-neutral-700">Select a City</Form.Label>
                        <ListGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {cities.map(city => (
                            <ListGroup.Item 
                              key={city.id}
                              action
                              active={selectedCity?.id === city.id}
                              onClick={() => handleCitySelect(city)}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{city.name}</strong>
                                  <div><small>{city.region}</small></div>
                                </div>
                                {city.population && (
                                  <Badge bg="secondary">
                                    Pop: {(city.population / 1000).toFixed(0)}k
                                  </Badge>
                                )}
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    )}
                    
                    {selectedCity && (
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium text-neutral-700">
                          Radius (km) around {selectedCity.name}
                        </Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          max="50"
                          value={radiusKm}
                          onChange={(e) => setRadiusKm(Number(e.target.value))}
                        />
                        <Form.Text className="text-muted">
                          The service zone will cover a circular area with this radius around the city.
                        </Form.Text>
                      </Form.Group>
                    )}
                  </>
                )}
                
                {createError && (
                  <Alert variant="danger" className="mt-3">
                    {createError}
                  </Alert>
                )}
                
                <Button 
                  variant="success" 
                  type="submit" 
                  disabled={isCreating || (creationMethod === 'draw' && !editableLayerGeoJson) || (creationMethod === 'city' && !selectedCity)} 
                  className="mt-3 py-2"
                >
                  {isCreating ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Creating...
                    </>
                  ) : 'Add Zone'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          
          <h3>Existing Service Zones</h3>
          
          {isLoadingList && (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading zones...</span>
              </Spinner>
            </div>
          )}
          
          {listError && <Alert variant="danger">{listError}</Alert>}
          
          {!isLoadingList && !listError && (
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {zones.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center">No zones found</td>
                  </tr>
                ) : (
                  zones.map((zone) => (
                    <tr key={zone.id}>
                      <td>{zone.id}</td>
                      <td>{zone.name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Col>
        
        <Col lg={7}>
          <Card>
            <Card.Body>
              <h3>Service Zone Map</h3>
              <div style={{ height: '600px', width: '100%' }}>
                {isLoadingList ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <Spinner animation="border" />
                    <span className="ms-2">Loading zones...</span>
                  </div>
                ) : showMap ? (
                  <MapContainer 
                    key={`zone-map-${Date.now()}`}
                    center={mapCenter} 
                    zoom={mapZoom} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Editable Feature Group for the leaflet-draw */}
                    <FeatureGroup ref={editableFG}>
                      <EditControl
                        position="topright"
                        onCreated={_onCreated}
                        onEdited={_onEdited}
                        onDeleted={_onDeleted}
                        featureGroupRef={editableFG as React.RefObject<L.FeatureGroup>}
                        draw={{
                          rectangle: false,
                          circle: false,
                          circlemarker: false,
                          marker: false,
                          polyline: false,
                          polygon: {
                            allowIntersection: false,
                            drawError: {
                              color: '#e1e100',
                              message: '<strong>Error:</strong> Shape edges cannot cross!',
                            },
                            shapeOptions: {
                              color: '#14B8A6'
                            }
                          },
                        }}
                        edit={{
                          edit: {
                            selectedPathOptions: {
                              maintainColor: true,
                              opacity: 0.7,
                            }
                          },
                          remove: true
                        }}
                      />
                    </FeatureGroup>
                    
                    {/* Render existing zones */}
                    {zones.map((zone) => {
                      try {
                        const geoJsonData = JSON.parse(zone.geoJsonPolygon);
                        // Basic validation
                        if (geoJsonData && (geoJsonData.type === 'Polygon' || geoJsonData.type === 'MultiPolygon')) {
                          const onEachFeature = (feature: any, layer: any) => {
                            layer.bindPopup(zone.name);
                          };

                          return (
                            <GeoJSON
                              key={zone.id}
                              data={geoJsonData}
                              pathOptions={{ color: 'blue', fillColor: 'lightblue', weight: 2, opacity: 0.8, fillOpacity: 0.3 }}
                              onEachFeature={onEachFeature}
                            />
                          );
                        }
                      } catch (e) {
                        console.error(`Failed to parse GeoJSON for zone ${zone.id} (${zone.name}):`, e);
                      }
                      return null; // Don't render if parse fails
                    })}
                  </MapContainer>
                ) : (
                  <MapLoadingFallback />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ZoneManagementPage; 