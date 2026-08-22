---
name: react-best-practices
description: Strict engineering guidelines for modern, client-side React development (Vite/CRA) omitting Next.js server-side logic.
---

## Core Architecture
- Use functional components with hooks. Never use class components.
- Favor standard CSS Modules, Tailwind CSS, or Styled Components for styling.
- Keep components small, modular, and focused on a single responsibility.
- Implement strict TypeScript interfaces for all component props.

## State Management & Data Fetching
- Do NOT fetch data directly inside a raw `useEffect` without cleanup logic.
- Use a dedicated library like TanStack Query (React Query) for server state and caching.
- Reserve `useState` strictly for local, UI-specific state.
- Use React Context only for global, low-frequency updates (e.g., themes, auth state).
- Avoid Context for high-frequency state updates to prevent global re-renders.

## Performance Optimization
- Never create new functions or objects inside `useEffect` dependency arrays.
- Use `useMemo` only for computationally expensive calculations, not basic primitive values.
- Use `useCallback` when passing callbacks to optimized child components to prevent breaking `React.memo`.
- Implement lazy loading for large route components using `React.lazy()` and `Suspense`.

## Code Style & Safety
- Use the functional updater form of `useState` (e.g., `setCount(c => c + 1)`) when the new state depends on the old one.
- Always add proper cleanup functions in `useEffect` for event listeners, intervals, and subscriptions.
- Ensure all components are strongly typed with TypeScript; avoid the `any` keyword entirely.
- Enforce strict exhaustive-deps linting rules for all React hooks.
