/**
 * Todo App v1 - Express Backend
 * Entry point for the API server
 */

import 'dotenv/config';
import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { corsMiddleware } from './middleware/cors.js';
import { loggingMiddleware } from './middleware/logging.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import listRoutes from './routes/lists.js';
import itemRoutes from './routes/items.js';
import { swaggerSpec } from './swagger.js';

// Initialize Express app
const app: Express = express();

// Get configuration from environment
const PORT = parseInt(process.env.PORT || '3001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Configure Middleware (in order)
 */

// CORS middleware - must come before routes
app.use(corsMiddleware);

// Logging middleware
app.use(loggingMiddleware);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Documentation
 */

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * API Routes
 */

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// API v1 routes
const apiPrefix = '/api';

// List routes: /api/lists
app.use(`${apiPrefix}/lists`, listRoutes);

// Item routes: /api/lists/:listId/items
app.use(`${apiPrefix}/lists/:listId/items`, itemRoutes);

/**
 * Error Handling (must be last)
 */

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

/**
 * Start Server
 */

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║          Todo App Backend - Express Server                ║
╠═══════════════════════════════════════════════════════════╣
║ 🚀 Server running at: http://localhost:${PORT}
║ 📝 Environment: ${NODE_ENV}
║ 🔌 API Base URL: http://localhost:${PORT}/api
║
║ Available Endpoints:
║   POST   /api/lists/:id          - Create a new list
║   GET    /api/lists/:id          - Get list with items
║
║   POST   /api/lists/:id/items    - Create an item
║   PATCH  /api/lists/:id/items/:itemId - Update an item
║   DELETE /api/lists/:id/items/:itemId - Delete an item
║
║ 📊 Health Check: GET /health
║ ❗ NOTE: Database integration pending after \`npm install\`
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
