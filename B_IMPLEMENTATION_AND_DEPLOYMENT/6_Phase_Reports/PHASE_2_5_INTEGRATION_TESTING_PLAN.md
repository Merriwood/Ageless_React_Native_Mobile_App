# Phase 2.5 Integration Testing - Comprehensive Plan

**Status**: Ready for Implementation
**Date**: 2026-01-09
**Scope**: 20+ components/screens, 100+ test cases
**Objective**: Validate integration of all Phase 1 & 2 components before Phase 3

---

## Executive Summary

Phase 2.5 Integration Testing is a comprehensive validation phase that ensures all components work together correctly in realistic mobile app scenarios. This plan provides clear scope, test cases, success criteria, tools, and implementation approach.

**Current Status**: Phase 3.5 Design Refinement COMPLETE with 100% PWA design parity
**Ready for**: Comprehensive integration testing with verified design

---

## 1. Testing Scope

### In Scope
- Authentication flows (login, register, biometric)
- Dashboard with workout entries and CRUD operations
- History screen with pagination and filtering
- Profile screen with user settings
- Navigation (bottom nav, drawer)
- Offline/online synchronization
- Error handling and recovery
- Data persistence and caching
- Real-time UI state management
- Performance and memory optimization

### Components to Test (20+ items)
**Core State**: UIContext, WorkoutContext
**Hooks**: useAuth, useOfflineQueue, useSyncTriggers, useBiometric
**Screens**: LoginScreen, RegisterScreen, DashboardScreen, HistoryScreen, ProfileScreen
**Modals**: SyncIndicator, HistoryModal, SummaryModal, ScanModal
**UI Components**: Button, Input, Card, DatePicker, WorkoutCard, OfflineBadge
**API Layer**: auth, entries, history, summary endpoints
**Utilities**: errorHandler, validation

### Out of Scope (Phase 3+)
- Advanced analytics integration
- Push notifications
- Third-party integrations (Sentry, Amplitude)
- Payment processing
- Multi-device cloud sync

---

## 2. Testing Strategy

### Multi-Layer Approach
```
Test Pyramid:
┌─────────────────────────────────────────┐
│  E2E Tests (Manual, 30+ scenarios)     │  Top
├─────────────────────────────────────────┤
│  Visual/UI Tests (Screenshots)         │
├─────────────────────────────────────────┤
│  Integration Tests (API, State, Sync)  │
├─────────────────────────────────────────┤
│  Component Tests (Rendering, Props)    │
├─────────────────────────────────────────┤
│  Unit Tests (Functions, Utilities)     │  Base
└─────────────────────────────────────────┘
```

### 10 Test Categories

1. **Unit Tests** - Individual functions (80%+ coverage target)
2. **Component Integration** - Component rendering with props
3. **Screen Flow Tests** - Complete user workflows
4. **Data Flow & State Management** - Context and hooks
5. **Offline/Sync Tests** - Offline-first architecture
6. **Navigation Tests** - Screen transitions
7. **UI/Visual Tests** - Design token compliance
8. **Performance Tests** - Rendering and memory
9. **Accessibility Tests** - WCAG compliance
10. **Error Handling Tests** - Error mapping and recovery

---

## 3. Detailed Test Case Matrix

### Authentication (15 Login + 15 Register Tests)

**LoginScreen Critical Tests**:
- AUTH-001: Valid email + password login
- AUTH-002: Invalid email format error
- AUTH-003: Empty email field error
- AUTH-004: Empty password field error
- AUTH-005: Wrong password error
- AUTH-006: Non-existent user error
- AUTH-007: Network timeout error
- AUTH-008: Server 5xx error
- AUTH-009: Show/hide password toggle
- AUTH-010: Password masking
- AUTH-012: Special characters in password
- AUTH-013: Navigate to register
- AUTH-014: Back button behavior
- AUTH-015: Login offline (queue)

