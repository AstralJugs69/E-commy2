import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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
    const token = localStorage.getItem('customer_token');
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
    // Handle global error cases
    if (error.response) {
      // Server responded with an error status code
      if (error.response.status === 401) {
        // Unauthorized - token expired or invalid
        localStorage.removeItem('customer_token');
        // You could also redirect to login page or dispatch a logout action if using Redux
      }
    }
    return Promise.reject(error);
  }
);

export default api; 