const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function createAdminUser() {
  try {
    // Create a timestamp email to ensure a new admin is created
    const timestamp = new Date().getTime();
    const email = `admin${timestamp}@example.com`;
    const password = 'admin123';
    
    console.log(`Creating new admin user with email: ${email}`);
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash
      }
    });
    
    console.log(`Created new admin user: ${email}`);
    console.log(`User ID: ${user.id}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createAdminUser(); 