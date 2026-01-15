# Maestro iOS Testing - EXECUTION CHECKLIST

**Date**: 2026-01-14
**Status**: READY TO EXECUTE
**Purpose**: Step-by-step checklist to run Maestro tests on iOS device

---

## ✅ PRE-EXECUTION VERIFICATION

### Files Verification
- [x] MAESTRO_IOS_TESTING_SETUP.md - Present
- [x] MAESTRO_DEVICE_SETUP_GUIDE.md - Present
- [x] MAESTRO_RENDER_BACKEND_CONFIG.md - Present
- [x] MAESTRO_QUICK_REFERENCE.txt - Present
- [x] MAESTRO_iOS_TESTING_COMPLETE.md - Present
- [x] MAESTRO_DELIVERY_SUMMARY.md - Present
- [x] MAESTRO_FILES_MANIFEST.txt - Present
- [x] TESTING_AND_QA/maestro/config.yaml - Present
- [x] TESTING_AND_QA/maestro/test_login_flow.yaml - Present
- [x] TESTING_AND_QA/maestro/test_register_flow.yaml - Present
- [x] TESTING_AND_QA/maestro/test_dashboard_flow.yaml - Present
- [x] TESTING_AND_QA/maestro/test_history_flow.yaml - Present
- [x] TESTING_AND_QA/maestro/test_profile_flow.yaml - Present
- [x] TESTING_AND_QA/maestro/README.md - Present

**Status**: ✅ ALL FILES PRESENT (13 files verified)

---

## 🔧 STEP 1: PREPARE YOUR MAC

### 1.1 Check Xcode Installation
```bash
xcode-select --version
# Expected: xcode-select version 2xxx or similar
```

### 1.2 Install Homebrew (if needed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 1.3 Install Maestro
```bash
brew tap mobile-dev-inc/maestro
brew install maestro
maestro --version
# Expected: maestro 1.x.x
```

**Checklist**:
- [ ] Xcode installed
- [ ] Homebrew working
- [ ] Maestro installed and verified

---

## 📱 STEP 2: PREPARE iOS DEVICE

### 2.1 Physical Connection
- [ ] Connect iOS device via USB cable to Mac
- [ ] Keep USB cable plugged in throughout testing
- [ ] Device shows "Trust" prompt
- [ ] Tap "Trust" on device
- [ ] Enter device passcode if prompted

### 2.2 Device Configuration
- [ ] Disable Auto-Lock: Settings → Display & Brightness → Auto-Lock → Never
- [ ] Device has >50% battery charged
- [ ] Device has >500MB free storage

### 2.3 Enable Developer Mode (iOS 16+ only)
If device is iOS 16 or later:
- [ ] Go to Settings → Privacy & Security
- [ ] Find "Developer Mode" at bottom
- [ ] Toggle ON
- [ ] Confirm reboot when prompted
- [ ] After reboot, reconnect USB and re-trust certificate

### 2.4 Verify USB Connection
```bash
maestro list-devices
# Expected output:
# iPhone [Model]
# UDID: 00008120-001ABCDEF1234567
# OS: iOS 15.x or later
```

**Action**: Copy the UDID from output - you'll need it for all tests

**Checklist**:
- [ ] USB connected
- [ ] Device trusted
- [ ] Developer Mode enabled (if iOS 16+)
- [ ] Device detected by Maestro
- [ ] UDID copied

---

## ⚙️ STEP 3: CONFIGURE ENVIRONMENT

### 3.1 Create .env.maestro File

Create file at project root:
```
c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\.env.maestro
```

With contents:
```env
# Maestro Testing Environment Configuration
# Date: 2026-01-14

# Device Configuration
IOS_DEVICE_UDID=PASTE_YOUR_UDID_HERE
DEVICE_NAME=Your iPhone Model

# Backend Configuration
RENDER_API_URL=https://ageless-api.render.com
RENDER_API_HEALTH_CHECK=https://ageless-api.render.com/api/health

# Test User Credentials
TEST_USER_EMAIL=test@ageless.app
TEST_USER_PASSWORD=Test@123

# Test Configuration
TEST_TIMEOUT=60
SCREENSHOT_ON_ERROR=true
VERBOSE_LOGGING=true
```

