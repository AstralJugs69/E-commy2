import { Request, Response, NextFunction } from 'express';

/**
 * Cache-Control middleware for public static resources
 * Used for resources that change rarely like categories, product images
 */
export const staticCache = (duration = 3600) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only apply cache headers to GET requests
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${duration}`);
    }
    next();
  };
};

/**
 * Cache-Control middleware for dynamic content
 * Used for resources that change but are still somewhat cacheable like product listings
 */
export const dynamicCache = (duration = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only apply cache headers to GET requests
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${duration}, stale-while-revalidate=${duration * 2}`);
    }
    next();
  };
};

/**
 * Cache-Control middleware for private user resources
 * Used for resources that are specific to a user but can still be cached
 */
export const privateCache = (duration = 60) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only apply cache headers to GET requests
    if (req.method === 'GET') {
      res.set('Cache-Control', `private, max-age=${duration}`);
    }
    next();
  };
};

/**
 * No-cache middleware for highly dynamic resources
 * Used for resources that should always be fetched fresh
 */
export const noCache = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  };
};

/**
 * Generate ETag and handle conditional requests
 * Useful for large resources that don't change frequently
 */
export const etagMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store the original json method
    const originalJson = res.json;
    
    // Override the json method
    res.json = function(body) {
      // Generate ETag from the JSON response
      const etag = require('crypto')
        .createHash('md5')
        .update(JSON.stringify(body))
        .digest('hex');
      
      // Set ETag header
      this.set('ETag', `"${etag}"`);
      
      // Check if client sent If-None-Match header
      const ifNoneMatch = req.get('If-None-Match');
      
      // If client has a matching ETag, return 304 Not Modified
      if (ifNoneMatch === `"${etag}"`) {
        return this.status(304).end();
      }
      
      // Otherwise, send the JSON response as usual
      return originalJson.call(this, body);
    };
    
    next();
  };
}; 