**RegisterScreen Critical Tests**:
- AUTH-016: Valid registration
- AUTH-017: Duplicate email error
- AUTH-018: Weak password error
- AUTH-019: Password mismatch error
- AUTH-020: Empty required field error
- AUTH-021: Invalid email format error
- AUTH-022: Very long password handling
- AUTH-023: Special characters in name
- AUTH-024: Biometric setup option
- AUTH-025: Decline biometric
- AUTH-026: Enable biometric
- AUTH-027: Offline registration (queue)
- AUTH-028: Server error during register
- AUTH-029: Prevent double submission
- AUTH-030: Navigation between screens

### Dashboard (15 Tests)

| ID | Test | Expected |
|----|------|----------|
| DASH-001 | Load empty dashboard | Shows empty state + add button |
| DASH-002 | Display existing workouts | Shows all cards for date |
| DASH-003 | Select different date | Updates to new date |
| DASH-004 | Add new workout | Modal opens |
| DASH-005 | Save new workout | Appears in list |
| DASH-006 | Edit existing workout | Editor opens with values |
| DASH-007 | Update workout | Changes saved and visible |
| DASH-008 | Delete workout | Confirms, removes from list |
| DASH-009 | Offline add | Queued, shows sync indicator |
| DASH-010 | Sync queued | Auto-syncs when online |
| DASH-011 | Scroll workouts | Smooth rendering |
| DASH-012 | Date selector | Defaults to today |
| DASH-013 | Past dates | Shows historical data |
| DASH-014 | Future dates | Empty state if no data |
| DASH-015 | Rapid date changes | No race conditions |

### History (15 Tests)

| ID | Test | Expected |
|----|------|----------|
| HIST-001 | Load history | Shows paginated list |
| HIST-002 | Initial page | Shows first 10-20 items |
| HIST-003 | Load more | Next page loads automatically |
| HIST-004 | Filter by date range | Shows only in range |
| HIST-005 | Filter by exercise | Shows only selected |
| HIST-006 | Clear filters | Shows all entries |
| HIST-007 | Search by name | Filters by match |
| HIST-008 | Tap entry | Opens modal |
| HIST-009 | Pagination indicator | Shows page |
| HIST-010 | Empty state | Shows message |
| HIST-011 | Loading state | Shows spinner |
| HIST-012 | Network error | Shows retry |
| HIST-013 | Offline access | Shows cached |
| HIST-014 | Large dataset (1000+) | Handles efficiently |
| HIST-015 | Filter performance | Quick without lag |

### Navigation (15 Tests)

| ID | Test | Expected |
|----|------|----------|
| NAV-001 | Tab visible | On all screens |
| NAV-002 | Dashboard tab | Navigates correctly |
| NAV-003 | History tab | Navigates correctly |
| NAV-004 | Profile tab | Navigates correctly |
| NAV-005 | Active tab highlight | Shows current |
| NAV-006 | Tab icons | All visible |
| NAV-007 | Tab labels | All readable |
| NAV-008 | Touch targets | 44+ points |
| NAV-009 | State preservation | Returns to same state |
| NAV-010 | Offline navigation | Works without internet |
| DRAW-001 | Drawer opens | Menu appears |
| DRAW-002 | User header | Shows user info |
| DRAW-003 | Menu items | Navigate correctly |
| DRAW-004 | Close button | Dismisses |
| DRAW-005 | Backdrop dismiss | Tapping outside closes |

### Offline & Sync (20 Tests)

| ID | Test | Expected |
|----|------|----------|
| OFFQ-001 | Queue offline request | Item added |
| OFFQ-002 | Persist to storage | Survives restart |
| OFFQ-003 | TTL enforced | Expires after 24 hours |
| OFFQ-004 | Max size enforced | Cannot exceed 500 |
| OFFQ-005 | Prevent user mismatch | Cleared on logout |
| OFFQ-006 | Sync when online | All items synced |
| OFFQ-007 | FIFO order | Items sync in order |
| OFFQ-008 | Deduplication | Duplicates removed |
| OFFQ-009 | Sync on reconnect | Auto triggers |
| OFFQ-010 | Manual sync trigger | Force sync works |
| OFFQ-011 | Conflict detection | 409 detected |
| OFFQ-012 | Sync progress visible | Shows in UI |
| OFFQ-013 | Queue cleanup | Synced items removed |
| OFFQ-014 | Retry backoff | Failed items retry |
| OFFQ-015 | Large queue (500) | Handles efficiently |
| OFFB-001 | Show online | Green, "Online" |
| OFFB-002 | Show offline | Red, "Offline" |
| OFFB-003 | Toggle on network | Updates immediately |
| OFFB-004 | Position correct | Doesn't block UI |
| OFFB-005 | Animations smooth | No stutter |

