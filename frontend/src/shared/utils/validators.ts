export interface ValidationError {
  isValid: boolean;
  message?: string;
}

export function validateTaskName(text: string): ValidationError {
  if (!text.trim()) {
    return { isValid: false, message: 'Name is required' };
  }
  if (!/^[a-zA-Z0-9\s]+$/.test(text)) {
    return { isValid: false, message: 'Only letters, numbers, and spaces allowed' };
  }
  if (text.length > 500) {
    return { isValid: false, message: 'Name must not exceed 500 characters' };
  }
  return { isValid: true };
}

export function validatePrice(price: number | ''): ValidationError {
  if (price === '') {
    return { isValid: true };
  }
  if (price < 0) {
    return { isValid: false, message: 'Price cannot be negative' };
  }
  return { isValid: true };
}

export function validateTaskInput(text: string, price: number | ''): ValidationError {
  const nameValidation = validateTaskName(text);
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  const priceValidation = validatePrice(price);
  if (!priceValidation.isValid) {
    return priceValidation;
  }

  return { isValid: true };
}
