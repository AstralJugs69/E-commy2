/**
 * Utility function to construct absolute image URLs from backend paths
 * 
 * This handles several cases:
 * 1. Already absolute URLs (starting with http:// or https://)
 * 2. Relative paths from the backend (starting with /)
 * 3. Missing or empty paths (returns a placeholder)
 */

/**
 * Converts a relative image path to an absolute URL
 * @param relativePath The image path received from the backend, may be relative or already absolute
 * @returns A properly formatted absolute URL for the image
 */
export function getImageUrl(relativePath?: string | null): string {
  // API base URL from environment variable or fallback
  // Use the same environment variable as in api.ts but without the '/api' suffix
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api').replace(/\/api$/, '');
  
  // Default placeholder image path
  const PLACEHOLDER_IMAGE_PATH = '/placeholder-image.svg';
  
  // Handle null, undefined or empty string
  if (!relativePath) {
    return PLACEHOLDER_IMAGE_PATH;
  }
  
  // Handle already absolute URLs
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Handle relative paths starting with /
  if (relativePath.startsWith('/')) {
    // Ensure no double slashes by removing trailing slash from API_BASE_URL if present
    return `${API_BASE_URL.replace(/\/$/, '')}${relativePath}`;
  }
  
  // For any other unexpected format, return the path combined with API_BASE_URL
  // This handles cases where the path doesn't start with / but is still relative
  return `${API_BASE_URL.replace(/\/$/, '')}/${relativePath}`;
}

// Export as named export
export default getImageUrl; 