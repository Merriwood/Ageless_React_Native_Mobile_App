# Phase 2.5 Testing Setup Guide

**For executing manual testing in Expo Go**

**Date**: January 6, 2026

---

## ⚠️ Important: Correct Directory

The `package.json` is located in the `mobile-app` subdirectory, NOT in the parent directories.

### ❌ Wrong Paths (will cause ConfigError)
```
C:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\package.json
C:\Users\SDWOR\Ageless_React_Native_Mobile_App\package.json
```

### ✅ Correct Path
```
C:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app\package.json
```

---

## 🚀 Quick Start (Correct Method)

### Step 1: Open Terminal/PowerShell

### Step 2: Navigate to Correct Directory
```bash
cd "C:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app"
```

### Step 3: Verify You're in Correct Directory
```bash
# You should see these files:
# - package.json
# - app.json
# - app/ (folder)
# - node_modules/ (folder)

ls package.json app.json
```

### Step 4: Start Development Server
```bash
npx expo start
```

### Step 5: Follow On-Screen Instructions
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go (on physical device)
- Or use `w` for web (limited testing)

---

## 📝 Testing in Expo Go

Once the dev server is running and Expo Go opens:

### Execute Testing Checklist
1. **Follow**: `PHASE_1_2_TEST_CHECKLIST.md` (20 minutes)
   - Auth tests
   - Offline queue tests
   - Error handling tests
   - Caching tests
   - End-to-end tests

2. **Document**: Results in template provided

3. **If Issues Found**: Use `PHASE_1_2_INTEGRATION_TESTING_GUIDE.md` for detailed steps

---

## 🔧 Troubleshooting ConfigError

### If You See "ConfigError: The expected package.json path..."

**Cause**: Running `npx expo start` from wrong directory

**Solution**:
```bash
# WRONG - from root directory:
cd C:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App
npx expo start  # ❌ This will fail

# CORRECT - from mobile-app directory:
cd C:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app
npx expo start  # ✅ This works
```

### Alternative: Full Path Command
```bash
cd "C:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app" && npx expo start
```

### If Dependencies Are Missing
```bash
# From mobile-app directory:
npm install
npx expo start
```

---

## 📋 Testing Checklist (Once App Loads)

### Phase 1: Authentication (5 tests)
- [ ] Register new account
- [ ] Login with existing account
- [ ] Test invalid credentials
- [ ] Test network timeout during auth
- [ ] Verify token persists on app restart

### Phase 2: Offline Queue (6 tests)
- [ ] Save data while online (should work)
- [ ] Turn off WiFi
- [ ] Try to add exercise (should queue)
- [ ] Verify "Offline (X pending)" badge
- [ ] Turn WiFi back on
- [ ] Verify auto-sync and "Online" badge

### Phase 3: Error Handling (5 tests)
- [ ] Test slow network timeout
- [ ] Test server error handling
- [ ] Test auth expiration
- [ ] Test validation errors
- [ ] Test conflict resolution (if applicable)

### Phase 4: End-to-End (2 tests)
- [ ] Complete offline→online journey
- [ ] Error recovery flow

---

## 📊 Success Indicators

### ✅ Everything Working
- App loads in Expo Go
- Can log in/register
- Can add exercises online
- Can go offline and queue items
- Can sync when online
- No crashes or red error screens
- No sensitive data in console logs

### ❌ Issues to Watch For
- Blank white screen (usually missing context)
- Red error banner (usually code error)
- Network errors not handled (missing error handling)
- Data loss after offline (cache issue)
- App crashes (unhandled exception)

---

## 📱 Device Options

### Option 1: iOS Simulator (macOS only)
```bash
# From mobile-app directory:
npx expo start
# Press 'i'
```

### Option 2: Android Emulator
```bash
# From mobile-app directory:
npx expo start
# Press 'a'
```

### Option 3: Physical Device with Expo Go
```bash
# From mobile-app directory:
npx expo start
# Scan QR code with Expo Go app (from App Store or Play Store)
```

