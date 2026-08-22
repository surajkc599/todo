# Plan: Collaborative Todo App

## Vision

Build a simple, reliable collaborative todo app for families to manage shared lists (grocery shopping, household tasks, meal planning, etc.) with zero friction and guaranteed data persistence.

### Target User
**Families managing shared lists** — coordinating grocery shopping, household chores, or meal planning together. Need simple sharing, no complicated login flows, and trust that data won't disappear.

### Core Problems We're Solving
1. **Persistence** — Family lists must survive server restarts. Data loss = loss of trust.
2. **Simplicity** — The app must be friction-free and intuitive. Families won't use complex tools.
3. **Sharing** — Anyone should be able to join a list with just a link. No signup required for v1.

### Design Principles
- **Ship fast** — Minimal viable scope. Get the core working, iterate based on real usage.
- **Fail open** — If internet drops, show "disconnected" gracefully. Don't pretend to work.
- **Data first** — Any doubt, add to the database. Persistence is non-negotiable.
- **Simple over sophisticated** — React hooks > Redux. REST > WebSockets for v1. One list per URL > user accounts in v1.

---

## MVP v1: Scope & Requirements

### What We're Building

**Core Features:**
- ✅ Create todo items — Users can add new tasks to a list
- ✅ Mark items as done — Check off completed tasks
- ✅ Delete items — Remove tasks from the list
- ✅ Cost/price per item — Track spending for each task (e.g., grocery prices)
- ✅ Display total cost — Show running sum of all items
- ✅ Share via unique link — Anyone with the link can view and edit
- ✅ Persistent storage — Data survives server restarts
- ✅ Simple list view — Uncluttered display

### Data Model

**Item:**
```
{
  id: string (UUID)
  listId: string (UUID)
  text: string
  done: boolean
  price: number | null
  createdAt: timestamp
}
```

**List:**
```
{
  id: string (UUID)
  createdAt: timestamp
}
```

### API Endpoints (REST)

```
POST   /api/lists                    → Create new list
GET    /api/lists/:listId            → Fetch list + items
POST   /api/lists/:listId/items      → Add item
PATCH  /api/lists/:listId/items/:id  → Update item
DELETE /api/lists/:listId/items/:id  → Delete item
```

### Out of Scope for v1
- ❌ Real-time collaboration (live updates from other users)
- ❌ Drag & drop reordering
- ❌ Sub-tasks
- ❌ Markdown descriptions
- ❌ Offline editing
- ❌ User accounts / authentication
- ❌ Permission management
- ❌ Rate limiting

---

## Strategic Decisions: Why We Made These Choices

### 1. No Authentication in v1
**Decision:** Anyone with the list URL can view and edit. No login required.

**Why:** Reduces friction. Families click a link, they edit. Done. No signup flows, no password resets. Simplicity over security for v1.

**Tradeoff:** Not suitable for sensitive data. But families share with trusted members only. v3 will add accounts and fine-grained permissions.

### 2. One List Per Share Link
**Decision:** Each list has a unique random ID (UUID). No user accounts or "my lists" dashboard in v1.

**Why:** Simpler for v1. No user management, no ownership complexity. Families can create multiple lists by sharing multiple links.

**Tradeoff:** v1 is stateless per user. Future versions will add accounts and dashboards.

### 3. PostgreSQL from Day One
**Decision:** Use a proper database (PostgreSQL) from v1, not file-based storage.

**Why:** Reliability. Families need confidence their data won't vanish. A real database provides that. Plus, no refactoring debt later.

### 4. REST API, Not WebSockets (v1)
**Decision:** v1 uses simple REST API. WebSockets added in v2 for real-time collab.

**Why:** Simplicity. Each API call is independent. No connection management, reconnection logic, or sync conflicts. Real-time isn't needed yet — families can refresh to see updates.

### 5. React Hooks for State Management
**Decision:** Use React's built-in `useState` and `useEffect`. No Redux, Context API, or libraries.

**Why:** Minimal. A single-page app with one list needs minimal state. No boilerplate. Can upgrade to Context API or Zustand in v2 if state grows complex.

### 6. Include Cost/Price in v1
**Decision:** Add a `price` field to items and display a running total. Ship in v1.

**Why:** Core to the use case. Grocery lists inherently need budgeting. Families care about total spend. Technically trivial (one field, one sum calculation).

### 7. Require Internet Connection (v1)
**Decision:** v1 does not support offline editing. If internet drops, show "disconnected" state.

**Why:** Simplicity. No local-first architecture, conflict resolution, or retry queues. Acceptable for v1 — most households have stable internet. Proper offline support comes in v2.

---

## v2: Real-Time Collab & Offline Support

### Features
- **Real-time collaboration** — Multiple users see each other's edits live
  - WebSocket connection + conflict resolution
  - User presence indicator
  
- **Drag & drop reordering** — Rearrange items on the list
  - Add `order` field to items
  
- **Offline editing & sync** — Edit when disconnected, sync when reconnected
  - Local-first architecture + optimistic updates
  - Queue changes while offline, resolve conflicts on sync
  
- **Better error handling** — Connection status indicators, auto-retry

### Why v2, Not v1?
- Real-time collab + offline sync add significant complexity (conflict resolution, queuing, retry logic)
- Families can live without it for v1 — eventual consistency is acceptable
- Splitting this allows v1 to ship fast and validate the core idea

---

## v3: Advanced Features & Accounts

### Features
- **Sub-tasks** — Break tasks into smaller steps with progress tracking
  - Tree structure (tasks → sub-tasks)
  
- **Markdown descriptions** — Rich text for task notes
  - Store markdown in database, render as HTML
  
- **User accounts & authentication** — Login system
  - Users create accounts, lists have owners
  - Users can belong to multiple lists
  
- **Permission management** — Fine-grained access control
  - Owner can invite collaborators
  - Collaborators can edit or view-only
  - Owner can revoke access

### Why v3, Not v1/v2?
- Sub-tasks and markdown are nice-to-haves, not core to family grocery lists
- Accounts add auth infrastructure and user management complexity
- v3 scales the app to teams, multi-user households, etc.

---

## Non-Goals for v1
- User accounts and authentication
- Real-time live collaboration (eventual consistency is OK)
- Offline editing/syncing
- Advanced features (markdown, cost budgeting beyond simple totals, sub-tasks)
- Rate limiting (trust-based, families won't abuse their own lists)
- Sophisticated error handling (simple messages are fine)

---

## Tech Stack (Quick Reference)

For full rationale behind each choice, see [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md).

| Component | Choice |
|-----------|--------|
| Frontend Bundler | Vite |
| Frontend Framework | React + TypeScript |
| Styling | TailwindCSS |
| HTTP Client | Fetch API |
| State Management | React hooks (useState) |
| Testing | Jest + React Testing Library |
| Backend Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Logging | Winston/Pino |
| Hosting | **Render** (backend+DB, free tier) + **Vercel** (frontend, free tier) |

## Deployment & Cost

**v1 Deployment Strategy:**
- **Frontend:** Vercel (free tier) — `yourtodo.vercel.app`
- **Backend + Database:** Render (free tier) — Included
- **Total Cost:** $0/month ✅

**Render Free Tier:** 750 hours/month (always-on instance) + Free PostgreSQL database included.

---

## What's Next?

1. **ARCHITECTURE.md** — Implementation guide (schema, API, deployment)
2. **ARCHITECTURE_DECISIONS.md** — Deep dive into each tech choice (why Vite, why Express, etc.)
3. Start building v1

---

**These decisions are living.** As you build v1 and learn from real usage, revisit this plan. Some choices will prove wise; others will need adjustment. That's expected and healthy.
