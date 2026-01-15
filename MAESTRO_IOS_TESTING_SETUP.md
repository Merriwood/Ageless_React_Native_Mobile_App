# Maestro iOS Testing Setup - Ageless React Native Mobile App

**Date**: 2026-01-14
**Status**: ✅ Complete Setup Documentation
**Target**: Single iOS Device Testing
**Framework**: Maestro Test Automation
**Backend**: Render API Integration

---

## Quick Start (5 minutes)

### Prerequisites
```bash
# Install Maestro CLI
brew tap mobile-dev-inc/maestro
brew install maestro

# Verify installation
maestro --version
```

### iOS Device Preparation
1. Connect iOS device via USB
2. Trust the development certificate on device
3. Unlock device and keep it unlocked during tests

### Run First Test
```bash
# Navigate to test directory
cd C:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\TESTING_AND_QA\maestro

# Start Maestro server
maestro start-server

# In new terminal, run login test
maestro test test_login_flow.yaml --udid=<DEVICE_UDID>
```

---

## Directory Structure

```
Ageless_React_Native_Mobile_App/
├── MAESTRO_IOS_TESTING_SETUP.md (this file)
├── MAESTRO_RENDER_BACKEND_CONFIG.md
├── MAESTRO_DEVICE_SETUP_GUIDE.md
└── TESTING_AND_QA/
    └── maestro/
        ├── config.yaml
        ├── test_login_flow.yaml
        ├── test_register_flow.yaml
        ├── test_dashboard_flow.yaml
        ├── test_history_flow.yaml
        ├── test_profile_flow.yaml
        ├── test_offline_sync.yaml
        ├── test_error_handling.yaml
        └── README.md
```

---

## Maestro Configuration

### Main Configuration File (config.yaml)

Located at: `TESTING_AND_QA/maestro/config.yaml`

```yaml
# Maestro Configuration for Ageless React Native
appId: com.ageless.mobile
device:
  os: iOS
  version: "14+"

api:
  baseUrl: https://ageless-api.render.com
  timeout: 30

test:
  timeout: 60
  retryCount: 2
  screenshotOnError: true

performance:
  waitTimeout: 10
  elementTimeout: 5
  animationWaitTimeout: 2

logging:
  level: info
  reportPath: ./reports/
```

---

## Test Flows Overview

### 1. Login Flow Test (`test_login_flow.yaml`)
**Duration**: ~3 minutes
**Critical Path**: YES - Required for all subsequent tests

**Test Cases**:
- Valid credentials login
- Invalid email validation
- Invalid password error
- Session persistence
- Auto-redirect to dashboard

**Key Elements Tested**:
- Email input field (testID: `email-input`)
- Password input field (testID: `password-input`)
- Sign In button (testID: `signin-button`)
- Error message display
- Navigation to dashboard

### 2. Register Flow Test (`test_register_flow.yaml`)
**Duration**: ~4 minutes
**Critical Path**: YES - New user onboarding

**Test Cases**:
- Valid registration
- Duplicate email validation
- Password confirmation mismatch
- Required field validation
- Account creation confirmation

**Key Elements Tested**:
- Email input (testID: `register-email-input`)
- Password input (testID: `register-password-input`)
- Confirm password (testID: `register-confirm-password-input`)
- Register button (testID: `register-button`)
- Success message

### 3. Dashboard Flow Test (`test_dashboard_flow.yaml`)
**Duration**: ~5 minutes
**Critical Path**: YES - Core functionality

**Test Cases**:
- Dashboard loads with current date
- Date picker opens and changes date
- Exercise cards display (11 total)
- +/- buttons increment/decrement exercises
- Weight input saves value
- Progress bar updates
- Bottom navigation tabs accessible

**Key Elements Tested**:
- Date picker (testID: `date-picker`)
- Exercise cards (testID: `exercise-card-{id}`)
- Progress bar (testID: `progress-bar`)
- Weight input (testID: `weight-input`)
- Bottom navigation (testID: `bottom-nav`)

### 4. History Modal Test (`test_history_flow.yaml`)
**Duration**: ~4 minutes
**Critical Path**: YES - Data retrieval validation

