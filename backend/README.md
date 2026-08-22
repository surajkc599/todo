# Todo App - Backend (v1)

Express.js backend for the collaborative todo app with Prisma ORM and PostgreSQL.

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)

### Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Start development server
npm run dev
```

### Environment Variables

Create `.env` file:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/todo_v1"
NODE_ENV="development"
PORT=3001
API_BASE_URL="http://localhost:3001/api"
```

### API Documentation

**Interactive Swagger UI:** `http://localhost:3001/api-docs`

- Full OpenAPI 3.0 specification
- Try-it-out functionality
- Request/response examples
- Schema definitions

### API Endpoints

**Lists:**
- `POST /api/lists` - Create list
- `GET /api/lists/:id` - Get list with items

**Items:**
- `POST /api/lists/:id/items` - Add item
- `GET /api/lists/:id/items` - Get all items
- `PATCH /api/lists/:id/items/:itemId` - Update item
- `DELETE /api/lists/:id/items/:itemId` - Delete item

**Health:**
- `GET /health` - Server status

**Docs:**
- `GET /api-docs` - Swagger UI (interactive documentation)

## Tech Stack

- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Custom middleware

## Project Structure

```
src/
├── routes/          # API endpoints
├── services/        # Business logic
├── middleware/      # Error handling, CORS, logging
├── types/           # TypeScript interfaces
├── utils/           # Validation helpers
└── index.ts         # App entry point
```

## Docker

Run with Docker Compose (from root):
```bash
docker-compose up
```

Services:
- Backend: `http://localhost:3001`
- Database: `postgres:5432`

## Troubleshooting

**OpenSSL error:** Already fixed - Docker image installs required libraries.

**Migration issues:** Run `npm run prisma:migrate:dev --name init`

**Database won't connect:** Ensure PostgreSQL is running and `DATABASE_URL` is correct.
