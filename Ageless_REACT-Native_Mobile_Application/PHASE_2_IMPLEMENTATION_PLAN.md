# Phase 2 Implementation Plan
## API Integration & State Management

**Status**: Ready to Begin
**Duration**: 8-12 days (Jan 7 - Jan 19, 2026)
**Priority**: 🔴 CRITICAL PATH
**Team**: 1-2 developers

---

## Overview

Phase 2 focuses on:
1. **Completing API Integration** (api/entries.ts, api/summary.ts, api/history.ts)
2. **Building State Management** (WorkoutContext, UIContext on top of AuthContext from Phase 1)
3. **Offline Sync Completion** (integrate auth tokens into useOfflineQueue)
4. **Error Handling & User Feedback** (toast notifications, error mapping)
5. **Data Validation & Caching** (request deduplication, cache layers)

**Key Dependency**: Phase 1 Auth must be complete (✅ Verified Jan 6)

---

## Architecture Overview

### Current State (Phase 1 Complete)
```
✅ API Client (api/client.ts)
   - Axios HTTP client with interceptors
   - Bearer token injection
   - 401 error handling
   - Exponential backoff retry
   - Request ID tracking

✅ Auth Management (hooks/useAuth.ts)
   - Token storage/retrieval
   - Token validation
   - Login/logout

✅ Form Validation (lib/validation.ts)
   - Email validation
   - Password strength
   - Input sanitization
```

### Phase 2 Will Add
```
📋 Workout Data Management (api/entries.ts)
   - getEntries()
   - getEntry(date)
   - saveEntry(date, exercises, weight)
   - deleteEntry(date)

📋 Summary & History (api/summary.ts, api/history.ts)
   - getSummary(startDate, endDate)
   - getHistory(limit, offset)
   - Caching layer (5-10 min TTL)

📋 WorkoutContext (context/WorkoutContext.tsx)
   - Workout data state
   - Entry loading/saving
   - Local cache management
   - Offline change tracking

📋 UIContext (context/UIContext.tsx)
   - Toast notifications
   - Sync status indicator
   - Offline badge
   - Error messages

📋 Offline Sync Enhancement (hooks/useOfflineQueue.ts)
   - Auth token integration
   - Queue persistence
   - Sync conflict detection
   - Background sync triggers

📋 Error Handling (utils/errorHandler.ts)
   - Network error mapping
   - User-friendly messages
   - Error logging/Sentry
```

---

## Phase 2.1: API Client & Data Synchronization
**Duration**: 3-4 days | **Status**: Framework Ready (90%)

### 2.1.1 API Client Review & Enhancement
**Current State**: ✅ Already complete from Phase 1
- axios with interceptors
- Bearer token injection
- 401 handling
- Exponential backoff

**What's Needed**:
- [ ] Verify base URL configuration (localhost, staging, production)
- [ ] Verify request/response interceptor working correctly
- [ ] Add Request ID header for debugging
- [ ] Verify timeout (30 seconds)

**Files**:
- `api/client.ts` - ✅ COMPLETE

### 2.1.2 Workout Entry Endpoints
**Files to Create**: `api/entries.ts`

```typescript
// api/entries.ts
export const entriesAPI = {
  // Get all entries for a user (paginated)
  getEntries: async (limit = 30, offset = 0) => {
    // GET /api/entries?limit=30&offset=0
    // Returns: { entries: [...], total: 150, hasMore: true }
  },

  // Get single day's entry
  getEntry: async (date: string) => {
    // GET /api/entries/:date
    // Returns: { id, date, exercises: {...}, weight, created_at, updated_at }
  },

  // Save entry (create or update)
  saveEntry: async (date: string, exercises: Record<string, number>, weight: number) => {
    // POST /api/entries
    // Payload: { date, exercises, weight }
    // Returns: { id, date, exercises, weight, created_at, updated_at }
  },

  // Delete entry
  deleteEntry: async (date: string) => {
    // DELETE /api/entries/:date
    // Returns: { success: true }
  },
};
```

**Tasks**:
- [ ] Create api/entries.ts with above endpoints
- [ ] Add proper TypeScript types
- [ ] Handle network errors gracefully
- [ ] Test with backend endpoints

