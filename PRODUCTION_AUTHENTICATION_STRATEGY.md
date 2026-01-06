# Production Authentication Strategy
## Expo Development → Native Production Migration Plan

**Date**: January 6, 2026
**Status**: Critical Architecture Planning Document
**Prepared By**: Claude Haiku 4.5

---

## Executive Summary

Phase 1 authentication has been successfully implemented for **Expo development** (100/100 completion). However, the master roadmap explicitly states this project will transition to **native production builds** (iOS/Android via App Store) without Expo.

This document:
1. ✅ Acknowledges the architectural gap identified
2. 📋 Details the current Expo-specific implementation
3. 🔄 Explains why Expo libraries are development-only
4. 🛠️ Provides migration strategy for production compatibility
5. 📅 Outlines timeline and effort impact
6. ✅ Offers three implementation options

---

## Part 1: Current Implementation Analysis

### What Phase 1 Auth Includes (Expo Development)

**✅ Implemented Files**:
- `app/(auth)/login.tsx` - Login screen
- `app/(auth)/register.tsx` - Registration screen
- `hooks/useAuth.ts` - Auth state management
- `hooks/useBiometric.ts` - Biometric authentication
- `api/client.ts` - HTTP client with interceptors
- `api/auth.ts` - Auth endpoint functions
- `lib/validation.ts` - Form validation
- `app/_layout.tsx` - Root layout with route protection

**✅ Implemented Features**:
- Email/password authentication
- JWT token management (30-day TTL)
- Secure token storage (encrypted)
- Face ID/Touch ID support
- Request interceptors (auto-inject Bearer token)
- Response interceptors (auto-logout on 401)
- Exponential backoff retry (5xx errors)
- Form validation
- Password strength indicator

**✅ Tech Stack (Development)**:
- Framework: Expo + Expo Router
- State: React Context API
- Storage: expo-secure-store (encrypted)
- Biometric: expo-local-authentication
- HTTP: axios
- Routing: expo-router (file-based)

---

## Part 2: Why Expo Libraries Are Development-Only

### What Expo Is

**Expo** is a managed development platform that:
- Provides JavaScript bridge to native APIs
- Includes Expo Go app for testing
- Abstracts away native build complexity
- Uses EAS (Expo Application Services) for managed builds
- NOT suitable for production self-managed native builds

### Expo-Specific Libraries (Cannot Work in Production)

#### 1️⃣ `expo-secure-store`
**Purpose**: Encrypted key-value storage on device

**Why Development-Only**:
- Built on Expo's managed infrastructure
- Requires Expo Go or EAS build context
- Cannot be used in self-managed native builds (Xcode/Android Studio)
- Expo Go is not distributable on App Store

**Current Usage** (in `hooks/useAuth.ts`):
```typescript
import * as SecureStore from "expo-secure-store";

const token = await SecureStore.getItemAsync("auth_token");
await SecureStore.setItemAsync("auth_token", newToken);
await SecureStore.deleteItemAsync("auth_token");
```

**Problem**: This won't work in App Store build

#### 2️⃣ `expo-local-authentication`
**Purpose**: Biometric authentication (Face ID/Touch ID)

**Why Development-Only**:
- Built on Expo's managed infrastructure
- Designed for Expo ecosystem
- Cannot be used in self-managed native builds

**Current Usage** (in `hooks/useBiometric.ts`):
```typescript
import * as LocalAuthentication from "expo-local-authentication";

const compatible = await LocalAuthentication.hasHardwareAsync();
const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
const result = await LocalAuthentication.authenticateAsync({...});
```

**Problem**: This won't work in App Store build

#### 3️⃣ `expo-router`
**Purpose**: File-based routing (similar to Next.js)

**Why Development-Only** (Partially):
- Works in Expo Go ✅
- Works in EAS managed builds ✅
- Works in self-managed native builds ⚠️ Limited support
- Better alternative exists: `react-navigation` (more flexible)

**Current Usage** (in `app/_layout.tsx`):
```typescript
import { Slot, useRouter, useSegments } from "expo-router";

const router = useRouter();
const segments = useSegments();
```

**Problem**: While technically possible in native builds, `react-navigation` is the industry standard

---

## Part 3: Production-Compatible Alternatives

### Recommended Replacement Libraries

All of these work in BOTH Expo development AND native production builds:

