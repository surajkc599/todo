# Shared Todo App (v1)

A lightweight, collaborative todo list app for families. Create a list, share the link, manage items together.

## Quick Start

### With Docker (Recommended)

```bash
docker-compose up
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Database: PostgreSQL on `localhost:5432`

### Manual Setup

**Backend:**
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Features

✨ **Create Lists** - Click "Create New List" to start
🔗 **Share Instantly** - Copy link, share with anyone
💾 **Auto-Save** - Everything syncs to database
💰 **Track Costs** - Add prices to items
✅ **Collaborative** - Multiple people can edit same list
🎨 **Clean UI** - Minimal, modern design

## Project Structure

```
todo/
├── backend/              # Express + Prisma + PostgreSQL
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Error handling
│   │   └── types/        # TypeScript interfaces
│   ├── prisma/           # Database schema
│   └── README.md
│
├── frontend/             # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/        # LandingPage, ListPage
│   │   ├── components/   # ItemRow, AddItemForm, Toast
│   │   ├── utils/        # API client
│   │   └── types/        # TypeScript interfaces
│   └── README.md
│
├── docker-compose.yml    # Full stack setup
└── README.md            # This file
```

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (bundler)
- TailwindCSS (styling)
- React Router v6

**Backend:**
- Express.js + TypeScript
- Prisma ORM
- PostgreSQL
- CORS, logging middleware

## API Overview

All endpoints return JSON. Success = HTTP 200/201, Error = HTTP 400/404/500

**Lists:**
- `POST /api/lists` → Create list
- `GET /api/lists/:id` → Fetch list with items

**Items:**
- `POST /api/lists/:id/items` → Add item
- `PATCH /api/lists/:id/items/:itemId` → Update (text, price, done)
- `DELETE /api/lists/:id/items/:itemId` → Remove item

See [Backend README](backend/README.md) for full details.

## Code Quality

### Linting & Formatting

Both frontend and backend use ESLint + Prettier for code consistency.

**Frontend:**
```bash
npm run lint           # Check for issues
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format with Prettier
npm run format:check  # Check formatting without changes
```

**Backend:**
```bash
npm run lint           # Check for issues
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format with Prettier
npm run format:check  # Check formatting without changes
```

**Configuration:**
- `.eslintrc.json` - Linting rules
- `.prettierrc.json` - Formatting rules
- `.prettierignore` - Files to exclude

**Team workflow:**
1. Developers run `npm run lint:fix && npm run format` before committing
2. CI/CD runs `npm run lint` and `npm run format:check` on PRs
3. Consistent code style across all team members

## Development

### Add a Feature

1. **Backend:** Add route → Add service → Add database migration
2. **Frontend:** Add component → Call API → Handle response

### Environment Variables

**Backend** (`.env`):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/todo_v1"
NODE_ENV="development"
PORT=3001
```

**Frontend** (`.env.local`):
```env
VITE_API_URL=http://localhost:3001/api
```

## Documentation

- [Backend Guide](backend/README.md)
- [Frontend Guide](frontend/README.md)
- [Architecture Decisions](docs/ARCHITECTURE_DECISIONS.md)

## Version History

**v1 (Current):**
- Basic todo list management
- Share via URL
- Cost tracking
- Inline editing

**v2 (Planned):**
- User accounts
- List dashboard
- Real-time collaboration
- Drag & drop sorting
- Offline sync

## Troubleshooting

**Docker won't start?**
```bash
docker-compose down -v  # Remove volumes
docker-compose up       # Fresh start
```

**Port conflicts?**
- Backend: Change `PORT` in `.env`
- Frontend: Change Vite config
- Database: Change `docker-compose.yml`

**Database connection issues?**
- Ensure PostgreSQL container is running: `docker ps`
- Check `DATABASE_URL` matches compose config
- Run migrations: `npm run prisma:migrate:dev`

## License

MIT
