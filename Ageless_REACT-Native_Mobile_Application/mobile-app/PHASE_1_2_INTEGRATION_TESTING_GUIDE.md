# Phase 1 & 2 Integration Testing Guide

**Purpose**: Verify Phase 1 (Authentication) and Phase 2 (Offline-First Architecture) work together correctly in Expo Go before proceeding to Phase 3.

**Date**: January 6, 2026
**Status**: Ready for Testing
**Scope**: Auth flow + Dashboard integration + Offline queue functionality

---

## 📋 Quick Start

### Prerequisites
- ✅ Expo Go installed on iOS/Android device or emulator
- ✅ Project running: `npx expo start`
- ✅ Test backend available or configured (see Mock Backend section)
- ✅ Optional: Redux DevTools / React Query DevTools for debugging

### What Can Be Tested Now
1. ✅ **Phase 1 Auth** - Login, Register, Token Management
2. ✅ **Phase 2 Contexts** - WorkoutContext, UIContext state management
3. ✅ **Phase 2 Offline Queue** - Queue persistence, sync behavior
4. ✅ **Phase 2 API Layer** - Endpoint integration, caching, error handling
5. ✅ **Phase 2 Error Handling** - Error mapping, retry logic
6. ❌ **Phase 3 UI** - Dashboard screens exist but not fully integrated yet

### What Cannot Be Tested Yet
- ❌ History screen (Phase 3)
- ❌ Profile screen (Phase 3)
- ❌ Data export functionality (Phase 3)
- ❌ App Store build (Phase 4)

---

## 🏗️ Testing Architecture

### Component Stack
```
SafeAreaView
  └─ UIProvider (Network, Toast, Sync state)
     └─ WorkoutProvider (Entry cache, mutations)
        └─ Dashboard Screen
           ├─ DatePicker
           ├─ Exercise Cards
           ├─ Weight Input
           ├─ Modals (History, Summary, Scan)
           └─ BottomNav
```

### Data Flow
```
User Input (Exercise + Weight)
  ↓
Dashboard State (exercises, weight)
  ↓
Debounce Timer (2 seconds)
  ↓
saveData() → enqueue() → OfflineQueue.ts
  ↓
Network Available?
  ├─ YES: Sync immediately + show success
  └─ NO: Queue persisted to AsyncStorage, show "Offline" badge
```

### State Management
- **AuthContext** (Phase 1): Manages JWT token, user ID, login/logout
- **UIContext** (Phase 2): Network status, toasts, sync state
- **WorkoutContext** (Phase 2): Entry cache, mutations, offline queue integration

---

## 🔧 Backend Requirements

### Option 1: Use Existing Backend (Recommended)
If backend is already running:
1. Update API_BASE_URL in `lib/api/client.ts`
2. Ensure endpoints exist:
   - `POST /api/entries` - Create/update entry
   - `GET /api/entries?limit=30&offset=0` - List entries
   - `GET /api/entries/:date` - Get single entry
   - `DELETE /api/entries/:date` - Delete entry
   - `GET /api/summary?startDate=...&endDate=...` - Statistics
   - `GET /api/history?page=0` - Paginated history

### Option 2: Mock Backend (For Development)
Create `lib/mocks/mockBackend.ts`:

