# Production Testing Mapping Guide ✅

**Date**: 2026-01-13
**Purpose**: Quick reference for matching HTML previews with React Native components during QA testing

---

## File Mapping Matrix

### Screen 1: Dashboard

**HTML Preview**: `C_TESTING_AND_VALIDATION/3_HTML_Previews/HTML_Previews_Final_for_Prod_Testing/dashboard-screen.html`

**React Native Component**: `Ageless_REACT-Native_Mobile_Application/mobile-app/app/dashboard/index.tsx`

**Key Elements to Test**:
- ✅ Red header (#C5282F) with "Ageless." title
- ✅ Hamburger menu icon (☰) at right 16px
- ✅ Date picker with calendar icon
- ✅ Progress section showing workout completion
- ✅ Weight input card
- ✅ 11 exercise cards in 2-column grid (48% width each)
- ✅ Exercise cards with +/- controls
- ✅ Completed exercise styling (#f1f8f4 background, #4caf50 border)
- ✅ Bottom navigation with 5 emoji tabs
- ✅ All scrolling behavior

**Visual Verification**:
```
Expected Layout:
┌─ Red Header with Hamburger Menu
├─ Date Picker
├─ Progress Section (0/11 exercises)
├─ Weight Card (lbs input)
├─ Exercise Grid (2 columns)
│  ├─ Bike         Abs
│  ├─ Chest Press  Leg Press
│  ├─ Lat          Military
│  ├─ Crunch       Bicep Curls
│  ├─ Triceps      Overhead Pull
│  └─ Row          (11th card)
└─ Bottom Nav (🏠 ⭐ 📱 🎧 🎁)
```

---

### Screen 2: Fitness Summary

**HTML Preview**: `C_TESTING_AND_VALIDATION/3_HTML_Previews/HTML_Previews_Final_for_Prod_Testing/fitness-summary-screen.html`

**React Native Component**: `Ageless_REACT-Native_Mobile_Application/mobile-app/components/modals/SummaryModal.tsx`

**Key Elements to Test**:
- ✅ Red header (#C5282F) with "Ageless." title
- ✅ Hamburger menu icon (☰) at right 16px
- ✅ Header card with "Fitness Summary" title and "Your progress at a glance" subtitle
- ✅ 3 stat cards (Total Workouts, Avg Weight, Total Sets)
- ✅ Stat card styling (10px padding, white background, left-justified text)
- ✅ "Weekly Breakdown" section title
- ✅ 3 weekly cards with:
  - Week date and completion percentage (right-aligned)
  - Workouts completed subtitle
  - 3-column stats grid (Avg Weight, Total Sets, Avg/Workout)
  - Top exercises list (light grey background)
  - Progress bar with fill percentage
- ✅ Bottom navigation with 5 emoji tabs
- ✅ Grey background (#f5f5f5) with white cards
- ✅ Scrollable content

**Visual Verification**:
```
Expected Layout:
┌─ Red Header with Hamburger Menu
├─ Header Card
│  ├─ Fitness Summary (20px, bold)
│  └─ Your progress at a glance (13px, normal)
├─ Stat Cards (single column)
│  ├─ Total Workouts: 47
│  ├─ Avg Weight: 178.5 lbs
│  └─ Total Sets: 312
├─ Weekly Breakdown
├─ Weekly Card 1 (Jan 7 - Jan 13, 2026)
│  ├─ 4 workouts completed | 80% completion
│  ├─ Avg Wt: 178.3 | Total Sets: 64 | Avg/WO: 16
│  ├─ Top Exercises (light grey box)
│  └─ [Progress Bar: 80%]
├─ Weekly Card 2 (Dec 31 - Jan 6, 2026)
│  └─ (Similar structure, 92% completion)
├─ Weekly Card 3 (Dec 24 - Dec 30, 2025)
│  └─ (Similar structure, 55% completion)
└─ Bottom Nav (🏠 ⭐ 📱 🎧 🎁)
```

**How to Open Modal**:
- Tap hamburger menu → Select "Summary" option
- Or use dedicated button if available

---

### Screen 3: Progress Summary Modal

**HTML Preview**: `C_TESTING_AND_VALIDATION/3_HTML_Previews/HTML_Previews_Final_for_Prod_Testing/progress-summary-modal-fixed.html`

**React Native Component**: `Ageless_REACT-Native_Mobile_Application/mobile-app/components/modals/ProgressSummaryScreen.tsx`

**Key Elements to Test**:
- ✅ Red header (#C5282F) with "Ageless." title
- ✅ Hamburger menu icon at right 16px
- ✅ Header card with "Progress Summary" title and "Weekly workout totals" subtitle
- ✅ 14-column table with sticky header
  - Week Of (170px min-width)
  - Avg Wt, Bike, Abs, Chest Press, Leg Press, Lat, Military, Crunch, Bicep Curls, Triceps, Overhead Pull, Row, Total Sets
- ✅ 52 rows of weekly data
- ✅ Table header red background with white text
- ✅ Alternating row colors (#f9f9f9 for even rows)
- ✅ Horizontal scroll for all columns (no visible scrollbar)
- ✅ Vertical scroll for 52 weeks (no visible scrollbar)
- ✅ Touch scroll support (no scroll indicators)
- ✅ Bottom navigation with 5 emoji tabs

**Visual Verification**:
```
Expected Layout:
┌─ Red Header with Hamburger Menu
├─ Header Card
│  ├─ Progress Summary (20px, bold, centered)
│  └─ Weekly workout totals (13px, normal, centered)
├─ 14-Column Table
│  ├─ Header Row (Red background, white text)
│  │  └─ Week Of | Avg Wt | Bike | Abs | Chest Press | Leg Press | Lat | Military | Crunch | Bicep Curls | Triceps | Overhead Pull | Row | Total Sets
│  └─ Data Rows (52 weeks)
│     ├─ Jan 7 - Jan 13, 2026 | 178.3 | 8 | 12 | 6 | 10 | 5 | 4 | 7 | 9 | 3 | 6 | 8 | 78
│     ├─ Dec 31 - Jan 6, 2026 | 177.8 | 10 | 14 | 8 | 12 | 6 | 5 | 9 | 11 | 4 | 7 | 10 | 96
│     ├─ (alternating grey rows)
│     └─ ... (52 weeks total)
└─ Bottom Nav (🏠 ⭐ 📱 🎧 🎁)
```

**Scroll Testing**:
- Horizontal: Swipe left/right to see all 14 columns
- Vertical: Swipe up/down to scroll through 52 weeks
- Header should stay sticky during vertical scroll

**How to Open Modal**:
- Tap hamburger menu → Select "Progress Summary" option
- Or use dedicated button in Dashboard

---

## Testing Checklist

### Dashboard Screen (dashboard-screen.html)
- [ ] Header displays correctly (red, white text)
- [ ] Hamburger menu visible and clickable
- [ ] Date picker works
- [ ] Progress bar updates correctly
- [ ] All 11 exercise cards display
- [ ] Cards arrange in 2 columns
- [ ] +/- buttons work for each exercise
- [ ] Completed exercises show green styling
- [ ] Bottom navigation visible and functional
- [ ] Responsive in landscape mode
- [ ] Scrolls smoothly

### Fitness Summary (fitness-summary-screen.html)
- [ ] Modal opens properly
- [ ] Header card displays with correct text
- [ ] 3 stat cards visible with correct data
- [ ] Stat text is left-justified
- [ ] "Weekly Breakdown" section visible
- [ ] 3 weekly cards display with data
- [ ] Completion percentages show correctly
- [ ] Top exercises list visible in light grey box
- [ ] Progress bars render with correct fill
- [ ] Bottom navigation visible
- [ ] Content scrolls smoothly
- [ ] Responsive in landscape mode

### Progress Summary Modal (progress-summary-modal-fixed.html)
- [ ] Modal opens with header card
- [ ] 14-column table visible
- [ ] Table header is red with white text
- [ ] All 52 weeks of data accessible
- [ ] Horizontal scroll works (no scrollbar visible)
- [ ] Vertical scroll works (no scrollbar visible)
- [ ] Header row stays sticky during scroll
- [ ] Alternating row colors correct (#f9f9f9)
- [ ] Data formatting consistent
- [ ] Touch scroll responsive
- [ ] Bottom navigation visible
- [ ] Modal closes properly

---

## Color Reference

Use these hex codes to verify colors match HTML previews:

```
Primary Red:      #C5282F (header, progress fill, accent)
White:            #FFFFFF (cards, text)
Light Grey:       #f5f5f5 (background)
Micro Grey:       #f9f9f9 (alternating rows)
Green (Complete): #4caf50 (completed exercise border)
Green BG:         #f1f8f4 (completed exercise background)
Dark Text:        #333   (primary text)
Medium Text:      #666   (secondary labels)
Light Text:       #999   (tertiary text, help text)
Border:           #e0e0e0 (borders, dividers)
Light Border:     #e5e5e5 (top borders)
```

---

## Font Size Reference

Verify all text matches these sizes:

```
Headers:          24px (Ageless.)
Card Titles:      20px (Fitness Summary, Progress Summary)
Section Titles:   16px (Weekly Breakdown)
Body Text:        14px (labels, descriptions)
Sub Text:         13px (subtitles)
Small Text:       12px (stats, labels)
Micro Text:       11px (navigation, badges)
```

---

## Spacing Reference

Verify padding and margins match:

```
Large Sections:   16px padding/margin
Cards:            10-16px padding
Header Card:      16px padding
Element Gaps:     12px (between cards)
Header Gaps:      4px (title/subtitle spacing)
```

---

## Quick Test Instructions

### 1. Dashboard Test (2 min)
1. Open app
2. View dashboard (should match HTML)
3. Tap date picker
4. Tap +/- on exercise cards
5. Check responsive in landscape
6. Verify hamburger menu

### 2. Fitness Summary Test (3 min)
1. Tap hamburger menu
2. Select "Summary" (or equivalent)
3. Modal should open with header card
4. Scroll through stat cards
5. Scroll through weekly cards
6. Verify all data displays correctly
7. Check responsive behavior
8. Close modal

### 3. Progress Summary Test (3 min)
1. Tap hamburger menu
2. Select "Progress Summary" (or equivalent)
3. Modal should open with table
4. Scroll horizontally (see all columns)
5. Scroll vertically (see all weeks)
6. Verify header stays sticky
7. Check row colors alternate
8. Close modal

**Total Test Time**: ~8 minutes per user

---

## Reference Links

**HTML Preview Folder**:
`C_TESTING_AND_VALIDATION/3_HTML_Previews/HTML_Previews_Final_for_Prod_Testing/`

**React Native Components Folder**:
`Ageless_REACT-Native_Mobile_Application/mobile-app/`

**Documentation**:
- `HTML_REACT_NATIVE_CONSISTENCY_VERIFICATION.md` - Detailed consistency report
- `HAMBURGER_MENU_FIX.md` - Hamburger menu implementation details
- `FITNESS_SUMMARY_REACT_NATIVE_UPDATE.md` - Fitness summary component details
- `PROGRESS_SUMMARY_FINAL_ADJUSTMENTS.md` - Progress summary adjustments
- `HEADER_CARD_UPDATE_2026_01_13.md` - Header card implementation

---

**Status**: ✅ **READY FOR PRODUCTION TESTING**
**Date**: 2026-01-13
**Version**: 1.0

