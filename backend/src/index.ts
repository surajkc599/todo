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
import taskRoutes from './routes/tasks.js';
import subtaskRoutes from './routes/subtasks.js';
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

// Task routes: /api/lists/:listId/tasks
app.use(`${apiPrefix}/lists/:listId/tasks`, taskRoutes);

// SubTask routes: /api/lists/:listId/subtasks
app.use(`${apiPrefix}/lists/:listId/subtasks`, subtaskRoutes);

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
║   POST   /api/lists                - Create a new list
║   GET    /api/lists/:listId        - Get list with tasks
║   DELETE /api/lists/:listId        - Delete list
║
║   POST   /api/lists/:listId/tasks  - Create task
║   PATCH  /api/lists/:listId/tasks/:taskId - Update task
║   DELETE /api/lists/:listId/tasks/:taskId - Delete task
║
║   POST   /api/lists/:listId/subtasks - Create subtask
║   PATCH  /api/lists/:listId/subtasks/:subTaskId - Update subtask
║   DELETE /api/lists/:listId/subtasks/:subTaskId - Delete subtask
║
║ 📊 Health Check: GET /health
║ 📖 Swagger Docs: http://localhost:${PORT}/api-docs
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
