/**
 * Input validation utilities for Todo App
 */

const TEXT_PATTERN = /^[a-zA-Z0-9\s\-'&,.!?()]+$/;

/**
 * Validates a create task request
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
    errors.push('Text is required and must be a string');
  } else if (obj.text.trim().length === 0) {
    errors.push('Text cannot be empty');
  } else if (!TEXT_PATTERN.test(obj.text)) {
    errors.push('Text contains invalid characters. Allowed: letters, numbers, spaces, and basic punctuation (-, \', &, ,, ., !, ?, (), )');
  } else if (obj.text.length > 500) {
    errors.push('Text must not exceed 500 characters');
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
 * Validates an update task request
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
      errors.push('Text must be a string');
    } else if (obj.text.trim().length === 0) {
      errors.push('Text cannot be empty');
    } else if (!TEXT_PATTERN.test(obj.text)) {
      errors.push('Text contains invalid characters. Allowed: letters, numbers, spaces, and basic punctuation (-, \', &, ,, ., !, ?, (), )');
    } else if (obj.text.length > 500) {
      errors.push('Text must not exceed 500 characters');
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
 * Sanitize text: remove only dangerous characters while allowing punctuation
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    // Remove HTML/script injection attempts
    .replace(/[<>{}]/g, '')
    // Remove multiple consecutive spaces
    .replace(/\s+/g, ' ');
}

/**
 * Validate if a string is a valid UUID v4
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
