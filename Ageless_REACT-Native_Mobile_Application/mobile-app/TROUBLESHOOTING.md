# Phase 2.5 Testing - Troubleshooting Guide

**For resolving common startup issues**

---

## 🚨 Issue 1: ConfigError - package.json not found

### Error Message
```
ConfigError: The expected package.json path:
C:\Users\SDWOR\...\Ageless_React_Native_Mobile_App\package.json
does not exist
```

### Cause
Running `npx expo start` from wrong directory

### ✅ Fix
```bash
# ❌ WRONG:
cd C:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App
npx expo start

# ✅ CORRECT:
cd "C:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app"
npx expo start
```

**Key**: Always run from the `mobile-app` directory where `package.json` exists

---

## 🚨 Issue 2: LightningCSS Native Module Error

### Error Message
```
ERROR  global.css: Cannot find module '../lightningcss.win32-x64-msvc.node'
```

### Cause
Native Windows module for CSS processing failed to build

### ✅ Quick Fix (30 seconds)
```bash
cd "C:\Users\SDWOR\...\mobile-app"
npm rebuild lightningcss
npx expo start
```

### ✅ Alternative: Skip Web, Use Device/Simulator
```bash
npx expo start
# Press 'a' for Android or 'i' for iOS
# DON'T press 'w' for web (that's what causes the error)
```

### ✅ Full Clean Install (3-5 minutes)
```bash
cd "C:\Users\SDWOR\...\mobile-app"
rmdir /s /q node_modules
del package-lock.json
npm install
npx expo start --clear
```

**Recommended**: Use device/simulator for testing (better anyway)

See: **LIGHTNINGCSS_FIX.md** for more details

---

## 🚨 Issue 3: Port Already in Use

### Error Message
```
› Port 8081 is being used by another process
Input is required, but 'npx expo' is in non-interactive mode
```

### Cause
Another process is using port 8081

### ✅ Fix Option 1: Use Different Port
```bash
npx expo start --port 8084
```

### ✅ Fix Option 2: Kill Process on Port 8081
```bash
# On Windows PowerShell:
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

### ✅ Fix Option 3: Clear Expo Cache
```bash
npx expo start --clear
# When prompted, accept using different port
```

---

## 🚨 Issue 4: App Won't Load in Expo Go

### Error Message
White screen or black screen in Expo Go

### Cause
Usually JavaScript error or missing context provider

### ✅ Fix
1. Check terminal for error messages
2. Look for red text in terminal output
3. Common issues:
   - Missing import
   - Wrong file path
   - Syntax error in code

### ✅ Debug Steps
```bash
# 1. Clear cache
npx expo start --clear

# 2. Watch terminal for error messages
# 3. If error appears:
#    - Open file mentioned in error
#    - Check syntax
#    - Check imports
#    - Save and hot reload (app will refresh)
```

---

## 🚨 Issue 5: Can't Login (401/401 Error)

### Error Message
```
Error: 401 Unauthorized
```

### Cause
Backend endpoint not available or mock not enabled

### ✅ Fix Option 1: Use Mock Backend
See: **PHASE_1_2_INTEGRATION_TESTING_GUIDE.md** - "Mock Backend" section

```typescript
// Can add to lib/api/client.ts for testing
if (process.env.MOCK_BACKEND === 'true') {
  // Use mock backend instead
}
```

### ✅ Fix Option 2: Start Backend Service
```bash
# In separate terminal, start backend:
# (Instructions depend on your backend setup)
```

### ✅ Fix Option 3: Skip Login, Test Queue Directly
You can test offline queue without real login:
- Use console to set mock token
- Focus on offline queue testing

---

## 🚨 Issue 6: Missing Assets (Splash/Icon Error)

### Error Message
```
ENOENT: no such file or directory, open './assets/icon.png'
```

### Cause
Missing `assets/` folder (optional for testing)

### ✅ Fix
Assets are NOT critical for testing. You can:
- Ignore the warning (app still works)
- Or create empty assets folder:

```bash
mkdir assets
# Create placeholder PNG files if needed
```

---

## 🚨 Issue 7: Module Resolution Error

### Error Message
```
Cannot find module '@/...'
or 'Cannot resolve...'
```

### Cause
Import path issue or tsconfig misconfiguration

### ✅ Fix
Check `tsconfig.json` has path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

If issue persists:
```bash
npx expo start --clear
```

---

## 🚨 Issue 8: Offline Queue Not Working

### Symptoms
- "Offline" badge doesn't appear
- Items don't queue when offline
- Sync doesn't trigger

### Cause
Usually AsyncStorage or network detection issue

### ✅ Debug Checklist
- [ ] Turn off WiFi in phone settings
- [ ] Watch for "Offline" badge in app
- [ ] Check console for network events
- [ ] Verify AsyncStorage has data:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugQueue = async () => {
  const queue = await AsyncStorage.getItem('offline_queue_v2');
  console.log('Queue contents:', queue);
};

// Call this in dashboard
```

