# DEVIATIONS FROM ORIGINAL APP
## Audit Date: October 22, 2025

This document tracks deviations between the current fitness-app-next implementation and the original `/workspaces/Fitness_tracker` application. These deviations have been analyzed, and corrected specifications are now documented in `claude.md`.

**Note**: This file shows what NEEDS to change. The CORRECTED final states are documented in `claude.md` as authoritative specifications.

---

## DEVIATION SUMMARY

| Priority | Count | Areas |
|----------|-------|-------|
| 🔴 CRITICAL | 1 | Offline functionality (service worker, queue, sync) |
| 🟠 MAJOR | 2 | Summary column immutability, exercise order validation |
| 🟡 MODERATE | 7 | Responsive breakpoints, header visibility, animations, etc. |
| 🟢 MINOR | 2 | Polish items (ARIA labels, loading states) |
| **TOTAL** | **12** | **Must be addressed before production** |

---

## CRITICAL DEVIATIONS

### DEVIATION #1: OFFLINE FUNCTIONALITY 🔴

**Status**: NOT IMPLEMENTED

**Original Implementation**:
- Service Worker: `/web/service-worker.js` (exists)
- Cache versioning: `ft-static-v1`
- Network-first strategy for HTML/API
- Cache-first for static assets
- Offline queue: localStorage `ft.outbox`
- Deduplication: same date replaces older entry
- Sync trigger: `window.online` event
- Toast notifications: "Queued", "Syncing...", "Synced!"

**Current Implementation**:
- ❌ No service worker (`service-worker.js` missing)
- ❌ No offline queue (`ft.outbox` not implemented)
- ❌ No sync mechanism
- ❌ localStorage only for weight (temporary, not proper caching)

**Required Changes**:
1. Create `/public/service-worker.js` with:
   - Cache naming: `ft-static-v1` (increment on deploys)
   - Network-first for `/api/*` endpoints
   - Cache-first for `/icons/*`, static JS/CSS
   - HTML: network-first with fallback
   - Offline 503 response for failed API calls

2. Implement offline queue hook:
   - localStorage key: `ft.outbox`
   - Structure: `{ path, method, body, ts }`
   - Trigger on save when `!navigator.onLine`
   - Do NOT update local state (avoid false correctness)

3. Implement sync on reconnect:
   - Listen to `window.online` event
   - Iterate queue in timestamp order
   - Dedup by date (same date replaces)
   - POST each, remove on success, keep failures
   - Toast feedback per entry

**Severity**: CRITICAL - App cannot work offline (foundational feature)

**Reference**: claude.md Section 0.5, 19.2.8

---

## MAJOR DEVIATIONS

### DEVIATION #2: SUMMARY TABLE COLUMN ORDER 🟠

**Status**: NOT EXPLICITLY ENFORCED

**Original Specification**:
- 14 columns in fixed order (IMMUTABLE)
- Column 1: Week Of
- Column 2: Avg Weight
- Columns 3-13: 11 exercises (Bike, Abs, Chest Press, Leg Press, Lat, Military, Crunch, Bicep Curls, Triceps, Overhead Pull, Row)
- Column 14: Total Sets
- Constraint: New exercises MUST append after column 14 (NOT insert)

**Current Implementation**:
- ❓ Summary table shows columns
- ❌ No TypeScript constant enforcing order
- ❌ No validation preventing column reordering
- ❌ No code comment warning against insertion

**Required Changes**:
1. Create immutable constant:
```typescript
const IMMUTABLE_SUMMARY_COLUMNS = [
  "Week Of",
  "Avg Weight",
  "Bike", "Abs", "Chest Press", "Leg Press", "Lat", "Military",
  "Crunch", "Bicep Curls", "Triceps", "Overhead Pull", "Row",
  "Total Sets"
] as const;
```

2. Use in component:
```typescript
const columns = IMMUTABLE_SUMMARY_COLUMNS; // NOT dynamic map
```

3. Add validation:
```typescript
if (IMMUTABLE_SUMMARY_COLUMNS.length !== 14) {
  throw new Error('Summary columns corrupted');
}
```

4. Add code comment:
```typescript
// CRITICAL: This column order is immutable and part of permanent UI design.
// DO NOT insert columns mid-structure. Any future exercises MUST append AFTER column 14.
// See: claude.md Section 0.2.E and Section 19.2.2
```

**Severity**: MAJOR - Breaks data model stability and test selectors

**Reference**: claude.md Section 0.2.E, 0.10, 19.2.2

---

### DEVIATION #3: EXERCISE DATA IMMUTABILITY 🟠

**Status**: PARTIALLY VERIFIED

