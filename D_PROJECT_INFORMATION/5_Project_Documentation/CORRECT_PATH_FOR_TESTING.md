# Correct Path for Expo Startup

**IMPORTANT: Use the COMPLETE path with all three directory levels**

---

## ❌ WRONG - Don't use this path:
```powershell
PS> cd c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App
PS> npx expo start
```

**This will fail with:** `ConfigError: The expected package.json path: ... does not exist`

---

## ✅ CORRECT - Use this complete path:
```powershell
PS> cd "c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app"
PS> npx expo start
```

**This will succeed:** Expo starts and displays QR code

---

## Directory Structure

```
c:\Users\SDWOR\
└── Ageless_React_Native_Mobile_App\
    └── Ageless_React_Native_Mobile_App\
        └── Ageless_REACT-Native_Mobile_Application\
            └── mobile-app\  ← THIS IS THE CORRECT DIRECTORY
                ├── package.json  ← Expo needs this
                ├── .env  ← API configuration
                ├── api\
                ├── app\
                ├── components\
                ├── __tests__\
                └── node_modules\
```

---

## Three Ways to Start Expo

### Method 1: Copy-Paste Command (Easiest)
```powershell
cd "c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app" && npx expo start
```

### Method 2: Step by Step
```powershell
# Step 1: Navigate to correct directory
cd "c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app"

# Step 2: Verify you're in the right place
dir package.json  # Should show package.json file

# Step 3: Start Expo
npx expo start
```

### Method 3: From PowerShell
```powershell
# Open PowerShell and run:
Set-Location "c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app"
npx expo start
```

---

## What You Should See

When you run the correct command:

```
env: load .env
env: export EXPO_PUBLIC_API_URL

Starting project at C:\Users\SDWOR\Ageless_React_Native_Mobile_App\...

> Local:   http://localhost:8083
> LAN:     http://192.168.1.x:8083

Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

Press 'a' to open Android emulator
Press 'i' to open iOS simulator
Press 'w' to open web
Press 'r' to reload
Press 'c' to clear console
Press 'q' to quit
```

If you see this output, Expo is running correctly!

---

## Quick Commands Reference

### Start Expo on default port (automatic if 8083 available)
```bash
cd "c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app" && npx expo start
```

### Start Expo on web browser
```bash
cd "c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app" && npx expo start -w
```

### Start Expo on specific port
```bash
cd "c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app" && npx expo start --port 8085
```

### Verify you're in correct directory
```bash
cd "c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app" && dir package.json .env
```

---

## Troubleshooting

### Error: "The expected package.json path: ... does not exist"
✅ **Fix:** Make sure you include `Ageless_REACT-Native_Mobile_Application\mobile-app` in the path

### Error: "Cannot find module '@sentry/react-native'"
✅ **Fix:** Already installed. If error persists:
```bash
cd "c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app"
npm install @sentry/react-native --legacy-peer-deps
```

### Error: ".env file not found"
✅ **Fix:** .env should be in mobile-app directory. Verify:
```bash
cd "c:\Users\SDWOR\Ageless_React_Native_Mobile_App\Ageless_React_Native_Mobile_App\Ageless_REACT-Native_Mobile_Application\mobile-app"
cat .env
```

Should show: `EXPO_PUBLIC_API_URL=https://ageless-api.render.com`

---

## Remember

**The key is having all three directory levels in your path:**
1. `Ageless_React_Native_Mobile_App\`
2. `Ageless_React_Native_Mobile_App\` (yes, it appears twice!)
3. `Ageless_REACT-Native_Mobile_Application\`
4. `mobile-app\` ← **This is where package.json is**

Without all of these, Expo won't find package.json and will fail.

---

## Once Expo is Running

See: **PHASE_2_MANUAL_TESTING_EXECUTION_GUIDE.md**

For the 19 comprehensive tests, follow the procedures in that document.

---

**Status:** ✅ Directory verified, package.json exists, ready to start Expo

**Next:** Copy-paste the correct command and press Enter!

