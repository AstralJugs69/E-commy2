// Script to seed sample products
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function seedSampleProducts() {
  console.log('Creating sample products...');
  
  try {
    // Sample product data
    const productData = [
      {
        name: 'Premium Coffee Maker',
        price: 129.99,
        description: 'A high-quality coffee maker with programmable settings and a stylish design.',
        imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=500',
        stock: 50
      },
      {
        name: 'Wireless Headphones',
        price: 89.99,
        description: 'Noise-cancelling wireless headphones with 20-hour battery life.',
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e736e9ae14?q=80&w=500',
        stock: 75
      },
      {
        name: 'Smart Watch',
        price: 199.99,
        description: 'Track your fitness, receive notifications, and more with this smart watch.',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500',
        stock: 30
      },
      {
        name: 'Portable Bluetooth Speaker',
        price: 59.99,
        description: 'Powerful sound in a compact, waterproof design. Perfect for outdoor activities.',
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=500',
        stock: 100
      },
      {
        name: 'Designer Backpack',
        price: 79.99,
        description: 'Stylish and functional backpack with laptop compartment and multiple pockets.',
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=500',
        stock: 45
      },
      {
        name: 'Stainless Steel Water Bottle',
        price: 24.99,
        description: 'Keep your drinks hot or cold for hours with this insulated water bottle.',
        imageUrl: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?q=80&w=500',
        stock: 120
      },
      {
        name: 'Wireless Charging Pad',
        price: 34.99,
        description: 'Fast wireless charging for compatible smartphones and earbuds.',
        imageUrl: 'https://images.unsplash.com/photo-1586941426723-d3d36b1acfc8?q=80&w=500',
        stock: 60
      },
      {
        name: 'Smart Home Security Camera',
        price: 149.99,
        description: 'HD security camera with motion detection, night vision, and cloud storage.',
        imageUrl: 'https://images.unsplash.com/photo-1557174949-3b1b575b6120?q=80&w=500',
        stock: 25
      }
    ];
    
    // Insert sample products
    const createdProducts = [];
    
    for (const product of productData) {
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: { name: product.name }
      });
      
      if (existingProduct) {
        console.log(`Product "${product.name}" already exists, updating it...`);
        const updatedProduct = await prisma.product.update({
          where: { id: existingProduct.id },
          data: product
        });
        createdProducts.push(updatedProduct);
      } else {
        console.log(`Creating new product: ${product.name}`);
        const newProduct = await prisma.product.create({
          data: product
        });
        createdProducts.push(newProduct);
      }
    }
    
    console.log(`Created/updated ${createdProducts.length} products`);
    createdProducts.forEach((product) => {
      console.log(`- ${product.name}: €${product.price}`);
    });
    
  } catch (error) {
    console.error('Error creating sample products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
seedSampleProducts(); 