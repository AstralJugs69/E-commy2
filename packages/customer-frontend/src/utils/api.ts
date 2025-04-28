import axios, { AxiosRequestConfig, AxiosResponse, AxiosAdapter } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create a simple in-memory cache
interface CacheItem {
  data: any;
  timestamp: number;
  etag?: string;
}

// Extended Axios Response with fromCache property
interface CachedAxiosResponse<T = any> extends AxiosResponse<T> {
  fromCache?: boolean;
}

// Cache configuration
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes default
const CACHE_CONFIG: Record<string, number> = {
  // Define which endpoints to cache and for how long (in ms)
  '/homepage': 5 * 60 * 1000,          // 5 minutes for homepage
  '/products': 5 * 60 * 1000,          // 5 minutes for product listings
  '/categories': 30 * 60 * 1000,       // 30 minutes for categories
  '/products/([0-9]+)$': 10 * 60 * 1000, // 10 minutes for product details
  '/products/([0-9]+)/with-details': 5 * 60 * 1000 // 5 minutes for product with reviews
};

// Keep track of in-flight requests to avoid duplicates
const pendingRequests: Record<string, Promise<any>> = {};

// In-memory cache storage
const cache: Record<string, CacheItem> = {};

// Helper function to check if a URL should be cached
const shouldCache = (url: string): boolean => {
  return Object.keys(CACHE_CONFIG).some(pattern => {
    const regex = new RegExp(pattern);
    return regex.test(url);
  });
};

// Helper function to get cache TTL for a URL
const getCacheTTL = (url: string): number => {
  for (const pattern in CACHE_CONFIG) {
    const regex = new RegExp(pattern);
    if (regex.test(url)) {
      return CACHE_CONFIG[pattern];
    }
  }
  return CACHE_MAX_AGE;
};

// Helper function to check if cache is expired
const isCacheExpired = (cacheItem: CacheItem): boolean => {
  return Date.now() - cacheItem.timestamp > getCacheTTL(cacheItem.data.config?.url || '');
};

// Create a simpler version of the axios instance without complex caching
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    // Add authorization header
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
      }
    }
    return Promise.reject(error);
  }
);

export default api; 