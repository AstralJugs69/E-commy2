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
  // Get base URL from env vars (without /api) for serving static content
  const BASE_URL = import.meta.env.VITE_API_URL || 
                  (import.meta.env.VITE_API_BASE_URL ? 
                   import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '') : 
                   'http://localhost:3001');
  
  // Allow explicit uploads URL to override base URL for uploads
  const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || `${BASE_URL}/uploads`;
   
  // Default placeholder image path - use local file
  const PLACEHOLDER_IMAGE_PATH = '/placeholder-image.svg';
   
  // Handle null, undefined or empty string
  if (!relativePath) {
    return PLACEHOLDER_IMAGE_PATH;
  }
  
  // Handle placeholder.png specially to avoid 429 errors
  if (relativePath === '/placeholder.png') {
    return '/placeholder.png';
  }
   
  // Handle already absolute URLs
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
   
  // Handle paths that start with /uploads specifically
  if (relativePath.startsWith('/uploads/')) {
    // For upload paths, use the dedicated UPLOADS_URL
    return `${UPLOADS_URL.replace(/\/uploads\/?$/, '')}${relativePath}`;
  }
  // Handle other relative paths starting with /
  else if (relativePath.startsWith('/')) {
    // Use the base URL for other paths
    return `${BASE_URL.replace(/\/$/, '')}${relativePath}`;
  }
   
  // For any other unexpected format, return the path combined with API_BASE_URL
  // This handles cases where the path doesn't start with / but is still relative
  return `${BASE_URL.replace(/\/$/, '')}/${relativePath}`;
}

// Export as named export
export default getImageUrl;