```typescript
/**
 * Mock Backend for Phase 1 & 2 Testing
 * Simulates API responses without real server
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutEntry } from '../types';

const MOCK_ENTRIES_KEY = 'mock_entries';

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockBackend = {
  // Authentication
  async login(email: string, password: string) {
    await delay(1000); // Simulate network
    if (email === 'test@ageless.com' && password === 'password123') {
      return {
        token: 'mock-jwt-token-' + Date.now(),
        userId: 'user-' + email.split('@')[0],
        expiresIn: 86400, // 24 hours
      };
    }
    throw { response: { status: 401, data: { message: 'Invalid credentials' } } };
  },

  async register(email: string, password: string) {
    await delay(1500);
    return {
      token: 'mock-jwt-token-' + Date.now(),
      userId: 'user-' + email.split('@')[0],
      expiresIn: 86400,
    };
  },

  // Entries CRUD
  async getEntry(date: string) {
    await delay(500);
    const entries = JSON.parse(await AsyncStorage.getItem(MOCK_ENTRIES_KEY) || '{}');
    const entry = entries[date];
    if (!entry) throw { response: { status: 404 } };
    return entry;
  },

  async listEntries(limit: number = 30, offset: number = 0) {
    await delay(800);
    const entries = JSON.parse(await AsyncStorage.getItem(MOCK_ENTRIES_KEY) || '{}');
    const dates = Object.keys(entries).sort().reverse();
    const paginated = dates.slice(offset, offset + limit).map(d => entries[d]);
    return { entries: paginated, total: dates.length };
  },

  async saveEntry(date: string, data: any) {
    await delay(600);
    const entries = JSON.parse(await AsyncStorage.getItem(MOCK_ENTRIES_KEY) || '{}');
    const entry = {
      id: 'entry-' + date,
      userId: 'test-user',
      date,
      exercises: data.fitnessData || {},
      weight: data.weight,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    entries[date] = entry;
    await AsyncStorage.setItem(MOCK_ENTRIES_KEY, JSON.stringify(entries));
    return entry;
  },

  async deleteEntry(date: string) {
    await delay(400);
    const entries = JSON.parse(await AsyncStorage.getItem(MOCK_ENTRIES_KEY) || '{}');
    delete entries[date];
    await AsyncStorage.setItem(MOCK_ENTRIES_KEY, JSON.stringify(entries));
  },

  async getSummary(startDate: string, endDate: string) {
    await delay(700);
    const entries = JSON.parse(await AsyncStorage.getItem(MOCK_ENTRIES_KEY) || '{}');
    const values = Object.values(entries) as any[];
    return {
      totalWorkouts: values.length,
      totalSets: values.reduce((sum, e) => sum + Object.values(e.exercises || {}).length, 0),
      daysActive: values.length,
      exercises: {},
    };
  },

  // Test Helpers
  async clearAllData() {
    await AsyncStorage.removeItem(MOCK_ENTRIES_KEY);
  },
};
```

**Integration in `lib/api/client.ts`**:
```typescript
// At top of file
import { mockBackend } from './mocks/mockBackend';

// Create axios instance
const api = axios.create({
  baseURL: __DEV__ ? 'http://localhost:3000' : 'https://api.ageless.app',
});

// Add request interceptor
api.interceptors.request.use((config) => {
  // Use mock backend in development if MOCK_BACKEND=true
  if (__DEV__ && process.env.MOCK_BACKEND === 'true') {
    // Routes requests through mockBackend
  }
  return config;
});
```

---

## ✅ Manual Testing Checklist

### Section 1: Phase 1 Auth Flow

#### Test 1.1: Register New User
**Steps**:
1. Launch app in Expo Go
2. Tap "Don't have an account? Register"
3. Enter email: `test@ageless.com`
4. Enter password: `TestPass123!`
5. Enter password again (confirm)
6. Tap "Create Account"

**Expected Outcomes**:
- ✅ Loading spinner appears
- ✅ Request sent to backend (check network tab)
- ✅ Token received and stored in SecureStore
- ✅ Redirects to Dashboard
- ✅ User ID persists (check in console)

**What's Being Tested**:
- Phase 1 register logic
- JWT token generation
- expo-secure-store integration
- Navigation flow

---

#### Test 1.2: Login Existing User
**Steps**:
1. From Dashboard, open menu (⋮ icon)
2. Tap "Logout"
3. Should see login screen
4. Enter email: `test@ageless.com`
5. Enter password: `TestPass123!`
6. Tap "Sign In"

**Expected Outcomes**:
- ✅ Loading spinner
- ✅ Credentials validated
- ✅ Token retrieved from backend
- ✅ Redirects to Dashboard
- ✅ Same user ID as before

**What's Being Tested**:
- Phase 1 login logic
- Token refresh mechanism
- Persistent auth state

---

#### Test 1.3: Invalid Credentials
**Steps**:
1. On login screen
2. Enter email: `test@ageless.com`
3. Enter password: `WrongPassword`
4. Tap "Sign In"

**Expected Outcomes**:
- ✅ Request fails (1-2 seconds)
- ✅ Toast shows: "Invalid credentials"
- ✅ Stays on login screen
- ✅ No token stored

