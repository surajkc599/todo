# Real-time Collaboration Strategy

## Overview
This document outlines the real-time collaboration strategy for Shopping List, enabling multiple users to view and edit shared lists with eventual consistency.

## Strategy: Long Polling with 5-Second Intervals

### Why Long Polling?
- **Simple**: No complex WebSocket infrastructure needed
- **Reliable**: Works on all networks and browsers
- **Cost-effective**: Low server resource usage
- **Eventual consistency**: 5-second delay is imperceptible for shopping lists
- **Sufficient for use case**: Users don't need millisecond-level sync for shopping

### Implementation

#### Frontend (ListPage.tsx)
```typescript
// Long polling: refresh list every 5 seconds for eventual consistency
useEffect(() => {
  if (!id) return;

  const interval = setInterval(() => {
    refreshList();
  }, 5000);

  return () => clearInterval(interval);
}, [id]);
```

**Key points:**
- Polling starts when list is viewed
- Polling stops when user leaves the list (cleanup in return)
- Calls existing `refreshList()` function to fetch latest data
- No UI disruption - updates merge silently

#### Backend
No changes required. Existing GET `/api/lists/:id` endpoint serves fresh data each poll.

### User Experience

**Scenario: Two users sharing a list**
```
User A adds "Apples €2"
  ↓ (API call succeeds immediately)
User B's list updates ~5 seconds later (via polling)
```

### Metrics
- **Sync delay**: ~5 seconds (imperceptible for shopping lists)
- **API load**: 1 request per 5 seconds per active viewer
- **Network**: Minimal - only fetches when data might have changed

### Future Enhancements
- **Presence awareness**: Show "User X is editing" (via polling separate endpoint)
- **Conflict detection**: Highlight if your item was deleted by someone else
- **WebSockets**: Upgrade to true real-time if performance becomes an issue
- **Optimistic updates**: Show changes immediately, reconcile on conflict

### Trade-offs
| Aspect | Long Polling | WebSockets |
|--------|-------------|-----------|
| Sync delay | ~5 seconds | <100ms |
| Implementation | Simple | Complex |
| Server load | Low | Medium |
| Browser support | 100% | 95%+ |
| Use case fit | ✅ Perfect | Overkill |

## Conclusion
Long polling every 5 seconds provides an ideal balance of simplicity, reliability, and user experience for collaborative shopping lists.
