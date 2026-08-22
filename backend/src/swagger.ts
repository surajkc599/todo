// @ts-expect-error - swagger-jsdoc doesn't have type definitions
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shared Todo App API',
      version: '1.0.0',
      description: 'REST API for collaborative todo lists with cost tracking',
      contact: {
        name: 'Todo App Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        List: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique list identifier (auto-generated)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when list was created',
            },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/Item' },
              description: 'Items in this list',
            },
          },
        },
        Item: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique item identifier',
            },
            listId: {
              type: 'string',
              format: 'uuid',
              description: 'Parent list ID',
            },
            text: {
              type: 'string',
              description: 'Item description',
            },
            done: {
              type: 'boolean',
              description: 'Whether item is completed',
            },
            price: {
              type: 'number',
              nullable: true,
              description: 'Item cost (optional)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Detailed error info (development only)',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