### 2.1.3 Summary & History Endpoints
**Files to Create**: `api/summary.ts`, `api/history.ts`

```typescript
// api/summary.ts
export const summaryAPI = {
  getSummary: async (startDate: string, endDate: string) => {
    // GET /api/summary?start=2026-01-01&end=2026-01-07
    // Returns: { week, exercises: {...}, totalSets: 45, daysActive: 6 }
  },
};

// api/history.ts
export const historyAPI = {
  getHistory: async (limit = 20, offset = 0) => {
    // GET /api/entries?limit=20&offset=0 (reuses entries endpoint)
    // Returns paginated entries with filters/sorting
  },
};
```

**Tasks**:
- [ ] Create api/summary.ts
- [ ] Create api/history.ts
- [ ] Add proper error handling
- [ ] Add caching (5-10 min TTL)

### 2.1.4 Caching Layer
**Files to Update**: `api/entries.ts`, `api/summary.ts`, `api/history.ts`

```typescript
// Implement in-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

const cache = new Map<string, CacheEntry<any>>();

function isCacheValid(key: string): boolean {
  const entry = cache.get(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < entry.ttl;
}

function getFromCache<T>(key: string): T | null {
  if (isCacheValid(key)) {
    return cache.get(key)!.data;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T, ttl: number) {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

// Usage in entriesAPI.getEntry:
const cacheKey = `entry:${date}`;
const cached = getFromCache(cacheKey);
if (cached) return cached;

const data = await client.get(`/api/entries/${date}`);
setCache(cacheKey, data, 1 * 60 * 60 * 1000); // 1 hour TTL
return data;
```

**Tasks**:
- [ ] Implement cache utility
- [ ] Cache entry details (1 hour TTL)
- [ ] Cache summary results (5 minute TTL)
- [ ] Cache history results (10 minute TTL)
- [ ] Invalidate cache on POST/PUT/DELETE operations

### 2.1.5 Request Deduplication
**Purpose**: Prevent duplicate requests within 2 seconds

```typescript
const pendingRequests = new Map<string, Promise<any>>();

function getDedupKey(config: any): string {
  return `${config.method}:${config.url}`;
}

// In request interceptor:
const dedupKey = getDedupKey(config);
if (pendingRequests.has(dedupKey)) {
  return pendingRequests.get(dedupKey)!;
}

const promise = client.request(config);
pendingRequests.set(dedupKey, promise);

promise.finally(() => {
  setTimeout(() => pendingRequests.delete(dedupKey), 2000);
});

return promise;
```

**Tasks**:
- [ ] Implement deduplication in api/client.ts
- [ ] Use 2-second window for duplicate detection
- [ ] Return cached promise for duplicate requests

---

## Phase 2.2: State Management Architecture
**Duration**: 2-3 days | **Status**: Partial (AuthContext exists, need WorkoutContext & UIContext)

### 2.2.1 WorkoutContext
**File to Create**: `context/WorkoutContext.tsx`

```typescript
interface WorkoutEntry {
  date: string;
  exercises: Record<string, number>;
  weight: number;
  created_at: string;
  updated_at: string;
}

interface WorkoutContextType {
  // State
  entries: Map<string, WorkoutEntry>;
  selectedDate: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadEntry: (date: string) => Promise<void>;
  saveEntry: (date: string, exercises: Record<string, number>, weight: number) => Promise<void>;
  deleteEntry: (date: string) => Promise<void>;
  updateLocalCache: (date: string, exercises: Record<string, number>, weight: number) => void;
  setSelectedDate: (date: string) => void;
  clearError: () => void;
}

// Implementation:
// - Cache entries by date
// - Show cached data while fetching fresh data
// - Track loading state per date
// - Handle offline mode (show local-only badge)
// - Sync with offline queue
```

**Tasks**:
- [ ] Create context/WorkoutContext.tsx
- [ ] Implement entry loading (from API or cache)
- [ ] Implement entry saving (POST to API, add to queue if offline)
- [ ] Implement entry deletion
- [ ] Implement local cache updates
- [ ] Add TypeScript interfaces
- [ ] Wrap app with WorkoutProvider at _layout.tsx level

