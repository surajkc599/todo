/**
 * Global error handling middleware
 * Catches and formats all errors for consistent API responses
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof SyntaxError) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  const errorResponse: ApiResponse<null> = {
    error: message,
    ...(process.env.NODE_ENV === 'development' && { message: err.message }),
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  const errorResponse: ApiResponse<null> = {
    error: `Route not found: ${req.method} ${req.path}`,
  };

  res.status(404).json(errorResponse);
};
