/**
 * Input validation utilities for Todo App
 */

/**
 * Validates a create item request (group or sub-task)
 */
export function validateCreateItemRequest(data: unknown): {
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
  } else if (!/^[a-zA-Z0-9\s]+$/.test(obj.text)) {
    errors.push('Item text can only contain letters, numbers, and spaces');
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

  // Validate parentItemId if provided (optional, for sub-tasks)
  if (obj.parentItemId !== undefined && obj.parentItemId !== null) {
    if (typeof obj.parentItemId !== 'string') {
      errors.push('Parent item ID must be a string');
    } else if (!isValidUUID(obj.parentItemId)) {
      errors.push('Parent item ID must be a valid UUID');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an update item request
 */
export function validateUpdateItemRequest(data: unknown): {
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
    } else if (!/^[a-zA-Z0-9\s]+$/.test(obj.text)) {
      errors.push('Item text can only contain letters, numbers, and spaces');
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
 * Sanitize item text: only allow alphanumeric characters and spaces
 * Removes all special characters, HTML, and potential injection vectors
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    // Keep only alphanumeric and spaces
    .replace(/[^a-zA-Z0-9\s]/g, '')
    // Limit consecutive spaces
    .replace(/\s+/g, ' ');
}

/**
 * Validate if a string is a valid UUID v4
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
