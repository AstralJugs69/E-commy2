import api from './api';

// Cache configuration
const DISTRICTS_CACHE_KEY = 'districts_cache';
const DISTRICTS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Cache structure interface
interface DistrictCache {
  timestamp: number;
  districts: string[];
}

/**
 * Gets districts data with caching strategy
 * - First tries to load from localStorage if valid and not expired
 * - Falls back to API call if cache miss or expired
 * - Saves fresh API data to cache for future use
 */
export async function getCachedDistricts(): Promise<string[]> {
  // Try to get data from cache
  try {
    const cachedDataString = localStorage.getItem(DISTRICTS_CACHE_KEY);
    
    if (cachedDataString) {
      const cachedData = JSON.parse(cachedDataString) as DistrictCache;
      
      // Check if cache is still valid
      if (Date.now() - cachedData.timestamp < DISTRICTS_CACHE_TTL) {
        console.log("Using cached districts.");
        return cachedData.districts;
      } else {
        console.log("Districts cache expired.");
        localStorage.removeItem(DISTRICTS_CACHE_KEY);
      }
    }
  } catch (error) {
    console.error("Error reading from districts cache:", error);
    localStorage.removeItem(DISTRICTS_CACHE_KEY);
  }
  
  // If we reach here, cache miss or expired - fetch from API
  console.log("Fetching districts from API...");
  
  try {
    const response = await api.get<string[]>('/districts');
    
    if (Array.isArray(response.data)) {
      const districts = response.data;
      
      // Cache the fetched data
      const cacheData: DistrictCache = {
        timestamp: Date.now(),
        districts: districts
      };
      
      try {
        localStorage.setItem(DISTRICTS_CACHE_KEY, JSON.stringify(cacheData));
      } catch (storageError) {
        console.error("Error saving districts to cache:", storageError);
      }
      
      return districts;
    } else {
      console.error("Invalid districts data format", response.data);
      throw new Error('Failed to fetch districts: Invalid data format.');
    }
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw new Error('Failed to fetch districts. Please try again later.');
  }
} 