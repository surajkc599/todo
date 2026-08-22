# UX/UI Designs - Todo App v1

## Overview
Static mockups of the landing page and list page for the collaborative todo app.

## Design Files

### Landing Page
- **Purpose:** Entry point for new users
- **Key Elements:**
  - Minimal header ("Shared Todo")
  - Large "Create List" button
  - Simple value prop

### List Page
- **Purpose:** Main app interface where users manage todos
- **Key Elements:**
  - List header with "Share" button
  - Add item form (text + price input)
  - Todo items list (checkbox, text, price, delete)
  - Total cost display at bottom
  - Progress indicator (items done / total)

## Design System

### Colors
- **Primary (Blue):** #2563eb — Actions, buttons, links
- **Success (Green):** #10b981 — Add/positive actions
- **Danger (Red):** #ef4444 — Delete actions
- **Background:** #f8fafc — Light, neutral background
- **Text:** #0f172a — Dark, primary text

### Typography
- **Font Family:** System UI (-apple-system, BlinkMacSystemFont, Segoe UI)
- **Heading:** 28–48px, weight 700
- **Body:** 14px, weight 400–600
- **Caption:** 12–13px, weight 400

### Spacing
- **Gap between items:** 8px (tight), 12px (buttons), 16px–24px (sections)
- **Padding:** 16–20px in containers

### Components
- **Button:** Flat, no shadow. 8px border-radius
- **Input:** 10px padding, 6px border-radius, light border
- **Card:** White background, 8px radius, 1px border
- **Checkbox:** 20px size, default browser style

## Development Notes

1. **Landing Page Simplicity** — No feature cards. Just title + button. Reduces friction.
2. **Share Button** — High priority in list page header. Easy access to copy/share link.
3. **Cost Tracking** — Always visible (price column in items, total at bottom).
4. **Progress Indicator** — Shows how many items are done (helps with motivation).
5. **Delete & Checkbox** — Simple, no confirmation dialogs (can add later in v2).

## Next Steps

1. Implement React components matching this design
2. Use TailwindCSS for styling
3. Responsive layout for mobile (items should stack on small screens)
4. Dark mode support (theme-aware CSS)