### 2.2.2 UIContext
**File to Create**: `context/UIContext.tsx`

```typescript
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

interface UIContextType {
  // State
  toasts: Toast[];
  syncStatus: 'idle' | 'syncing' | 'error';
  isOnline: boolean;
  offlineQueueSize: number;

  // Actions
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  dismissToast: (id: string) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  setIsOnline: (online: boolean) => void;
  setOfflineQueueSize: (size: number) => void;
}

// Implementation:
// - Global toast notification management
// - Sync status indicator (for UI display)
// - Network connectivity tracking
// - Offline queue size display
```

**Tasks**:
- [ ] Create context/UIContext.tsx
- [ ] Implement toast notification system
- [ ] Track network connectivity with NetInfo
- [ ] Display offline badge UI
- [ ] Display sync indicator UI
- [ ] Wrap app with UIProvider at _layout.tsx level

### 2.2.3 AuthContext Enhancement (Already from Phase 1)
**File**: `context/AuthContext.tsx` (from Phase 1, integrated via useAuth hook)

**What's Already Done**:
- ✅ User state management
- ✅ Token management
- ✅ Login/logout/refresh methods

**What Needs to Be Added** (if not already done):
- [ ] Verify AuthProvider wraps entire app
- [ ] Verify context available to all screens
- [ ] Verify token refresh on 401

**Tasks**:
- [ ] Review existing AuthContext implementation
- [ ] Ensure it's used as Provider at _layout.tsx level
- [ ] Ensure token refresh logic works

### 2.2.4 Root Layout Integration
**File**: `app/_layout.tsx` (partially done in Phase 1, needs enhancement)

```typescript
// Should wrap app with all three contexts:
<AuthProvider>
  <WorkoutProvider>
    <UIProvider>
      <Slot />
    </UIProvider>
  </WorkoutProvider>
</AuthProvider>
```

**Tasks**:
- [ ] Add WorkoutProvider wrapper
- [ ] Add UIProvider wrapper
- [ ] Verify context nesting order
- [ ] Test context availability in all screens

### 2.2.5 State Persistence
**File**: Update each context to persist state

```typescript
// AuthContext - persist to SecureStore (already done)
// WorkoutContext - persist entries cache to AsyncStorage
// UIContext - persist preferences (selected date, etc) to AsyncStorage
```

**Tasks**:
- [ ] Persist workout cache to AsyncStorage
- [ ] Persist UI preferences (selected date) to AsyncStorage
- [ ] Implement hydration on app boot
- [ ] Show cached data while fetching fresh

---

## Phase 2.3: Data Validation & Input Sanitization
**Duration**: 1-2 days | **Status**: Partial (client-side mostly done, need API response validation)

### 2.3.1 Client-Side Validation (Mostly Done)
**Files**: `lib/validation.ts` (from Phase 1)

**Already Implemented**:
- ✅ isValidEmail()
- ✅ isValidPassword()

**What Needs to Be Added**:
- [ ] isValidWeight(weight) - numeric, positive, <= 500
- [ ] isValidSets(sets, exercise) - integer, > 0, <= MAX_SETS
- [ ] isValidDate(date) - valid date format, not in future

**Tasks**:
- [ ] Add weight validation
- [ ] Add sets validation
- [ ] Add date validation
- [ ] Update Input components to show validation feedback in real-time

### 2.3.2 API Response Validation
**Purpose**: Ensure API responses match expected schema before using

**Files to Create**: `utils/validation.ts` additions or new `utils/schemas.ts`

```typescript
// Use Zod or similar for runtime schema validation
import { z } from 'zod';

const EntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  exercises: z.record(z.number()),
  weight: z.number().positive(),
  created_at: z.string(),
  updated_at: z.string(),
});

const EntriesResponseSchema = z.object({
  entries: z.array(EntrySchema),
  total: z.number(),
  hasMore: z.boolean(),
});

// In API response interceptor:
try {
  const validated = EntriesResponseSchema.parse(response.data);
  return validated;
} catch (error) {
  console.error('Invalid API response:', error);
  throw new Error('Invalid server response');
}
```

