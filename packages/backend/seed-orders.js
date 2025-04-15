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

    // Create some test products if they don't exist
    const testProducts = [
      {
        name: 'Test Product 1',
        price: 19.99,
        description: 'A test product for seeding orders',
        stock: 100
      },
      {
        name: 'Test Product 2',
        price: 29.99,
        description: 'Another test product',
        stock: 50
      }
    ];

    // Create or find the products
    const products = [];
    for (const productData of testProducts) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: productData.name }
      });

      if (existingProduct) {
        products.push(existingProduct);
      } else {
        const newProduct = await prisma.product.create({
          data: productData
        });
        products.push(newProduct);
      }
    }
    
    // Sample order data
    const orderData = [
      {
        userId: user.id,
        status: 'PENDING',
        totalAmount: 59.97,
        latitude: 40.7128,
        longitude: -74.0060,
        shippingDetails: {
          fullName: 'John Doe',
          address: '123 Main St',
          city: 'Anytown',
          zipCode: '12345',
          country: 'USA',
          phone: '+123456789'
        },
        items: [
          {
            productId: products[0].id,
            productName: products[0].name,
            quantity: 2,
            price: products[0].price
          },
          {
            productId: products[1].id,
            productName: products[1].name,
            quantity: 1,
            price: products[1].price
          }
        ]
      },
      {
        userId: user.id,
        status: 'PROCESSING',
        totalAmount: 29.99,
        latitude: 34.0522,
        longitude: -118.2437,
        shippingDetails: {
          fullName: 'Jane Smith',
          address: '456 Oak Ave',
          city: 'Somewhere',
          zipCode: '67890',
          country: 'USA',
          phone: '+987654321'
        },
        items: [
          {
            productId: products[1].id,
            productName: products[1].name,
            quantity: 1,
            price: products[1].price
          }
        ]
      },
      {
        userId: user.id,
        status: 'SHIPPED',
        totalAmount: 19.99,
        latitude: 41.8781,
        longitude: -87.6298,
        shippingDetails: {
          fullName: 'Bob Johnson',
          address: '789 Pine St',
          city: 'Nowhere',
          zipCode: '54321',
          country: 'USA',
          phone: '+1122334455'
        },
        items: [
          {
            productId: products[0].id,
            productName: products[0].name,
            quantity: 1,
            price: products[0].price
          }
        ]
      }
    ];
    
    // Clear existing orders for testing purposes
    await prisma.order.deleteMany({
      where: { userId: user.id }
    });
    
    // Insert sample orders with order items
    for (const orderDataItem of orderData) {
      const { items, ...orderDetails } = orderDataItem;
      
      const order = await prisma.order.create({
        data: orderDetails
      });
      
      // Create order items for each order
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price
          }
        });
      }
      
      console.log(`Created order ${order.id} with ${items.length} items`);
    }
    
  } catch (error) {
    console.error('Error creating test orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
seedTestOrders(); 