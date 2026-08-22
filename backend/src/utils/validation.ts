/**
 * Input validation utilities for Todo App
 */

/**
 * Validates a create item request
 */
export function validateCreateItemRequest(
  data: unknown
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    errors.push('Request body must be an object');
    return { isValid: false, errors };
  }

  const obj = data as Record<string, unknown>;

  if (!obj.text || typeof obj.text !== 'string') {
    errors.push('Item text is required and must be a string');
  } else if (obj.text.trim().length === 0) {
    errors.push('Item text cannot be empty');
  } else if (obj.text.length > 500) {
    errors.push('Item text must not exceed 500 characters');
  }

  if (obj.price !== undefined && obj.price !== null) {
    const price = parseFloat(String(obj.price));
    if (isNaN(price) || price < 0) {
      errors.push('Price must be a valid positive number');
    }
  }

  if (obj.done !== undefined && typeof obj.done !== 'boolean') {
    errors.push('Done flag must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an update item request
 */
export function validateUpdateItemRequest(
  data: unknown
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    errors.push('Request body must be an object');
    return { isValid: false, errors };
  }

  const obj = data as Record<string, unknown>;

  if (Object.keys(obj).length === 0) {
    errors.push('At least one field must be provided for update');
  }

  if (obj.text !== undefined) {
    if (typeof obj.text !== 'string') {
      errors.push('Item text must be a string');
    } else if (obj.text.trim().length === 0) {
      errors.push('Item text cannot be empty');
    } else if (obj.text.length > 500) {
      errors.push('Item text must not exceed 500 characters');
    }
  }

  if (obj.price !== undefined && obj.price !== null) {
    const price = parseFloat(String(obj.price));
    if (isNaN(price) || price < 0) {
      errors.push('Price must be a valid positive number');
    }
  }

  if (obj.done !== undefined && typeof obj.done !== 'boolean') {
    errors.push('Done flag must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize item text to prevent injection attacks
 */
export function sanitizeText(text: string): string {
  return text.trim().replace(/[<>]/g, '');
}