**Tasks**:
- [ ] Install Zod (or alternative schema validation)
- [ ] Create schemas for all API response types
- [ ] Add validation to response interceptor
- [ ] Reject invalid responses with clear error
- [ ] Log validation failures (non-sensitive data only)

### 2.3.3 Data Sanitization
**Purpose**: Prevent XSS and data injection attacks

**Tasks**:
- [ ] Never render user input as raw HTML (use TextInput, not WebView)
- [ ] Strip HTML/script tags from text inputs
- [ ] Validate data types before use
- [ ] Never log sensitive data (passwords, tokens)

---

## Phase 2.4: Offline Sync Completion
**Duration**: 2-3 days | **Status**: Framework Ready (90%), Auth integration needed

### 2.4.1 Auth Token Integration
**File**: `hooks/useOfflineQueue.ts` (from Phase 1, needs enhancement)

```typescript
// Current state: Offline queue stores requests
// Needed: Add JWT tokens to queued requests

interface QueuedRequest {
  id: string;
  date: string;
  exercises: Record<string, number>;
  weight: number;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
  // NEW:
  userId: string; // from JWT token
  token: string; // JWT token at time of queueing
}

// When user offline:
// 1. Extract user_id from current token
// 2. Store request in queue with user_id
// 3. When coming online, validate token still valid
// 4. If token expired, show "Please login to sync"
// 5. Don't auto-clear queue (preserve user data)
```

