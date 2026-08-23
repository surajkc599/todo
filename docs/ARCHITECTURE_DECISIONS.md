# Architecture Decisions: Technical Choices & Tradeoffs

This document records every architectural decision made during the planning phase, including alternatives considered, tradeoffs, and the final outcome. Refer back to this when reconsidering choices or explaining decisions to future teammates.

---

## 1. Frontend Bundler: Vite

**Decision:** Use Vite for the React frontend build tool.

**Alternatives:**
- Create React App (CRA) — Simpler, batteries-included, but slower
- Webpack — Manual config, powerful but complex

**Tradeoffs:**
| Vite | CRA |
|------|-----|
| Fast dev server, instant HMR | Slower dev loop |
| Minimal config needed | Eject or live with defaults |
| Modern tooling | Older, more established |
| Less documentation for edge cases | Tons of tutorials |

**Decision Rationale:**
- v1 doesn't need CRA's batteries. Vite is faster and still simple.
- Fast feedback loop = faster development = faster to market.
- TypeScript works out of the box with Vite.

**Outcome:** ✅ Vite will be used for development and production builds.

---

## 2. Backend Framework: Express.js

**Decision:** Use Express.js for the Node.js backend.

**Alternatives:**
- Fastify — Faster, modern, but smaller ecosystem
- NestJS — Full-featured framework, but heavyweight for v1

**Tradeoffs:**
| Express | Fastify |
|---------|---------|
| Mature, widely known | Faster request handling |
| Largest middleware ecosystem | Built-in validation, plugins |
| Tons of tutorials, help available | Better async/await defaults |
| Works fine for v1 and v2 | Slightly cleaner for WebSockets |

**Decision Rationale:**
- Express is overkill for v1, but so is Fastify.
- Express's middleware ecosystem makes adding features simple.
- Upgrading to WebSockets in v2 via Socket.io is well-proven.
- More developers know Express, easier hiring/onboarding.

**Outcome:** ✅ Express.js with TypeScript will be used. Socket.io for v2 WebSockets.

**Note:** Fastify was considered for v2 but dismissed — Express + Socket.io is a proven real-time stack.

---

## 3. ORM: Prisma

**Decision:** Use Prisma for database queries and migrations.

**Alternatives:**
- TypeORM — More powerful, traditional ORM, steeper learning curve
- Raw `pg` library — Maximum control, but more code and manual everything
- No ORM — Raw SQL strings, risky for large apps

**Tradeoffs:**
| Prisma | TypeORM | Raw SQL |
|--------|---------|---------|
| Auto-generated types | Manual type definitions | No types |
| Simple query API | Complex, flexible API | Full control |
| Built-in migrations | Manual migration management | DIY migrations |
| Opinionated (good for v1) | Flexible (good for v3) | No opinions |

**Decision Rationale:**
- v1 has only 2 tables and basic CRUD. Prisma's simplicity wins.
- Auto-generated types + migrations save boilerplate.
- Built-in connection pooling. No extra config.
- Easy to migrate to TypeORM in v3 if complexity demands it.

**Outcome:** ✅ Prisma will be used for all database operations and schema migrations.

---

## 4. Frontend Styling: TailwindCSS

**Decision:** Use TailwindCSS for styling the React app.

**Alternatives:**
- CSS Modules — Scoped styles, prevents conflicts, more manual
- Plain CSS — Zero dependencies, full control, more boilerplate
- styled-components — CSS-in-JS, nice DX, adds runtime cost

**Tradeoffs:**
| TailwindCSS | CSS Modules | Plain CSS |
|-------------|-------------|-----------|
| Rapid UI building | Modular, scoped styles | Simple, no build step |
| Utility-first (opinionated) | More manual work | More code to write |
| Large CSS file (mitigated by tree-shaking) | Smaller CSS output | Depends on discipline |
| Great for consistent design | Requires design planning | Risk of inconsistency |

**Decision Rationale:**
- TailwindCSS lets us build a clean UI in hours, not days.
- Utility-first approach = fewer custom CSS files to maintain.
- Scales well as v2/v3 add features (dark mode, responsive, etc.).
- Learning curve is low for any developer.

**Outcome:** ✅ TailwindCSS will be used for all styling. Customization via `tailwind.config.js`.

---

## 5. Input Validation: Both Frontend & Backend

**Decision:** Validate user input on both frontend (UX) and backend (security).

