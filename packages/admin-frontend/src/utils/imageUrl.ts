/**
 * Utility function to handle image URLs, now using Cloudinary
 * 
 * This handles several cases:
 * 1. Cloudinary URLs (already absolute, starting with https://res.cloudinary.com/)
 * 2. Already absolute URLs (starting with http:// or https://)
 * 3. Missing or empty paths (returns a placeholder)
 */

/**
 * Processes an image URL to ensure it's correctly formatted
 * @param imageUrl The image URL received from the backend
 * @returns A properly formatted absolute URL for the image
 */
export function getImageUrl(imageUrl?: string | null): string {
  // Default placeholder image path - use local file
  const PLACEHOLDER_IMAGE_PATH = '/placeholder-image.svg';
   
  // Handle null, undefined or empty string
  if (!imageUrl) {
    return PLACEHOLDER_IMAGE_PATH;
  }
  
  // Handle placeholder.png specially
  if (imageUrl === '/placeholder.png') {
    return '/placeholder.png';
  }
   
  // Handle Cloudinary or already absolute URLs
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
   
  // For backward compatibility with any legacy paths
  // Get base URL from env vars for serving static content
  const BASE_URL = import.meta.env.VITE_API_URL || 
                  (import.meta.env.VITE_API_BASE_URL ? 
                   import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '') : 
                   'http://localhost:3001');
  
  // Handle paths that start with / - legacy case
  if (imageUrl.startsWith('/')) {
    return `${BASE_URL.replace(/\/$/, '')}${imageUrl}`;
  }
   
  // For any other unexpected format, return the path combined with BASE_URL
  return `${BASE_URL.replace(/\/$/, '')}/${imageUrl}`;
}

// Export as named export
export default getImageUrl;