**Tasks**:
- [ ] Update QueuedRequest interface to include userId, token
- [ ] Extract user_id from JWT on save
- [ ] Validate token still valid before syncing
- [ ] Show "Please login to sync" if token expired
- [ ] Preserve queue (don't clear) if auth needed

### 2.4.2 Sync Conflict Detection
**Purpose**: Handle cases where server data is newer than local

```typescript
// Scenario: User offline, makes changes. Server has newer version of same date.
// Solution: Show dialog asking user to keep local or use server data

interface SyncConflict {
  date: string;
  local: WorkoutEntry;
  server: WorkoutEntry;
}

// In offline queue sync:
// 1. If POST returns 409 Conflict (or similar)
// 2. Show dialog: "Server has newer data. Keep yours or sync server's?"
// 3. Default to server data
// 4. Allow user to override if desired
// 5. Remember user choice (for future auto-sync)
```

**Tasks**:
- [ ] Detect 409 Conflict responses from API
- [ ] Show conflict resolution dialog
- [ ] Store user preference (keep local vs. use server)
- [ ] Update queue entry with resolution
- [ ] Continue sync after resolution

### 2.4.3 Sync Indicator UI
**Purpose**: Show user sync status visually

**Files**: Update components based on UIContext state

```
UI Elements Needed:
- [Syncing...] spinner while queue processing
- "X items waiting to sync" in offline mode
- "✓ All changes synced" when queue empty
- Offline badge (airplane icon, red background)
```

**Tasks**:
- [ ] Create SyncIndicator component
- [ ] Create OfflineBadge component
- [ ] Connect to UIContext.syncStatus
- [ ] Connect to UIContext.offlineQueueSize
- [ ] Show appropriate message based on state

### 2.4.4 Background Sync Triggers
**Purpose**: Automatically sync when conditions change

```typescript
// Trigger 1: App comes online
NetInfo.fetch().then(state => {
  if (state.isConnected && wasOffline) {
    offlineQueue.sync(); // Auto-sync
  }
});

// Trigger 2: Every 5 minutes if online
setInterval(() => {
  if (isOnline && hasQueuedItems) {
    offlineQueue.sync();
  }
}, 5 * 60 * 1000);

// Trigger 3: App resumes from background
AppState.addEventListener('change', (state) => {
  if (state === 'active' && hasQueuedItems) {
    offlineQueue.sync();
  }
});
```

**Tasks**:
- [ ] Implement NetInfo integration for online detection
- [ ] Add 5-minute sync interval
- [ ] Add AppState listener for background/foreground
- [ ] Call useOfflineQueue.sync() on each trigger
- [ ] Respect token expiration (don't sync if 401)

### 2.4.5 Queue Reliability
**Purpose**: Ensure no data is lost, even if app crashes

```typescript
interface QueueEntry {
  id: string; // unique ID
  date: string;
  exercises: Record<string, number>;
  weight: number;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
  maxRetries: number; // default 5
  lastRetryTime: number;
}

// Persistence:
// - Store in AsyncStorage with key: ft.outbox.{id}
// - On app crash, restore from AsyncStorage
// - Resume syncing where it left off

// Retry strategy:
// - Retry on network errors
// - Don't retry on 401/403 (auth issue)
// - Don't retry on 400 (validation issue)
// - Max 5 retries per request
// - Exponential backoff: 1s, 2s, 4s, 8s, 16s

// Queue limits:
// - Max 500 pending requests
// - Warn user if queue > 100 items
// - Show "Too many pending changes, contact support" if max exceeded
```

**Tasks**:
- [ ] Implement persistent queue in AsyncStorage
- [ ] Add retry tracking per request
- [ ] Implement selective retry (network vs. auth vs. validation)
- [ ] Add queue size monitoring
- [ ] Add recovery on app crash
- [ ] Add developer-only queue debugging UI

---

## Phase 2.5: Error Handling & User Feedback
**Duration**: 1-2 days | **Status**: Partial (interceptors done, need utils/errorHandler)

### 2.5.1 Error Mapping Utility
**File to Create**: `utils/errorHandler.ts`

```typescript
type NetworkErrorType =
  | 'NO_INTERNET'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

interface MappedError {
  type: NetworkErrorType;
  message: string; // User-friendly message
  details?: string; // Technical details (dev only)
  retryable: boolean;
}

export function mapNetworkError(error: any): MappedError {
  if (!error.response) {
    // Network error (no internet, timeout, etc.)
    if (error.code === 'ECONNABORTED') {
      return {
        type: 'TIMEOUT',
        message: 'Server not responding. Please check your connection and try again.',
        retryable: true,
      };
    }
    return {
      type: 'NO_INTERNET',
      message: 'No internet connection. Your changes will sync when you\'re back online.',
      retryable: true,
    };
  }

  const status = error.response.status;

  switch (status) {
    case 400:
      return {
        type: 'VALIDATION_ERROR',
        message: error.response.data?.message || 'Invalid input. Please check and try again.',
        retryable: false,
      };
    case 401:
      return {
        type: 'UNAUTHORIZED',
        message: 'Your session expired. Please login again.',
        retryable: false,
      };
    case 403:
      return {
        type: 'FORBIDDEN',
        message: 'You don\'t have permission to do this.',
        retryable: false,
      };
    case 404:
      return {
        type: 'NOT_FOUND',
        message: 'Data not found. Please refresh and try again.',
        retryable: false,
      };
    case 500:
    case 502:
    case 503:
      return {
        type: 'SERVER_ERROR',
        message: 'Server error. Please try again in a moment.',
        retryable: true,
      };
    default:
      return {
        type: 'UNKNOWN',
        message: 'Something went wrong. Please try again.',
        retryable: true,
      };
  }
}
```

**Tasks**:
- [ ] Create utils/errorHandler.ts
- [ ] Implement mapNetworkError() function
- [ ] Map all common HTTP status codes
- [ ] Return user-friendly messages
- [ ] Indicate if error is retryable
- [ ] Test with various error scenarios

### 2.5.2 Toast Notification System
**Implementation**: Via UIContext (from Phase 2.2.2)

**Usage**:
```typescript
const { showToast } = useContext(UIContext);

// Success
showToast('Progress saved!', 'success', 3000);

// Error
showToast('Failed to save. Will retry when online.', 'error', 5000);

// Warning
showToast('Local changes not yet synced', 'warning', 4000);
```

**Tasks**:
- [ ] Implement Toast component
- [ ] Add auto-dismiss after duration
- [ ] Show at top of screen
- [ ] Support multiple toasts (queue)
- [ ] Use appropriate colors (green=success, red=error, etc.)

### 2.5.3 Error Logging
**Purpose**: Send errors to Sentry/Firebase for monitoring

```typescript
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enableInExpoDevelopment: true,
  environment: process.env.ENV || 'development',
});

// In error handler:
export function logError(error: any, context: string) {
  // Never log sensitive data
  const sanitized = {
    message: error.message,
    context,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  };

  if (process.env.ENV === 'production') {
    Sentry.captureException(error, {
      contexts: { error: sanitized },
    });
  } else {
    console.error(`[${context}]`, error);
  }
}
```

**Tasks**:
- [ ] Install Sentry or Firebase Crashlytics
- [ ] Configure error tracking
- [ ] Add logError() calls in critical paths
- [ ] Test error reporting
- [ ] Verify no sensitive data in logs
- [ ] Set up alerts for critical errors

### 2.5.4 Retry UI
**Purpose**: Show user retry options for failed requests

**Components Needed**:
- [ ] RetryButton - manual retry for failed saves
- [ ] RetryCountdown - show exponential backoff timer
- [ ] RetryPrompt - "Failed to save. Retry?" dialog

**Tasks**:
- [ ] Create RetryButton component
- [ ] Connect to offline queue retry logic
- [ ] Show retry countdown during backoff
- [ ] Offer manual retry option
- [ ] Show "Gave up on this change" if max retries exceeded

---

## Phase 2 Success Criteria

### ✅ All Endpoints Implemented
- [ ] GET /api/entries (paginated)
- [ ] GET /api/entries/:date
- [ ] POST /api/entries (save entry)
- [ ] DELETE /api/entries/:date
- [ ] GET /api/summary (with caching)
- [ ] GET /api/entries (for history, paginated)

### ✅ State Management Complete
- [ ] WorkoutContext working
- [ ] UIContext working
- [ ] AuthContext integrated
- [ ] All contexts wrapped at root level
- [ ] State persistence working
- [ ] Hydration on app boot working

### ✅ Offline Sync Working
- [ ] Queue stores requests with tokens
- [ ] Auto-sync when coming online
- [ ] Manual sync every 5 minutes
- [ ] Conflict detection & resolution
- [ ] Queue persistence across crashes
- [ ] Selective retry (network vs. auth)

### ✅ Error Handling Complete
- [ ] Network errors mapped to user messages
- [ ] Toast notifications showing
- [ ] Error logging to Sentry
- [ ] Retry options available
- [ ] No sensitive data in logs

### ✅ Data Validation Complete
- [ ] Client-side validation working
- [ ] API response schema validation
- [ ] Data sanitization implemented
- [ ] Real-time validation feedback

### ✅ Performance
- [ ] Caching reduces API calls
- [ ] Deduplication prevents duplicate requests
- [ ] No memory leaks
- [ ] App starts in <2 seconds
- [ ] Dashboard loads in <1 second (cached)

### ✅ User Experience
- [ ] Clear error messages
- [ ] Offline indicator visible
- [ ] Sync status visible
- [ ] Retry options available
- [ ] No crashes or unexpected behavior

---

## Implementation Order

**Recommended sequence** (not necessarily sequential):

### Week 1 (Days 1-4)
1. API Endpoints (entries.ts, summary.ts, history.ts)
2. Caching layer
3. Request deduplication
4. Response validation

### Week 2 (Days 5-8)
5. WorkoutContext
6. UIContext
7. Auth token integration
8. Sync indicator UI

### Week 2 (Days 9-12)
9. Offline sync enhancements
10. Conflict resolution
11. Error handling utilities
12. Toast notifications
13. Testing & bug fixes

---

## Phase 2 Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Backend endpoints not ready | CRITICAL | Ensure backend team is aligned on timeline |
| Complex state management bugs | HIGH | Use React DevTools, test contexts thoroughly |
| Offline sync data loss | CRITICAL | Implement persistent queue, test crash scenarios |
| Network issues during testing | MEDIUM | Use network throttling tools, test offline mode |
| Performance issues | MEDIUM | Profile early, implement caching from start |

---

## Next Steps

1. ✅ Review this plan
2. ⏳ Confirm backend API endpoints and timing
3. ⏳ Begin Phase 2.1 (API endpoints & caching)
4. ⏳ Build contexts (2.2)
5. ⏳ Complete offline sync (2.4)
6. ⏳ Add error handling (2.5)
7. ⏳ Test thoroughly before Phase 3

---

**Prepared By**: Claude Haiku 4.5
**Date**: January 6, 2026
**Status**: Ready for Review & Execution