**Alternatives:**
- Frontend only — Better UX but no security
- Backend only — Secure but poor UX (slow feedback)
- No validation — Risky, but fastest to ship

**Tradeoffs:**
| Both | Frontend Only | Backend Only |
|------|---------------|--------------|
| Better UX + security | Great UX, insecure | Secure, poor UX |
| Slightly more code | Less code | More code |
| Rules defined in one place (shared types) | Duplicated logic | Duplicated logic |

**Decision Rationale:**
- Frontend validation = instant feedback (item text length, price format).
- Backend validation = security (never trust client, prevent SQL injection).
- Share validation rules via TypeScript types to avoid duplication.

**Outcome:** ✅ Validation rules defined in shared TypeScript types. Frontend & backend both validate before acting.

---

## 6. Logging: Structured Logging

**Decision:** Use structured logging (Winston or Pino) from day one.

**Alternatives:**
- Console.log only — Free, but logs are hard to grep in production
- No logging — Dangerous for debugging production issues
- Full observability (Sentry, DataDog) — Overkill and expensive for v1

**Tradeoffs:**
| Structured Logs | Console.log | No Logging | Sentry/DataDog |
|-----------------|-------------|-----------|----------------|
| Parseable in prod | Simple locally | Can't debug | Full visibility |
| One more dependency | Zero setup | Blind in prod | Costs money, complexity |
| Pays off in prod | Useless in prod | — | Over-engineered |

**Decision Rationale:**
- Console.log is fine locally. In production, logs are hard to parse.
- Winston/Pino add minimal overhead (one package, ~10 lines setup).
- When a user reports a bug, structured logs let us replay the issue.
- Sentry is unnecessary for v1 (add in v2 if needed).

**Outcome:** ✅ Winston or Pino will be integrated for structured logging (JSON format). Logs written to stdout for container/platform capture.

---

## 7. Rate Limiting: None in v1

**Decision:** No rate limiting in v1.

**Alternatives:**
- Simple rate limiting — Max requests per IP/hour
- Sophisticated rate limiting — Per-endpoint, sliding windows, multiple strategies
- None — Skip for v1

**Tradeoffs:**
| No Rate Limiting | Simple | Sophisticated |
|------------------|--------|---------------|
| Simplest code | Protects against spam | Full protection |
| Works for v1 (trusted families) | Adds complexity | Complex state management |
| No extra dependencies | Redis needed for accuracy | Expensive infrastructure |
| Vulnerable to abuse (unlikely) | Mitigates bot attacks | Professional-grade |

**Decision Rationale:**
- v1 is families sharing lists. No anonymous users, no bot risk.
- Rate limiting adds complexity (IP tracking, caching, state).
- Families won't abuse their own lists.
- If bot spam becomes an issue, add in v2. Easy to retrofit.

**Outcome:** ✅ No rate limiting in v1. Revisit if abuse occurs.

---

## 8. Testing: Unit Tests on Both Backend & Frontend

**Decision:** Write unit tests for both backend and frontend. Skip E2E tests in v1.

**Alternatives:**
- Manual testing only — Fastest to v1, risky
- Backend unit tests only — Catches API bugs, but broken UI ships
- Unit + E2E tests — Thorough, but slow to write
- E2E tests only — Tests real flows, but fragile and slow

**Tradeoffs:**
| Unit BE+FE | Unit BE Only | Manual Only | Unit + E2E |
|-----------|------------|------------|-----------|
| Good coverage, fast | Backend protected | Fast to v1, risky | Most thorough, slowest |
| No E2E flakiness | Frontend untested | Can't refactor safely | E2E maintenance burden |
| ~50-70% coverage | ~50% coverage | 0% coverage | ~95% coverage |

**Decision Rationale:**
- Backend unit tests catch validation, database, and API bugs (high ROI).
- Frontend unit tests catch component logic bugs (low-medium ROI).
- E2E tests are slow to write and fragile for v1. Add in v2.
- Tests let you refactor safely later.

**Outcome:** ✅ Jest will be used for both frontend and backend unit tests. React Testing Library for component tests. Supertest for API endpoint tests.

---

## 9. Database Connection Pooling: Prisma Defaults

**Decision:** Use Prisma's built-in connection pooling. No manual configuration.

