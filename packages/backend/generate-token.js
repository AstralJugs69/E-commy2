// Simple script to generate a test JWT token
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'hybrid_ecommerce_secret_key_for_development_only';

// Create a payload with some test data
const payload = {
  userId: 1,
  email: 'admin@example.com',
  role: 'admin'
};

// Generate the token
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

console.log('Test JWT Token:');
console.log(token);
console.log('\nUse this in your Authorization header as:');
console.log(`Bearer ${token}`);

// Also generate an invalid token for testing
const invalidToken = token.slice(0, -5) + 'XXXXX';
console.log('\nInvalid token for testing:');
console.log(`Bearer ${invalidToken}`); 