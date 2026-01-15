# Fitness App UI - Visual Structure & Hierarchy

## Application Flow Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ROOT LAYOUT                                  │
│                     (app/layout.tsx)                                │
│  Metadata, Favicons, PWA Setup, Global Styles                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                 ┌───────────┴────────────┐
                 │                        │
    ┌────────────▼──────────────┐  ┌────▼──────────────────┐
    │  AUTH PAGES               │  │  DASHBOARD PAGES     │
    │  (app/(auth)/)            │  │  (app/dashboard/)    │
    ├──────────────────────────┤  ├────────────────────┤
    │ • Login Page             │  │ • Home/Dashboard   │
    │ • Register Page          │  │ • History Page     │
    │                          │  │ • Summary Page     │
    └────────────────────────┘  └────────────────────┘
```

---

## Authentication Flow (Mobile Phone Frame)

```
┌─────────────────────────────────────┐
│    LOGIN-OVERLAY (Fixed Full Screen)│
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │   LOGIN-CONTAINER             │  │
│  │   (375px Max-Width)           │  │
│  │   (667px Min-Height)          │  │
│  ├───────────────────────────────┤  │
│  │                               │  │
│  │   ┌─────────────────────────┐ │  │
│  │   │  Ageless Body. (Header) │ │  │
│  │   └─────────────────────────┘ │  │
│  │                               │  │
│  │   ┌─────────────────────────┐ │  │
│  │   │ Welcome Card            │ │  │
│  │   │  💪                     │ │  │
│  │   │ "Track your daily..."   │ │  │
│  │   └─────────────────────────┘ │  │
│  │                               │  │
│  │   ┌─────────────────────────┐ │  │
│  │   │ Sign In Form            │ │  │
│  │   │ [email input]           │ │  │
│  │   │ [password input]  👁    │ │  │
│  │   │ ☑ Remember me          │ │  │
│  │   │ [Sign in Button]        │ │  │
│  │   └─────────────────────────┘ │  │
│  │                               │  │
│  │   ┌─────────────────────────┐ │  │
│  │   │ "Create new account"    │ │  │
│  │   └─────────────────────────┘ │  │
│  │                               │  │
│  │   ┌─────────────────────────┐ │  │
│  │   │  Bottom Navigation      │ │  │
│  │   │ 📞  📍  ⋯               │ │  │
│  │   └─────────────────────────┘ │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## Dashboard Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ HEADER (bg-primary: #C5282F, text-white, h-14)          │
│ ├─ <div> (spacer)                                       │
│ ├─ Title: "Ageless Body."                               │
│ └─ LogoutButton (Avatar + Dropdown)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  MAIN CONTENT (max-w-6xl, mx-auto, p-5)        │   │
│  │                                                 │   │
│  │  [Dashboard/History/Summary Content Here]      │   │
│  │  (with pb-24 for nav bar clearance)            │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ PWA NAVIGATION BAR (Fixed Bottom, z-410)                │
│ ├─ Home       (House Icon)                              │
│ ├─ History    (Calendar Icon)                           │
│ ├─ Summary    (Grid Icon)                               │
│ ├─ Scan       (📷)                                      │
│ └─ Rewards    (🎁)                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Dashboard Home Page Content Structure

```
┌──────────────────────────────────────────────────────────┐
│                   TODAY'S WORKOUT                        │
│  Progress: 2/11 exercises (18%)                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│  │ 18% Complete                                        │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Weight (lbs)                                            │
│  [Enter your weight (optional)]                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ EXERCISE GRID (grid-cols-1 | sm:grid-cols-2 | lg:gap-3) │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Bike         │  │ Abs          │  │ Chest Press  │   │
│  │ Target: 60m  │  │ Target: 100r │  │ Target: 20r  │   │
│  │              │  │              │  │              │   │
│  │  [-]  2  [+] │  │  [-]  0  [+] │  │  [-]  4  [+] │   │
│  │   2 / 4 sets │  │   0 / 4 sets │  │   4 / 4 sets │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Leg Press    │  │ Lat          │  │ Military     │   │
│  │ Target: 20r  │  │ Target: 20r  │  │ Target: 20r  │   │
│  │              │  │              │  │              │   │
│  │  [-]  1  [+] │  │  [-]  0  [+] │  │  [-]  0  [+] │   │
│  │   1 / 4 sets │  │   0 / 4 sets │  │   0 / 4 sets │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
│  [... more exercise cards ...]                           │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  ✅ Workout saved successfully!                          │
│  (Appears after save, auto-dismisses after 3s)           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ [Save Workout] (Sticky Bottom, Large Button, Full Width)│
└──────────────────────────────────────────────────────────┘
```

