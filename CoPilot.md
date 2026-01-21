# GitHub Copilot Code Sessions

## Session: January 21, 2026

### Session Start: 2026-01-21
### Branch: `CPB_Branch` (created from `main`)

---

## Issue Investigated

**Problem**: User data on entry is not persisting, disappearing from user dashboard on entry, not displaying and persisting properly in Summary and History, Edit feature not working. Issue affects both Web PWA and React Native mobile apps.

---

## 🚨 ROOT CAUSE FOUND (Session 2)

### The ACTUAL Bug: Stale Closure in syncQueue

**The timing (2-3 seconds) was the key clue!** This matches the debounce timer exactly.

#### What Was Happening:
1. User enters data → triggers `handleExerciseChange`
2. 2-second debounce timer starts
3. Timer fires → `saveData()` called
4. `saveData()` calls `addToQueue()` which uses `setQueueState()` (ASYNC!)
5. **Immediately after**, `syncQueue()` is called
6. **🔴 BUG**: `syncQueue()` reads `queueState.items` - BUT this is STALE because React setState is async!
7. `syncQueue()` sees 0 pending items → returns `{ synced: 0 }`
8. Dashboard thinks nothing was synced, doesn't refresh
9. User's data was **NEVER** actually sent to the server
10. Data appears to "disappear" after 2-3 seconds

#### The Fix (Commit 3131269):
Added a `queueItemsRef` that is updated **SYNCHRONOUSLY** when items change:

```typescript
// CRITICAL FIX: Use a ref to always have access to current queue items
const queueItemsRef = useRef<QueuedRequest[]>([]);

// In addToQueue - update ref SYNCHRONOUSLY before async setState
const updatedItemsForRef = queueItemsRef.current.filter(...);
updatedItemsForRef.push(newItem);
queueItemsRef.current = updatedItemsForRef;  // <-- SYNC update

// In syncQueue - read from ref instead of stale state
const pendingItems = queueItemsRef.current.filter(item => item.status === 'pending');
```

---

## Previous Session Fixes (Supporting, not root cause)

#### Issue 1: Cache Null Handling Bug (`api/entries.ts`)
- Changed null cache TTL from 1 hour to 10 seconds
- Minor optimization, not the root cause

#### Issue 2: Functional State Updates (`useOfflineQueue.ts`)
- Changed addToQueue to use `setQueueState(prev => ...)` pattern
- Correct but insufficient - the stale closure in syncQueue remained

#### Issue 3: Synced Items Cleanup (`useOfflineQueue.ts`)
- Added cleanup of synced items after sync
- Good practice, not the root cause

---

## All Changes Made

| Timestamp | File | Change Description | Status |
|-----------|------|-------------------|--------|
| 2026-01-21 | CoPilot.md | Created session documentation | ✅ Complete |
| 2026-01-21 | Branch | Created `CPB_Branch` from `main` | ✅ Complete |
| 2026-01-21 | `api/entries.ts` | Fix null cache TTL (10s instead of 1hr) | ✅ Complete |
| 2026-01-21 | `api/entries.ts` | Add __nullMarker pattern for cached nulls | ✅ Complete |
| 2026-01-21 | `useOfflineQueue.ts` | Fix stale closures with functional state updates | ✅ Complete |
| 2026-01-21 | `useOfflineQueue.ts` | Cleanup synced items after successful sync | ✅ Complete |
| **2026-01-21** | **`useOfflineQueue.ts`** | **🔴 CRITICAL: Add queueItemsRef for sync access** | ✅ Complete |

---

## Git Commits on CPB_Branch

1. `d7a40a2` - Initial fixes (cache TTL, functional updates, cleanup)
2. **`3131269`** - **CRITICAL FIX**: Use ref to prevent stale closure in syncQueue

---

## Verification - Console Logs to Look For

**BEFORE fix (broken):**
```
[useOfflineQueue.syncQueue] No pending items to sync
```
*This means syncQueue was called but couldn't see the item that was just added*

**AFTER fix (working):**
```
[useOfflineQueue] Added/updated item for 2026-01-21 /api/entries - ref now has 1 items
[useOfflineQueue.syncQueue] Starting sync of 1 pending items (from ref)
[useOfflineQueue.syncQueue] POST successful
[useOfflineQueue.syncQueue] Sync complete: { synced: 1, failed: 0, conflicts: 0 }
```

---

## Deployment Notes

- Branch `CPB_Branch` pushed to GitHub
- Deploy to Render from CPB_Branch
- Test with console open to verify sync is happening