- [ ] Check if NetInfo listener is active (see UIContext)

### ✅ Fix
If queue not working:
1. Restart app
2. Force offline with device WiFi toggle
3. Check console for errors
4. See PHASE_1_2_INTEGRATION_TESTING_GUIDE.md debugging section

---

## ✅ Testing Without Issues

### Recommended Path (Avoids Most Issues)

1. **Use Correct Directory**
   ```bash
   cd "C:\Users\SDWOR\...\mobile-app"
   ```

2. **Rebuild Modules**
   ```bash
   npm rebuild lightningcss
   ```

3. **Start Dev Server**
   ```bash
   npx expo start --clear
   ```

4. **Use Device/Simulator (Not Web)**
   ```
   Press 'a' (Android) or 'i' (iOS)
   NOT 'w' (web causes lightningcss error)
   ```

5. **Follow Testing Guide**
   ```
   PHASE_1_2_TEST_CHECKLIST.md
   ```

This approach avoids 90% of issues.

---

## 📱 Recommended Device Option

### Best: Physical Device + Expo Go
```bash
npx expo start
# Scan QR code with Expo Go app
```

**Advantages**:
- Tests real mobile experience
- Avoids simulator quirks
- Matches production environment
- No web bundling needed

### Second Best: Android Emulator
```bash
npx expo start
# Press 'a'
```

### Third: iOS Simulator (macOS only)
```bash
npx expo start
# Press 'i'
```

### Avoid: Web (Not Needed)
```bash
npx expo start
# DON'T press 'w' (causes lightningcss error)
```

---

## 🔧 Advanced Troubleshooting

### If Still Having Issues

**Step 1**: Check terminal output
```bash
npx expo start 2>&1 | grep -i error
```

**Step 2**: Enable verbose logging
```bash
DEBUG=* npx expo start
```

**Step 3**: Check Node/npm versions
```bash
node --version  # Should be 16+
npm --version   # Should be 8+
```

**Step 4**: Clear everything and reinstall
```bash
rmdir /s /q node_modules
del package-lock.json
del -r .expo .cache
npm install
npx expo start --clear
```

---

## 🆘 When All Else Fails

### Option 1: Document the Error
Note down:
- Exact error message
- Steps to reproduce
- Error occurs at: (startup/login/save/etc)
- Device: (iOS/Android/Web/Simulator)

### Option 2: Check Documentation
- **LIGHTNINGCSS_FIX.md** - CSS module issues
- **TESTING_SETUP_GUIDE.md** - General setup help
- **TESTING_QUICK_START.md** - Quick reference
- **PHASE_1_2_INTEGRATION_TESTING_GUIDE.md** - Detailed testing

### Option 3: Modify App Temporarily
For testing, you can simplify:
```typescript
// Temporarily skip contexts in app/_layout.tsx
// Just show dashboard without auth
// To focus on testing specific features
```

---

## ✅ Success Checklist

Before declaring "ready to test":

- [x] No ConfigError
- [x] Expo shows "Expo Go App is running"
- [x] App loads in device/simulator (shows login screen)
- [x] No red error banner
- [x] Console has no critical errors
- [x] Can navigate between screens
- [x] Can enter login credentials

If all above ✅, proceed with: **PHASE_1_2_TEST_CHECKLIST.md**

---

## 📞 Summary

| Issue | Fix Time | Solution |
|-------|----------|----------|
| ConfigError | 10 sec | Use correct directory |
| LightningCSS | 30 sec | `npm rebuild lightningcss` |
| Port in use | 30 sec | Use different port or kill process |
| App won't load | 2-5 min | Check console, debug imports |
| Login fails | 5 min | Check backend or use mock |
| Missing assets | N/A | Optional - can ignore |
| Module errors | 1-2 min | Clear cache, reinstall |
| Queue issues | 5-10 min | Check AsyncStorage, debug |

**Most issues**: Resolved in under 1 minute

---

## 🎯 Next Steps

1. **Try** one of the fixes above
2. **Test** that Expo loads (shows login screen)
3. **Follow** PHASE_1_2_TEST_CHECKLIST.md
4. **Document** any remaining issues

**Expected**: Testing completes in 1-2 hours

---

**Status**: Issues are fixable ✅
**Support**: All solutions documented
**Time to Resolution**: Usually < 1 minute
**Testing Can Proceed**: YES ✅

Pick the issue you're seeing and follow the solution!