**Test Cases**:
- Hamburger menu opens
- History modal loads
- Previous workouts display
- Edit workout opens
- Delete workout confirmation
- Modal closes properly

**Key Elements Tested**:
- Hamburger menu (testID: `hamburger-menu`)
- History modal (testID: `history-modal`)
- Workout history cards (testID: `history-card-{index}`)
- Edit button (testID: `edit-button`)
- Delete button (testID: `delete-button`)

### 5. Profile/MyBody Screen Test (`test_profile_flow.yaml`)
**Duration**: ~2 minutes
**Critical Path**: MEDIUM - User information access

**Test Cases**:
- Bottom nav profile tab accessible
- Profile screen loads
- User info displays
- Body measurements section visible
- Logout button present and functional

**Key Elements Tested**:
- Profile tab (testID: `profile-tab`)
- User name (testID: `user-name-display`)
- Body measurements (testID: `body-measurements`)
- Logout button (testID: `logout-button`)

### 6. Offline Sync Test (`test_offline_sync.yaml`)
**Duration**: ~6 minutes
**Critical Path**: HIGH - Data integrity

**Test Cases**:
- Record workout while online
- Enable airplane mode
- Record additional workout
- Disable airplane mode
- Queue syncs automatically
- Both workouts appear in history

**Key Elements Tested**:
- Workout entry form
- Offline indicator (if present)
- Sync status messages
- History data consistency

### 7. Error Handling Test (`test_error_handling.yaml`)
**Duration**: ~5 minutes
**Critical Path**: HIGH - Stability

**Test Cases**:
- Network timeout handling
- 401 Unauthorized (expired token)
- 404 Not Found errors
- Server error responses (500)
- Graceful error messages

**Key Elements Tested**:
- Error message display
- Retry functionality
- User guidance
- No app crashes

### 8. Summary Modal Test (Bonus)
**Duration**: ~3 minutes
**Critical Path**: LOW - Analytics

**Test Cases**:
- Summary modal opens from menu
- Statistics display correctly
- Weekly breakdown visible
- Progress bars render
- Modal closes properly

---

## Test Execution Plan

### Phase 1: Foundation (Critical Path)
**Target**: All critical paths green
**Time**: ~20 minutes
**Files**:
1. test_login_flow.yaml ✓
2. test_register_flow.yaml ✓
3. test_dashboard_flow.yaml ✓

### Phase 2: Data Management
**Target**: Verify data flows correctly
**Time**: ~10 minutes
**Files**:
1. test_history_flow.yaml ✓
2. test_offline_sync.yaml ✓

### Phase 3: Error Handling
**Target**: App handles errors gracefully
**Time**: ~10 minutes
**Files**:
1. test_error_handling.yaml ✓
2. test_profile_flow.yaml ✓

### Phase 4: Advanced Features (Optional)
**Target**: Bonus features validated
**Time**: ~5 minutes
**Files**:
1. Summary modal test ✓

**Total Time**: ~45 minutes for full test suite

---

## Device Setup

### Get Device UDID
```bash
# Connect device and run:
maestro list-devices

# Output example:
# UDID: 00008120-001ABCDEF1234567
```

### Create Device-Specific Config
```bash
# Set environment variable
export IOS_DEVICE_UDID=00008120-001ABCDEF1234567

# Or run with udid flag
maestro test test_login_flow.yaml --udid=00008120-001ABCDEF1234567
```

### iOS Simulator Alternative
```bash
# List available simulators
xcrun simctl list devices

# Launch simulator
xcrun simctl boot "iPhone 14"

# Run tests on simulator
maestro test test_login_flow.yaml --simulator
```

---

## Backend Integration

### Render API Configuration

**Base URL**: `https://ageless-api.render.com`