**What's Being Tested**:
- Error handling in Phase 1
- User-friendly error messages
- Failed request state

---

#### Test 1.4: Network Error During Login
**Steps**:
1. Turn off WiFi/Mobile data
2. On login screen
3. Enter valid credentials
4. Tap "Sign In"

**Expected Outcomes**:
- ✅ After 30 seconds: timeout
- ✅ Toast shows: "No internet connection"
- ✅ Stays on login screen
- ✅ No partial auth state

**What's Being Tested**:
- Network error detection
- Timeout handling
- Error recovery

---

### Section 2: Phase 2 Context Integration

#### Test 2.1: UIContext Initialization
**Steps**:
1. Log in successfully
2. Dashboard should load without errors
3. Open React DevTools (if available)

**Expected Outcomes**:
- ✅ UIProvider mounted and initialized
- ✅ Network status detected (online/offline)
- ✅ Toast container ready
- ✅ No console errors related to UIContext

**What's Being Tested**:
- UIContext provider wrapping
- NetInfo integration
- Context initialization

---

#### Test 2.2: WorkoutContext Initialization
**Steps**:
1. Stay on Dashboard
2. Check console for WorkoutContext logs

**Expected Outcomes**:
- ✅ WorkoutProvider mounted
- ✅ Entry cache initialized (empty or from AsyncStorage)
- ✅ Mutation state ready (isSaving: false, error: null)
- ✅ No type errors

**What's Being Tested**:
- WorkoutContext provider setup
- AsyncStorage hydration
- Context API usage

---

### Section 3: Phase 2 Offline Queue

#### Test 3.1: Online Save Behavior
**Prerequisites**: Internet connected, logged in

**Steps**:
1. On Dashboard, ensure "Online" badge visible (top-right)
2. Select date: today
3. Enter weight: 185 lbs
4. Tap exercise "+ " button to add sets

**Expected Outcomes**:
- ✅ Exercise count increments
- ✅ After 2 seconds: data saves
- ✅ No visible error toast
- ✅ Data persists across date changes

**What's Being Tested**:
- Online save flow
- Debounce logic (2 seconds)
- API integration
- Cache persistence

---

#### Test 3.2: Offline Queue - Add Items While Offline
**Prerequisites**: Connected to app

**Steps**:
1. Turn off WiFi/Mobile data
2. Add 3 exercises (click +)
3. Change weight to 190
4. Notice "Offline (X pending)" badge
5. Check AsyncStorage in React DevTools

**Expected Outcomes**:
- ✅ Red "Offline" badge with item count: "Offline (1 pending)"
- ✅ Toast: "No internet connection"
- ✅ Queue stored in AsyncStorage key: `offline_queue_v2`
- ✅ Queue item has: { userId, timestamp, date, method, body, status: 'pending' }

**What's Being Tested**:
- Offline detection
- Queue creation
- AsyncStorage persistence
- UI feedback

---

#### Test 3.3: Auto-Sync When Online
**Prerequisites**: Items queued offline

**Steps**:
1. With queue items pending (from Test 3.2)
2. Turn WiFi/data back on
3. Watch for sync behavior

**Expected Outcomes**:
- ✅ "Offline" badge changes to "Syncing..." (orange)
- ✅ Spinner animation visible
- ✅ After 1-3 seconds: "Online" badge
- ✅ Toast: "Synced 1 item"
- ✅ Queue cleared in AsyncStorage

**What's Being Tested**:
- Network reconnection detection
- Auto-sync trigger
- Sync completion handling
- UI state transitions

---

#### Test 3.4: Manual Sync Button
**Prerequisites**: Offline queue with items

**Steps**:
1. Create queue items while offline (Test 3.2)
2. Open "MyABS" menu (⋮)
3. Tap "View Sync Status" (if available)
4. Tap "Sync Now" button

**Expected Outcomes**:
- ✅ Badge shows "Syncing..."
- ✅ Manual sync initiates
- ✅ Results shown in modal
- ✅ Success or error for each item

**What's Being Tested**:
- Manual sync trigger
- Sync result handling
- Modal UI integration

---

