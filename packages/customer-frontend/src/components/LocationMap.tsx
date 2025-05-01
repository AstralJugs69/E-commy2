import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { Alert, Card, Spinner } from 'react-bootstrap';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';

// Define interface for location
interface Location {
  lat: number;
  lng: number;
}

// Define interfaces for service zones
interface ServiceZone {
  id: number;
  name: string;
  geoJsonPolygon: string;
}

// Props for the component
interface LocationMapProps {
  location: Location | null;
  isInServiceZone?: boolean;
}

// Fix for Leaflet marker icons in React
// Needed because of how webpack handles assets
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icons for service area status
const inServiceIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const outOfServiceIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const LocationMap: React.FC<LocationMapProps> = ({ location, isInServiceZone }) => {
  const { t } = useTranslation();
  const [serviceZones, setServiceZones] = useState<ServiceZone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default to Addis Ababa if no location provided
  const defaultCenter = { lat: 9.02, lng: 38.75 };
  const mapCenter = location || defaultCenter;
  
  // Fetch service zones
  useEffect(() => {
    const fetchServiceZones = async () => {
      if (!location) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Use the public endpoint for service zones
        const response = await api.get('/location/zones');
        setServiceZones(response.data);
      } catch (err) {
        console.error('Error fetching service zones:', err);
        setError(t('location.errorLoadingZones', 'Unable to load service zones'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServiceZones();
  }, [location, t]);
  
  // Return early if no location is provided
  if (!location) {
    return (
      <Alert variant="info">
        {t('location.invalidCoords', 'Invalid location coordinates')}
      </Alert>
    );
  }
  
  // Validate coordinates are within a reasonable range
  if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
    return (
      <Alert variant="warning">
        {t('location.coordsOutOfRange', 'Location coordinates outside valid range')}
      </Alert>
    );
  }
  
  // Select icon based on service zone status
  const markerIcon = isInServiceZone === undefined 
    ? defaultIcon 
    : isInServiceZone 
      ? inServiceIcon 
      : outOfServiceIcon;
  
  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>{t('location.yourLocation', 'Your Location')}</Card.Title>
        <div style={{ height: '300px', width: '100%' }}>
          <MapContainer 
            center={[mapCenter.lat, mapCenter.lng]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* User location marker */}
            <Marker 
              position={[location.lat, location.lng]}
              icon={markerIcon}
            >
              <Popup>
                <strong>{t('location.yourLocation', 'Your Location')}</strong><br />
                {isInServiceZone === true && (
                  <span className="text-success">{t('location.inServiceZone', 'Within delivery service area')}</span>
                )}
                {isInServiceZone === false && (
                  <span className="text-danger">{t('location.outOfServiceZone', 'Outside delivery service area')}</span>
                )}
              </Popup>
            </Marker>
            
            {/* Service zones */}
            {serviceZones.map(zone => {
              try {
                const geoJsonData = JSON.parse(zone.geoJsonPolygon);
                return (
                  <GeoJSON 
                    key={zone.id}
                    data={geoJsonData}
                    pathOptions={{ 
                      color: '#14B8A6', 
                      weight: 2, 
                      fillOpacity: 0.1, 
                      fillColor: '#14B8A6' 
                    }}
                  >
                    <Popup>
                      <strong>{zone.name}</strong><br />
                      {t('location.serviceZone', 'Service Zone')}
                    </Popup>
                  </GeoJSON>
                );
              } catch (err) {
                console.error(`Error parsing GeoJSON for zone ${zone.id}:`, err);
                return null;
              }
            })}
          </MapContainer>
          
          {isLoading && (
            <div className="text-center mt-2">
              <small><Spinner animation="border" size="sm" /> {t('location.loadingZones', 'Loading service zones...')}</small>
            </div>
          )}
          
          {error && (
            <div className="text-center mt-2">
              <small className="text-danger">{error}</small>
            </div>
          )}
        </div>
        {isInServiceZone === false && (
          <Alert variant="warning" className="mt-3">
            <Alert.Heading>{t('location.locationNoticeTitle', 'Location Notice')}</Alert.Heading>
            <p>{t('location.locationNoticeText', 'Your location appears to be outside our current delivery zones.')}</p>
            <p className="mb-0">{t('location.contactSupportText', 'Please contact customer support for assistance.')}</p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default LocationMap; 