**Alternatives:**
- Manual pool config — Tune min/max connections for expected load
- Prisma defaults — Prisma manages it automatically
- No pooling — Open a connection per request (bad)

**Tradeoffs:**
| Prisma Defaults | Manual Config | No Pooling |
|-----------------|---------------|-----------|
| Sensible defaults | Fine-tuned for load | Simple but inefficient |
| No tuning needed for v1 | Requires profiling | Slow, wastes connections |
| Can adjust in v2 if needed | More control | Breaks at scale |

**Decision Rationale:**
- Prisma's default pool (20-30 connections) is fine for v1.
- v1 won't hit connection limits. Families aren't generating massive traffic.
- If v2 profiling shows bottlenecks, tune the pool. Not needed now.

**Outcome:** ✅ Prisma connection pooling will be used as-is. No manual `.env` config needed.

---

## 10. Hosting: All-in-One Platform (Render/Railway)

**Decision:** Deploy backend + database on a single platform (Render or Railway). Frontend on Vercel.

**Alternatives:**
- Split services — Frontend on Vercel, backend on separate provider
- Self-hosted VPS — Full control, but manage everything
- Serverless (Lambda, Cloud Functions) — Expensive for always-on app

**Tradeoffs:**
| All-in-One | Split Services | Self-Hosted VPS | Serverless |
|-----------|---|---|---|
| One dashboard | More flexibility | Full control | Pay-per-request |
| Simple deploy | Slightly more setup | High ops burden | Cold starts (bad) |
| Free tier (easy) | Free tiers on each | Cheapest at scale | Expensive for v1 |
| Less control | More control | Maximum control | Minimal control |

**Decision Rationale:**
- Render/Railway offer free tiers for backend + PostgreSQL. One invoice.
- No DevOps overhead. One-command deploys.
- Vercel handles frontend separately (standard practice).
- If v2/v3 need scaling, migrate infrastructure then. Easy to move.

**Outcome:** ✅ Backend + DB on Render or Railway (TBD which platform). Frontend on Vercel.

---

## 11. Environment Variables: Standard Config

**Decision:** Configure v1 with standard environment variables.

**Alternatives:**
- Minimal — Only `DATABASE_URL`, `NODE_ENV`
- Standard — Add `API_BASE_URL`, `PORT` for dev/prod separation
- Comprehensive — Feature flags, logging levels, feature toggles

**Tradeoffs:**
| Standard | Minimal | Comprehensive |
|----------|---------|---------------|
| Future-proof | Simplest | Over-engineered |
| Clear separation (dev/prod) | Hardcoded base URLs | Overkill for v1 |
| Not over-engineered | Won't scale | Maintenance burden |

**Decision Rationale:**
- Minimal doesn't support dev/prod separation cleanly.
- Standard lets us run locally (localhost:3001) and production (yourdomain.com) seamlessly.
- Comprehensive adds config we don't need yet. Keep it simple.

**Outcome:** ✅ `.env` will contain: `DATABASE_URL`, `NODE_ENV`, `API_BASE_URL`, `PORT`. Documented in `.env.example`.

---

## 12. API Response Format: Simple REST

**Decision:** Use simple REST responses. No wrapper envelope.

**Alternatives:**
- Envelope format — `{ success: true, data: [...], error: null }`
- Problem Details (RFC 7807) — Standardized error responses
- Simple REST — Just return data; errors are HTTP status codes

**Tradeoffs:**
| Simple REST | Envelope | Problem Details |
|-------------|----------|-----------------|
| Clean, follows HTTP norms | Explicit success/failure | Standards-compliant |
| Less code (client & server) | Wrapper overhead | Overkill for v1 |
| Standard (easy to use) | Clear intent | More code |

**Decision Rationale:**
- HTTP status codes already communicate success/failure (200, 400, 500).
- REST conventions are clear: GET `/items` returns array, DELETE `/items/:id` returns 204.
- No need to wrap data in extra envelope.
- Frontend code is simpler: `response.json()` → use the data directly.

**Outcome:** ✅ API will follow REST conventions. No envelope wrapper.

---

## 13. HTTP Client: Fetch API

**Decision:** Use the built-in Fetch API for HTTP requests from React.

**Alternatives:**
- Axios — Popular, nicer API, requires dependency
- jQuery AJAX — Outdated
- Fetch API — Built-in, modern, sufficient