#### 1️⃣ Encrypted Token Storage

**Current** (Expo-only): `expo-secure-store`

**Production Alternative**: `react-native-keychain`
```typescript
// Install: npm install react-native-keychain
import * as Keychain from "react-native-keychain";

// Set token (encrypted)
await Keychain.setGenericPassword("auth_token", token, {
  service: "com.ageless.app",
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
});

// Get token
const credentials = await Keychain.getGenericPassword({
  service: "com.ageless.app",
});
const token = credentials.password;

// Clear token
await Keychain.resetGenericPassword({
  service: "com.ageless.app",
});
```

**Why Better**:
- ✅ Works in Expo development
- ✅ Works in native iOS builds (Keychain)
- ✅ Works in native Android builds (Keystore)
- ✅ Industry standard (used by major apps)
- ✅ Actively maintained
- ✅ Zero Expo dependency

**Effort**: Low - API is very similar

---

#### 2️⃣ Biometric Authentication

**Current** (Expo-only): `expo-local-authentication`

**Production Alternative**: `react-native-biometrics`
```typescript
// Install: npm install react-native-biometrics
import ReactNativeBiometrics from "react-native-biometrics";

const rnBiometrics = new ReactNativeBiometrics();

// Check availability
const { available } = await rnBiometrics.isSensorAvailable();

// Authenticate
const { success } = await rnBiometrics.simplePrompt({
  promptMessage: "Authenticate to access your fitness data",
});
```

**Why Better**:
- ✅ Works in Expo development
- ✅ Works in native iOS builds
- ✅ Works in native Android builds
- ✅ Simpler API
- ✅ Actively maintained
- ✅ Zero Expo dependency

**Effort**: Low - Similar API to current implementation

---

#### 3️⃣ File-Based Routing (Optional)

**Current**: `expo-router`

**Production Alternative**: `react-navigation` with `@react-navigation/native-stack`
```typescript
// Install: npm install @react-navigation/native @react-navigation/native-stack
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const { token } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" component={LoginScreen} />
            <Stack.Screen name="register" component={RegisterScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="dashboard" component={DashboardScreen} />
            {/* ... other screens ... */}
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Note**: This is optional. `expo-router` can work in native builds, but `react-navigation` is:
- More flexible for complex navigation
- Industry standard
- Better performance in native builds

**Effort**: Moderate - Requires restructuring navigation hierarchy

---

## Part 4: Migration Path & Timeline

### Option A: Refactor Now (RECOMMENDED for Clean Architecture)

**Approach**: Replace Expo libraries immediately with production-compatible alternatives

**Effort**:
- `react-native-keychain` integration: 2-3 hours
- `react-native-biometrics` integration: 2-3 hours
- Testing in both Expo and native builds: 3-4 hours
- **Total**: 1-1.5 days

**Timeline Impact**: Phase 1 completes Jan 8 instead of Jan 6 (2 days later)

**Advantages**:
- ✅ Zero refactoring in Phase 4
- ✅ Can test production auth path during Phase 2-3
- ✅ Cleaner architecture from the start
- ✅ Reduces risk at App Store submission

**When to Choose This**: If you want to avoid surprises during Phase 4

**Implementation Steps**:
```
1. Install production-compatible libraries
2. Update useAuth hook (react-native-keychain)
3. Update useBiometric hook (react-native-biometrics)
4. Test in Expo Go (should work identically)
5. Test in native iOS/Android builds (early validation)
6. Proceed to Phase 2 with confidence
```

---

### Option B: Abstraction Layer (MODERATE Effort)

**Approach**: Create abstraction layer for storage/biometric, keep Expo libs for now

**Effort**:
- Create `lib/SecureStorage.ts` abstraction: 1-2 hours
- Create `lib/BiometricAuth.ts` abstraction: 1-2 hours
- Update hooks to use abstractions: 2 hours
- **Total**: 0.5 days

**Timeline Impact**: None - Phase 1 still completes Jan 6

**Implementation**:

Create abstraction layer (`lib/SecureStorage.ts`):
```typescript
// Abstraction layer - switch implementation at one place
import * as SecureStore from "expo-secure-store";
// In production, switch to: import * as Keychain from "react-native-keychain";

