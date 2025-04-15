// Script to update test products with non-zero stock values
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function seedProductStock() {
  console.log('Updating product stock...');
  
  try {
    // Get all products
    const products = await prisma.product.findMany();
    
    if (products.length === 0) {
      console.log('No products found. Please seed products first.');
      return;
    }
    
    console.log(`Found ${products.length} products. Updating stock...`);
    
    // Update each product with a random stock value between 10 and 100
    for (const product of products) {
      const randomStock = Math.floor(Math.random() * 91) + 10; // Random value between 10 and 100
      
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: randomStock }
      });
      
      console.log(`Updated product #${product.id} "${product.name}" with stock: ${randomStock}`);
    }
    
    console.log('Product stock update completed successfully!');
    
  } catch (error) {
    console.error('Error updating product stock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
seedProductStock(); 