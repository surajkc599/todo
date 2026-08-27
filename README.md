# Shared Todo App (v1)

A lightweight, collaborative todo list app for families. Create a list, share the link, manage items together.

## Features Implemented

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

## Testing

⚠️ **Note**: Unit tests and integration tests are **out of scope** for this take-home assignment.

### For Production Code (Mandatory)

However, production-ready code **must include**:

#### Frontend Tests
- **Unit Tests**: Component logic, hooks, utilities, calculations
  - Tool: Vitest + React Testing Library
  - Coverage target: >80% for business logic
- **Integration Tests**: Component interactions, form submissions, API integration
  - Tool: Playwright or Cypress for E2E
  - Coverage: Critical user flows

#### Backend Tests
- **Unit Tests**: Business logic, calculations, transformations
  - Tool: Jest
  - Coverage target: >80%
- **Integration Tests**: API endpoints, database operations
  - Tool: Supertest + Jest
  - Coverage: All endpoints with valid/invalid inputs

#### Critical Paths to Test
✅ **Frontend:**
- List creation and sharing
- Task/SubTask CRUD operations
- Offline queue operations and sync
- Form validation
- View mode toggle (Active/Completed)
- Budget calculations

✅ **Backend:**
- List endpoints (POST, GET, PATCH)
- Task endpoints (CRUD operations)
- SubTask endpoints (CRUD operations)
- Cascade delete behavior
- Pagination logic
- Input validation & error handling

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

**v2 (Out of scope):**
- Real-time collaboration (WebSocket live updates)
- Offline editing & sync
- Drag & drop reordering
- Better error handling with connection indicators

**v3 (Future):**
- User accounts & authentication
- List dashboard ("My Lists")
- Fine-grained permission management
- Markdown descriptions for tasks

## Documentation

- [UX Design & Flows](docs/UX_DESIGN.md) — User interface, interactions, and design system
- [Project Roadmap](docs/PLAN.md) — v1/v2/v3 feature plans and requirements
- [Architecture Decisions](docs/ARCHITECTURE_DECISIONS.md) — Tech choices & tradeoffs
- [Hosting & Deployment](docs/HOSTING.md) — Vercel, Render/Railway, environment setup
- [Backend Guide](backend/README.md)
- [Frontend Guide](frontend/README.md)

## License

MIT