---

## History Page Layout

### Desktop View (md breakpoint)
```
┌─────────────────────────────────────────────────────────┐
│              WORKOUT HISTORY                            │
│     12 workouts recorded                                │
├─────────────────────────────────────────────────────────┤
│ TABLE                                                   │
├─────────────────────────────────────────────────────────┤
│ Date      │ Weight  │ Exercises│ Total Sets│ Actions   │
├───────────┼─────────┼──────────┼──────────┼───────────┤
│ 2025-10-15│ 185 lbs │  8/11    │  28 sets │ [View]... │
│ 2025-10-14│ 184 lbs │  11/11   │  44 sets │ [View]... │
│ 2025-10-13│   —     │  5/11    │  15 sets │ [View]... │
│           ...                                           │
└─────────────────────────────────────────────────────────┘
```

### Mobile View
```
┌──────────────────────────────────┐
│    WORKOUT HISTORY               │
│    12 workouts recorded          │
├──────────────────────────────────┤
│                                  │
│ ┌────────────────────────────┐   │
│ │ 2025-10-15            185  │   │
│ │ Monday                 lbs │   │
│ ├────────────────────────────┤   │
│ │ Exercises: 8/11            │   │
│ │ Total Sets: 28             │   │
│ │                            │   │
│ │ [View Details] [Delete]    │   │
│ └────────────────────────────┘   │
│                                  │
│ ┌────────────────────────────┐   │
│ │ 2025-10-14            184  │   │
│ │ Sunday                 lbs │   │
│ ├────────────────────────────┤   │
│ │ Exercises: 11/11           │   │
│ │ Total Sets: 44             │   │
│ │                            │   │
│ │ [View Details] [Delete]    │   │
│ └────────────────────────────┘   │
│                                  │
│   ... more cards ...             │
│                                  │
└──────────────────────────────────┘
```

---

## Summary Page Layout

```
┌────────────────────────────────────────────────────────┐
│             FITNESS SUMMARY                            │
│         Your progress at a glance                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│ OVERALL STATS (3-column grid)                         │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│ │Total        │  │Avg Weight   │  │Total Sets   │    │
│ │Workouts  12 │  │184.5 lbs    │  │432 sets    │    │
│ └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                        │
├────────────────────────────────────────────────────────┤
│ WEEKLY BREAKDOWN                                       │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Oct 6 - Oct 12           Completion: 92%         │  │
│ │ 5 workouts completed                             │  │
│ ├──────────────────────────────────────────────────┤  │
│ │                                                  │  │
│ │ Avg Weight    │ Total Sets   │ Avg Sets/Workout  │  │
│ │ 184.2 lbs     │ 185 sets     │ 37 sets          │  │
│ │                                                  │  │
│ │ Top Exercises:                                   │  │
│ │ 1. Bike - 24 sets                               │  │
│ │ 2. Abs - 20 sets                                │  │
│ │ 3. Chest Press - 18 sets                        │  │
│ │                                                  │  │
│ │ Week Progress:                                   │  │
│ │ ┌──────────────────────────────────────────────┐│  │
│ │ │ ████████████████████████████████░░░░░░░░░░░ ││  │
│ │ │                            92%               ││  │
│ │ └──────────────────────────────────────────────┘│  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Sep 29 - Oct 5           Completion: 78%         │  │
│ │ 4 workouts completed                             │  │
│ │ ... (similar structure)                          │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Component Composition Example: Exercise Card

```
┌─ Card (with station-card class)
│  ├─ CardHeader
│  │  ├─ CardTitle
│  │  │  └─ "Bike"
│  │  └─ CardDescription
│  │     └─ "Target: 60 minutes"
│  │
│  └─ CardContent
│     ├─ Flex Container (flex items-center justify-between)
│     │  ├─ Button(-)
│     │  │  └─ "-"
│     │  ├─ Display
│     │  │  └─ "2"
│     │  └─ Button(+)
│     │     └─ "+"
│     │
│     └─ Status Text
│        └─ "2 / 4 sets"

