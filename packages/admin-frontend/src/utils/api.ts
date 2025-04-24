import axios from 'axios';

// Helper function to determine the correct API URL based on environment
const getApiBaseUrl = () => {
  // Check if we're in production (based on window.location)
  const isRailway = window.location.hostname.includes('railway.app');
  const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  // Get the correct API URL based on environment
  if (isRailway) {
    // For Railway deployment - use the backend service URL
    return 'https://e-commy2-production.up.railway.app/api';
  } else if (isProd) {
    // For other production environments
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    if (apiBaseUrl) return apiBaseUrl;
  }
  
  // Default development URL
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('API Base URL:', API_BASE_URL);

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url, 'with baseURL:', config.baseURL);
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Add special handling for the domain URL issue
    if (error.config && error.response && error.response.status === 405) {
      console.error('Detected possible URL issue with Railway deployment');
      console.error('Original URL:', error.config.url);
      console.error('Original baseURL:', error.config.baseURL);
      
      const fixedUrl = error.config.url.replace(/\/[^\/]+\.up\.railway\.app\/api/, '/api');
      console.log('Attempting with fixed URL:', fixedUrl);
      
      // Return a new request with the fixed URL
      return axios({
        ...error.config,
        url: fixedUrl,
        baseURL: API_BASE_URL
      });
    }
    
    // Handle global error cases
    if (error.response) {
      // Server responded with an error status code
      if (error.response.status === 401) {
        // Unauthorized - token expired or invalid
        localStorage.removeItem('admin_token');
        // You could also redirect to login page or dispatch a logout action if using Redux
      }
    }
    return Promise.reject(error);
  }
);

export default api; 