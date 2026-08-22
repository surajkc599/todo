# Local Development Setup

## Prerequisites

- **Docker Desktop** — https://www.docker.com/products/docker-desktop

## Quick Start

```bash
# From project root
docker-compose up
```

Wait for all services to start (1-2 minutes on first run).

## Access the App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Database:** localhost:5432

## Stop

```bash
docker-compose down
```

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Access database
docker-compose exec postgres psql -U postgres -d todo_v1

# Reset database (wipes data)
docker-compose down -v
docker-compose up
```

## Database

- User: `postgres`
- Password: `password`
- Database: `todo_v1`
- Tables auto-created on startup

That's it! 🚀