**Tradeoffs:**
| Fetch | Axios |
|-------|-------|
| Built-in (no dependency) | More ergonomic (auto JSON stringify) |
| Works great for v1 | Interceptors (useful in v2) |
| Slightly more verbose | Slightly shorter syntax |
| Modern, standard | Popular, battle-tested |

**Decision Rationale:**
- Fetch is built-in, no extra package needed.
- Can upgrade to Axios in v2 if we need interceptors (request/response middleware).
- For v1's simple CRUD, Fetch is plenty.
- Reduces bundle size by skipping an external dependency.

**Outcome:** ✅ Fetch API will be used. Wrapped in a custom hook (`useFetch` or similar) to centralize error handling and loading states.

---

## 14. Frontend State Updates: Pessimistic

**Decision:** Use pessimistic updates. Wait for server response before updating UI.

**Alternatives:**
- Optimistic updates — Update UI immediately, revert if server fails
- Hybrid — Optimistic for some actions, pessimistic for others
- Pessimistic — Always wait for server

**Tradeoffs:**
| Pessimistic | Optimistic | Hybrid |
|------------|-----------|--------|
| Predictable, always correct | Snappy, responsive | More complex logic |
| Loading spinners (slightly slower UX) | Requires revert logic | Hard to reason about |
| Easy to implement & test | Harder to debug | More edge cases |
| Doesn't need offline sync | Needs offline queue (v2) | More code |

**Decision Rationale:**
- v1 doesn't need real-time snappiness. Families can wait 200ms for a request.
- Pessimistic logic is straightforward: click → show loading → update UI.
- Avoids complex revert scenarios (what if delete fails?).
- In v2, when WebSockets launch, upgrade to optimistic for better UX.

**Outcome:** ✅ All frontend updates will use pessimistic pattern. Show loading spinner, wait for response, then update UI.

---

## 15. Database Migrations: Prisma Migrate

**Decision:** Use Prisma Migrate for schema versioning and migrations.

**Alternatives:**
- Manual SQL migrations — Write `.sql` files, track in git, run custom scripts
- Flyway or Liquibase — Dedicated migration tools (overkill)
- No migrations — Manual schema changes (risky)

**Tradeoffs:**
| Prisma Migrate | Manual SQL | No Migrations |
|---|---|---|
| Automatic, version controlled | Full control, error-prone | Fast initially, risky |
| Works with ORM | Separate from ORM | Unmaintainable |
| Built-in rollback support | Manual rollbacks | No rollback |
| Type-safe (via Prisma schema) | Not type-safe | — |

**Decision Rationale:**
- Prisma Migrate integrates with our ORM choice (Prisma).
- Automatic versioning prevents accidental schema conflicts.
- Built-in rollback support (important for v2/v3 fast iteration).
- No extra dependency — comes with Prisma.

**Outcome:** ✅ `prisma migrate dev` for local development. `prisma migrate deploy` for production. Migrations tracked in `prisma/migrations/`.

---

## Summary: Tech Stack & Rationale

| Component | Choice | Why |
|-----------|--------|-----|
| Frontend Bundler | Vite | Fast, modern, minimal config |
| Frontend Framework | React + TypeScript | Team familiar, Vite integrates well |
| Styling | TailwindCSS | Rapid UI, consistent design |
| HTTP Client | Fetch API | Built-in, sufficient for v1 |
| State Management | React hooks | No extra complexity for v1 |
| Backend Framework | Express.js | Mature, middleware ecosystem, proven for v2 WebSockets |
| Database | PostgreSQL | Reliable, scalable, standard |
| ORM | Prisma | Auto-types, simple migrations, connection pooling included |
| Validation | Both FE & BE | UX + security |
| Testing | Jest + React Testing Library + Supertest | Standard, works for both FE & BE |
| Logging | Winston/Pino | Structured, parseable in production |
| Hosting | Render/Railway + Vercel | Simple, free tier, one-command deploys |
| Environment Config | .env files | Standard, future-proof |
| API Design | REST | HTTP-native, follows conventions |
| Database Migrations | Prisma Migrate | Automatic, version controlled |

---

## When to Reconsider These Decisions

- **After v1 ships:** If real users struggle with UX (loading spinners too slow?), consider optimistic updates in v2.
- **If complexity grows:** If state management becomes unwieldy, migrate to Context API or Zustand.
- **At v2 scale:** If server load spikes, consider Fastify or Deno. But Express will handle moderate load fine.
- **For real-time features:** v2's WebSockets will require revisiting some frontend decisions (optimistic updates, offline sync).
- **If hiring grows:** More developers might have Fastify/TypeORM experience. Revisit in v3.