### UI Components (20 Tests)

| ID | Test | Expected |
|----|------|----------|
| BTN-001 | Default style | Primary color |
| BTN-002 | Outline style | Border, transparent |
| BTN-003 | Ghost style | No background |
| BTN-004 | Small size | 40px height |
| BTN-005 | Default size | 44px height |
| BTN-006 | Large size | 48px height |
| BTN-007 | Disabled state | Opacity reduced |
| BTN-008 | Loading state | Shows spinner |
| BTN-009 | Press callback | Fires on press |
| BTN-010 | Text color | Correct by variant |
| INP-001 | Text input | Field visible |
| INP-002 | Email keyboard | Correct keyboard |
| INP-003 | Password masked | Characters hidden |
| INP-004 | Placeholder | Text visible |
| INP-005 | Value change | Callback fires |
| INP-006 | Error state | Message shown |
| INP-007 | Disabled | Not editable |
| CARD-001 | Card renders | Container visible |
| CARD-002 | Shadow | Elevation visible |
| DATE-001 | DatePicker | Picker visible |

### Error Handling (15 Tests)

| ID | Test | Expected |
|----|------|----------|
| ERR-001 | 400 Bad Request | VALIDATION_ERROR |
| ERR-002 | 401 Unauthorized | UNAUTHORIZED, logout |
| ERR-003 | 403 Forbidden | FORBIDDEN |
| ERR-004 | 404 Not Found | Returns null |
| ERR-005 | 409 Conflict | CONFLICT |
| ERR-006 | 500 Server Error | SERVER_ERROR, retryable |
| ERR-007 | Network error | NO_INTERNET |
| ERR-008 | Timeout | TIMEOUT |
| REC-001 | Timeout recovery | "Try again" option |
| REC-002 | Network recovery | Auto-retry on reconnect |
| REC-003 | Auth error recovery | Logout, redirect |
| REC-004 | Validation recovery | Message, allow correction |
| REC-005 | Conflict recovery | Merge options |
| REC-006 | Sequential errors | Multiple handled |
| REC-007 | Error toast visible | Not blocked |

### Data Persistence (15 Tests)

| ID | Test | Expected |
|----|------|----------|
| CACHE-001 | Entry cache TTL (1h) | Expires after 1 hour |
| CACHE-002 | Summary cache TTL (5m) | Expires after 5 minutes |
| CACHE-003 | History cache TTL (10m) | Expires after 10 minutes |
| CACHE-004 | Invalidate on save | Related cleared |
| CACHE-005 | Invalidate on delete | Related cleared |
| CACHE-006 | Deduplication (2s) | Duplicates combined |
| CACHE-007 | Size limit | Doesn't grow unbounded |
| CACHE-008 | Persists | Survives restart |
| STOR-001 | Write to storage | Data persisted |
| STOR-002 | Read from storage | Data retrieved |
| STOR-003 | Update | Data updated |
| STOR-004 | Delete | Data removed |
| STOR-005 | Quota | Doesn't exceed limits |
| STOR-006 | Encryption | Sensitive encrypted |
| STOR-007 | Migration | Handles schema changes |

---

## 4. Success Criteria

### Overall Success (ALL must be met)

1. **Automated Tests Passing**
   - Unit tests: 80%+ coverage, all passing
   - Integration tests: All passing
   - Component tests: All passing
   - No flaky tests

2. **Manual Testing Complete**
   - All P0 tests documented and passed
   - All P1 tests documented and passed
   - Zero critical bugs unaddressed
   - Zero high bugs unaddressed

