import { Request } from 'express';

/**
 * Standard pagination parameters interface
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Standard paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Extract pagination parameters from request query
 * @param req - Express request object
 * @param defaultLimit - Default number of items per page (defaults to 10)
 * @returns Pagination parameters
 */
export function getPaginationParams(req: Request, defaultLimit = 10): PaginationParams {
  // Get page and limit from query parameters
  const pageQuery = req.query.page;
  const limitQuery = req.query.limit;
  
  // Parse and validate page (default to 1)
  let page = typeof pageQuery === 'string' ? parseInt(pageQuery, 10) : 1;
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  
  // Parse and validate limit (default to defaultLimit)
  let limit = typeof limitQuery === 'string' ? parseInt(limitQuery, 10) : defaultLimit;
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  }
  // Cap limit at 100 to prevent excessive data fetching
  if (limit > 100) {
    limit = 100;
  }
  
  // Calculate skip for database query
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * Create a standardized paginated response
 * @param data - Array of items for the current page
 * @param totalItems - Total number of items across all pages
 * @param params - Pagination parameters used for the query
 * @returns Standardized paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const { page, limit } = params;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    data,
    meta: {
      currentPage: page,
      totalPages,
      itemsPerPage: limit,
      totalItems,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
} 