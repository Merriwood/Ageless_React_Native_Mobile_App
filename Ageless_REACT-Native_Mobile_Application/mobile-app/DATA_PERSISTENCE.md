# Data Persistence Architecture

## Overview
Every workout entry is **permanently persisted to the database** and survives user logouts, app refreshes, and device restarts.

---

## Database Schema

```sql
CREATE TABLE entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,                          -- YYYY-MM-DD format
  weight DECIMAL(5,2),                              -- User's body weight
  fitness_data JSONB NOT NULL DEFAULT '{}',         -- Exercise data: { exerciseId: setCount }
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entry_date)                       -- One entry per user per day
);
```

**Key Points:**
- `UNIQUE(user_id, entry_date)`: Guarantees ONE entry per day per user
- `fitness_data` stored as JSONB: Efficient storage and querying
- `updated_at` tracks modifications for sync conflict resolution
- `ON DELETE CASCADE`: User deletion removes all their entries

---

## Data Flow: Create/Update Workout

```
User Input (Dashboard)
    ↓
useEffect triggers after 2s debounce
    ↓
saveData() function
    ├─ Queue to offline queue (useOfflineQueue hook)
    ├─ Immediately syncQueue()
    └─ Wait for server response
        ├─ SUCCESS: Clear caches → Reload dashboard
        └─ FAILED: Keep data in offline queue for retry
    ↓
POST /api/entries { date, exercises, weight }
    ↓
Server INSERT ... ON CONFLICT DO UPDATE
    ├─ If entry exists for that date: UPDATE weight & fitness_data
    └─ If new date: INSERT new entry
    ↓
Entry permanently stored in PostgreSQL database
```

### Code Flow (Technical)

**File:** `app/dashboard/index.tsx`

```typescript
const saveData = async () => {
  const dateStr = formatDateForApi(selectedDate);  // "2026-01-20"

  // 1. Add to offline queue
  await addToQueue('POST', '/api/entries', dateStr, {
    exercises,           // e.g., { "bike": 2, "abs": 3 }
    weight: parseFloat(weight)
  });

  // 2. Immediately sync to server
  const syncResult = await syncQueue();

  // 3. Clear caches and reload
  if (syncResult.synced > 0) {
    entriesAPI.clearCache();
    historyAPI.clearCache();
    await loadWorkoutForDate();  // Fetch fresh data from server
  }
};
```

---

## Data Flow: Load Historical Entry

```
User opens Dashboard for Date X
    ↓
useEffect dependency [selectedDate] triggers
    ↓
loadWorkoutForDate() function
    ↓
entriesAPI.getEntry(dateStr)
    ├─ Check cache (1 hour TTL)
    ├─ If expired/missing:
    │   ├─ Fetch: GET /api/entries/:date
    │   └─ Server queries: SELECT * FROM entries WHERE user_id=$1 AND entry_date=$2
    ├─ Update cache
    └─ Return data
    ↓
Dashboard displays:
├─ If entry exists: Show exercises & weight
└─ If no entry: Show empty state (0 exercises for all)
```

### Code Flow (Technical)

**File:** `app/dashboard/index.tsx`

```typescript
const loadWorkoutForDate = async () => {
  const dateStr = formatDateForApi(selectedDate);  // "2026-01-20"

  // 1. Try to fetch from server (authoritative source)
  try {
    const serverEntry = await entriesAPI.getEntry(dateStr);
    if (serverEntry) {
      setExercises(serverEntry.exercises);      // { "bike": 2, "abs": 3 }
      setWeight(serverEntry.weight?.toString());
      return;
    }
  } catch (serverError) {
    // Fall back to offline queue if network fails
  }

  // 2. Check offline queue for pending changes
  const pendingEntry = offlineQueue.find(e => e.date === dateStr);
  if (pendingEntry?.body) {
    setExercises(pendingEntry.body.exercises);
    setWeight(pendingEntry.body.weight?.toString());
    return;
  }

  // 3. No data found = empty entry
  setExercises({});
  setWeight('');
};
```

---

## Data Persistence Across Scenarios

### ✅ Scenario 1: User Saves Today's Workout

```
User Input:    Bike 2 sets, Abs 3 sets, Weight 185
       ↓
IMMEDIATE:     Dashboard shows Bike 2, Abs 3, Weight 185
       ↓
2s DEBOUNCE:   saveData() triggers
       ↓
SYNC:          POST /api/entries → Server INSERT
       ↓
DATABASE:      entries row created with (user_id, 2026-01-20, 185, {bike: 2, abs: 3})
       ↓
DASHBOARD:     Auto-refreshes from server
       ↓
USER LOGS OUT & BACK IN
       ↓
APP BOOT:      Validates token → Navigates to Dashboard
       ↓
USER OPENS DATE 2026-01-20
       ↓
loadWorkoutForDate() → GET /api/entries/2026-01-20
       ↓
DATABASE QUERY: SELECT ... WHERE user_id=123 AND entry_date='2026-01-20'
       ↓
RESULT:        ✅ Bike 2, Abs 3, Weight 185 loaded and displayed
```

### ✅ Scenario 2: User Navigates to Past Date

```
User clicks date selector → Chooses 2026-01-10
       ↓
useEffect [selectedDate] fires
       ↓
loadWorkoutForDate()
       ↓
GET /api/entries/2026-01-10 → Server
       ↓
DATABASE QUERY: SELECT * FROM entries WHERE user_id=$1 AND entry_date='2026-01-10'
       ↓
RESULT FOUND:  ✅ Show previously saved data from that date
RESULT NOT FOUND (404): ✅ Show empty state (no activity for that day)
```

