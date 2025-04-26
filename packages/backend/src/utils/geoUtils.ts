import { point } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

/**
 * Check if a point (lat, lng) is within a GeoJSON polygon
 * 
 * @param lat - Latitude of the point to check
 * @param lng - Longitude of the point to check
 * @param geoJsonPolygon - GeoJSON polygon string
 * @returns boolean indicating if the point is inside the polygon
 */
export const isPointInPolygon = (lat: number, lng: number, geoJsonPolygon: string): boolean => {
  try {
    // Create a GeoJSON point
    const pt = point([lng, lat]); // Note: GeoJSON uses [longitude, latitude] order
    
    // Parse the polygon string to JSON
    const polygon = JSON.parse(geoJsonPolygon);
    
    // Check if the point is within the polygon
    return booleanPointInPolygon(pt, polygon);
  } catch (error) {
    console.error('Error checking if point is in polygon:', error);
    return false; // Return false if there's an error
  }
};

/**
 * Check if a point is within any of the service zones
 * 
 * @param lat - Latitude of the point to check
 * @param lng - Longitude of the point to check
 * @param zones - Array of service zones, each with a geoJsonPolygon property
 * @returns boolean indicating if the point is inside any zone
 */
export const isPointInAnyZone = (
  lat: number, 
  lng: number, 
  zones: Array<{ geoJsonPolygon: string }>
): boolean => {
  // Check each zone
  for (const zone of zones) {
    if (isPointInPolygon(lat, lng, zone.geoJsonPolygon)) {
      return true;
    }
  }
  return false;
};

/**
 * Generate a circular polygon around a city's coordinates
 * This creates a simple circular buffer around the city center
 * 
 * @param cityLat - Latitude of the city
 * @param cityLng - Longitude of the city
 * @param radiusKm - Radius in kilometers
 * @returns GeoJSON polygon as a string
 */
export const generateCityPolygon = (cityLat: number, cityLng: number, radiusKm: number = 5): string => {
  // Constants for calculation
  const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers
  const DEG_TO_RAD = Math.PI / 180;
  const RAD_TO_DEG = 180 / Math.PI;
  
  // Number of points to generate the circle
  const numPoints = 32;
  
  // Convert radius from km to radians
  const radiusRad = radiusKm / EARTH_RADIUS_KM;
  
  // Initialize coordinates array for the polygon
  const coordinates = [];
  
  // Generate points in a circle
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 360 / numPoints) * DEG_TO_RAD;
    
    // Calculate offset from city center
    // Using the Haversine formula approximation
    const latOffset = radiusRad * Math.cos(angle);
    const lngOffset = radiusRad * Math.sin(angle) / Math.cos(cityLat * DEG_TO_RAD);
    
    // Convert back to degrees and add to the city's coordinates
    const pointLat = cityLat + (latOffset * RAD_TO_DEG);
    const pointLng = cityLng + (lngOffset * RAD_TO_DEG);
    
    coordinates.push([pointLng, pointLat]); // Note: GeoJSON uses [lng, lat] order
  }
  
  // Close the polygon by adding the first point again
  coordinates.push(coordinates[0]);
  
  // Create GeoJSON polygon
  const polygon = {
    type: "Polygon",
    coordinates: [coordinates]
  };
  
  return JSON.stringify(polygon);
};

// Ethiopia's rough bounding box (for validation)
const ETHIOPIA_BOUNDS = {
  minLat: 3.4,
  maxLat: 14.9,
  minLng: 33.0,
  maxLng: 48.0
};

/**
 * Validate if coordinates are within Ethiopia's boundaries
 * 
 * @param lat - Latitude to validate
 * @param lng - Longitude to validate
 * @returns boolean indicating if the coordinates are within Ethiopia
 */
export const isInEthiopia = (lat: number, lng: number): boolean => {
  return (
    lat >= ETHIOPIA_BOUNDS.minLat && 
    lat <= ETHIOPIA_BOUNDS.maxLat && 
    lng >= ETHIOPIA_BOUNDS.minLng && 
    lng <= ETHIOPIA_BOUNDS.maxLng
  );
}; 