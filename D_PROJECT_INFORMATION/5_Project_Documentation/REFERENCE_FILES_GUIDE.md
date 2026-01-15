# Complete Reference Files Guide

**Source**: Old_Ageless_Web_PWA/fitness-app-next
**Purpose**: Master list of files to follow for React Native duplication
**Priority**: Ranked by importance for mobile app development

---

## CRITICAL FILES (Must Follow First)

### 1. **App Pages** - Main Screen Structures

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `app/dashboard/page.tsx` | Main dashboard with exercises | `screens/DashboardScreen.tsx` | 🔴 CRITICAL |
| `app/(auth)/login/page.tsx` | Login screen | `screens/LoginScreen.tsx` | 🔴 CRITICAL |
| `app/dashboard/layout.tsx` | Dashboard layout with PWANav | `navigation/DashboardNavigator.tsx` | 🔴 CRITICAL |

### 2. **Core Components** - UI Building Blocks

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `components/layout/PWANav.tsx` | 5-tab bottom navigation | `components/PWANav.tsx` | 🔴 CRITICAL |
| `components/ui/DatePicker.tsx` | Calendar date picker | `components/DatePicker/index.tsx` | 🔴 CRITICAL |
| `components/ui/card.tsx` | Card container component | `components/ui/Card.tsx` (Already done) | ✅ DONE |
| `components/ui/button.tsx` | Button component | `components/ui/Button.tsx` (Already done) | ✅ DONE |
| `components/ui/input.tsx` | Text input field | `components/ui/Input.tsx` | 🟡 HIGH |

### 3. **Layout Components** - Navigation & Structure

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `components/layout/PWAHeader.tsx` | App header | `components/PWAHeader.tsx` | 🟡 HIGH |
| `components/layout/MyABSDrawer.tsx` | My ABS sidebar drawer | `components/MyABSDrawer.tsx` | 🟡 HIGH |

### 4. **Modal Components** - Pop-up Dialogs

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `components/modals/HistoryModal.tsx` | Workout history table | `components/modals/HistoryModal.tsx` | 🟡 HIGH |
| `components/modals/SummaryModal.tsx` | Summary statistics modal | `components/modals/SummaryModal.tsx` | 🟡 HIGH |
| `components/modals/ScanModal.tsx` | QR code scan modal | `components/modals/ScanModal.tsx` | 🟡 HIGH |

### 5. **Authentication** - Auth-Related

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `components/auth/FaceIDIcon.tsx` | Animated Face ID icon | `components/auth/FaceIDIcon.tsx` | 🟡 HIGH |

---

## HIGH PRIORITY FILES (Follow Second)

### 6. **Hooks & Contexts** - State Management

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `hooks/useOfflineQueue.ts` | Offline queue management | `hooks/useOfflineQueue.ts` (Already exists) | 🟡 HIGH |
| `contexts/DrawerContext.tsx` | Drawer state management | `contexts/DrawerContext.tsx` | 🟡 HIGH |

### 7. **Library Utilities** - Constants & Helpers

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `lib/constants/exercises.ts` | Exercise/station data | `lib/constants/exercises.ts` (Already exists) | 🟡 HIGH |
| `lib/utils.ts` | Utility functions | `lib/utils.ts` (Already exists) | 🟡 HIGH |
| `lib/auth.ts` | Authentication utilities | `lib/auth.ts` | 🟡 HIGH |

### 8. **Page Layouts** - Other Screens

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `app/dashboard/history/page.tsx` | History/workout details | `screens/HistoryScreen.tsx` | 🟡 HIGH |
| `app/dashboard/mybody/page.tsx` | My Body/ABS tracking | `screens/MyBodyScreen.tsx` | 🟡 HIGH |
| `app/dashboard/summary/page.tsx` | Summary statistics | `screens/SummaryScreen.tsx` | 🟡 HIGH |
| `app/dashboard/rewards/page.tsx` | Rewards page | `screens/RewardsScreen.tsx` | 🟡 HIGH |
| `app/(auth)/register/page.tsx` | Registration screen | `screens/RegisterScreen.tsx` | 🟡 HIGH |

---

## MEDIUM PRIORITY FILES (Follow Third)

### 9. **UI Components** - Specialized Inputs

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `components/ui/MenuDropdown.tsx` | Dropdown menu | `components/ui/MenuDropdown.tsx` | 🟠 MEDIUM |
| `components/ui/toast.tsx` | Toast notifications | `components/ui/Toast.tsx` | 🟠 MEDIUM |