---

## 16. Project Structure: Simple Folders vs Monorepo

**Decision:** Use simple folder structure (`/frontend` and `/backend` in one repo), not NX monorepo.

**Alternatives:**
- **Simple folders** (chosen) — Two folders in one repo
- **NX monorepo** — Advanced monorepo with shared libraries
- **Two separate repos** — Frontend and backend in different repos

**Tradeoffs:**

| Simple Folders | NX Monorepo | Two Repos |
|---|---|---|
| Easy to set up | Complex setup, steep learning curve | More friction to coordinate |
| Clear separation | Advanced tooling overhead | Hard to share code |
| Can deploy independently | Over-engineered for v1 | Separate CI/CD pipelines |
| Minimal overhead | Shared code/types (not needed yet) | Difficult to test together |
| Easy to migrate later | Harder to simplify later | Harder to refactor together |

**Decision Rationale:**
- v1 is MVP — minimize complexity and tooling
- No shared code between FE and BE yet (each has own types/utils)
- If v2 needs shared utilities, easy to extract into `/libs` folder
- Docker-compose orchestrates both services seamlessly
- One git repo is simpler than two

**Upgrade path:** If v2 adds significant shared code (types, utilities, validation), can add `/libs` folder without changing deployment or tooling.

**When to reconsider:** If frontend and backend need extensive shared code (shared validators, types, utilities), migrate to a simple shared `/libs` structure or full monorepo. But this is unlikely for v1/v2 scope.

---

## 17. Data Model: Hierarchical Items (Groups & Sub-tasks)

**Decision:** Use hierarchical items with `parentItemId` field. Groups (parent = null) contain sub-tasks (parent = group ID). Max nesting: 1 level deep.

**Alternatives:**
- **Flat items** — All items at same level, no grouping
- **Hierarchical (chosen)** — Items have optional `parentItemId` for parent-child relationships
- **Full tree structure** — Unlimited nesting (groups → sub-groups → items → etc.)

**Tradeoffs:**

| Hierarchical (1 level) | Flat | Full Tree |
|---|---|---|
| Organized, scannable UX | Simpler schema | Maximum flexibility |
| One cascade delete (groups → children) | No cascade complexity | Complex recursion queries |
| Easy to query (one join) | Simpler queries | Expensive queries (recursive CTEs) |
| Sufficient for family lists | Works if lists stay small | Overkill for v1 |
| Clear group-level costs | No grouping | Complex cost aggregation |

**Decision Rationale:**
- Families naturally organize lists into categories (Groceries, Hardware, Chores)
- One level of nesting (groups → sub-tasks) is sufficient; no need for unlimited depth
- Keeps queries simple: `items WHERE parentItemId = null` for groups, `items WHERE parentItemId = groupId` for sub-tasks
- Cascade delete is straightforward: deleting a group auto-deletes its sub-tasks
- UX is cleaner: accordion UI shows groups, tabs show Open/Completed sub-tasks per group

**Implementation:**
- Item schema: Add nullable `parentItemId` field pointing to another item's UUID
- Index on `parentItemId` for fast child lookups
- Cascade delete rule: If parent item deleted, all children deleted automatically
- API: Single endpoint accepts `parentItemId` param. Frontend organizes response into hierarchy.

**Schema Change:**
```prisma
model Item {
  id           String   @id @default(uuid())
  listId       String
  text         String
  done         Boolean  @default(false)
  price        Decimal?
  parentItemId String?  // NEW: null = group, set = sub-task
  
  list         List     @relation(fields: [listId], references: [id], onDelete: Cascade)
  parent       Item?    @relation("ChildItems", fields: [parentItemId], references: [id], onDelete: Cascade)
  children     Item[]   @relation("ChildItems")
  
  @@index([listId])
  @@index([parentItemId])  // NEW: for fast child lookups
}
```

**Outcome:** ✅ Hierarchical items with `parentItemId`. 1-level nesting (groups → sub-tasks). Cascade delete on parent deletion.

---

**These decisions are not permanent.** They're optimal for v1. As the app grows and real usage patterns emerge, revisit this document and adjust.
