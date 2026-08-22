/**
 * CORS middleware configuration
 * Allows requests from frontend to access backend API
 */

import cors from 'cors';

/**
 * Configure CORS options
 */
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? [
          process.env.FRONTEND_URL || '',
          'https://todo-six-zeta-34.vercel.app'
        ].filter(Boolean) // Remove empty strings
      : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

/**
 * Export configured CORS middleware
 */
export const corsMiddleware = cors(corsOptions);