STYLING:
- Default: bg-white, border #E2E3E6, shadow-elev
- Completed: border #31a24c, shadow-green-glow
- Hover: shadow-elev-hover
```

---

## Color Usage Throughout UI

```
PRIMARY RED (#C5282F):
├─ Header background
├─ Button primary variant
├─ Focus ring on inputs
├─ Active nav item label & icon
├─ Progress bars
└─ Links

SECONDARY COLORS:
├─ Surface White (#FFFFFF)
│  ├─ Card backgrounds
│  ├─ Input backgrounds
│  └─ Nav bar background
│
├─ Background Light Gray (#F7F7F9)
│  └─ Page background
│
├─ Surface Alt (#F2F2F7)
│  ├─ Inactive areas
│  └─ Hover states
│
├─ Text Dark (#111111)
│  └─ Primary text
│
├─ Text Muted (#666666)
│  ├─ Secondary text
│  ├─ Descriptions
│  └─ Placeholders
│
├─ Border Light (#E2E3E6)
│  ├─ Card borders
│  └─ Input borders
│
├─ Success Green (#31a24c)
│  ├─ Completed exercise card border
│  └─ Success messages
│
└─ Danger Red (red-600/700/800)
   └─ Delete buttons
```

---

## Responsive Breakpoints in Action

### Exercise Grid Transformation
```
Mobile (< 640px)          Tablet (640px-767px)    Desktop (≥ 768px)
─────────────────        ──────────────────────   ──────────────────
[Card 1]                 [Card 1] [Card 2]        [Card 1] [Card 2] [Card 3]
[Card 2]                 [Card 3] [Card 4]        [Card 4] [Card 5] [Card 6]
[Card 3]                 [Card 5] [Card 6]        [Card 7] [Card 8] [Card 9]
[Card 4]                 [Card 7] [Card 8]        [Card 10][Card 11]
[Card 5]                 [Card 9] [Card 10]
...                      [Card 11]
```

### History View Transformation
```
Mobile                   Desktop
──────────────          ─────────────────────────────────────
[Card View]             [Table View]
[Card View]             - Row 1
[Card View]             - Row 2
...                     - Row 3
                        ...
```

---

## Z-Index Hierarchy

```
10000  Login Overlay
  410  PWA Navigation Bar
 3200  Modal Overlay
20000+ Focus rings & tooltips
```

---

## Animation Timeline

### Page Load
```
0ms:    Page renders
0ms:    Spinner visible if loading
300ms:  Data arrives
500ms:  Content fades in
```

### Button Interaction
```
0ms:    Hover - slight elevation increase
120ms:  Click - active color state
300ms:  Save - disabled with spinner
        (waits for response)
```

### Success Message
```
0ms:    Message appears, slides up
3000ms: Auto-fade out
```

---

## Safe Area Inset Support

For devices with notch/safe areas (iPhone X, etc.):

```
┌─────────────────────────────────────┐
│ ╭──┐                         ╭──┐   │  safe-area-inset-top
│ │  │     HEADER              │  │   │
│ ╰──┘                         ╰──┘   │
├─────────────────────────────────────┤
│                                     │
│        MAIN CONTENT                 │
│                                     │
├─────────────────────────────────────┤
│ PWA NAV BAR                    ╱  ╱ │  safe-area-inset-bottom
│ Padding includes notch height ╱  ╱  │
└─────────────────────────────────────┘
```