### 3.2 Verify Backend Accessibility

```bash
# Test API health
curl https://ageless-api.render.com/api/health

# Expected: 200 status with operational message
```

**Checklist**:
- [ ] .env.maestro created with your UDID
- [ ] Backend API accessible
- [ ] Test user credentials confirmed
- [ ] Device internet connection working

---

## 🚀 STEP 4: EXECUTE TESTS

### 4.1 Start Maestro Server

**Terminal 1** (Keep running throughout testing):
```bash
cd c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App
maestro start-server
```

Expected output:
```
Starting Maestro Server...
Server is ready on port 7001
Waiting for commands...
```

**Important**: Keep this terminal open while running tests

### 4.2 Navigate to Test Directory

**Terminal 2**:
```bash
cd c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\TESTING_AND_QA\maestro
```

### 4.3 PHASE 1: CRITICAL TESTS (15 minutes)

These MUST ALL PASS for production deployment.

#### Test 1: Login Flow (3 minutes)
```bash
maestro test test_login_flow.yaml --udid=YOUR_UDID_HERE
```

Expected:
- ✅ 5 assertions pass
- ✅ Token extracted successfully
- ✅ No errors or crashes

**Result**: PASS / FAIL
```
□ PASS - All assertions passed
□ FAIL - See error details below:
  Error:
  Description:
```

#### Test 2: Register Flow (4 minutes)
```bash
maestro test test_register_flow.yaml --udid=YOUR_UDID_HERE
```

Expected:
- ✅ 6 assertions pass
- ✅ All validations work
- ✅ Registration succeeds

**Result**: PASS / FAIL
```
□ PASS - All assertions passed
□ FAIL - See error details below:
  Error:
  Description:
```

#### Test 3: Dashboard Flow (5 minutes)
```bash
maestro test test_dashboard_flow.yaml --udid=YOUR_UDID_HERE
```

Expected:
- ✅ 11 assertions pass
- ✅ All exercises display
- ✅ Navigation works

**Result**: PASS / FAIL
```
□ PASS - All assertions passed
□ FAIL - See error details below:
  Error:
  Description:
```

#### PHASE 1 Decision
```
All 3 tests PASSED? → Continue to Phase 2
Any test FAILED? → Debug and retest before Phase 2
```

### 4.4 PHASE 2: DATA MANAGEMENT (10 minutes)

Proceed only if Phase 1 all passed.

#### Test 4: History Flow (4 minutes)
```bash
maestro test test_history_flow.yaml --udid=YOUR_UDID_HERE
```

Expected:
- ✅ 10 assertions pass
- ✅ History data accessible
- ✅ Edit/delete operations work

**Result**: PASS / FAIL
```
□ PASS - All assertions passed
□ FAIL - See error details below:
  Error:
  Description:
```

### 4.5 PHASE 3: OPTIONAL (5 minutes)

Proceed if you want complete coverage (not required for launch).

#### Test 5: Profile Flow (2 minutes)
```bash
maestro test test_profile_flow.yaml --udid=YOUR_UDID_HERE
```

Expected:
- ✅ 10 assertions pass
- ✅ User info displays
- ✅ Profile functional

**Result**: PASS / FAIL
```
□ PASS - All assertions passed
□ FAIL - See error details below:
  Error:
  Description:
```

---

## 📊 STEP 5: GENERATE REPORT

### 5.1 Run All Tests with HTML Report

```bash
maestro test . --udid=YOUR_UDID_HERE --reporter-type html
```

This generates HTML report in `./test-reports/` directory.

### 5.2 View Report

```bash
# On Mac, open the report
open ./test-reports/report.html

# Or navigate to the file in Finder
# ./test-reports/report.html
```

---

## ✨ STEP 6: DOCUMENT RESULTS

### 6.1 Fill Out Test Summary

**Date Tested**: _______________
**Device Model**: _______________
**iOS Version**: _______________
**Tester Name**: _______________

