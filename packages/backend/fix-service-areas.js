// Script to fix service area GeoJSON data
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Sample valid GeoJSON data for service areas
const validServiceAreas = [
  {
    id: 1,
    name: "Downtown Area",
    geoJsonPolygon: JSON.stringify({
      type: "Polygon",
      coordinates: [[
        [-73.98, 40.72],
        [-73.96, 40.72],
        [-73.96, 40.74],
        [-73.98, 40.74],
        [-73.98, 40.72]
      ]]
    })
  },
  {
    id: 2,
    name: "Suburban District",
    geoJsonPolygon: JSON.stringify({
      type: "Polygon",
      coordinates: [[
        [-74.01, 40.65],
        [-73.95, 40.65],
        [-73.95, 40.70],
        [-74.01, 40.70],
        [-74.01, 40.65]
      ]]
    })
  },
  {
    id: 3,
    name: "North Region",
    geoJsonPolygon: JSON.stringify({
      type: "Polygon",
      coordinates: [[
        [-73.95, 40.75],
        [-73.90, 40.75],
        [-73.90, 40.80],
        [-73.95, 40.80],
        [-73.95, 40.75]
      ]]
    })
  }
];

async function fixServiceAreas() {
  console.log('Checking service area data...');
  
  try {
    // Get all service areas
    const serviceAreas = await prisma.serviceArea.findMany();
    console.log(`Found ${serviceAreas.length} service areas in the database.`);
    
    for (const area of serviceAreas) {
      console.log(`Checking service area: ${area.name} (ID: ${area.id})`);
      
      // Try to parse the GeoJSON
      try {
        JSON.parse(area.geoJsonPolygon);
        console.log(`✅ Service area ${area.id} has valid GeoJSON.`);
      } catch (error) {
        console.log(`❌ Service area ${area.id} has invalid GeoJSON. Fixing...`);
        
        // Find the matching area in our valid data
        const validArea = validServiceAreas.find(a => a.id === area.id) || 
                         validServiceAreas.find(a => a.name === area.name);
        
        if (validArea) {
          // Update with valid GeoJSON
          await prisma.serviceArea.update({
            where: { id: area.id },
            data: { geoJsonPolygon: validArea.geoJsonPolygon }
          });
          console.log(`✅ Updated service area ${area.id} with valid GeoJSON.`);
        } else {
          // If no match found, create a default polygon
          const defaultPolygon = JSON.stringify({
            type: "Polygon",
            coordinates: [[
              [-74.0, 40.7],
              [-73.9, 40.7],
              [-73.9, 40.8],
              [-74.0, 40.8],
              [-74.0, 40.7]
            ]]
          });
          
          await prisma.serviceArea.update({
            where: { id: area.id },
            data: { geoJsonPolygon: defaultPolygon }
          });
          console.log(`✅ Updated service area ${area.id} with default GeoJSON.`);
        }
      }
    }
    
    console.log('Service area check/fix completed!');
  } catch (error) {
    console.error('Error fixing service areas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
fixServiceAreas(); 