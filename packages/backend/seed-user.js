// Script to seed a test user
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function seedTestUser() {
  console.log('Creating test user...');
  
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (existingUser) {
      console.log(`Test user already exists with ID: ${existingUser.id}`);
      return existingUser;
    }
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: '$2a$10$dummyHashForTestingPurposesOnly'  // This is not a real hash
      }
    });
    
    console.log(`Created test user with ID: ${user.id}`);
    return user;
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
seedTestUser(); 