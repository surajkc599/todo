# Todo App - Frontend (v1)

React + Vite frontend for the collaborative todo app with TailwindCSS styling.

## Quick Start

### Prerequisites
- Node.js 18+
- Backend running on `http://localhost:3001`

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Server runs on `http://localhost:5173`

### Environment Variables

Create `.env.local` file:
```env
VITE_API_URL=http://localhost:3001/api
```

## Features

- ✅ Create shareable todo lists
- ✅ Add items with prices
- ✅ Mark items as done
- ✅ Edit items inline
- ✅ Delete items
- ✅ Track total cost
- ✅ Copy share link
- ✅ Progress indicator

## Pages

**Landing Page** (`/`)
- Create new list
- View feature highlights

**List Page** (`/list/:id`)
- Add items (text + price)
- Edit items inline
- Mark items as done
- Delete items
- Share list
- View total cost & progress

## Tech Stack

- **Framework:** React 18
- **Bundler:** Vite
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **State:** React Hooks (useState, useEffect)

## Project Structure

```
src/
├── pages/           # Page components
├── components/      # Reusable UI components
├── utils/           # API client
├── types/           # TypeScript interfaces
├── styles/          # Global CSS (Tailwind)
├── App.tsx          # Router setup
└── main.tsx         # Entry point
```

## Key Components

- `LandingPage` - Entry point with "Create List" button
- `ListPage` - Main app with item management
- `AddItemForm` - Inline form to add items
- `ItemRow` - Item with edit/delete controls
- `ItemList` - Container for items
- `Toast` - Non-intrusive notifications

## API Integration

All API calls go through `src/utils/api.ts`:

```typescript
api.createList()              // Create new list
api.getList(id)               // Fetch list by ID
api.createItem(data)          // Add item
api.updateItem(listId, id, data)  // Edit item
api.deleteItem(listId, id)    // Remove item
```

## Docker

Run with Docker Compose (from root):
```bash
docker-compose up
```

Frontend accessible at `http://localhost:5173`

## Build for Production

```bash
npm run build
npm run preview
```

## Troubleshooting

**Backend connection fails:** Ensure backend is running on `localhost:3001`

**Port 5173 already in use:** Change Vite config port or stop other process

**Styles not loading:** Rebuild with `npm run dev` to regenerate Tailwind classes