### ✅ Scenario 3: User Edits Past Workout in History Modal

```
User opens History Modal
       ↓
Clicks "Edit" on 2026-01-15
       ↓
onEditWorkout(date) callback → setSelectedDate('2026-01-15')
       ↓
History Modal closes
       ↓
Dashboard useEffect fires: historyModalVisible → false
       ↓
CACHE CLEAR:   entriesAPI.clearCache() + historyAPI.clearCache()
       ↓
Dashboard reloads data for 2026-01-15
       ↓
User edits exercises, clicks "+" buttons
       ↓
saveData() triggers after 2s debounce
       ↓
POST /api/entries WITH ON CONFLICT DO UPDATE
       ↓
DATABASE:      Update existing row for (user_id, 2026-01-15)
       ↓
✅ Changes persisted and displayed
```

### ✅ Scenario 4: User Deletes Entry from History Modal

```
User opens History Modal
       ↓
Clicks Delete on 2026-01-20
       ↓
Confirmation Alert → Clicks "Delete"
       ↓
DELETE /api/entries/2026-01-20
       ↓
SERVER: DELETE FROM entries WHERE user_id=$1 AND entry_date=$2
       ↓
CACHE CLEAR:   entriesAPI.clearCache() + historyAPI.clearCache()
       ↓
DATABASE:      ✅ Entry completely removed
       ↓
History Modal reloads → Entry no longer appears
       ↓
User navigates back to Dashboard for 2026-01-20
       ↓
loadWorkoutForDate() → GET /api/entries/2026-01-20
       ↓
DATABASE: No row found (404)
       ↓
✅ Dashboard shows empty state for that date
```

### ✅ Scenario 5: Offline & Network Failure

```
User saves workout while offline
       ↓
addToQueue() → Stored in AsyncStorage + Redux state
       ↓
syncQueue() → Attempt to send
       ↓
NETWORK ERROR: Request fails
       ↓
Offline queue item marked PENDING (not synced)
       ↓
loadWorkoutForDate() → Can't reach server
       ↓
FALLBACK: Check offline queue → Find pending item
       ↓
✅ Display pending data on Dashboard
       ↓
Network reconnects
       ↓
useSyncTriggers hook detects network return
       ↓
Auto-triggers syncQueue()
       ↓
POST /api/entries → Server processes queued changes
       ↓
✅ Data synced to database
```

---

## Cache Strategy

| API | Cache TTL | When Invalidated |
|-----|-----------|-----------------|
| `entriesAPI.getEntry(date)` | 1 hour | After POST/DELETE, manual clear |
| `entriesAPI.getEntries()` | 5 minutes | After POST/DELETE, manual clear |
| `historyAPI.getHistory(page)` | 10 minutes | After POST/DELETE, manual clear |

**Manual Cache Clear Triggers:**
- ✅ After successful sync in `saveData()`
- ✅ After delete in `HistoryModal.handleDelete()`
- ✅ On modal close (dashboard effect)
- ✅ On app logout

---

## Security & Data Integrity

### Per-User Data Isolation
```sql
WHERE user_id = $1
```
Every query filters by `user_id`. Users can NEVER see another user's data.

### One Entry Per Day Per User
```sql
UNIQUE(user_id, entry_date)
```
Prevents duplicate entries for same date.

### Automatic Cascade Delete
```sql
ON DELETE CASCADE
```
If user account deleted, all their entries removed automatically.

### Server-Side Validation
- ✅ JWT authentication required on all endpoints
- ✅ Date format validation (YYYY-MM-DD)
- ✅ Exercise data schema validation
- ✅ Weight range validation

---

## Verification Checklist

### For Users:
- [x] Each day with activity shows that activity on dashboard
- [x] Days without activity show empty state (no entry)
- [x] Data persists across logout/login cycles
- [x] Data persists across app refresh
- [x] Data persists across device restart
- [x] Users can edit any historical date
- [x] Edits are saved and persisted
- [x] Deletions are permanent and propagate to all screens

### For Developers:
- [x] `entries` table has proper schema with UNIQUE constraint
- [x] Each endpoint requires authentication
- [x] Server queries are parameterized (no SQL injection)
- [x] Caches properly invalidated after mutations
- [x] Offline queue system handles network failures
- [x] Dashboard loads fresh data on date selection
- [x] Modal close triggers cache clear and refresh

---

## Key Implementation Files

| File | Purpose |
|------|---------|
| `server/schema.sql` | Database schema definition |
| `combined-server.mjs` | API endpoints (GET/POST/DELETE /api/entries) |
| `app/dashboard/index.tsx` | Dashboard display & entry logic |
| `components/modals/HistoryModal.tsx` | History view & edit/delete |
| `api/entries.ts` | Client API layer with caching |
| `hooks/useOfflineQueue.ts` | Offline queue & sync logic |
| `hooks/useSyncTriggers.ts` | Network detection & auto-sync |

---

## Conclusion

**The system is fully architected for permanent data persistence:**

1. **Database**: PostgreSQL with proper schema
2. **Server**: API endpoints with user isolation & validation
3. **Client**: Multi-layer caching with automatic invalidation
4. **Offline Support**: Queue system for network failures
5. **User Experience**: Immediate UI updates with sync confirmation

All workout data is **persistent, secure, and user-isolated**. Every day with activity will show that activity, and every day without activity will show the empty state. ✅
