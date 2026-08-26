# Architecture: Implementation Guide

This document is a **how-to** guide for building and deploying the app.

> **Want to know WHY we chose each technology?** See [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) — it explains the reasoning behind each choice.

## Tech Stack

### Frontend
- **React** with TypeScript
- **Bundler:** Vite
- **Styling:** TailwindCSS
- **State Management:** React hooks (useState, useEffect)
- **HTTP Client:** Fetch API
- **Testing:** Jest + React Testing Library

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Testing:** Jest + Supertest
- **Logging:** Winston or Pino

### Deployment
- **Frontend:** Vercel
- **Backend + Database:** Render or Railway (all-in-one)
- **Environment Config:** .env files

---

## Database Schema

### Data Model
```
List
  ├─ Task (category/group)
  │  ├─ name, price (budget)
  │  ├─ description (markdown)
  │  └─ SubTasks (items)
  │     ├─ text, price, done
  │     └─ timestamps
  └─ timestamps
```

### Prisma Schema
```prisma
model List {
  id    String  @id @default(cuid())
  tasks Task[]
}

model Task {
  id          String    @id @default(cuid())
  listId      String
  text        String
  description String?
  price       Decimal?  @default(0)
  list        List      @relation(fields: [listId], references: [id], onDelete: Cascade)
  subtasks    SubTask[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([listId])
}

model SubTask {
  id        String   @id @default(cuid())
  taskId    String
  text      String
  price     Decimal? @default(0)
  done      Boolean  @default(false)
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([taskId])
}
```

---

## Backend API Design

### Base URL
```
/api
```

### Endpoints

#### Create a new list
```
POST /api/lists
Response: { id: string, tasks: [] }
```

#### Get a list (with pagination)
```
GET /api/lists/:listId?limit=5&offset=0
Response: {
  list: {
    id: string,
    tasks: [
      {
        id, text, description, price, createdAt,
        subtasks: [{ id, text, price, done, createdAt }, ...]
      },
      ...
    ]
  },
  pagination: { limit, offset, total, hasMore }
}
```

#### Create task
```
POST /api/lists/:listId/tasks
Body: { text: string, price?: number, description?: string }
Response: { id, text, price, description, subtasks: [], createdAt }
```

#### Update task
```
PATCH /api/lists/:listId/tasks/:taskId
Body: { text?: string, price?: number, description?: string }
Response: { id, text, price, description, subtasks, createdAt }
```

#### Delete task (cascade deletes subtasks)
```
DELETE /api/lists/:listId/tasks/:taskId
Response: 204 No Content
```

#### Create subtask
```
POST /api/lists/:listId/subtasks
Body: { taskId: string, text: string, price?: number }
Response: { id, taskId, text, price, done: false, createdAt }
```

#### Update subtask
```
PATCH /api/lists/:listId/subtasks/:subTaskId
Body: { text?: string, price?: number, done?: boolean }
Response: { id, taskId, text, price, done, createdAt }
```

#### Delete subtask
```
DELETE /api/lists/:listId/subtasks/:subTaskId
Response: 204 No Content
```

### Error Handling
- **404** — List or resource not found
- **400** — Invalid request (missing fields, bad data)
- **500** — Server error

---

## Frontend Architecture

### Component Structure
```
App
├── ListPage (main)
│   ├── Header (title, share button)
│   ├── ViewMode toggle (Active/Completed)
│   ├── GroupList (accordion)
│   │   └── GroupAccordion
│   │       ├─ Task header (delete, edit buttons)
│   │       └─ GroupTabs (Open/Completed)
│   │           └─ SubTaskItem
│   │               ├─ Checkbox (done)
│   │               ├─ Text (editable price)
│   │               └─ Delete button
│   ├── SyncIndicator (offline status)
│   └── Toast (notifications)
└── AddCategoryModal
```

### State Management
```javascript
const [list, setList] = useState(null);           // List + Tasks
const [allTasks, setAllTasks] = useState([]);    // Display tasks
const [viewMode, setViewMode] = useState('active'); // Active/Completed
const [isOnline, setIsOnline] = useState(true);  // Offline status
const [pendingCount, setPendingCount] = useState(0); // Queued ops
```

### Offline Support
- **Dexie (IndexedDB)** stores pending operations (edit/delete)
- **SyncEngine** processes queued ops when online
- **getMergedTasks()** combines server data with pending changes
- **Only 3 operations supported offline:**
  - Delete Task
  - Delete SubTask
  - Edit SubTask (price, done status)

### Data Flow
1. Load list: `GET /api/lists/:id?limit=5&offset=0`
2. Merge server data with pending offline operations
3. Render hierarchical UI (tasks with accordion, tabs for subtasks)
4. User action → Update local state (optimistic)
5. Send API request asynchronously
6. If offline: Queue operation in Dexie
7. If online: Auto-sync queued operations

---

## Hosting Strategy

See **[HOSTING.md](HOSTING.md)** for complete deployment strategy, platform setup, environment variables, and cost analysis.

**Quick Summary:**
- **Frontend:** Vercel (free tier)
- **Backend + Database:** Render or Railway (free tier, includes PostgreSQL)
- **Deployment:** Git-based auto-deploy, zero DevOps overhead

---

## Security Considerations (v1)

### No Authentication
- Anyone with the list ID can view and edit.
- v3 will add user accounts and permissions.
- **Important:** Advise users this is for trusted groups only (families, teammates).

### CORS
- Backend allows requests from frontend domain(s)
- **Development:** Allow `localhost:3000` or `localhost:5173`
- **Production:** Allow your frontend domain only

### Environment Variables
Required `.env` file (see `.env.example`):
```
DATABASE_URL=postgresql://user:password@host:5432/todo_v1
NODE_ENV=development
API_BASE_URL=http://localhost:3001/api
PORT=3001
```

### Input Validation
- Backend validates all inputs before persisting (text length, price range, format)
- Frontend validates for UX (instant feedback)
- Sanitize text to prevent XSS if rendering as HTML (good practice)

---

## Development Workflow

### Local Setup
```bash
# Backend
npm install
cp .env.example .env
npm run db:migrate
npm run dev

# Frontend
npm install
npm run dev
```

### Database Migrations
- Use Prisma Migrate for all schema changes
- Never modify schema directly in production
- **Development:** `npm run db:migrate` runs pending migrations
- **Production:** `npm run db:migrate:deploy` applies migrations safely

### Testing Strategy
- **Backend:** Unit tests for all API endpoints (Jest + Supertest)
- **Frontend:** Unit tests for components & hooks (Jest + React Testing Library)
- **Target Coverage:** 50-70% for v1, focus on critical paths
- **No E2E tests in v1** (add in v2 if needed)

---

## Related Documentation

- **[HOSTING.md](HOSTING.md)** — Deployment strategy, Vercel & Render setup, environment variables, cost analysis
- **[ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md)** — Deep dive into tech choices, tradeoffs, and alternatives for each decision
- **[PLAN.md](PLAN.md)** — Feature roadmap and vision for v1/v2/v3
- **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** — Project organization and file layout

---

## Deployment Checklist (v1 Release)
- [ ] Database migrations tested locally and in staging
- [ ] Environment variables configured (.env)
- [ ] Backend API tested with Postman/curl
- [ ] Frontend built and tested in production mode
- [ ] CORS configured correctly
- [ ] Error messages logged (backend logs accessible)
- [ ] Frontend error handling tested (network errors, timeouts)
- [ ] Database backups configured (if self-hosted)