**Original Specification**:
- Exactly 11 exercises in fixed order (immutable)
- Exercise 1: Bike (unit: Min, goal: 60)
- Exercise 2: Abs (unit: Reps, goal: 100)
- Exercise 3: Chest Press (unit: Reps, goal: 20)
- Exercise 4: Leg Press (unit: Reps, goal: 20)
- Exercise 5: Lat (unit: Reps, goal: 20)
- Exercise 6: Military (unit: Reps, goal: 20)
- Exercise 7: Crunch (unit: Reps, goal: 100)
- Exercise 8: Bicep Curls (unit: Reps, goal: 20)
- Exercise 9: Triceps (unit: Reps, goal: 40)
- Exercise 10: Overhead Pull (unit: Reps, goal: 40)
- Exercise 11: Row (unit: Reps, goal: 20)

**Current Implementation**:
- ✅ 11 exercises present
- ❓ Order correct (needs verification)
- ❓ Goals correct (needs verification)
- ❌ No TypeScript constraint as `const`

**Required Changes**:
1. Verify all 11 exercises match exactly (names, goals, units)
2. Convert to constant:
```typescript
const EXERCISES = [
  { name: "Bike", unit: "Min", goal: 60 },
  { name: "Abs", unit: "Reps", goal: 100 },
  // ... rest
] as const;
```

3. Add validation:
```typescript
if (EXERCISES.length !== 11) {
  throw new Error('Exercise list corrupted: must have exactly 11');
}
```

4. Add code comment about immutability

**Severity**: MAJOR - Progress calculations depend on order

**Reference**: claude.md Section 0.10, 19.2.4

---

## MODERATE DEVIATIONS

### DEVIATION #4: RESPONSIVE BREAKPOINT VERIFICATION 🟡

**Status**: NEEDS VERIFICATION

**Original Specification**:
- Mobile (< 600px): Grid `minmax(180px, 1fr)`, padding `16px 14px 18px`
- Tablet (600px - 680px): Grid `minmax(220px, 1fr)`, padding `16px 14px 18px`
- Desktop (> 680px): Grid `minmax(240px, 1fr)`, padding `18px 16px 20px`

**Current Implementation**:
- ❓ Grid template unclear (may not have explicit 600px break)
- ❓ Padding may not adjust at breakpoint

**Required Changes**:
1. Verify current CSS/Tailwind uses 600px boundary
2. Test at exactly 599px and 600px viewport widths
3. Ensure grid columns change at boundary
4. Verify padding adjusts (16px → 18px)

**Test Cases**:
- [ ] At 375px (iPhone SE): 2 columns, narrow cards
- [ ] At 600px boundary: Grid layout changes
- [ ] At 768px (tablet): All cards visible
- [ ] At 1024px (desktop): Optimal spacing

**Severity**: MODERATE - Mobile UX impacted

**Reference**: claude.md Section 0.6, 19.2.7

---

### DEVIATION #5: PWA HEADER VISIBILITY LOGIC 🟡

**Status**: NEEDS VERIFICATION

**Original Specification**:
- Header HIDDEN on login/register (no auth)
- Header VISIBLE on dashboard (post-auth)
- Only shows in PWA mode (`body.is-pwa.pwa-app-active`)
- Shows user email, profile button, app title

**Current Implementation**:
- ✅ Red header exists
- ❓ Visibility logic unclear (shows on all pages?)
- ❓ May not respect auth state

**Required Changes**:
1. Verify header only shows when authenticated
2. Add conditional render:
```typescript
if (session) {
  return <PWAHeader email={session.user.email} />;
}
// No header before auth
```

3. Verify body classes:
   - `is-pwa`: Set when PWA detected
   - `pwa-app-active`: Set after auth

**Test Cases**:
- [ ] Header NOT shown on /login
- [ ] Header NOT shown on /register
- [ ] Header shown on /dashboard
- [ ] Header shows user email
- [ ] Header fixed on scroll

**Severity**: MODERATE - UI consistency

**Reference**: claude.md Section 0.1, 19.2.1

---

### DEVIATION #6: FACE ID ANIMATION SPECIFICS 🟡

**Status**: NEEDS VERIFICATION

**Original Specification**:
- Duration: 2s (exactly 2000ms)
- Easing: ease-in-out
- Animation: scale 1 → 1.1 → 1 (10% growth)
- Shadow: Green `rgba(52, 199, 89, 0.5)` (NOT red)
- Brightness: 1.2 boost at midpoint
- Trigger: Click on Face ID icon

