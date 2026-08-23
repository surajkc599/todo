# UX Design: Hierarchical Todo List (v1)

This document describes the user interface and interaction flows for the collaborative todo list app with hierarchical groups and sub-tasks.

## Design Principles

1. **Empty state is clear** — Users understand what to do immediately
2. **Accordion organization** — Groups collapse/expand to reduce cognitive load
3. **Focus by default** — Open tab shows actionable items; Completed tab is secondary
4. **One level deep** — Groups → Sub-tasks only (no further nesting)
5. **Cost transparency** — Costs visible at both group and sub-task levels

---

## Component Breakdown

### Empty State
- Centered message: "Your list is empty. Start by creating a group."
- Inline form with group name + optional budget + Add button
- Focus on group name input for faster typing

### Accordion Header
- Clickable chevron icon (▼ / ▶) to expand/collapse
- Group name (font-weight: 600, color: dark slate)
- Total cost on right (font-weight: 600, color: blue)
- Hover state: light background color

### Tabs (Open / Completed)
- Two tabs at top of accordion content
- Active tab has blue underline
- Count badge: "Open (2)", "Completed (1)"
- Default: Open tab always selected

### Sub-task Row
- Checkbox (left)
- Item name (flex: 1)
- Cost (right-aligned)
- Edit/Delete buttons (right, appear on hover)
- Strikethrough text if done: true

### Add Sub-task Form
- Inline form appears below sub-tasks
- Two inputs: Item name (flex: 1), Price (140px)
- Two buttons: Add (blue), Cancel (white border)
- Label above inputs: "Item name", "Price (€)"

### Summary Card (Bottom)
- Two rows:
  1. **Total Cost** — Show sum of all group costs (not aggregated sub-tasks, just top-level)
  2. **Progress** — Show "X of Y" with progress bar (all items including sub-tasks)


## Interaction States

### Empty State
- No groups exist
- Input form visible
- Summary card shows €0.00, Progress 0/0

### With Groups (Expanded)
- Accordion expanded
- Tabs visible
- Sub-task list visible
- Form to add sub-task visible

### With Groups (Collapsed)
- Accordion collapsed
- Only group name and cost visible
- Chevron points right (▶)

### Completed State
- Sub-task has done: true
- Appears in "Completed" tab only
- Text has strikethrough
- Checkbox shows checkmark (✓) with green background

---

## Responsive Behavior

### Desktop (1024px+)
- Form inputs side-by-side: [Name (flex)] [Price (140px)] [Buttons (flex)]
- Two-column layout not needed

### Tablet / Mobile (< 768px)
- Form inputs stack vertically (future enhancement)
- Buttons full-width (future enhancement)
- Cost column may abbreviate to "€15" instead of "€15.00"

---

## Design System (Tailwind + Slate Palette)

### Colors
- **Primary**: `#2563eb` (blue) — Links, active tabs, buttons
- **Success**: `#16a34a` (green) — Checkboxes, progress bar
- **Text**: `#1e293b` (dark slate) — Headers, labels
- **Muted**: `#64748b` (slate) — Secondary text, borders
- **Background**: `#f1f5f9` (light slate) — Page background
- **Card**: `#ffffff` (white) — Accordion, form backgrounds

### Typography
- **Display**: 48px bold (page title "Your List")
- **Section title**: 18px semi-bold
- **Group name**: 16px semi-bold (accordion header)
- **Sub-task**: 15px medium
- **Form labels**: 12px semi-bold
- **Muted text**: 14px medium (secondary info)

### Spacing
- **Padding**: 16px (accordion), 12px (sub-task rows)
- **Gap**: 12px (form inputs), 8px (buttons)
- **Margin**: 24px (between sections), 16px (section top)

### Shadows & Borders
- **Border**: 1px solid `#e2e8f0` (light grey)
- **Border radius**: 6px (cards, inputs, buttons)
- **No shadow** on accordions (flat, minimal design)

---

## Accessibility

- **Keyboard navigation**: Tab between inputs, Space/Enter to submit
- **Focus states**: All inputs show blue outline on focus
- **Contrast**: Text colors meet WCAG AA (4.5:1 ratio)
- **Labels**: Form inputs have visible labels
- **Icons**: Chevron and buttons use accessible symbols (✎, ✕)

---