### Section 4: Phase 2 Error Handling

#### Test 4.1: Network Timeout
**Prerequisites**: Connected

**Steps**:
1. Throttle network to slow 3G (dev tools if available)
2. Try to add exercise + weight data
3. Wait for timeout (30 seconds)

**Expected Outcomes**:
- ✅ Initial request starts
- ✅ After 30 seconds: Toast "Request took too long"
- ✅ Item queued for retry
- ✅ Automatic retry after 1 second (exponential backoff)

**What's Being Tested**:
- Timeout detection
- Retry scheduling
- User feedback

---

#### Test 4.2: Server Error (5xx) Handling
**Prerequisites**: Mock backend returning 500

**Steps**:
1. Configure mock backend to return 500 error
2. Try to save data
3. Watch retry behavior

**Expected Outcomes**:
- ✅ Toast: "Server error. Will retry automatically."
- ✅ Item marked as 'pending' (not 'failed')
- ✅ Automatic retry after 1s, then 2s, then 4s, etc.
- ✅ Max 5 retry attempts
- ✅ If all fail: item marked 'failed'

**What's Being Tested**:
- Server error mapping
- Retryable error detection
- Exponential backoff
- Max retry limit

---

#### Test 4.3: Auth Error (401) Handling
**Prerequisites**: Token expires or becomes invalid

**Steps**:
1. Modify token in SecureStore to invalid value
2. Try to save data
3. Observe behavior

**Expected Outcomes**:
- ✅ Request fails with 401
- ✅ Item marked as 'failed' (NOT retried)
- ✅ Toast: "Your session expired. Please log in again."
- ✅ Redirected to login screen
- ✅ Queue cleared (prevents cross-user contamination)

**What's Being Tested**:
- Auth error detection
- Non-retryable error classification
- User logout
- Queue security

---

#### Test 4.4: Data Validation Error (400)
**Prerequisites**: Mock endpoint returning 400

**Steps**:
1. Try to save data that fails validation
2. Observe response

**Expected Outcomes**:
- ✅ Toast: "Invalid request. Please check your input."
- ✅ Item marked as 'failed' (NOT retried)
- ✅ No automatic retry attempts

**What's Being Tested**:
- Validation error mapping
- Client-side error handling
- User guidance

---

#### Test 4.5: Conflict Error (409)
**Prerequisites**: Item modified on backend

