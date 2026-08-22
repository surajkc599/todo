/**
 * Request logging middleware
 * Logs incoming requests for debugging and monitoring
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Simple logging middleware that logs HTTP requests
 */
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, path, query } = req;

  // Log request details
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] ${method} ${path}`, query);

  // Capture original send function
  const originalSend = res.send;

  // Override send to log response details
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const status = res.statusCode;

    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}] Response: ${status} (${duration}ms)`);

    // Call original send
    return originalSend.call(this, data);
  };

  next();
};
