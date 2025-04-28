import { Router, Request, Response } from 'express';
import { isUser } from '../middleware/authMiddleware';
import { z } from 'zod';
import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { isPointInAnyZone } from '../utils/geoUtils';

const router = Router();
const prisma = new PrismaClient();

/**
 * @route GET /api/location/ip
 * @description Get location based on client IP address
 * @access Public
 */
router.get('/ip', (async (req: Request, res: Response) => {
  try {
    // Get the client's IP address
    const ip = 
      req.headers['x-forwarded-for'] as string || 
      req.socket.remoteAddress || 
      '';
    
    // Clean up the IP address (handle proxy-forwarded IPs)
    const cleanIp = ip.split(',')[0].trim();
    
    console.log(`Client IP address: ${cleanIp}`);
    
    // For development/local testing, we'll return a default location
    // In production, you would use a service like ipstack or ipgeolocation.io
    // with real API credentials
    
    // For demonstration purposes, this returns a fixed location
    // This should be replaced with actual IP geolocation in production
    const mockLocation = {
      lat: 8.9806,  // Example lat for Hawassa, Ethiopia
      lng: 38.7578, // Example lng for Hawassa, Ethiopia
      city: 'Hawassa',
      country: 'Ethiopia',
      ip: cleanIp
    };
    
    res.status(200).json({ 
      success: true,
      location: mockLocation
    });
  } catch (error) {
    console.error('Error getting IP location:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to determine location from IP address' 
    });
  }
}) as RequestHandler);

/**
 * @route POST /api/location/check-zone
 * @description Check if a location is within any service zone
 * @access Public
 */
router.post('/check-zone', (async (req: Request, res: Response) => {
  try {
    // Define schema for location data
    const schema = z.object({
      lat: z.number(),
      lng: z.number()
    });
    
    // Validate request body
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location data',
        errors: result.error.flatten()
      });
    }
    
    const { lat, lng } = result.data;
    
    // Query all service zones from the database
    const serviceZones = await prisma.serviceArea.findMany();
    
    if (!serviceZones || serviceZones.length === 0) {
      return res.status(200).json({
        success: true,
        isInServiceZone: false,
        message: 'No service zones defined yet',
        debug: { zonesChecked: 0 }
      });
    }
    
    // Check if the location is in any service zone
    const isInServiceZone = isPointInAnyZone(lat, lng, serviceZones);
    
    // Log the result for debugging
    console.log(`Location check [${lat}, ${lng}]: In service zone: ${isInServiceZone}`);
    
    res.status(200).json({
      success: true,
      isInServiceZone,
      message: isInServiceZone 
        ? 'Location is within our service area'
        : 'Sorry, we don\'t currently service this area',
      debug: { zonesChecked: serviceZones.length }
    });
    
  } catch (error) {
    console.error('Error checking service zone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check service zone availability'
    });
  }
}) as RequestHandler);

/**
 * @route GET /api/location/zones
 * @description Get all active service zones
 * @access Public
 */
router.get('/zones', (async (req: Request, res: Response) => {
  try {
    // Get all service zones from the database
    const serviceZones = await prisma.serviceArea.findMany({
      select: {
        id: true,
        name: true,
        geoJsonPolygon: true
      }
    });
    
    // Return zones as JSON
    res.status(200).json(serviceZones);
  } catch (error) {
    console.error('Error fetching service zones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch service zones' 
    });
  }
}) as RequestHandler);

export default router; 