3. **Code Quality**
   - No TypeScript errors
   - No console errors/warnings
   - No memory leaks
   - Performance acceptable

4. **Accessibility**
   - Touch targets 44x44+
   - Color contrast WCAG AA
   - Keyboard navigation works
   - Screen reader compatible

5. **Documentation**
   - Test results documented
   - Bugs logged with severity
   - Known limitations listed
   - Phase dependencies clear

### Performance Targets

| Metric | Target | Acceptable | Max |
|--------|--------|-----------|-----|
| App Launch | < 3s | < 5s | > 5s |
| Screen Nav | < 100ms | < 300ms | > 500ms |
| List FPS | 60 fps | 55+ fps | < 50 fps |
| Memory (idle) | < 100MB | < 150MB | > 200MB |
| Memory (1000 items) | < 200MB | < 250MB | > 300MB |
| API Response | < 500ms | < 1s | > 2s |
| Sync Queue | < 5s | < 10s | > 30s |

---

## 5. Tools & Environment

### Required Tools
- Jest 30+
- React Native Testing Library
- Expo (54+)
- Node.js 18+ LTS
- Android Studio (Android simulator)
- Xcode 15+ (iOS simulator)

### Testing Frameworks
- Jest: Unit/integration tests
- React Native Testing Library: Component tests
- AsyncStorage Mock: Storage testing
- Expo SecureStore Mock: Secure storage
- Mock Service Worker (optional): API mocking

### Test Environment Setup
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test -- offline-queue.test.ts

# Watch mode
npm test -- --watch

# Integration tests only
npm test -- integration
```

### Simulator Setup
```bash
# iOS Simulator
npx expo start --ios

# Android Simulator
npx expo start --android

# Expo Go (physical device)
npx expo start
```

---

## 6. Implementation Phases

### Phase 1: Setup (Day 1)
- [ ] Configure test environment
- [ ] Setup test mocks
- [ ] Create test utilities
- [ ] Document setup

### Phase 2: Unit Tests (Days 2-4)
- [ ] Utility functions
- [ ] Hooks
- [ ] API methods
- [ ] Context providers
- Target: 80%+ coverage

### Phase 3: Component Tests (Days 5-7)
- [ ] UI components
- [ ] Modals
- [ ] Screen components
- [ ] Integration tests

### Phase 4: Manual Testing (Days 8-14)
- [ ] P0 critical path tests
- [ ] P1 feature tests
- [ ] Edge cases
- [ ] Stress tests
- [ ] Accessibility
- [ ] Document results

### Phase 5: Bug Fixes & Sign-Off (Days 15+)
- [ ] Fix identified issues
- [ ] Retest affected areas
- [ ] Final verification
- [ ] Sign off

---

## 7. Manual Testing Scenarios

### Critical User Journey 1: Registration → Dashboard
```
1. Start app → See login
2. Tap "Register"
3. Enter email: user@example.com
4. Enter password: SecurePass123!
5. Confirm password: SecurePass123!
6. Enter name: John Doe
7. (Optional) Enable biometric
8. Tap "Register"
9. Verify: Redirected to dashboard
10. Verify: User name in profile
SUCCESS: User logged in, profile correct
```

### Critical User Journey 2: Offline Add → Sync Online
```
1. On dashboard with internet
2. Turn off internet
3. Tap "Add Workout"
4. Enter exercise data
5. Tap "Save"
6. Verify: "Offline" badge shows
7. Verify: Entry shows sync icon
8. Turn internet back on
9. Verify: Sync indicator shows
10. Verify: Entry synced
SUCCESS: Offline save queued, synced online
```

### Critical User Journey 3: Navigation
```
1. On dashboard
2. Tap History → History screen appears
3. Tap Profile → Profile screen appears
4. Tap Dashboard → Dashboard screen appears
5. Open drawer → Menu appears
6. Tap Profile → Profile screen
7. Tap back → Drawer closes
SUCCESS: All navigation smooth
```

### Critical User Journey 4: Error Handling
```
1. On dashboard
2. Add new workout
3. Simulate network error during save
4. Verify: Error message shown
5. Tap "Retry"
6. Verify: Progress shown
7. Simulate success
8. Verify: Entry saved
SUCCESS: Error shown, retry works
```

### Critical User Journey 5: Data Persistence
```
1. Add 3 workouts to dashboard
2. Close app completely
3. Reopen app
4. Verify: All 3 workouts still visible
5. Verify: Same date selected
6. Go to history
7. Verify: 3 entries visible
SUCCESS: Data persists across restart
```

### Stress Tests
- **Rapid Submission**: Tap "Save" multiple times → Only one entry created
- **Large Queue**: Add 50+ offline items → All sync, no crashes, no data loss
- **Date Changes**: Rapidly change dates → No race conditions, correct final state
- **Online/Offline**: Toggle 10 times rapidly → Stable, no data loss, sync works
- **Memory (15 min)**: Navigate repeatedly → Memory stable, no leaks

### Edge Cases
- Very long input (1000 chars)
- Special characters (O'Brien & Co.)
- Rapid logout
- Queue at capacity (500 items)
- Session expires during operation

---

## 8. Bug Severity Levels

**Critical**: App crash, data loss, auth broken
- Must fix before release

**High**: Feature broken, major performance issue
- Must fix or document

**Medium**: Workaround exists, minor perf issue
- Should fix

**Low**: UI polish, minor edge cases
- Can defer

---

## 9. Test Result Tracking

### Daily Test Log Format
```
Date: [DATE]
Tester: [NAME]
Environment: [iOS/Android/Simulator]
Build: [VERSION]

