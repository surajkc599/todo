# Plan: Collaborative Todo App

## Vision

Build a simple, reliable todo app for families to manage shared lists with zero friction and guaranteed data persistence.

**Target User:** Families managing shared lists (grocery shopping, household chores, meal planning)

**Core Problems:**
1. Persistence — Data must survive server restarts
2. Simplicity — Friction-free, intuitive interface
3. Sharing — Join lists with just a link, no signup

---

## v1: MVP Scope

**What We're Building:**
- ✅ Create tasks (categories/groups)
- ✅ Create subtasks (items within tasks)
- ✅ Mark items as done
- ✅ Delete tasks/subtasks
- ✅ Track cost per item
- ✅ Display totals
- ✅ Open/Completed tabs
- ✅ Share via unique link
- ✅ Accordion UI for task groups
- ✅ Offline editing (limited: edit/delete only, no adds)

**Data Model:**
```
List
  ├─ Task (category)
  │  ├─ name, price (budget)
  │  └─ SubTasks (items)
  │     ├─ text, price, done
  │     └─ timestamps
  └─ timestamps
```

**API Endpoints:**
```
POST   /api/lists                           → Create new list
GET    /api/lists/:id                       → Get list with tasks/subtasks
POST   /api/lists/:id/tasks                 → Create task
PATCH  /api/lists/:id/tasks/:taskId         → Update task
DELETE /api/lists/:id/tasks/:taskId         → Delete task (cascade)
POST   /api/lists/:id/subtasks              → Create subtask
PATCH  /api/lists/:id/subtasks/:subTaskId   → Update subtask
DELETE /api/lists/:id/subtasks/:subTaskId   → Delete subtask
```

**Out of Scope for v1:**
- ❌ Real-time collaboration
- ❌ User accounts / authentication
- ❌ Drag & drop reordering
- ❌ Markdown descriptions
- ❌ Full offline support (new adds)
- ❌ Rate limiting

---

## Tech Stack

| Component | Choice |
|-----------|--------|
| Frontend | React + TypeScript + Vite |
| Styling | TailwindCSS |
| State Management | React hooks |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL + Prisma |
| Hosting | Render (backend+DB) + Vercel (frontend) |
| Offline | Dexie (IndexedDB) for edit/delete queue |

---

## v2: Real-Time & Offline

- WebSockets for live collaboration
- Full offline editing with conflict resolution
- Drag & drop reordering
- Better error handling & connection status

---

## v3: User Accounts & Advanced

- User authentication & list ownership
- "My Lists" dashboard
- Fine-grained permissions
- Markdown descriptions

---

## Deployment

- **Frontend:** Vercel (free tier)
- **Backend + Database:** Render (free tier, 750 hrs/mo)
- **Total Cost:** $0/month

---

**These decisions are living.** Revisit as you learn from real usage.
