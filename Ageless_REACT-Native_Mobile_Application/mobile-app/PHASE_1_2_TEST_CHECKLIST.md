# Phase 1 & 2 Quick Test Checklist

**Quick reference for manual testing in Expo Go**

---

## 🚀 Pre-Test Setup

- [ ] Expo Go running: `npx expo start`
- [ ] Device connected or emulator ready
- [ ] Internet connection (for online tests)
- [ ] Test account ready: `test@ageless.com` / `TestPass123!`
- [ ] Backend available or mock enabled

---

## ✅ Phase 1: Authentication (5 min)

### Login/Register
- [ ] **Register**: New account created successfully
- [ ] **Login**: Existing account logs in with token saved
- [ ] **Invalid Auth**: Wrong password shows error toast
- [ ] **Network Error**: No connection shows timeout error after 30s

---

## ✅ Phase 2: Offline Queue (10 min)

### Online Behavior
- [ ] **Online Badge**: Green "Online" indicator visible
- [ ] **Save Online**: Add exercise + weight, saves after 2s debounce
- [ ] **No Errors**: No error messages in online mode

### Offline Behavior
- [ ] **Offline Badge**: Red "Offline (X pending)" when WiFi off
- [ ] **Queue Items**: Multiple changes stored locally
- [ ] **Persistence**: Queue survives app restart (AsyncStorage)

### Sync Behavior
- [ ] **Auto-Sync**: Badge → "Syncing..." → "Online" when reconnected
- [ ] **Toast Feedback**: "Synced X items" shown after success
- [ ] **Queue Cleared**: All items synced and removed

---

## ✅ Phase 2: Error Handling (5 min)

### Error Types
- [ ] **Timeout (30s)**: Slow network shows timeout message
- [ ] **Server Error (5xx)**: Retries with exponential backoff
- [ ] **Auth Error (401)**: Logs out, redirects to login
- [ ] **Validation (400)**: Shows error, doesn't retry
- [ ] **Conflict (409)**: Modal shows both versions, user resolves

---

## ✅ Phase 2: Caching & Performance (5 min)

### Cache Behavior
- [ ] **Entry Cache (1h)**: Same date doesn't reload
- [ ] **List Cache (5m)**: History modal uses cache
- [ ] **Cache Invalidation**: Saving clears old cache

### Deduplication
- [ ] **Request Dedup**: Rapid clicks → single request
- [ ] **2s Window**: Simultaneous requests consolidated

---

## ✅ End-to-End Scenarios (10 min)

### Complete Offline Journey
1. [ ] Go online → offline
2. [ ] Add exercise + weight
3. [ ] See "Offline (1 pending)"
4. [ ] Go back online
5. [ ] See "Syncing..." then "Online"
6. [ ] Verify data persisted

### Error & Recovery
1. [ ] Slow network → timeout
2. [ ] Queue builds up
3. [ ] Network recovers
4. [ ] Auto-sync succeeds
5. [ ] Queue cleared

---

## 🎯 Success Criteria

**All tests pass if**:
- ✅ Auth flow works (login/register)
- ✅ Online save works (2s debounce)
- ✅ Offline queue works (items stored)
- ✅ Sync works (auto-sync on online)
- ✅ Errors handled (user-friendly messages)
- ✅ No crashes or console errors
- ✅ Data persists across app restart

**If any test fails**:
- Check console for errors
- Review relevant test section in PHASE_1_2_INTEGRATION_TESTING_GUIDE.md
- Use debugging tools (AsyncStorage inspector, etc.)
- Fix issue and re-test

---

## 📝 Results

**Date Tested**: ___________
**Tester**: ___________
**Device**: ___________

**Summary**: All tests ___ PASS / ___ SOME FAILED

**Issues Found**:
1. ___________
2. ___________
3. ___________

**Ready for Phase 3?**: ___ YES / ___ NO (needs fixes)

---