**Current Implementation**:
- ✅ Animation exists
- ❓ Duration (2s or different?)
- ❓ Shadow color (green or red?)
- ❓ Easing correct?

**Required Changes**:
1. Verify animation is exactly 2s (not 1s or 1.5s)
2. Verify shadow is green (RGB 52,199,89)
3. Verify easing is ease-in-out
4. Verify brightness(1.2) applied

**Animation Spec**:
```css
@keyframes faceIdScan {
  0%, 100% { transform: scale(1); }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 20px rgba(52, 199, 89, 0.5)) brightness(1.2);
  }
}
```

**Severity**: MODERATE - Design polish, user expectations

**Reference**: claude.md Section 0.2.A

---

### DEVIATION #7: MENU HIERARCHY & NESTING 🟡

**Status**: NEEDS VERIFICATION

**Original Specification**:
- Main menu: 11 items + divider + Logout
- Food submenu: 5 items (all "Coming Soon")
- Beauty submenu: Skin nested submenu
- Skin submenu: 4 items (all "Coming Soon")
- Mind submenu: 8 items (all "Coming Soon")
- Disabled items: opacity 0.55, cursor default, no hover

**Current Implementation**:
- ✅ Menu exists
- ❓ All submenus present?
- ❓ Nesting correct (Beauty→Skin)?
- ❓ Disabled styling correct?

**Required Changes**:
1. Verify all 11 main items present
2. Verify disabled items have opacity 0.55 (NOT 0.5)
3. Verify hierarchical nesting (Beauty→Skin chain)
4. Verify arrow indicators use `▸` character

**Test Cases**:
- [ ] 11 main menu items
- [ ] Food submenu shows 5 items
- [ ] Beauty→Skin nested structure works
- [ ] Mind submenu shows 8 items
- [ ] Disabled items: opacity 0.55, no hover effect
- [ ] Arrows use `▸` character

**Severity**: MODERATE - Navigation consistency

**Reference**: claude.md Section 0.2.F

---

### DEVIATION #8: BOTTOM NAV TAB LABELS 🟡

**Status**: NEEDS VERIFICATION

**Original Specification**:
- Tab 1: "Home"
- Tab 2: "My Body" (or "My ABS"? - verify)
- Tab 3: "Scan"
- Tab 4: "Listen" (or "Media"? - verify)
- Tab 5: "Rewards"

**Current Implementation**:
- ✅ 5 tabs present
- ❓ Labels match exactly?

**Required Changes**:
1. Verify Tab 2 label (My Body vs My ABS)
2. Verify Tab 4 label (Listen vs Media)
3. Update PWANav.tsx if needed

**Test Cases**:
- [ ] Tab 1: "Home" (not "Dashboard")
- [ ] Tab 2: Exact label verified
- [ ] Tab 3: "Scan" (not "QR")
- [ ] Tab 4: Exact label verified
- [ ] Tab 5: "Rewards" (not "Achievements")

**Severity**: MODERATE - User confusion risk

**Reference**: claude.md Section 0.2.F, 19.2.2

---

### DEVIATION #9: AUTO-SAVE DEBOUNCE TIMING 🟡

**Status**: NEEDS VERIFICATION

**Original Specification**:
- Debounce duration: 2s (exactly 2000ms, NOT 800ms)
- Duplicate detection: If identical payload within 2s, ignore save
- Purpose: Prevent rapid duplicate POSTs

**Current Implementation**:
- ✅ Auto-save exists
- ❓ Debounce timing (800ms or 2s?)
- ❓ Duplicate detection implemented?

**Required Changes**:
1. Verify debounce is 2s (not 800ms)
2. Implement duplicate detection:
```typescript
if (JSON.stringify(data) === JSON.stringify(lastPayload)) {
  return; // Identical, skip
}
```

3. Add code comment explaining 2s debounce

**Test Cases**:
- [ ] Same payload within 2s: Skipped (no POST)
- [ ] Different payload: POST fires
- [ ] Timer: Resets on each keystroke
- [ ] Toast: Shows once after save

**Severity**: MODERATE - Save reliability

**Reference**: claude.md Section 0.2.C

---

### DEVIATION #10: COLLAPSE ARROW ANIMATION 🟡

**Status**: NEEDS VERIFICATION

**Original Specification**:
- Rotation: 180° (full flip)
- Timing: 120ms ease-out
- Font size: 28.8px
- Trigger: Click on "Sign in" section

**Current Implementation**:
- ✅ Arrow rotates
- ❓ Rotation angle (180° or different?)
- ❓ Timing correct?

**Required Changes**:
1. Verify rotation is 180° (not 90°)
2. Verify timing is 120ms ease-out
3. Verify font size 28.8px

