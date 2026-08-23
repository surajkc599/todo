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
🎯 **Organized Groups** - Create parent items (groups), add sub-tasks within each
💰 **Track Costs** - Add prices to groups and sub-tasks separately
📊 **Track Progress** - See completion status per group with Open/Completed tabs
✅ **Collaborative** - Multiple people can edit same list
🎨 **Clean UI** - Minimal, modern design with accordion organization

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
- `GET /api/lists/:id` → Fetch list with items (hierarchical: groups + sub-tasks)

**Items (Groups & Sub-tasks):**
- `POST /api/lists/:id/items` → Add group or sub-task
  - `text`: item name
  - `price`: optional cost (€)
  - `parentItemId`: optional (if provided, creates sub-task under parent group)
- `PATCH /api/lists/:id/items/:itemId` → Update (text, price, done status)
- `DELETE /api/lists/:id/items/:itemId` → Remove item (cascades: deleting group removes all sub-tasks)

**Response Format:**
Items are returned with `parentItemId` field. Frontend organizes them as:
- Groups: items with `parentItemId = null`
- Sub-tasks: items with `parentItemId` set

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

- [UX Design & Flows](docs/UX_DESIGN.md) — User interface, interactions, and design system
- [Project Roadmap](docs/PLAN.md) — v1/v2/v3 feature plans and requirements
- [Architecture Decisions](docs/ARCHITECTURE_DECISIONS.md) — Tech choices & tradeoffs
- [Hosting & Deployment](docs/HOSTING.md) — Vercel, Render/Railway, environment setup
- [Backend Guide](backend/README.md)
- [Frontend Guide](frontend/README.md)

## Version History

**v1 (Current):**
- Basic todo list management with hierarchical groups
- Groups: organize items into logical categories (e.g., Groceries, Hardware)
- Sub-tasks: add items within each group with individual costs
- Open/Completed tabs per group for better focus
- Share via URL
- Cost tracking at group and sub-task level
- Inline editing
- Progress tracking per group

**v2 (Planned):**
- Real-time collaboration (WebSocket live updates)
- Offline editing & sync
- Drag & drop reordering
- Better error handling with connection indicators

**v3 (Future):**
- User accounts & authentication
- List dashboard ("My Lists")
- Fine-grained permission management
- Markdown descriptions for tasks

## Troubleshooting

**Docker won't start?**
```bash
docker-compose down -v  # Remove volumes
docker-compose up       # Fresh start
```

## License

MIT
