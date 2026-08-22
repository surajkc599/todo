# Architecture: v1 Implementation Guide

> **For the reasoning behind each tech choice (tradeoffs, alternatives, rationale), see [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md).**

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

### lists table
```sql
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### items table
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  text VARCHAR(255) NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_items_list_id ON items(list_id);
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
Response: { id: string }
```

#### Get a list with all items
```
GET /api/lists/:listId
Response: {
  id: string,
  createdAt: timestamp,
  items: [
    { id, text, done, price, createdAt },
    ...
  ]
}
```

#### Add item to list
```
POST /api/lists/:listId/items
Body: { text: string, price?: number }
Response: { id, text, done, price, createdAt }
```

#### Update item
```
PATCH /api/lists/:listId/items/:itemId
Body: { text?: string, done?: boolean, price?: number }
Response: { id, text, done, price, createdAt }
```

#### Delete item
```
DELETE /api/lists/:listId/items/:itemId
Response: 204 No Content
```

### Error Handling
- **404** — List or item not found
- **400** — Invalid request (missing fields, bad data)
- **500** — Server error (with error message)

---

## Frontend Architecture

### Component Structure
```
App
├── ListPage (main component)
│   ├── ItemInput (add new item)
│   ├── ItemList (render items)
│   │   └── ItemRow (single item)
│   └── TotalCost (display sum)
└── [error/loading states]
```

### State Management
```javascript
const [listId, setListId] = useState(null); // from URL params
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### Data Flow
1. App loads, extract `listId` from URL
2. Fetch list items from `GET /api/lists/:listId`
3. Render items locally
4. User adds/edits/deletes item → immediately update local state
5. Send POST/PATCH/DELETE to backend (fire-and-forget for v1)
6. If request fails, show error toast, optionally revert state

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