### 10. **Layout Components** - Helper Layouts

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `components/layout/logout-button.tsx` | Logout button | `components/LogoutButton.tsx` | 🟠 MEDIUM |
| `app/(auth)/layout.tsx` | Auth layout wrapper | `navigation/AuthNavigator.tsx` | 🟠 MEDIUM |
| `app/layout.tsx` | Root layout | `App.tsx` / Root provider | 🟠 MEDIUM |

### 11. **Provider Components** - Global Setup

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `components/SessionProvider.tsx` | Auth session provider | `providers/SessionProvider.tsx` | 🟠 MEDIUM |
| `components/ServiceWorkerRegister.tsx` | PWA service worker | N/A (Mobile specific) | 🟠 MEDIUM |

---

## LOW PRIORITY FILES (Follow Last)

### 12. **API Routes** - Backend Integration

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `app/api/auth/[...nextauth]/route.ts` | NextAuth API | Backend API integration | 🔵 LOW |
| `app/api/workouts/[date]/route.ts` | Workout API | API service layer | 🔵 LOW |
| `app/api/workouts/route.ts` | Workouts list API | API service layer | 🔵 LOW |
| `app/api/summary/route.ts` | Summary API | API service layer | 🔵 LOW |
| `app/api/auth/register/route.ts` | Registration API | API service layer | 🔵 LOW |
| `app/api/mobile/login/route.ts` | Mobile login API | API service layer | 🔵 LOW |

### 13. **Configuration Files** - Setup & Config

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `tailwind.config.ts` | Tailwind configuration | Already using theme/tokens.ts | 🔵 LOW |
| `middleware.ts` | Next.js middleware | N/A (Backend specific) | 🔵 LOW |
| `lib/prisma.ts` | Database ORM | Backend database logic | 🔵 LOW |

### 14. **Scripts & Testing** - Development Tools

| File | Purpose | React Native Equivalent | Priority |
|------|---------|------------------------|----------|
| `types/index.ts` | TypeScript type definitions | `types/index.ts` | 🔵 LOW |
| `test-ui-components.js` | Component testing | Testing utilities | 🔵 LOW |

---

## File Organization Summary

### By Category:

**Pages (Screens)**:
```
app/dashboard/page.tsx                    ← Main dashboard
app/dashboard/history/page.tsx            ← History screen
app/dashboard/mybody/page.tsx             ← My Body screen
app/dashboard/summary/page.tsx            ← Summary screen
app/dashboard/rewards/page.tsx            ← Rewards screen
app/(auth)/login/page.tsx                 ← Login screen
app/(auth)/register/page.tsx              ← Register screen
```

**Components**:
```
components/layout/
  ├── PWANav.tsx                          ← CRITICAL: Bottom navigation
  ├── PWAHeader.tsx                       ← Header
  ├── MyABSDrawer.tsx                     ← Drawer
  └── logout-button.tsx

components/ui/
  ├── button.tsx                          ← ✅ DONE
  ├── card.tsx                            ← ✅ DONE
  ├── input.tsx
  ├── DatePicker.tsx                      ← CRITICAL: Calendar
  ├── MenuDropdown.tsx
  └── toast.tsx

components/auth/
  └── FaceIDIcon.tsx                      ← Animated icon

components/modals/
  ├── HistoryModal.tsx                    ← CRITICAL
  ├── SummaryModal.tsx                    ← CRITICAL
  └── ScanModal.tsx                       ← CRITICAL
```

**Hooks & Context**:
```
hooks/
  └── useOfflineQueue.ts

contexts/
  └── DrawerContext.tsx
```

**Libraries**:
```
lib/
  ├── constants/exercises.ts
  ├── utils.ts
  └── auth.ts
```

---

## Implementation Roadmap

### Phase 1 (COMPLETE ✅)
- ✅ Theme/tokens system
- ✅ Design audit infrastructure
- ✅ Basic components (Card, Button, DateSelector)

### Phase 2 (NEXT - 4-6 weeks)
**CRITICAL FILES TO IMPLEMENT**:
1. `components/layout/PWANav.tsx` - 5-tab navigation
2. `components/ui/DatePicker.tsx` - Calendar component
3. `components/modals/HistoryModal.tsx` - History display
4. `components/modals/SummaryModal.tsx` - Summary display
5. `components/modals/ScanModal.tsx` - QR scan

