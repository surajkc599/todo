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
- ✅ Create groups — Organize items into logical categories (e.g., "Groceries", "Hardware")
- ✅ Create sub-tasks — Add items within each group
- ✅ Mark items as done — Check off completed sub-tasks
- ✅ Delete items — Remove sub-tasks or entire groups (cascade delete)
- ✅ Cost/price per item — Track spending for each group and sub-task independently
- ✅ Display total cost — Show running sum of all costs
- ✅ Open/Completed tabs — View only open items by default, toggle to see completed
- ✅ Share via unique link — Anyone with the link can view and edit
- ✅ Persistent storage — Data survives server restarts
- ✅ Accordion UI — Collapse/expand groups to reduce visual clutter

### Data Model

**Item (Group or Sub-task):**
```
{
  id: string (UUID)
  listId: string (UUID)
  text: string
  done: boolean
  price: number | null
  parentItemId: string (UUID) | null  // null = group, set = sub-task
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

**Data Structure:**
- Groups: Items with `parentItemId = null`
- Sub-tasks: Items with `parentItemId` pointing to a group
- Hierarchy depth: 1 level only (groups → sub-tasks, no further nesting)

### API Endpoints (REST)

```
POST   /api/lists                      → Create new list
GET    /api/lists/:listId              → Fetch list + items (hierarchical)

POST   /api/lists/:listId/items        → Add group or sub-task
                                          POST body: { text, price?, parentItemId? }
PATCH  /api/lists/:listId/items/:id    → Update item (text, price, done)
DELETE /api/lists/:listId/items/:id    → Delete item (cascade: deletes children)
```

**Item Creation:**
- Group: `POST /lists/:id/items` with `{ text: "Groceries", price: 50 }`
- Sub-task: `POST /lists/:id/items` with `{ text: "Milk", price: 3, parentItemId: "group-uuid" }`

**Response Format:**
All item endpoints return nested structure with `parentItemId` field for frontend organization.

### Out of Scope for v1
- ❌ Real-time collaboration (live updates from other users)
- ❌ Drag & drop reordering
- ❌ Markdown descriptions
- ❌ Offline editing
- ❌ User accounts / authentication
- ❌ List dashboard ("My Lists")
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
  - User presence indicator ("User A is editing...")
  
- **Drag & drop reordering** — Rearrange groups and sub-tasks
  - Add `order` field to items, sync drag events via WebSocket
  
- **Offline editing & sync** — Edit when disconnected, sync when reconnected
  - Local-first architecture + optimistic updates
  - Queue changes while offline, resolve conflicts on sync
  
- **Better error handling** — Connection status indicators, auto-retry
- **Undo/Redo** — Revert changes within a session

### Why v2, Not v1?
- Real-time collab + offline sync add significant complexity (conflict resolution, queuing, retry logic)
- Families can live without it for v1 — eventual consistency is acceptable
- Splitting this allows v1 to ship fast and validate the core idea

---

## v3: Advanced Features & Accounts

### Features
- **User accounts & authentication** — Login system
  - Users create accounts, lists have owners
  - Users can belong to multiple lists
  - Session management and password reset
  
- **List dashboard** — "My Lists" page showing all lists a user created/joined
  - See recent lists, starred favorites, search
  - Create new list from dashboard
  
- **Permission management** — Fine-grained access control
  - Owner can invite collaborators by email
  - Collaborators can have "edit" or "view-only" roles
  - Owner can revoke access, transfer ownership
  
- **Markdown descriptions** — Rich text for task notes
  - Store markdown in database, render as HTML
  - Support for checklists, links, formatting

### Why v3, Not v1/v2?
- Accounts add auth infrastructure and user management complexity
- v3 scales the app to teams, multi-user households, and unknown collaborators
- Markdown and advanced permissions are nice-to-haves, not core to initial use case

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

## Rollout Plan: Hierarchical Items Implementation

### Phase 1: Database Schema (Week 1)
- Add `parentItemId` field to Item model (nullable UUID)
- Add index on `parentItemId` for performance
- Add cascade delete rule (parent deletion removes children)
- Create Prisma migration: `prisma migrate dev --name add_hierarchical_items`

### Phase 2: Backend API (Week 1)
- Update item creation endpoint to accept `parentItemId` parameter
- Update item response to include `parentItemId` field
- Add validation: prevent circular relationships (item cannot be its own parent)
- Ensure cascade delete works correctly when deleting a group

### Phase 3: Frontend Components (Week 2)
- Build Accordion component (collapsible group header)
- Build Tabs component (Open / Completed tabs)
- Build AddGroupForm component (empty state, create first group)
- Build AddSubTaskForm component (inline form per group)
- Refactor ItemList to GroupList (organize items by parentItemId)

### Phase 4: Frontend Logic (Week 2)
- Organize backend response: separate groups (parentItemId = null) from sub-tasks
- Implement filtering: Open vs Completed tabs per group
- Calculate totals per group and overall
- Track progress (completed / total items)

### Phase 5: Testing (Week 2-3)
**Unit Tests:**
- Backend: Create group, create sub-task, update/delete operations, cascade delete
- Frontend: Organize items into hierarchy, tab filtering, cost calculation

**Integration Tests:**
- Full flow: Create list → Create group → Create sub-tasks → Toggle complete → Delete group (verify cascade)

**Manual Testing:**
- Empty state UX
- Create multiple groups
- Add/edit/delete sub-tasks
- Tab switching (Open/Completed)
- Keyboard navigation (Tab, Enter, Escape)
- Mobile responsiveness

### Phase 6: Deployment (Week 3)
- Deploy backend with new schema to Render
- Deploy frontend with new UI to Vercel
- Verify API responses include parentItemId
- Verify accordion/tabs render correctly

---

## Testing Checklist

### Backend Tests
- [ ] Create group (text only, optional price)
- [ ] Create sub-task with parentItemId
- [ ] Prevent sub-task creation with invalid parentItemId
- [ ] Update sub-task (text, price, done status)
- [ ] Delete sub-task (verify not cascade delete)
- [ ] Delete group (verify all sub-tasks cascade deleted)
- [ ] Fetch list (verify response includes parentItemId)
- [ ] Cost aggregation correct (sum of all levels)

### Frontend Tests
- [ ] Empty state shows form to create first group
- [ ] Create group works, appears in accordion
- [ ] Create multiple groups, all visible
- [ ] Click accordion chevron, group expands/collapses
- [ ] Click "Add sub-task", inline form appears
- [ ] Create sub-task, appears in Open tab
- [ ] Click checkbox on sub-task, moves to Completed tab
- [ ] Tab switching (Open/Completed) works
- [ ] Delete sub-task, removed from list
- [ ] Delete group, accordion removed
- [ ] Progress bar updates correctly
- [ ] Total cost updates correctly
- [ ] Keyboard navigation works (Tab, Enter, Escape)

---

**These decisions are living.** As you build v1 and learn from real usage, revisit this plan. Some choices will prove wise; others will need adjustment. That's expected and healthy.
