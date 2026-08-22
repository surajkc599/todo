/**
 * Input validation utilities for Todo App
 */

/**
 * Validates a create item request
 */
export function validateCreateItemRequest(data: Record<string, unknown>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.text || typeof data.text !== 'string') {
    errors.push('Item text is required and must be a string');
  } else if (data.text.trim().length === 0) {
    errors.push('Item text cannot be empty');
  } else if (data.text.length > 500) {
    errors.push('Item text must not exceed 500 characters');
  }

  if (data.price !== undefined && data.price !== null) {
    const price = parseFloat(data.price);
    if (isNaN(price) || price < 0) {
      errors.push('Price must be a valid positive number');
    }
  }

  if (data.done !== undefined && typeof data.done !== 'boolean') {
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
export function validateUpdateItemRequest(data: Record<string, unknown>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (Object.keys(data).length === 0) {
    errors.push('At least one field must be provided for update');
  }

  if (data.text !== undefined) {
    if (typeof data.text !== 'string') {
      errors.push('Item text must be a string');
    } else if (data.text.trim().length === 0) {
      errors.push('Item text cannot be empty');
    } else if (data.text.length > 500) {
      errors.push('Item text must not exceed 500 characters');
    }
  }

  if (data.price !== undefined && data.price !== null) {
    const price = parseFloat(data.price);
    if (isNaN(price) || price < 0) {
      errors.push('Price must be a valid positive number');
    }
  }

  if (data.done !== undefined && typeof data.done !== 'boolean') {
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