CRITICAL TESTS:
- [ ] Login: PASS/FAIL
- [ ] Register: PASS/FAIL
- [ ] Add Workout: PASS/FAIL
- [ ] Offline Queue: PASS/FAIL
- [ ] Navigation: PASS/FAIL

BUGS FOUND: [COUNT]
PASS RATE: X/Y

Signature: _________ Date: _______
```

### Final Report Contents
- Summary (pass rate, coverage)
- Test breakdown by category
- Bug summary by severity
- Performance metrics
- Sign-off with date and name

---

## 10. Regression Testing

### Critical Path Tests (Every Build)
- Login/Register flow
- Add/Save workout
- Screen navigation
- Offline queue create and sync
- Error handling and recovery

### Full Regression (Before Release)
- All unit tests
- All integration tests
- All component tests
- All manual scenarios
- All edge cases
- All stress tests

---

## 11. Risks & Contingencies

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Network mocking issues | Medium | High | Multiple mocking strategies |
| Platform-specific issues | Medium | Medium | Test both iOS/Android |
| Performance regression | Low | High | Profile early, establish baselines |
| Test flakiness | Medium | Medium | Stable patterns, increase waits |
| Data loss during sync | Low | Critical | Extensive offline queue testing |
| Auth failures | Low | High | Thorough auth flow testing |
| Memory leaks | Medium | High | Memory profiling, cleanup verification |

### Contingency Plans
- If unit tests fail rapidly: Focus on integration/manual instead
- If critical bugs found: Pause testing, fix issues, restart
- If performance issues: Profile, optimize, re-baseline
- If network issues: Use offline mock server

---

## 12. Next Steps

### Ready to Start Phase 2.5 When:
- ✅ Phase 3.5 Design Refinement complete (DONE)
- ✅ All 9 components refined and design-verified (DONE)
- ✅ Test environment ready
- ✅ Test plan approved
- ✅ Team assigned

### To Begin Phase 2.5:
1. Setup test environment per section 5
2. Configure Jest and mocks
3. Create test utilities
4. Begin unit tests
5. Execute manual tests
6. Document results
7. Fix issues
8. Sign off

---

## Sign-Off

**Plan Created**: 2026-01-09
**Plan Status**: Ready for Implementation
**Next Phase**: Phase 2.5 Integration Testing
**Expected Duration**: 15-25 days (sequential) or 8-12 days (parallel)

---

*This comprehensive plan provides the roadmap for Phase 2.5 Integration Testing with 100+ specific test cases, clear success criteria, and actionable implementation steps.*
