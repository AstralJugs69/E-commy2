// Script to test /api/admin/orders endpoint directly
const axios = require('axios');

// Valid token generated using generate-token.js
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDQ0MzE4OTAsImV4cCI6MTc0NDQzNTQ5MH0.Mm7xTN894GKh2e7RIHQ7ticvaQ4v0BeHdBxQKk6MXuI';

async function testAdminOrdersAPI() {
  console.log('Testing /api/admin/orders endpoint...');
  
  try {
    const response = await axios.get('http://localhost:3001/api/admin/orders', {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error calling API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
    } else {
      console.error('Error details:', error);
    }
  }
}

testAdminOrdersAPI(); 