**Severity**: MODERATE - Animation polish

**Reference**: claude.md Section 0.2.A

---

### DEVIATION #11: GATEWAY PAGE ROUTING 🟡

**Status**: NEEDS VERIFICATION

**Original Specification**:
- Root path `/` redirects based on auth state
- No auth: Redirect to login
- Authenticated: Redirect to dashboard

**Current Implementation**:
- ✅ Routing exists
- ❓ Exact redirect logic?

**Test Cases**:
- [ ] Unauthenticated at `/`: Redirects to `/login`
- [ ] Authenticated at `/`: Redirects to `/dashboard`
- [ ] Direct `/dashboard` no auth: Redirects to `/login`

**Severity**: MODERATE - UX flow

---

## MINOR DEVIATIONS

### DEVIATION #12: ARIA LABELS & ACCESSIBILITY 🟢

**Status**: PARTIAL IMPLEMENTATION

**Original Specification**:
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Focus rings: 2px solid outline with 2px offset
- Keyboard support: Tab, Enter, Escape
- Reduced motion: Media query removes animations

**Current Implementation**:
- ⚠️ Some ARIA labels present
- ❓ Complete coverage?
- ✅ Focus rings likely present
- ✅ Keyboard support likely working

**Required Changes**:
1. Add missing ARIA attributes
2. Ensure focus rings on all interactive elements
3. Test keyboard navigation (Tab, Escape)
4. Verify reduced-motion media query works

**Test Cases**:
- [ ] Modals have `role="dialog"` and `aria-modal="true"`
- [ ] Focus rings visible (2px outline)
- [ ] Tab key navigates logically
- [ ] Escape closes modals
- [ ] Reduced motion respected (no animations)

**Severity**: MINOR - Accessibility, not core functionality

**Reference**: claude.md Section 0.7, 19.2.6

---

### DEVIATION #13: LOADING & ERROR STATE UX 🟢

**Status**: BASIC IMPLEMENTATION

**Original Specification**:
- Loading: Simple feedback (not complex skeletons)
- Errors: Toast notifications (not alerts)
- Messages: Simple, clear language
- Retry: Automatic retry for offline saves

**Current Implementation**:
- ✅ Basic loading states exist
- ✅ Toast notifications present
- ❓ Error messages consistent?

**Required Changes**:
1. Verify error messages match original tone
2. Ensure no `alert()` usage (use toast instead)
3. Add loading indicators where appropriate

**Severity**: MINOR - UX polish

---

## REMEDIATION PRIORITY

### Phase 1: CRITICAL (Week 1-2)
- [ ] DEVIATION #1: Implement service worker + offline queue + sync

### Phase 2: MAJOR (Week 2-3)
- [ ] DEVIATION #2: Enforce summary column immutability
- [ ] DEVIATION #3: Validate exercise data + make constant

### Phase 3: MODERATE (Week 3-4)
- [ ] DEVIATION #4: Verify responsive breakpoints (600px)
- [ ] DEVIATION #5: Verify header visibility logic
- [ ] DEVIATION #6: Verify Face ID animation (2s, green)
- [ ] DEVIATION #7: Verify menu structure + nesting
- [ ] DEVIATION #8: Verify tab labels exact
- [ ] DEVIATION #9: Verify debounce 2s + duplicate detection
- [ ] DEVIATION #10: Verify collapse arrow 180°/120ms
- [ ] DEVIATION #11: Verify routing logic

### Phase 4: MINOR (Week 4+)
- [ ] DEVIATION #12: Complete ARIA labels
- [ ] DEVIATION #13: Finalize UX messages

---

## VALIDATION CHECKLIST

Before closing any deviation:

- [ ] Code change implemented
- [ ] Tests pass (or added)
- [ ] Behavior matches original exactly
- [ ] Claude.md updated with final spec
- [ ] Code comment added explaining constraint
- [ ] Peer review completed
- [ ] Marked complete in this file

---

## REFERENCE DOCUMENTS

- **Source of Truth**: `/workspaces/Fitness_tracker` (original app)
- **Design System**: `claude.md` (Sections 0-20)
- **User Flows**: `USER_FLOWS.md` (original app)
- **Behavior Spec**: `BEHAVIOR_SPEC.md` (original app)
- **Current Status**: `CURRENT_STATUS_AND_NEXT_STEPS.md` (fitness-app-next)

---

## NOTES

This document is a **working reference** for development. As deviations are fixed, mark them complete with a checkbox and a brief note of when they were resolved.

**Last Updated**: October 22, 2025
**Status**: Initial audit complete, awaiting remediation