### 6.2 Phase 1 Results
```
Test 1 - Login Flow:        □ PASS  □ FAIL
Test 2 - Register Flow:     □ PASS  □ FAIL
Test 3 - Dashboard Flow:    □ PASS  □ FAIL

Phase 1 Overall:            □ PASS  □ FAIL
```

### 6.3 Phase 2 Results
```
Test 4 - History Flow:      □ PASS  □ FAIL

Phase 2 Overall:            □ PASS  □ FAIL
```

### 6.4 Phase 3 Results
```
Test 5 - Profile Flow:      □ PASS  □ FAIL

Phase 3 Overall:            □ PASS  □ FAIL (Optional)
```

### 6.5 Issues Encountered
```
No issues:                  □

Issues found:
1. ________________________
2. ________________________
3. ________________________
```

### 6.6 Production Approval
```
Ready for production?       □ YES   □ NO

If NO, describe blockers:
_________________________________
_________________________________
```

---

## 🔧 TROUBLESHOOTING

### Device Not Detected
```bash
# 1. Disconnect USB, wait 5 seconds
# 2. Reconnect USB
# 3. Verify again
maestro list-devices

# If still failing:
# - Try different USB port
# - Restart device
# - Restart Mac
# - Update Xcode: xcode-select --install
```

### Test Timeout
```bash
# 1. Check device performance (close apps)
# 2. Verify network: ping ageless-api.render.com
# 3. Increase timeout in config.yaml
# 4. Re-run test with longer timeout
```

### API Connection Failed
```bash
# 1. Verify backend:
curl https://ageless-api.render.com/api/health

# 2. Check device internet:
# - On device, test Safari: https://www.google.com
# - Verify Wi-Fi or cellular working

# 3. If VPN enabled, disable it
```

### App Crashes
```bash
# 1. Check logs: View in Xcode Console
# 2. Restart app on device
# 3. Verify test account exists: test@ageless.app
# 4. Reinstall app on device
# 5. Rerun test
```

---

## 📋 FINAL CHECKLIST

### Before Starting Tests
- [ ] Xcode installed
- [ ] Maestro installed and verified
- [ ] iOS device connected via USB
- [ ] Device trusted (developer certificate)
- [ ] Developer Mode enabled (iOS 16+)
- [ ] .env.maestro created with UDID
- [ ] Backend API accessible (curl test)
- [ ] Test user account confirmed (test@ageless.app)
- [ ] Device Auto-Lock disabled
- [ ] Device has >50% battery
- [ ] Device has >500MB storage

### During Testing
- [ ] Maestro server running in Terminal 1
- [ ] Device stays unlocked
- [ ] USB cable stays connected
- [ ] No background apps on device
- [ ] Network connection stable

### After Testing
- [ ] All test results recorded
- [ ] HTML report generated
- [ ] Issues documented
- [ ] Screenshots captured (if errors)
- [ ] Ready for approval decision

---

## 🎯 SUCCESS CRITERIA

### Minimum (Required for Production)
```
✅ Phase 1: ALL 3 tests PASS
✅ Phase 2: ALL tests PASS
✅ No crashes or errors
✅ <30 minutes total time
```

### Recommended
```
✅ Phase 3: Tests PASS
✅ HTML report generated
✅ No warnings
✅ All assertions successful
```

---

## 📞 QUICK REFERENCE

**Maestro Server**:
```bash
maestro start-server  # Terminal 1 - keep running
```

**Run Single Test**:
```bash
maestro test test_login_flow.yaml --udid=YOUR_UDID
```

**Run All Tests**:
```bash
maestro test . --udid=YOUR_UDID
```

**Generate Report**:
```bash
maestro test . --udid=YOUR_UDID --reporter-type html
```

**Get Device UDID**:
```bash
maestro list-devices
```

**Stop Server**:
```
Ctrl+C in Terminal 1
```

---

## ✅ YOU ARE READY TO BEGIN TESTING

All infrastructure is in place. Follow this checklist to execute tests.

**Estimated Total Time**: 2 hours (setup + execution + reporting)

**Next Action**: Start with STEP 1 above.

---

**Status**: 🟢 READY FOR EXECUTION
**Date**: 2026-01-14
**Confidence**: ⭐⭐⭐⭐⭐

BEGIN TESTING NOW!

