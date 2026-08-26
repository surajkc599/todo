# Architecture Decisions: Why We Chose X

> This document explains the **why** behind our technical choices. For **how** to implement and use these technologies, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 1. Frontend Bundler: Vite
**Why:** Modern tooling, instant HMR, minimal config, TypeScript out-of-the-box

---

## 2. Backend Framework: Express.js
**Why:** Mature ecosystem, easy middleware, well-documented, proven for WebSockets (v2)

---

## 3. ORM: Prisma
**Why:** Auto-generated types, simple migrations, built-in connection pooling, less boilerplate

---

## 4. Styling: TailwindCSS
**Why:** Rapid development, utility-first, consistent design system, scales well

---

## 5. Input Validation: Both Frontend & Backend
**Why:** Frontend = instant UX feedback, Backend = security (never trust client)

---

## 6. API Design: REST
**Why:** Follows HTTP conventions, clean client code, less boilerplate, standard

---

## 7. HTTP Client: Fetch API
**Why:** No extra dependency, sufficient for v1, can upgrade to Axios in v2

---

## 8. Project Structure: Simple Folders (not monorepo)
**Why:** Simple setup, clear separation, easy independent deployment, minimal overhead

---

## 9. Data Model: Hierarchical (List → Task → SubTask)
**Why:** Natural organization for categories, one cascade delete, simple queries, fits family use case

---

## 10. Offline Support: Minimal (3 operations only)
**Why:** Simplicity. Edit/delete are most common. No new adds offline = no complexity. Full offline support deferred to v2.

---

## Notes for v2+

- **Real-time Collab:** Add WebSockets for live updates
- **Full Offline:** Support adding tasks offline with conflict resolution
- **User Accounts:** Add authentication and per-user lists
- **Advanced UI:** Drag-drop, markdown, rich formatting

**These are not permanent.** Revisit as the app evolves and real usage patterns emerge.