export const SecureStorage = {
  setItem: async (key: string, value: string) => {
    // Current: expo-secure-store
    await SecureStore.setItemAsync(key, value);

    // Future: react-native-keychain
    // await Keychain.setGenericPassword(key, value);
  },

  getItem: async (key: string) => {
    // Current: expo-secure-store
    return await SecureStore.getItemAsync(key);

    // Future: react-native-keychain
    // const creds = await Keychain.getGenericPassword();
    // return creds?.password;
  },

  removeItem: async (key: string) => {
    // Current: expo-secure-store
    await SecureStore.deleteItemAsync(key);

    // Future: react-native-keychain
    // await Keychain.resetGenericPassword();
  },
};
```

Update `hooks/useAuth.ts` to use abstraction:
```typescript
import { SecureStorage } from "../lib/SecureStorage";

// Instead of: await SecureStore.setItemAsync(...)
// Now: await SecureStorage.setItem(...)
```

**Advantages**:
- ✅ Minimal immediate refactoring
- ✅ Phase 1 completes on time (Jan 6)
- ✅ Easy to switch implementations later
- ✅ One central place to update

**Disadvantages**:
- ❌ Phase 4 requires full refactoring anyway
- ❌ Can't validate production build path until Phase 4
- ❌ Higher risk of surprises at App Store submission

**When to Choose This**: If timeline is critical and you can defer production testing

---

### Option C: Parallel Development (HIGHEST Effort)

**Approach**: Maintain two branches - Expo (development) and native (production)

**Effort**: High - entire team overhead

**Timeline Impact**: Neutral but increases complexity

**Advantages**:
- Different optimization for each platform
- True platform-specific customization

**Disadvantages**:
- Code duplication
- Merge conflicts
- Increased maintenance burden
- NOT RECOMMENDED for this project

**When to Choose This**: Never, unless you have platform-specific requirements

---

## Part 5: Detailed Recommendation

### CHOOSE: Option A (Refactor Now)

**Reasoning**:
1. ✅ Phase 1 is NOT actually complete if not production-ready
2. ✅ Only 1-1.5 days of additional work
3. ✅ Eliminates major risk during Phase 4 (App Store submission)
4. ✅ Validates authentication path in real native builds
5. ✅ Industry best practice to test production path early
6. ✅ Master roadmap explicitly states non-Expo production
7. ❌ Phase 1 declaration of "100% complete" is premature without this

**Modified Timeline**:
- Phase 1 Auth: Completes Jan 8 (2 days later)
- Phase 2: Jan 9-19 (shifted 2 days)
- Phase 3: Feb 2-11 (shifted 2 days)
- Phase 4: Feb 12-25 (shifted 2 days)
- App Store Launch: Feb 25 (delayed 2 days)

**This is a SMALL cost for ensuring production readiness.**

---

## Part 6: Implementation Steps for Option A

### Step 1: Install Production Libraries

```bash
cd mobile-app
npm install react-native-keychain react-native-biometrics
# Pod install for iOS
cd ios && pod install && cd ..
```

### Step 2: Update `lib/SecureStorage.ts` (New File)

```typescript
import * as Keychain from "react-native-keychain";

/**
 * Secure token storage abstraction
 * Works in both Expo and native builds
 */
export const SecureStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await Keychain.setGenericPassword(key, value, {
        service: "com.ageless.app",
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      console.error(`[SecureStorage] Failed to set ${key}:`, error);
      throw error;
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: "com.ageless.app",
      });

      // Note: react-native-keychain returns all items under same service
      // This is a simplified example - in real implementation, store as JSON object
      if (credentials && key === "auth_token") {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error(`[SecureStorage] Failed to get ${key}:`, error);
      return null;
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await Keychain.resetGenericPassword({
        service: "com.ageless.app",
      });
    } catch (error) {
      console.error(`[SecureStorage] Failed to remove ${key}:`, error);
      throw error;
    }
  },
};
```

### Step 3: Update `lib/BiometricAuth.ts` (New File)

```typescript
import ReactNativeBiometrics from "react-native-biometrics";

const rnBiometrics = new ReactNativeBiometrics();

/**
 * Biometric authentication abstraction
 * Works in both Expo and native builds
 */
