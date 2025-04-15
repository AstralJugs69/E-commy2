const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function createAdminUser() {
  try {
    // Define admin credentials
    const email = 'admin@example.com';
    const password = 'admin123';
    
    console.log(`Attempting to create admin user with email: ${email}`);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log(`Admin user with email ${email} already exists. Creating a new admin user instead.`);
      
      // Create a new email with timestamp to avoid conflicts
      const timestamp = new Date().getTime();
      const newEmail = `admin${timestamp}@example.com`;
      
      // Hash the password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email: newEmail,
          passwordHash
        }
      });
      
      console.log(`Created new admin user: ${newEmail}`);
      console.log(`User ID: ${newUser.id}`);
      console.log(`Password: ${password}`);
    } else {
      // Hash the password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      
      // Create admin user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash
        }
      });
      
      console.log(`Created admin user: ${email}`);
      console.log(`User ID: ${user.id}`);
      console.log(`Password: ${password}`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createAdminUser(); 