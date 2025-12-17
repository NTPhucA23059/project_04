/**
 * Get API base URL
 * Avoids circular dependency by checking environment or default
 */
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8081';
  
  // Check environment variable first
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Default based on location
  if (window.location.origin.includes('localhost')) {
    return 'http://localhost:8081';
  }
  
  // Fallback
  return window.location.origin.replace(/:\d+$/, ':8081');
};

/**
 * Convert relative URL to absolute URL
 * Handles various URL formats from the backend
 * @param {string|null|undefined} url - The image URL (can be relative or absolute)
 * @returns {string|null} - Absolute URL or null if invalid
 */
export const toAbsoluteUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Already absolute URL (http:// or https://)
  if (/^https?:\/\//.test(url)) return url;
  
  // Get base URL
  const base = getApiBaseUrl().replace(/\/$/, '');
  
  if (!base) return null;
  
  // If it's already a full path starting with /, combine with base
  if (url.startsWith('/')) {
    return `${base}${url}`;
  }
  
  // Relative path - add base URL
  const cleanUrl = url.replace(/^\/+/, '');
  return `${base}/${cleanUrl}`;
};

/**
 * Get car main image URL from car object
 * Tries multiple possible fields
 * @param {object} car - Car object from API
 * @returns {string|null} - Image URL or null
 */
export const getCarMainImage = (car) => {
  if (!car) return null;
  
  // Try various possible image fields
  const imageUrl = car.image || 
                   car.Image || 
                   car.imageUrl || 
                   car.ImageUrl || 
                   car.MainImage ||
                   (car.images && car.images.length > 0 
                     ? (car.images[0].imageUrl || car.images[0].ImageUrl || car.images[0].image) 
                     : null);
  
  return imageUrl ? toAbsoluteUrl(imageUrl) : null;
};

/**
 * Get all car images from car object
 * @param {object} car - Car object from API
 * @returns {array} - Array of image objects with absolute URLs
 */
export const getCarImages = (car) => {
  if (!car) return [];
  
  const images = [];
  
  // Get images from car.images array
  if (car.images && Array.isArray(car.images) && car.images.length > 0) {
    car.images.forEach((img) => {
      const imageUrl = img.imageUrl || img.ImageUrl || img.image || img.url;
      const absoluteUrl = toAbsoluteUrl(imageUrl);
      
      if (absoluteUrl) {
        images.push({
          imageID: img.imageID || img.ImageID || img.imageId || images.length,
          imageUrl: absoluteUrl,
          ImageUrl: absoluteUrl, // Keep both for compatibility
          ImageID: img.imageID || img.ImageID || img.imageId || images.length,
        });
      }
    });
  }
  
  // If no images from array, try main image
  if (images.length === 0) {
    const mainImageUrl = getCarMainImage(car);
    if (mainImageUrl) {
      images.push({
        imageID: 0,
        imageUrl: mainImageUrl,
        ImageUrl: mainImageUrl,
        ImageID: 0,
      });
    }
  }
  
  return images;
};

/**
 * Default placeholder image URL
 */
export const DEFAULT_CAR_IMAGE = "https://placehold.co/600x400?text=Car+Image";

/**
 * Handle image load error - replace with placeholder
 * @param {Event} e - Image error event
 */
export const handleImageError = (e) => {
  if (e && e.target) {
    e.target.src = DEFAULT_CAR_IMAGE;
    e.target.onerror = null; // Prevent infinite loop
  }
};

