# Phase 2 Technical Specification
## API Integration, State Management & Offline Support - Final Reference

**Document Purpose**: Complete technical reference for Phase 2 implementation
**Date**: January 6, 2026
**Status**: 90% Complete (Core Implementation Done, Sentry Pending)

---

## Table of Contents

1. [API Layer Specification](#api-layer-specification)
2. [State Management](#state-management)
3. [Error Handling](#error-handling)
4. [Offline Queue System](#offline-queue-system)
5. [Sync Mechanism](#sync-mechanism)
6. [Validation System](#validation-system)
7. [Component Integration](#component-integration)
8. [Testing Plan](#testing-plan)

---

## API Layer Specification

### Endpoints Overview

#### 1. Entries API (`api/entries.ts`)

**Module Exports**:
```typescript
interface WorkoutEntry {
  id: string;                    // UUID
  userId: string;                // User who owns this
  date: string;                  // YYYY-MM-DD
  exercises: Record<string, {    // Exercise name → data
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
  }>;
  weight?: number;               // Body weight in lbs
  notes?: string;
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}

export const entriesAPI = {
  async getEntries(limit: number, offset: number): Promise<{
    entries: WorkoutEntry[];
    total: number;
    hasMore: boolean;
  }>,
  async getEntry(date: string): Promise<WorkoutEntry | null>,
  async saveEntry(date: string, exercises, weight?): Promise<WorkoutEntry>,
  async deleteEntry(date: string): Promise<void>,
  clearCache(): void,
}
```

**Cache Strategy**:
- Single entry: 1 hour TTL
- List (getEntries): 5 minutes TTL
- Deduplication: 2-second window (same endpoint + params)
- Invalidation: Pattern-based (`entries:*` pattern)

**Error Handling**:
- 404: Returns `null` (not an error - no entry exists)
- 409: Returns conflict with `{ code: 'CONFLICT', serverData: {...} }`
- 5xx: Retried with exponential backoff (3 attempts)
- Timeout: Treated as network error, retried

**Example Usage**:
```typescript
// Get single entry (cached 1 hour)
const entry = await entriesAPI.getEntry('2026-01-06');
if (entry === null) {
  // No entry for this date
}

// Get paginated list (cached 5 minutes)
const response = await entriesAPI.getEntries(30, 0);
// { entries: [...], total: 150, hasMore: true }

// Save (clears related caches)
const saved = await entriesAPI.saveEntry('2026-01-06', exercises, 180);
// Automatically invalidates:
// - entries:*
// - summary:*
// - history:*

// Delete
await entriesAPI.deleteEntry('2026-01-06');
```

---

#### 2. Summary API (`api/summary.ts`)

**Module Exports**:
```typescript
export interface WorkoutStats {
  exercises: Record<string, {
    totalSets: number;
    totalReps: number;
    personalBest: number;
    averageWeight: number;
  }>;
  totalSets: number;
  totalWorkouts: number;
  daysActive: number;
  averageSetsPerDay: number;
  currentStreak: number;
  longestStreak: number;
}

export const summaryAPI = {
  async getSummary(startDate: string, endDate: string): Promise<WorkoutStats>,
  async getWeekSummary(referenceDate?: Date): Promise<WorkoutStats>,
  async getMonthSummary(referenceDate?: Date): Promise<WorkoutStats>,
  clearCache(): void,
}
```

**Cache Strategy**:
- Any summary query: 5 minutes TTL
- Auto-invalidated on entry save/delete
- Deduplication: 2-second window

**Example Usage**:
```typescript
// Get week stats
const week = await summaryAPI.getWeekSummary();
// Returns stats for last 7 days from now

// Get month stats
const month = await summaryAPI.getMonthSummary(new Date('2026-01-01'));
// Returns stats for January 2026

// Manual date range
const custom = await summaryAPI.getSummary('2026-01-01', '2026-01-31');
```

---

#### 3. History API (`api/history.ts`)

**Module Exports**:
```typescript
export interface HistoryPageResponse {
  entries: WorkoutEntry[];
  total: number;
  hasMore: boolean;
  currentPage: number;
  pageSize: number;
}

export interface FilterOptions {
  sortBy?: 'date' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  exerciseFilter?: string;
}

export const historyAPI = {
  async getHistory(
    page: number,
    pageSize: number,
    options?: FilterOptions
  ): Promise<HistoryPageResponse>,
  async loadNextPage(
    pageSize: number,
    options?: FilterOptions
  ): Promise<HistoryPageResponse>,
  resetPagination(): void,
  getPaginationState(): PaginationState,
  clearCache(): void,
}
```

**Cache Strategy**:
- Per-page cache: 10 minutes TTL
- Pagination state: In-memory
- Deduplication: 2-second window

**Example Usage**:
```typescript
// Get first page
const page0 = await historyAPI.getHistory(0, 30);
// { entries: [...], total: 150, hasMore: true, ... }

// Load next page (auto-increments)
const page1 = await historyAPI.loadNextPage(30);

// Filter and sort
const filtered = await historyAPI.getHistory(0, 30, {
  sortBy: 'date',
  sortOrder: 'desc',
  exerciseFilter: 'bench-press'
});

// Reset when navigating away
historyAPI.resetPagination();
```

---

## State Management

### WorkoutContext

**Purpose**: Global cache for all workout entries with CRUD operations

**Type Definition**:
```typescript
export interface WorkoutContextType {
  // State
  entries: Map<string, WorkoutEntry>;
  selectedDate: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasLocalChanges: boolean;

  // Actions
  loadEntry: (date: string) => Promise<WorkoutEntry | null>;
  saveEntry: (date, exercises, weight?) => Promise<WorkoutEntry>;
  deleteEntry: (date: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  clearError: () => void;
  clearCache: () => void;
}
```

**Persistence**:
- AsyncStorage key: `workout_cache_{userId}`
- Automatic hydration on mount
- Debounced saves (2-second delay)
- Cleared on logout

**Features**:
- In-memory cache (Map for O(1) lookups)
- Automatic cache invalidation on mutations
- Conflict handling (409 responses)
- Local change tracking
- Error state management

**Example Usage**:
```typescript
const {
  entries,
  selectedDate,
  isLoading,
  isSaving,
  error,
  loadEntry,
  saveEntry,
  deleteEntry
} = useWorkout();

// Load entry
const entry = await loadEntry('2026-01-06');
if (entry) {
  // Display it
}

// Save entry (updates cache locally, syncs when online)
try {
  const saved = await saveEntry('2026-01-06', {
    'bench-press': { sets: 3, reps: 8, weight: 275 }
  }, 180);
  showToast('Saved!');
} catch (err) {
  // Conflict or error
  if (err.code === 'CONFLICT') {
    // Show conflict resolution dialog
  }
}

// Get all cached entries
for (const [date, entry] of entries) {
  console.log(`${date}: ${Object.keys(entry.exercises).join(', ')}`);
}
```

---

### UIContext

**Purpose**: Global UI state (toasts, network, sync status)

**Type Definition**:
```typescript
export interface UIContextType {
  // Toast State
  toasts: Toast[];
  showToast: (msg, type?, duration?, dismissible?) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;

  // Network State
  isOnline: boolean;
  isConnecting: boolean;

  // Sync State
  syncStatus: 'idle' | 'syncing' | 'error';
  setSyncStatus: (status) => void;
  offlineQueueSize: number;
  setOfflineQueueSize: (size: number) => void;

  showOfflineBadge: boolean;
}
```

**Network Detection**:
- Uses NetInfo to monitor connectivity
- Auto-shows "No internet" toast when goes offline
- Auto-shows "Back online" toast when comes back online
- Updates `isOnline` and `isConnecting` states

**Convenience Hooks**:
```typescript
// Toast helper
const { success, error, warning, info, dismiss, clearAll } = useToast();
success('Saved!', 2000);  // Auto-dismiss in 2s

// Sync helper
const { status, setStatus, queueSize, isSyncing } = useSync();
if (isSyncing) showLoadingSpinner();

// Network helper
const { isOnline, isOffline } = useNetwork();
if (isOffline) disableSubmitButton();
```

**Example Usage**:
```typescript
const { showToast, isOnline, syncStatus, offlineQueueSize } = useUI();

// Show feedback
if (success) {
  showToast('Entry saved!', 'success', 2000);
} else {
  showToast('Failed to save', 'error', 3000);
}

// Check connectivity
if (!isOnline) {
  // Show offline message
}

// Track sync
if (syncStatus === 'syncing') {
  // Show spinner
} else if (syncStatus === 'error') {
  // Show error message
}

// Display queue size
if (offlineQueueSize > 0) {
  showBadge(`${offlineQueueSize} pending`);
}
```

---

## Error Handling

### Error Mapping System

**File**: `utils/errorHandler.ts`

**Error Categories**:

```typescript
type ErrorCode =
  | 'NO_INTERNET'          // No connectivity
  | 'TIMEOUT'              // Request took too long
  | 'UNAUTHORIZED'         // 401 - need to login
  | 'FORBIDDEN'            // 403 - not allowed
  | 'NOT_FOUND'            // 404 - resource doesn't exist
  | 'CONFLICT'             // 409 - server has newer version
  | 'VALIDATION_ERROR'     // 400 - bad request
  | 'RATE_LIMITED'         // 429 - too many requests
  | 'SERVER_ERROR'         // 5xx - backend error
  | 'SERVICE_UNAVAILABLE'  // 503 - maintenance/overload
  | 'UNKNOWN'              // Unexpected error

export interface MappedError {
  code: ErrorCode;
  message: string;         // User-friendly
  details?: string;        // Dev-only details
  severity: 'info' | 'warning' | 'error' | 'critical';
  retryable: boolean;      // Should we retry?
  statusCode?: number;     // HTTP status if applicable
  requestId?: string;      // For tracing
  timestamp: Date;
}
```

**Retry Strategy**:

```typescript
export interface RetryStrategy {
  maxAttempts: number;     // Default: 3
  baseDelay: number;       // Default: 1000ms
  maxDelay: number;        // Default: 30000ms
  shouldRetry: (error, attempt) => boolean;
}

// Retry decision tree:
NO_INTERNET         → Retryable ✅
TIMEOUT             → Retryable ✅
SERVER_ERROR (5xx)  → Retryable ✅
SERVICE_UNAVAILABLE → Retryable ✅
RATE_LIMITED        → Retryable ✅ (with wait)

UNAUTHORIZED (401)  → Non-retryable ❌ (force logout)
FORBIDDEN (403)     → Non-retryable ❌
VALIDATION_ERROR    → Non-retryable ❌
CONFLICT (409)      → Non-retryable ❌ (user resolution)
NOT_FOUND (404)     → Non-retryable ✅ (return null)

// Backoff calculation:
delay = Math.min(baseDelay * 2^(attempt-1), maxDelay) + jitter
delay(1) = 1000ms + 0-1000ms jitter = 1-2 seconds
delay(2) = 2000ms + 0-1000ms jitter = 2-3 seconds
delay(3) = 4000ms + 0-1000ms jitter = 4-5 seconds
delay(4) = 8000ms + jitter (capped at 30s)
```

**API Client Integration**:

```typescript
// Response interceptor in api/client.ts applies:
const mappedError = mapError(error);

if (mappedError.retryable) {
  const delay = calculateBackoffDelay(retryCount);
  await sleep(delay);
  return retry(request);
}

if (mappedError.code === 'UNAUTHORIZED') {
  await SecureStore.deleteItemAsync('auth_token');
  return Promise.reject(mappedError);
}

return Promise.reject(mappedError);
```

**Example Usage**:
```typescript
try {
  await entriesAPI.saveEntry(date, exercises);
} catch (err) {
  const mapped = mapError(err);
  showToast(mapped.message);  // User sees friendly message
  logError(mapped);            // Dev debugging info

  if (mapped.code === 'CONFLICT') {
    // Show conflict resolution UI
  }
}
```

---

## Offline Queue System

### Queue Data Structure

**File**: `hooks/useOfflineQueue.ts`

```typescript
export interface QueuedRequest {
  id: string;                    // Unique ID
  userId: string;                // Must match current user
  timestamp: number;             // When created
  method: 'POST' | 'PUT' | 'DELETE';
  endpoint: string;              // e.g., '/api/entries'
  date: string;                  // YYYY-MM-DD
  body?: {
    exercises: Record<string, any>;
    weight?: number;
  };
  status: 'pending' | 'synced' | 'failed' | 'conflict';
  retryCount: number;            // Current attempt
  maxRetries: number;            // Max allowed (5)
  lastRetryTime?: number;        // Throttle retries
  conflictData?: {
    serverData: any;
    userChoice?: 'keep-local' | 'use-server';
  };
}

export interface OfflineQueueState {
  items: QueuedRequest[];
  totalSize: number;             // Item count
  maxSize: number;               // Max 500 items
  syncInProgress: boolean;
  lastSyncTime?: number;
  pendingCount: number;
  failedCount: number;
  conflictCount: number;
}
```

### Queue Operations

**Add to Queue**:
```typescript
const { addToQueue } = useOfflineQueue();

// Method signature
async function addToQueue(
  method: 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  date: string,
  body?: { exercises, weight }
): Promise<string> // returns queue item ID
```

**Behavior**:
- Checks user is logged in
- Checks queue size < 500
- Deduplicates (removes any pending for same date/endpoint)
- Adds new item with status='pending'
- Persists to AsyncStorage
- Returns item ID for tracking

**Sync Queue**:
```typescript
const { syncQueue } = useOfflineQueue();

async function syncQueue(): Promise<SyncResult> {
  // For each pending item:
  // 1. Validate user hasn't changed
  // 2. Send request with Bearer token
  // 3. Handle response:
  //    - Success → mark 'synced'
  //    - Conflict (409) → mark 'conflict', save serverData
  //    - Auth error → mark 'failed'
  //    - Network error → increment retry, schedule retry
  // 4. Return summary: { synced, failed, conflicts, errors }
}
```

**Resolve Conflict**:
```typescript
const { resolveConflict } = useOfflineQueue();

// User chooses: keep their changes or use server version
await resolveConflict(itemId, 'keep-local');   // Retry with local
await resolveConflict(itemId, 'use-server');   // Mark synced, forget local
```

**Storage**:
- AsyncStorage key: `offline_queue_v2`
- Items expire after 24 hours
- Persisted on every state change
- Loaded on app start
- Cleared on explicit `clearQueue()`

### Queue Constraints

| Property | Value | Reason |
|----------|-------|--------|
| Max items | 500 | Prevent storage overflow |
| Item TTL | 24 hours | Don't keep stale requests |
| Max retries | 5 | Don't retry forever |
| Dedup window | Per date/endpoint | Prevent duplicate mutations |
| Sync timeout | 30 seconds per item | Prevent hanging |

---

## Sync Mechanism

### Background Sync Triggers

**File**: `hooks/useSyncTriggers.ts`

**Configuration**:
```typescript
interface SyncTriggerConfig {
  enableNetworkSync: boolean;     // Default: true
  enableAppStateSync: boolean;    // Default: true
  enablePeriodicSync: boolean;    // Default: true
  periodicSyncInterval: number;   // Default: 5 * 60 * 1000 (5 min)
  minSyncInterval: number;        // Default: 30 * 1000 (30 sec)
}

// Usage
useSyncTriggers({
  enableNetworkSync: true,
  periodicSyncInterval: 10 * 60 * 1000,  // 10 minutes
});
```

### Trigger Types

#### 1. Network State Trigger
**When**: Network connectivity changes
```typescript
// Detected via NetInfo listener
NetInfo.addEventListener(state => {
  if (wasOffline && isNowOnline) {
    performSync('network');  // Auto-sync when online
  }
});
```

#### 2. App State Trigger
**When**: App returns to foreground
```typescript
// Detected via AppState listener
AppState.addEventListener('change', state => {
  if (state === 'active') {
    performSync('appstate');  // Auto-sync when user opens app
  }
});
```

#### 3. Periodic Trigger
**When**: Every 5 minutes (configurable)
```typescript
// Implemented via setInterval
setInterval(() => {
  performSync('periodic');  // Auto-sync every 5 min
}, 5 * 60 * 1000);
```

#### 4. Manual Trigger
**When**: User clicks "Sync Now"
```typescript
const { syncNow } = useSyncTriggers();
<Button onPress={() => syncNow()} title="Sync Now" />
```

### Sync Debouncing

**Purpose**: Prevent excessive syncing

**Rules**:
```typescript
// Don't sync more frequently than minSyncInterval (30s)
if (timeSinceLastSync < minSyncInterval) {
  if (trigger !== 'manual') {  // But allow manual anytime
    return;  // Skip
  }
}

// Don't sync if already syncing
if (isSyncing) {
  return;
}

// Only sync if there are pending items
if (pendingCount === 0) {
  return;
}
```

**Timeline Example**:
```
10:00:00 - User creates entry while offline
         - Added to queue
         - Manual sync triggered

10:00:15 - Network comes online
         - performSync('network') called
         - But only 15s since last sync (< 30s)
         - Skipped due to minSyncInterval

10:00:30 - 30 seconds have passed
         - Next network event or periodic
         - Now allowed to sync

10:00:31 - Periodic sync triggers (5 min)
         - But we just synced 1s ago
         - Skipped due to minSyncInterval

10:05:31 - 5 minutes have passed
         - Periodic sync triggers again
         - At least 30s since last
         - Allowed to sync
```

---

## Validation System

### Response Schemas

**File**: `lib/schemas.ts`

**Core Schemas**:

```typescript
// Primitives
const UUIDSchema = z.string().uuid();
const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const ISOTimestampSchema = z.string().datetime();

// Entry validation
export const WorkoutEntrySchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  date: ISODateSchema,
  exercises: z.record(z.object({
    sets: z.number().int().positive(),
    reps: z.number().int().positive(),
    weight: z.number().positive().optional(),
    notes: z.string().optional(),
  })),
  weight: z.number().positive().optional(),
  notes: z.string().optional(),
  createdAt: ISOTimestampSchema,
  updatedAt: ISOTimestampSchema,
});

// Response validation
export const EntriesResponseSchema = z.object({
  entries: z.array(WorkoutEntrySchema),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

// Error validation
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.enum([
      'INVALID_REQUEST',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'INTERNAL_ERROR',
    ]),
    message: z.string(),
    details: z.string().optional(),
  }),
});
```

**Validation Functions**:

```typescript
// Strict validation - throws on error
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T {
  try {
    return schema.parse(data);
  } catch (err) {
    console.error(`[Validation] ${context}:`, err.message);
    throw new ValidationError(`Invalid ${context}`);
  }
}

// Safe validation - returns null on error
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | null {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
}
```

**API Client Integration**:

```typescript
// In response interceptor:
apiClient.interceptors.response.use(
  (response) => {
    // Validate response based on endpoint
    if (response.config.url?.includes('/entries')) {
      if (response.data.entries) {
        // List response
        const validated = validateSchema(
          EntriesResponseSchema,
          response.data,
          'EntriesResponse'
        );
        return { ...response, data: validated };
      } else {
        // Single entry
        const validated = validateSchema(
          WorkoutEntrySchema,
          response.data,
          'WorkoutEntry'
        );
        return { ...response, data: validated };
      }
    }
    return response;
  },
  (error) => {
    // Validate error response
    const errorData = safeParse(
      ErrorResponseSchema,
      error.response?.data
    );
    // ... handle error
  }
);
```

---

## Component Integration

### OfflineBadge Component

**Props**: None (uses UIContext internally)

**Display**:
```
Offline (red):      🔴 Offline (3 pending)
Syncing (orange):   🟠 Syncing...
Error (red):        🔴 Sync Error
Online (green):     🟢 Online
```

**Example Integration**:
```typescript
// In header/top bar
export function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Dashboard</Text>
      <OfflineBadge />  {/* ← Add here */}
    </View>
  );
}
```

### SyncIndicator Component

**Props**:
```typescript
interface SyncIndicatorProps {
  visible: boolean;
  onClose: () => void;
}
```

**Example Integration**:
```typescript
export function DashboardScreen() {
  const [showSync, setShowSync] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <Button
          title="Show Sync Status"
          onPress={() => setShowSync(true)}
        />
      </View>

      <SyncIndicator
        visible={showSync}
        onClose={() => setShowSync(false)}
      />
    </>
  );
}
```

---

## Testing Plan

### Unit Tests

**Error Handler Tests** (15+ cases):
```typescript
describe('mapError', () => {
  test('maps network error to NO_INTERNET', () => {
    const error = new Error('Network Error');
    const mapped = mapError(error);
    expect(mapped.code).toBe('NO_INTERNET');
    expect(mapped.retryable).toBe(true);
  });

  test('maps 401 to UNAUTHORIZED', () => {
    const error = { response: { status: 401 } };
    const mapped = mapError(error);
    expect(mapped.code).toBe('UNAUTHORIZED');
    expect(mapped.retryable).toBe(false);
  });

  // ... more cases
});

describe('calculateBackoffDelay', () => {
  test('returns exponential backoff with jitter', () => {
    const delay1 = calculateBackoffDelay(1);
    expect(delay1).toBeGreaterThanOrEqual(1000);
    expect(delay1).toBeLessThanOrEqual(2000);

    const delay2 = calculateBackoffDelay(2);
    expect(delay2).toBeGreaterThanOrEqual(2000);
    expect(delay2).toBeLessThanOrEqual(3000);
  });
});
```

**Offline Queue Tests** (20+ cases):
```typescript
describe('useOfflineQueue', () => {
  test('adds item to queue', async () => {
    const { result } = renderHook(() => useOfflineQueue());
    const id = await result.current.addToQueue(
      'PUT',
      '/api/entries',
      '2026-01-06',
      { exercises: {} }
    );
    expect(result.current.queue).toHaveLength(1);
    expect(result.current.queue[0].id).toBe(id);
  });

  test('deduplicates items for same date/endpoint', async () => {
    const { result } = renderHook(() => useOfflineQueue());
    await result.current.addToQueue('PUT', '/api/entries', '2026-01-06', {...});
    await result.current.addToQueue('PUT', '/api/entries', '2026-01-06', {...});
    expect(result.current.queue).toHaveLength(1);
  });

  test('syncs and marks items as synced', async () => {
    // Mock API success
    // Call syncQueue()
    // Verify items marked as 'synced'
  });

  test('handles conflict (409) and prompts user', async () => {
    // Mock API 409 response
    // Call syncQueue()
    // Verify item status is 'conflict'
    // Call resolveConflict()
  });

  // ... more cases
});
```

**Cache Tests** (10+ cases):
```typescript
describe('entriesAPI caching', () => {
  test('returns cached entry within TTL', async () => {
    // First call
    const entry1 = await entriesAPI.getEntry('2026-01-06');

    // Mock time forward 30 seconds
    jest.advanceTimersByTime(30 * 1000);

    // Second call (within 1 hour TTL)
    const entry2 = await entriesAPI.getEntry('2026-01-06');

    // Should not have called API again
    expect(mockApiCalls).toHaveBeenCalledTimes(1);
    expect(entry1).toBe(entry2);  // Same reference
  });

  test('invalidates cache after TTL expires', async () => {
    await entriesAPI.getEntry('2026-01-06');

    // Forward past 1 hour TTL
    jest.advanceTimersByTime(61 * 60 * 1000);

    // Next call should hit API
    await entriesAPI.getEntry('2026-01-06');
    expect(mockApiCalls).toHaveBeenCalledTimes(2);
  });

  test('deduplicates simultaneous requests', async () => {
    // Call getEntry twice simultaneously
    const [entry1, entry2] = await Promise.all([
      entriesAPI.getEntry('2026-01-06'),
      entriesAPI.getEntry('2026-01-06'),
    ]);

    // Only one API call made
    expect(mockApiCalls).toHaveBeenCalledTimes(1);
    expect(entry1).toBe(entry2);
  });
});
```

### Integration Tests

**API + Context Flow**:
```typescript
describe('WorkoutContext + API Integration', () => {
  test('loads entry from API and caches in context', async () => {
    const { result } = renderHook(() => useWorkout());

    const entry = await result.current.loadEntry('2026-01-06');
    expect(entry).toBeDefined();

    // Check cache
    expect(result.current.entries.has('2026-01-06')).toBe(true);
  });

  test('saves entry and invalidates caches', async () => {
    const { result } = renderHook(() => useWorkout());

    const saved = await result.current.saveEntry('2026-01-06', {...});

    // Verify:
    // 1. Entry in cache
    expect(result.current.entries.has('2026-01-06')).toBe(true);

    // 2. Summary cache cleared
    // 3. History cache cleared
    // 4. Persisted to AsyncStorage
  });

  test('handles conflict during save', async () => {
    // Mock API returns 409
    const { result } = renderHook(() => useWorkout());

    try {
      await result.current.saveEntry('2026-01-06', {...});
    } catch (err) {
      expect(err.code).toBe('CONFLICT');
      expect(err.serverData).toBeDefined();
    }
  });
});
```

**Offline + Sync Flow**:
```typescript
describe('Offline → Sync → Online Flow', () => {
  test('queues changes while offline', async () => {
    // Mock offline
    mockNetInfo.isConnected = false;

    const { result } = renderHook(() => useWorkout());
    await result.current.saveEntry('2026-01-06', {...});

    // Should be queued
    const queue = useOfflineQueue();
    expect(queue.queue).toHaveLength(1);
  });

  test('syncs automatically when comes online', async () => {
    // Start offline with pending
    mockNetInfo.isConnected = false;

    // Add to queue
    const queue = useOfflineQueue();
    await queue.addToQueue('PUT', '/api/entries', '2026-01-06', {...});

    // Come online
    mockNetInfo.isConnected = true;
    await act(() => {
      NetInfo.addEventListener.mock.calls[0][0]({
        isConnected: true
      });
    });

    // Should sync
    // Verify no more pending items
    expect(queue.state.pendingCount).toBe(0);
  });
});
```

### Manual Testing Checklist

```markdown
## Offline Mode Testing

- [ ] Turn off wifi
- [ ] Create entry
- [ ] Verify offline badge shows
- [ ] Verify entry queued (AsyncStorage check)
- [ ] Turn wifi back on
- [ ] Verify auto-sync triggers
- [ ] Verify offline badge cleared
- [ ] Verify entry synced to backend

## Conflict Testing

- [ ] Create entry on phone
- [ ] (Don't sync yet) Edit same entry on backend
- [ ] Try to sync on phone
- [ ] Verify conflict dialog appears
- [ ] Choose "Keep Local"
- [ ] Verify phone version overwrites server
- [ ] Choose "Use Server"
- [ ] Verify server version loads on phone

## Error Handling Testing

- [ ] Backend returns 500
  - [ ] Verify auto-retry with backoff
  - [ ] Verify exponential delay increases
- [ ] Backend returns 401
  - [ ] Verify logged out
  - [ ] Verify redirected to login
- [ ] Backend returns 429
  - [ ] Verify retried with wait
- [ ] Network timeout
  - [ ] Verify queued for later
  - [ ] Verify auto-retry when online

## UI Testing

- [ ] OfflineBadge appears when offline
- [ ] OfflineBadge shows pending count
- [ ] SyncIndicator shows queue items
- [ ] SyncIndicator shows conflicts
- [ ] "Sync Now" button works
- [ ] Toast notifications appear
```

---

## Summary

This Phase 2 technical specification provides complete guidance for:
- ✅ API endpoint design and caching strategy
- ✅ State management with persistence
- ✅ Error handling with automatic retry
- ✅ Offline queue with conflict resolution
- ✅ Background sync triggers
- ✅ Response validation with schemas
- ✅ UI component integration
- ✅ Comprehensive testing approach

**Status**: Ready for Phase 3 (Dashboard & Screen Implementation)

---

**Document Version**: 1.0
**Last Updated**: January 6, 2026
**Created By**: Claude Haiku 4.5