**Key Endpoints**:
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/summary` - 52-week progress data
- `GET /api/workouts` - Workout history
- `POST /api/workouts` - Create workout entry
- `PUT /api/workouts/{id}` - Update workout
- `DELETE /api/workouts/{id}` - Delete workout

### Test User Accounts

**Account 1 (Testing)**
```
Email: test@ageless.app
Password: Test@123
Purpose: Login/Dashboard tests
```

**Account 2 (New Registration)**
```
Email: newuser+{timestamp}@ageless.app
Password: NewUser@123
Purpose: Registration flow tests
```

### Environment Variables

Create `.env.maestro` file:
```
RENDER_API_URL=https://ageless-api.render.com
TEST_USER_EMAIL=test@ageless.app
TEST_USER_PASSWORD=Test@123
DEVICE_UDID=00008120-001ABCDEF1234567
```

---

## Test Execution Commands

### Run Single Test
```bash
maestro test test_login_flow.yaml --udid=<DEVICE_UDID>
```

### Run All Tests
```bash
maestro test . --udid=<DEVICE_UDID>
```

### Run with Verbose Output
```bash
maestro test test_login_flow.yaml --udid=<DEVICE_UDID> --verbose
```

### Generate HTML Report
```bash
maestro test . --udid=<DEVICE_UDID> --reporter-type html
```

### Run Tests in CI/CD
```bash
maestro ci test . \
  --udid=$IOS_DEVICE_UDID \
  --reporter-type html \
  --reporter-output-dir=./test-reports
```

---

## Expected Test Results

### Success Criteria
✅ All 8 test flows pass
✅ No crashes or exceptions
✅ Navigation flows correctly
✅ Data persists across sessions
✅ Error messages display appropriately
✅ Offline sync works
✅ Performance acceptable (< 10s per test)

### Failure Handling
❌ Test fails → Capture screenshot
❌ Review screenshot in `./reports/failures/`
❌ Check logs in console output
❌ Investigate root cause
❌ Retry with verbose logging

---

## Troubleshooting

### Issue: Device not detected
```bash
# Reset USB connection
# 1. Disconnect device
# 2. Run: maestro list-devices
# 3. If empty, reconnect and try again
```

### Issue: Tests timeout
```bash
# Increase timeout in config.yaml
timeout: 60  # increase to 120

# Or run specific test with extended timeout
maestro test test_dashboard_flow.yaml --timeout 120
```

### Issue: API connection fails
```bash
# Verify backend is accessible
curl https://ageless-api.render.com/api/health

# Check device internet connection
# - Device must be on same network or have cellular
# - Verify VPN not blocking API calls
```

### Issue: App crashes during test
```bash
# 1. Check console for error messages
# 2. Enable screenshotOnError in config.yaml
# 3. Review screenshot in ./reports/
# 4. Check mobile app logs
```

---

## Performance Metrics

### Expected Performance
| Test | Duration | Status |
|------|----------|--------|
| Login Flow | ~3 min | ✅ Critical |
| Register Flow | ~4 min | ✅ Critical |
| Dashboard Flow | ~5 min | ✅ Critical |
| History Flow | ~4 min | ✅ High |
| Offline Sync | ~6 min | ✅ High |
| Error Handling | ~5 min | ✅ High |
| Profile Flow | ~2 min | ✅ Medium |
| Summary Modal | ~3 min | ⭕ Low |

**Total**: ~32 minutes (without retries)

---

## Next Steps

1. ✅ Install Maestro CLI
2. ✅ Connect iOS device
3. ✅ Get device UDID
4. ✅ Create config.yaml
5. ✅ Run test_login_flow.yaml
6. ✅ Debug any failures
7. ✅ Run full test suite
8. ✅ Generate HTML report
9. ✅ Archive results
10. ✅ Move to production deployment

---

## Reference Files

- **Device Setup**: [MAESTRO_DEVICE_SETUP_GUIDE.md](MAESTRO_DEVICE_SETUP_GUIDE.md)
- **Backend Config**: [MAESTRO_RENDER_BACKEND_CONFIG.md](MAESTRO_RENDER_BACKEND_CONFIG.md)
- **Test Flows**: [TESTING_AND_QA/maestro/](TESTING_AND_QA/maestro/)

---

**Status**: ✅ READY FOR IMPLEMENTATION
**Date**: 2026-01-14
**Maintainer**: Development Team
**Last Updated**: 2026-01-14

