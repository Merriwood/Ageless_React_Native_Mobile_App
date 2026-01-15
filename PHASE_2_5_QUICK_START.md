# Phase 2.5 Quick Start - EAS Build + Maestro Testing

**Total Time**: ~1.5 hours | **Status**: Ready Now

---

## TL;DR COMMAND SEQUENCE

### Setup (5 min)
```bash
npm install -g eas-cli
eas login
cd Ageless_REACT-Native_Mobile_Application/mobile-app
npm install
```

### Build (25-30 min)
```bash
eas build --platform ios --wait
# Download .ipa from link provided
```

### Install (5-10 min)
```bash
# Connect device via USB
maestro list-devices  # Save UDID
xcrun xcodebuild -install-ipa ~/Downloads/ageless.ipa -device YOUR_UDID
```

### Test (30 min)
```bash
# Terminal 1
maestro start-server

# Terminal 2
cd TESTING_AND_QA/maestro
maestro test test_login_flow.yaml --udid=YOUR_UDID
maestro test test_register_flow.yaml --udid=YOUR_UDID
maestro test test_dashboard_flow.yaml --udid=YOUR_UDID
maestro test test_history_flow.yaml --udid=YOUR_UDID
maestro test test_profile_flow.yaml --udid=YOUR_UDID  # Optional
maestro test . --udid=YOUR_UDID --reporter-type html
```

### Report (10 min)
```bash
open ./test-reports/report.html
```

---

## STEP-BY-STEP EXECUTION

### Step 1: Verify Prerequisites (2 min)
```bash
xcode-select --version      # ✓ Should show version
node --version              # ✓ Should be v16+
npm --version               # ✓ Should be v7+
maestro --version           # ✓ Should show version
```

### Step 2: Login to Expo (3 min)
```bash
npm install -g eas-cli
eas login
# Enter email and password
eas whoami  # ✓ Should show email
```

### Step 3: Prepare Project (2 min)
```bash
cd Ageless_REACT-Native_Mobile_Application/mobile-app
npm install
```

### Step 4: Build with EAS (25-30 min)
```bash
eas build --platform ios --wait
# Wait for build to complete...
# Copy download link when finished
```

### Step 5: Download and Install (10 min)
```bash
# Download .ipa
curl -o ~/Downloads/ageless.ipa "PASTE_DOWNLOAD_LINK_HERE"

# Connect device and install
maestro list-devices  # ✓ Should see your device
# Copy UDID from output

xcrun xcodebuild -install-ipa ~/Downloads/ageless.ipa -device YOUR_UDID_HERE
# Wait for installation to complete
```

### Step 6: Run Maestro Tests (30 min)

**Terminal 1 (keep running)**:
```bash
maestro start-server
```

**Terminal 2 (run tests)**:
```bash
cd TESTING_AND_QA/maestro

# Phase 1 Critical Tests (REQUIRED)
maestro test test_login_flow.yaml --udid=YOUR_UDID_HERE
# ✓ 5/5 assertions should pass

maestro test test_register_flow.yaml --udid=YOUR_UDID_HERE
# ✓ 6/6 assertions should pass

maestro test test_dashboard_flow.yaml --udid=YOUR_UDID_HERE
# ✓ 11/11 assertions should pass

# Phase 2 Data Tests (REQUIRED)
maestro test test_history_flow.yaml --udid=YOUR_UDID_HERE
# ✓ 10/10 assertions should pass

# Phase 3 User Tests (OPTIONAL)
maestro test test_profile_flow.yaml --udid=YOUR_UDID_HERE
# ✓ 10/10 assertions should pass

# Generate Report
maestro test . --udid=YOUR_UDID_HERE --reporter-type html
```

### Step 7: Review Results (5 min)
```bash
open ./test-reports/report.html

# Expected:
# - 5 test flows executed
# - 42 total assertions
# - 42 passed, 0 failed
# - ~30 minute duration
# - 100% success rate
```

---

## KEY INFORMATION

**Render Backend**: https://ageless-api.render.com
**Test User**: test@ageless.app / Test@123
**Test File Location**: TESTING_AND_QA/maestro/
**Report Location**: TESTING_AND_QA/maestro/test-reports/report.html

---

## DECISION MATRIX

| Scenario | Action |
|----------|--------|
| All 5 tests pass (42/42) | ✅ Phase 2.5 APPROVED → Go to Phase 3 |
| Phase 1-2 pass, Phase 3 fails | ✅ Phase 2.5 APPROVED (Phase 3 is optional) |
| Any Phase 1-2 test fails | ❌ Debug and retest |

---

## IF THINGS GO WRONG

| Problem | Solution |
|---------|----------|
| Device not detected | Disconnect/reconnect USB, restart device |
| Build fails | Check internet, retry `eas build --platform ios --wait` |
| Test timeout | Close background apps, verify network, retry |
| Login fails | Verify backend accessible: `curl https://ageless-api.render.com/api/health` |
| App crashes | Reinstall app, clear device cache, retry |

---

## EXPECTED TIMES

- Build: 25-30 min (first time), 15-20 min (subsequent)
- Install: 5-10 min
- Tests: 30 min (5 flows)
- Report: 10 min
- **TOTAL**: ~1.5 hours

---

## SUCCESS = This Message

```
Build completed!
Install successful!

✓ Login Flow Test ........................... PASS (5/5)
✓ Register Flow Test ........................ PASS (6/6)
✓ Dashboard Flow Test ....................... PASS (11/11)
✓ History Flow Test ......................... PASS (10/10)
✓ Profile Flow Test ......................... PASS (10/10)

Total: 42/42 assertions passed ✅

HTML Report: ./test-reports/report.html

Ready for Phase 3! 🚀
```

---

**For detailed instructions**: Read `PHASE_2_5_EAS_BUILD_AND_MAESTRO_TESTING.md`

**Begin now!**