**HIGH FILES TO IMPLEMENT**:
6. `components/layout/MyABSDrawer.tsx` - Drawer navigation
7. `components/auth/FaceIDIcon.tsx` - Animated icon
8. `components/layout/PWAHeader.tsx` - App header
9. `app/dashboard/history/page.tsx` - History screen
10. `app/dashboard/mybody/page.tsx` - My Body screen

### Phase 3 (FUTURE - 2-3 weeks)
**MEDIUM FILES TO IMPLEMENT**:
1. `app/dashboard/summary/page.tsx` - Summary screen
2. `app/dashboard/rewards/page.tsx` - Rewards screen
3. `components/ui/MenuDropdown.tsx` - Dropdown
4. `components/ui/toast.tsx` - Toast notifications

**LOW FILES TO IMPLEMENT**:
5. API integration
6. Authentication flow
7. Type definitions

---

## Quick Reference: What's Already Done vs. What's Missing

### ✅ ALREADY IMPLEMENTED
- `components/ui/Card.tsx` (matches card.tsx)
- `components/ui/Button.tsx` (matches button.tsx - refactored)
- `components/ui/DateSelector.tsx` (simple version, not full DatePicker)
- `lib/constants/exercises.ts` (exists)
- `lib/utils.ts` (exists)
- `hooks/useOfflineQueue.ts` (exists)
- Design tokens (theme/tokens.ts)

### ❌ MISSING - CRITICAL
- `components/layout/PWANav.tsx` - 5-tab bottom nav
- `components/ui/DatePicker.tsx` - Full calendar component
- `components/modals/HistoryModal.tsx` - History table
- `components/modals/SummaryModal.tsx` - Summary modal
- `components/modals/ScanModal.tsx` - QR scan modal

### ❌ MISSING - HIGH
- `components/layout/MyABSDrawer.tsx` - Drawer
- `components/auth/FaceIDIcon.tsx` - Animated icon
- `components/layout/PWAHeader.tsx` - Header
- `contexts/DrawerContext.tsx` - Drawer state
- Dashboard screens (history, mybody, summary, rewards)

### ❌ MISSING - MEDIUM/LOW
- UI components (MenuDropdown, toast)
- Additional screens and flows
- API integration

---

## File Size & Complexity Guide

| File | Size | Complexity | Est. Time |
|------|------|-----------|-----------|
| PWANav.tsx | ~150-200 lines | Medium | 1-2 hrs |
| DatePicker.tsx | ~300-400 lines | High | 3-4 hrs |
| HistoryModal.tsx | ~200-250 lines | Medium | 2-3 hrs |
| MyABSDrawer.tsx | ~250-300 lines | High | 2-3 hrs |
| FaceIDIcon.tsx | ~100-150 lines | Low | 1 hr |
| Each Screen | ~200-300 lines | Medium | 2-3 hrs |

**Total estimated time for Phase 2**: 15-20 hours

---

## How to Use This Guide

1. **For each file**, read the ORIGINAL from fitness-app-next
2. **Understand the structure** - Component composition, state management
3. **Replicate in React Native** - Adapt to React Native APIs
4. **Use theme tokens** - All styling from theme/tokens.ts
5. **Test functionality** - Use Design Audit Screen to verify

---

## Critical Implementation Notes

### PWANav.tsx Structure
- 5 tabs (Home, My ABS, Scan, Listen, Rewards)
- Bottom fixed navigation
- Active tab styling (scale + color change)
- Custom SVG icons (NOT emoji)
- Safe area inset handling

### DatePicker.tsx Structure
- Calendar popup/modal
- Month/year navigation
- Day selection
- Today button
- Animated open/close

### Modals Structure
- Overlay with semi-transparent background
- Center positioned
- Close button
- Animated entrance/exit
- Scrollable content for long lists

### FaceIDIcon.tsx Animation
- Scale animation (1 → 1.1 → 1)
- 2s duration, ease-in-out timing
- Green drop-shadow effect
- Pulsing effect when scanning

---

## Next Steps

**Immediate (This Week)**:
1. Read all CRITICAL files from fitness-app-next
2. Understand PWANav implementation
3. Plan DatePicker component structure

**Short Term (Next 1-2 Weeks)**:
1. Implement PWANav component
2. Implement DatePicker component
3. Implement Modal components

**This is your master reference guide for Phase 2+ development!**

---

**Created**: January 5, 2026
**Source**: Old_Ageless_Web_PWA/fitness-app-next
**Status**: Complete reference guide
**Use**: As implementation roadmap