**Steps**:
1. Create entry on phone (don't sync immediately)
2. Modify same entry on backend (if possible)
3. Try to sync from phone
4. Observe conflict dialog

**Expected Outcomes**:
- ✅ Request fails with 409 status
- ✅ Response includes serverData
- ✅ Modal appears: "Server has newer data"
- ✅ Shows both versions:
   - Local: { exercises, weight }
   - Server: { exercises, weight }
- ✅ Two buttons: "Keep Local" and "Use Server"

**If User Chooses "Keep Local"**:
- ✅ Item status: pending → syncing
- ✅ Retry with local data
- ✅ If succeeds: toast "Synced"

**If User Chooses "Use Server"**:
- ✅ Load server version
- ✅ Item status: conflict → synced
- ✅ Queue cleared

**What's Being Tested**:
- Conflict detection
- User resolution UI
- Conflict retry logic

---

### Section 5: Data Persistence & Caching

#### Test 5.1: AsyncStorage Persistence
**Prerequisites**: Items saved online

**Steps**:
1. Save some exercise data while online
2. Force close app
3. Reopen app
4. Log back in

**Expected Outcomes**:
- ✅ Previously saved data appears
- ✅ No loading from network (uses cache)
- ✅ Cache TTL respected:
   - Single entry: 1 hour
   - Entry list: 5 minutes
   - Summary: 5 minutes

**What's Being Tested**:
- AsyncStorage caching
- Data persistence
- Cache TTL validation

---

#### Test 5.2: Cache Invalidation on Save
**Prerequisites**: Cached data exists

**Steps**:
1. View Dashboard (cache populates)
2. Add new exercise
3. Switch to different date
4. Switch back to original date

**Expected Outcomes**:
- ✅ Old cache cleared (not used)
- ✅ Fresh data requested
- ✅ New values shown
- ✅ No stale data

**What's Being Tested**:
- Cache invalidation logic
- Mutation cache clearing
- Data freshness

---

#### Test 5.3: Request Deduplication
**Prerequisites**: Network throttled to slow connection

**Steps**:
1. Slow network to ~5-10 seconds per request
2. Rapidly click same exercise + button multiple times
3. Check network tab

**Expected Outcomes**:
- ✅ Multiple rapid clicks → single request (dedup)
- ✅ 2-second dedup window
- ✅ Response shared across requests
- ✅ No duplicate saves

**What's Being Tested**:
- Request deduplication logic
- 2-second dedup window
- Multiple request consolidation

---

### Section 6: Integration End-to-End Flow

#### Test 6.1: Complete Offline → Online Journey
**Steps**:

1. **Setup**: Logged in, connected to internet
   - ✅ Dashboard loads
   - ✅ "Online" badge visible

2. **Go Offline**: Turn off WiFi
   - ✅ "Offline" badge appears
   - ✅ Toast: "Connection lost"

3. **Make Changes**: Add 2 exercises, set weight
   - ✅ Changes visible immediately (optimistic update)
   - ✅ Toast: "No internet connection"
   - ✅ "Offline (1 pending)" badge

4. **Add More**: Switch dates, add more exercises
   - ✅ Multiple items queued
   - ✅ Badge: "Offline (2 pending)"

5. **Come Online**: Turn WiFi back on
   - ✅ Badge → "Syncing..."
   - ✅ Spinner animation
   - ✅ After sync completes → "Online"
   - ✅ Toast: "Synced 2 items"

6. **Verify**: Check that all data synced
   - ✅ No pending items
   - ✅ All changes persisted

**What's Being Tested**:
- Complete offline flow
- Queue management
- Network detection
- Sync completion
- Data integrity

---

#### Test 6.2: Error Recovery Flow
**Steps**:

1. **Network Error**: Slow connection, timeout
2. **Queue Builds**: Multiple retries, backoff delays
3. **Network Recovers**: Connection restored
4. **Auto-Sync**: Queue syncs automatically
5. **Verify Success**: All items processed

**Expected Outcome**: System recovers gracefully, no data loss

---

### Section 7: Stress Testing

#### Test 7.1: Large Offline Queue (50+ Items)
**Prerequisites**: Ability to create many queue items

**Steps**:
1. Go offline
2. Create 50+ queue items (rapid clicks)
3. Turn online

**Expected Outcomes**:
- ✅ App remains responsive
- ✅ No crashes
- ✅ Sync handles all items
- ✅ Queue limited to 500 items max

**What's Being Tested**:
- Queue size limits
- Performance under load
- Sync scalability

---

#### Test 7.2: Memory Leak Check
**Prerequisites**: App running for 10+ minutes

**Steps**:
1. Use app for 10+ minutes
2. Open/close modals multiple times
3. Switch between screens
4. Toggle online/offline frequently

**Expected Outcomes**:
- ✅ No increasing memory usage
- ✅ No performance degradation
- ✅ Smooth animations throughout
- ✅ No unresponsive UI

**What's Being Tested**:
- Memory management
- Listener cleanup
- Performance stability

---

## 🐛 Debugging Guide

### Common Issues & Solutions

#### Issue: "AsyncStorage not initialized"
**Cause**: UIContext not wrapped properly
**Solution**: Check `app/_layout.tsx` - UIProvider must wrap all screens

#### Issue: "Network always offline"
**Cause**: NetInfo listener not running
**Solution**: Check `UIContext.tsx` - useEffect hook for NetInfo.addEventListener

#### Issue: "Queue items never sync"
**Cause**: User ID mismatch
**Solution**: Check `useOfflineQueue.ts` - userId validation before sync

#### Issue: "Token expired but still trying to use"
**Cause**: Token refresh not implemented
**Solution**: Add token refresh interceptor in `lib/api/client.ts`

### Debugging Tools

#### 1. React DevTools
```bash
# Install global
npm install -g react-devtools

# Start devtools
react-devtools

# In app, open menu and select "Debug remote JS"
```

#### 2. AsyncStorage Inspector
```typescript
// Add to Dashboard for debugging
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugAsyncStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const values = await AsyncStorage.multiGet(keys);
  console.log('AsyncStorage contents:', Object.fromEntries(values));
};

// Call after load
useEffect(() => {
  debugAsyncStorage();
}, []);
```

#### 3. Network Monitoring
```typescript
// Add to useOfflineQueue.ts
const logNetworkEvent = (event: string, data: any) => {
  console.log(`[Network] ${event}:`, data);
  // Can send to Sentry in production
};
```

#### 4. Queue Status Check
```typescript
// Add to Dashboard menu
const viewQueueStatus = async () => {
  const queue = await getQueue();
  console.log('Pending items:', queue.filter(q => q.status === 'pending'));
  console.log('Failed items:', queue.filter(q => q.status === 'failed'));
  console.log('Conflicts:', queue.filter(q => q.status === 'conflict'));
};
```

---

## 📊 Testing Results Template

Use this template to document your testing results:

```markdown
# Phase 1 & 2 Integration Test Results

**Date**: [Date]
**Tester**: [Name]
**Device**: [iOS/Android, Model, OS Version]
**Backend**: [Real / Mock]

## Auth Tests
- [ ] Register: PASS / FAIL
- [ ] Login: PASS / FAIL
- [ ] Invalid Credentials: PASS / FAIL
- [ ] Network Error: PASS / FAIL

## Context Tests
- [ ] UIContext Init: PASS / FAIL
- [ ] WorkoutContext Init: PASS / FAIL

## Offline Queue Tests
- [ ] Online Save: PASS / FAIL
- [ ] Add Items Offline: PASS / FAIL
- [ ] Auto-Sync Online: PASS / FAIL
- [ ] Manual Sync: PASS / FAIL

## Error Handling Tests
- [ ] Timeout: PASS / FAIL
- [ ] Server Error (5xx): PASS / FAIL
- [ ] Auth Error (401): PASS / FAIL
- [ ] Validation Error (400): PASS / FAIL
- [ ] Conflict (409): PASS / FAIL

## Persistence Tests
- [ ] AsyncStorage: PASS / FAIL
- [ ] Cache Invalidation: PASS / FAIL
- [ ] Request Dedup: PASS / FAIL

## End-to-End Tests
- [ ] Offline → Online Journey: PASS / FAIL
- [ ] Error Recovery: PASS / FAIL

## Stress Tests
- [ ] Large Queue (50+ items): PASS / FAIL
- [ ] Memory Leak Check: PASS / FAIL

## Issues Found
1. [Issue 1]
   - Severity: High/Medium/Low
   - Reproduction: [Steps]
   - Impact: [What doesn't work]

## Notes
[Any additional observations]
```

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. Document all passing tests
2. Commit a "test results" note to git
3. Proceed to Phase 3 (Dashboard Screens)

### If Some Tests Fail ❌
1. Identify which component is failing
2. Check console errors and logs
3. Review relevant code section
4. Fix the issue
5. Re-test that specific flow
6. Commit fix with clear message

### Phase 3 Prerequisites
- ✅ Phase 1 Auth working end-to-end
- ✅ Phase 2 Offline/Online flows verified
- ✅ Phase 2 Error handling functional
- ✅ No critical bugs blocking Progress

---

## 📚 Related Documentation

- **Phase 1 Summary**: [PHASE_1_FINAL_SUMMARY.md](PHASE_1_FINAL_SUMMARY.md)
- **Phase 2 Summary**: [PHASE_2_FINAL_SUMMARY.md](PHASE_2_FINAL_SUMMARY.md)
- **Testing Guide**: [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **API Specification**: [PHASE_2_TECHNICAL_SPEC.md](PHASE_2_TECHNICAL_SPEC.md)
- **Sentry Setup**: [SENTRY_SETUP_GUIDE.md](SENTRY_SETUP_GUIDE.md)

---

## 📞 Support

If you encounter issues during testing:

1. **Check logs**: Console warnings/errors
2. **Review code**: Check relevant files mentioned in test
3. **Debug state**: Use AsyncStorage inspector
4. **Ask for help**: Include error message + reproduction steps

---

**Ready to test Phase 1 & 2 integration!** 🧪