export const BiometricAuth = {
  isBiometricAvailable: async (): Promise<boolean> => {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      return available;
    } catch (error) {
      console.error("[BiometricAuth] Error checking sensor:", error);
      return false;
    }
  },

  authenticate: async (reason: string): Promise<boolean> => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: reason,
      });
      return success;
    } catch (error) {
      console.error("[BiometricAuth] Authentication failed:", error);
      return false;
    }
  },

  getSensorType: async (): Promise<"FaceID" | "TouchID" | "Biometric" | null> => {
    try {
      const { biometryType } = await rnBiometrics.isSensorAvailable();

      if (biometryType === "Face") return "FaceID";
      if (biometryType === "Touch") return "TouchID";
      if (biometryType === "Iris") return "Biometric";
      return null;
    } catch (error) {
      console.error("[BiometricAuth] Error detecting sensor type:", error);
      return null;
    }
  },
};
```

### Step 4: Update `hooks/useAuth.ts`

Replace:
```typescript
import * as SecureStore from "expo-secure-store";
```

With:
```typescript
import { SecureStorage } from "../lib/SecureStorage";
```

Update token operations:
```typescript
// OLD (Expo-only):
const token = await SecureStore.getItemAsync("auth_token");
await SecureStore.setItemAsync("auth_token", newToken);
await SecureStore.deleteItemAsync("auth_token");

// NEW (Works in Expo + Native):
const token = await SecureStorage.getItem("auth_token");
await SecureStorage.setItem("auth_token", newToken);
await SecureStorage.removeItem("auth_token");
```

### Step 5: Update `hooks/useBiometric.ts`

Replace:
```typescript
import * as LocalAuthentication from "expo-local-authentication";
```

With:
```typescript
import { BiometricAuth } from "../lib/BiometricAuth";
```

Update biometric operations:
```typescript
// OLD (Expo-only):
const compatible = await LocalAuthentication.hasHardwareAsync();
const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
const result = await LocalAuthentication.authenticateAsync({...});

// NEW (Works in Expo + Native):
const compatible = await BiometricAuth.isBiometricAvailable();
const sensorType = await BiometricAuth.getSensorType();
const success = await BiometricAuth.authenticate("Authenticate to login");
```

### Step 6: Testing

**Test in Expo Go** (current):
```bash
expo start
# Should work identically to before
```

**Build and test iOS native build** (early validation):
```bash
# Create native iOS build with EAS or local Xcode
cd ios
xcodebuild -workspace ageless.xcworkspace -scheme ageless -configuration Release
```

**Build and test Android native build** (early validation):
```bash
cd android
./gradlew assembleRelease
```

---

## Part 7: Risk Assessment

### Risk: Code Not Working in Native Builds

**Likelihood**: Medium (without early testing)
**Impact**: Catastrophic (App Store rejection)
**Mitigation**: Test Option A immediately in actual native builds

**Decision Point**: If native build testing fails, have fallback to Option B (abstraction layer)

---

## Part 8: Summary Table

| Aspect | Expo-Only | Option A (Recommended) | Option B (Fallback) |
|--------|-----------|----------------------|-------------------|
| **Works in Expo Go** | ✅ | ✅ | ✅ |
| **Works in Native iOS** | ❌ | ✅ | ❌ |
| **Works in Native Android** | ❌ | ✅ | ❌ |
| **Effort** | 0 hours | 5-8 hours | 3-4 hours |
| **Timeline Impact** | - | +2 days | None |
| **Phase 4 Refactoring** | Massive | Minimal | Massive |
| **Risk at App Store** | 🔴 Critical | 🟢 Minimal | 🔴 Critical |
| **Recommended** | ❌ | ✅ | ⏸️ Fallback |

---

## Conclusion

**Phase 1 Authentication is currently Expo-development-only, NOT production-ready.**

The Phase 1 "100% complete" declaration was premature and should be updated to reflect:
- ✅ Expo development: 100% complete
- ⏳ Production native: 0% (requires library migration)

**Recommendation**: Spend 1-1.5 additional days (Option A) to migrate to production-compatible libraries. This is a small investment compared to the risk of App Store rejection during Phase 4.

**Next Steps**:
1. ✅ Read and understand this document
2. ⏳ Approve Option A for implementation
3. ⏳ Provide decision on timeline (2-day delay acceptable?)
4. ⏳ Proceed with library migration and testing

---

**Prepared By**: Claude Haiku 4.5
**Date**: January 6, 2026
**Status**: Ready for Review & Approval
