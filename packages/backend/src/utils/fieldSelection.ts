import { Request } from 'express';

/**
 * Interface for field selection options
 */
export interface FieldSelectionOptions {
  defaultFields: string[];
  allowedFields: string[];
  nestedFields?: Record<string, string[]>;
}

/**
 * Process field selection query parameters
 * @param req - Express request object
 * @param options - Field selection options
 * @returns Object with selected fields for Prisma select
 */
export function processFieldSelection(
  req: Request,
  options: FieldSelectionOptions
): Record<string, boolean | Record<string, boolean | any>> {
  const { defaultFields, allowedFields, nestedFields = {} } = options;
  
  // Extract fields parameter from query
  const fieldsParam = req.query.fields;
  let requestedFields: string[] = [];
  
  if (fieldsParam) {
    // Handle both comma-separated string and array formats
    if (typeof fieldsParam === 'string') {
      requestedFields = fieldsParam.split(',').map(f => f.trim()).filter(Boolean);
    } else if (Array.isArray(fieldsParam)) {
      requestedFields = fieldsParam.map(f => String(f).trim()).filter(Boolean);
    }
  }
  
  // If no fields specified, use defaults
  if (requestedFields.length === 0) {
    const selectObject: Record<string, boolean | Record<string, any>> = {};
    
    // Add default fields
    defaultFields.forEach(field => {
      if (field.includes('.')) {
        // Handle nested field (e.g., "category.name")
        const [parent, child] = field.split('.');
        if (!selectObject[parent]) {
          selectObject[parent] = { select: {} };
        }
        (selectObject[parent] as any).select[child] = true;
      } else {
        selectObject[field] = true;
      }
    });
    
    return selectObject;
  }
  
  // Process requested fields, filtering to only allowed fields
  const selectObject: Record<string, boolean | Record<string, any>> = {};
  
  requestedFields.forEach(field => {
    // Check if it's a nested field request (e.g., "category.name")
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      
      // Verify parent is allowed
      if (!allowedFields.includes(parent)) return;
      
      // Verify child is allowed for this parent
      if (nestedFields[parent] && !nestedFields[parent].includes(child)) return;
      
      // Add to select object
      if (!selectObject[parent]) {
        selectObject[parent] = { select: {} };
      }
      (selectObject[parent] as any).select[child] = true;
    } 
    // Simple field
    else if (allowedFields.includes(field)) {
      selectObject[field] = true;
    }
  });
  
  // Ensure id is always included (for references)
  if (!selectObject['id']) {
    selectObject['id'] = true;
  }
  
  return selectObject;
}

/**
 * Middleware for handling field selection
 * To be used after authentication middleware
 */
export function fieldSelectionMiddleware(options: FieldSelectionOptions) {
  return (req: Request, _: any, next: () => void) => {
    // Attach the field selection to the request object for later use
    (req as any).fieldSelection = processFieldSelection(req, options);
    next();
  };
} 