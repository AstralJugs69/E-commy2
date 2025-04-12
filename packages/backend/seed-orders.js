// Script to seed test orders
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function seedTestOrders() {
  console.log('Creating test orders...');
  
  try {
    // Find test user to associate orders with
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!user) {
      console.log('Test user not found. Please run seed-user.js first.');
      return;
    }
    
    // Sample order data
    const orderData = [
      {
        userId: user.id,
        customerName: 'John Doe',
        customerPhone: '+123456789',
        addressText: '123 Main St, Anytown, USA',
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'Pending Call',
        locationCheckResult: 'Inside Zone Main'
      },
      {
        userId: user.id,
        customerName: 'Jane Smith',
        customerPhone: '+987654321',
        addressText: '456 Oak Ave, Somewhere, USA',
        latitude: 34.0522,
        longitude: -118.2437,
        status: 'Verified',
        locationCheckResult: 'Inside Zone West'
      },
      {
        userId: user.id,
        customerName: 'Bob Johnson',
        customerPhone: '+1122334455',
        addressText: '789 Pine St, Nowhere, USA',
        latitude: 41.8781,
        longitude: -87.6298,
        status: 'Processing',
        locationCheckResult: 'Inside Zone North'
      }
    ];
    
    // Clear existing orders for testing purposes
    await prisma.order.deleteMany({
      where: { userId: user.id }
    });
    
    // Insert sample orders
    const orders = await Promise.all(
      orderData.map(order => 
        prisma.order.create({
          data: order
        })
      )
    );
    
    console.log(`Created ${orders.length} test orders`);
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1} ID: ${order.id} - Status: ${order.status}`);
    });
    
  } catch (error) {
    console.error('Error creating test orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
seedTestOrders(); 