### Option 4: Web (Limited Testing)
```bash
# From mobile-app directory:
npx expo start
# Press 'w'
# Note: Some features may not work (SecureStore, NetInfo)
```

---

## 🎯 What to Test First

### Test 1: Can App Load?
1. Start with: `npx expo start`
2. Try to load in Expo Go
3. Should see login screen
4. ✅ If yes → Continue to Test 2
5. ❌ If no → Check error message in terminal

### Test 2: Can You Login?
1. On login screen
2. Enter email: `test@ageless.com`
3. Enter password: `TestPass123!`
4. Tap "Sign In"
5. ✅ If dashboard loads → Continue to Test 3
6. ❌ If fails → Check console for error

### Test 3: Can You Add Exercise?
1. On dashboard
2. Tap "+" button for an exercise
3. Enter weight
4. Wait 2 seconds
5. ✅ If data saves without error → Proceed to full test checklist
6. ❌ If fails → Check console

---

## 💡 Tips for Testing

### Enable Console Logging
In Expo Go settings:
- Tap menu (≡)
- Settings → Console
- Enable detailed logging

### Check AsyncStorage (for offline queue)
Add this to dashboard:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugQueue = async () => {
  const queue = await AsyncStorage.getItem('offline_queue_v2');
  console.log('Offline Queue:', queue);
};
```

### Monitor Network Changes
Turn WiFi on/off in phone settings while app is running:
- Should see "Offline" badge appear/disappear
- Should trigger auto-sync

### Force Offline State
In iOS Simulator:
- Hardware → Simulate Location
- Or: Xcode → Debug → Simulate Network → No Connection

In Android Emulator:
- Settings → Wifi → Toggle off
- Or use AVD Manager network settings

---

## 📞 If You Get Stuck

### Common Issues & Solutions

**Issue: "Cannot find module 'expo-router'"**
- Solution: Run `npm install` in mobile-app directory

**Issue: "ENOENT: no such file or directory, open './assets/icon.png'"**
- Solution: Missing assets folder - not critical for testing

**Issue: "Network request failed"**
- Solution: Normal - backend might not be running. Check PHASE_1_2_INTEGRATION_TESTING_GUIDE.md for mock backend setup

**Issue: "SecureStore not available"**
- Solution: Normal in simulator. Use physical device for full testing

**Issue: App hangs on loading screen**
- Solution: Check console in terminal - may have error. Kill Expo (Ctrl+C) and restart

---

## ✅ Verification Checklist Before Testing

Before starting the test checklist, verify:

- [x] You're in correct directory (mobile-app)
- [x] `npx expo start` runs without ConfigError
- [x] Expo Go loads app (shows login screen)
- [x] You can enter login credentials
- [x] You can navigate the app
- [x] Console shows no critical errors

---

## 🎯 Testing Goals

**Primary Goal**: Verify Phase 1 & 2 integration works in Expo Go

**Expected Time**: 1-2 hours (20 min quick + 30-45 min detailed if needed)

**Success Criteria**: All tests in PHASE_1_2_TEST_CHECKLIST.md pass

**Next Phase**: Phase 3 (Dashboard, History, Profile) if tests pass

---

## 📚 Related Files

- **PHASE_1_2_TEST_CHECKLIST.md** ← Start here after app loads
- **PHASE_1_2_INTEGRATION_TESTING_GUIDE.md** ← For detailed scenarios
- **TESTING_READY_STATUS.md** ← Project verification status

---

## 🚀 Ready to Test?

1. **Open terminal/PowerShell**
2. **Navigate to**: `C:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app`
3. **Run**: `npx expo start`
4. **Load**: Expo Go on device/emulator
5. **Follow**: `PHASE_1_2_TEST_CHECKLIST.md`

---

**Status**: ✅ Ready for testing
**Time Estimate**: 1-2 hours
**Expected Outcome**: All tests pass

Let's test! 🚀
