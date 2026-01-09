# UI Implementation - Quick Reference Guide

## Project Info
- **App Name:** Ageless Body - Fitness Tracker
- **Tech Stack:** Next.js 14.2, React 18.3, TypeScript 5.9, Tailwind CSS 3.4
- **Build Type:** PWA (Progressive Web App)
- **Status:** Fully implemented (15 feature-complete pages)

---

## File Tree

```
fitness-app-next/
├── app/
│   ├── layout.tsx                    [Root layout + PWA setup]
│   ├── page.tsx                      [Redirect to /login or /dashboard]
│   ├── globals.css                   [Global styles & utilities]
│   ├── (auth)/
│   │   ├── layout.tsx                [Auth page container]
│   │   ├── login/page.tsx            [Login form]
│   │   └── register/page.tsx         [Registration form]
│   ├── api/auth/
│   │   └── [...nextauth]/route.ts    [NextAuth handler]
│   └── dashboard/
│       ├── layout.tsx                [Header + nav + layout]
│       ├── page.tsx                  [Today's workout]
│       ├── history/page.tsx          [Workout history]
│       └── summary/page.tsx          [Weekly stats]
├── components/
│   ├── ui/
│   │   ├── button.tsx                [Reusable button]
│   │   ├── card.tsx                  [Compound card component]
│   │   └── input.tsx                 [Text input wrapper]
│   └── layout/
│       └── logout-button.tsx         [User menu]
├── lib/
│   ├── utils.ts                      [Utility functions]
│   └── constants/
│       └── exercises.ts              [11 exercises definition]
├── public/
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── manifest.json                 [PWA manifest]
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── tailwind.config.ts                [Design tokens]
├── postcss.config.js                 [CSS processing]
└── package.json                      [Dependencies]
```

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Primary | #C5282F | Header, buttons, active states |
| Primary Hover | #b12228 | Button hover |
| Primary Active | #9a1d23 | Button active |
| Background | #F7F7F9 | Page background |
| Surface | #FFFFFF | Cards, inputs |
| Surface Alt | #F2F2F7 | Hover states |
| Text | #111111 | Main text |
| Text Muted | #666666 | Secondary text |
| Border | #E2E3E6 | Card/input borders |
| Border Strong | #D0D1D4 | Stronger borders |
| Success | #31a24c | Completed states |
| Danger | #dc2626 | Delete buttons |

---

## Core Components

### Button
**File:** `components/ui/button.tsx`
```tsx
<Button variant="primary" size="md">Save</Button>
// Variants: primary, secondary, danger
// Sizes: sm (36px), md (48px), lg (56px)
```

### Card
**File:** `components/ui/card.tsx`
```tsx
<Card completed={true}>
  <CardHeader>
    <CardTitle>Exercise Name</CardTitle>
    <CardDescription>Details</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

### Input
**File:** `components/ui/input.tsx`
```tsx
<Input 
  type="email"
  placeholder="Enter email"
  disabled={loading}
/>
```

---

## Design Tokens

### Spacing (in pixels)
- 2: 4px
- 3: 6px
- 4: 8px
- 5: 10px
- 6: 12px
- 8: 16px
- 10: 20px
- 12: 24px

### Border Radius
- sm: 4px
- md: 8px (default)
- lg: 12px
- xl: 20px
- 2xl: 24px

### Shadows
- `shadow-elev`: 0 4px 12px rgba(0,0,0,0.08)
- `shadow-elev-hover`: 0 6px 16px rgba(0,0,0,0.12)

### Transitions
- `transition-fast`: 120ms ease-out
- Timing: 160ms ease-out

---

## Responsive Grid System

```
Mobile (< 600px):     1 column
Tablet (640px):       2 columns
Desktop (768px):      3 columns
Large (1024px):       Full width, max 1536px
```

---

## Page Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | page.tsx | Redirects to /login or /dashboard |
| `/login` | (auth)/login/page.tsx | User login |
| `/register` | (auth)/register/page.tsx | User registration |
| `/dashboard` | dashboard/page.tsx | Today's workout |
| `/dashboard/history` | history/page.tsx | Workout history |
| `/dashboard/summary` | summary/page.tsx | Weekly stats |

---

## Key UI Features

### Authentication
- Email/password login
- User registration with 5 goal checkboxes
- Password validation (min 8 chars)
- NextAuth integration
- Session-based access

### Dashboard - Home
- Daily progress bar (X/11 exercises)
- Weight input field
- 11 exercise cards with +/- counters
- Save button (sticky bottom)
- Success/error messages

### Dashboard - History
- Desktop: Table with Date, Weight, Exercises, Sets, Actions
- Mobile: Card layout per entry
- Delete functionality with confirmation
- Empty state with emoji (📅)

### Dashboard - Summary
- Overall stats: Total workouts, Avg weight, Total sets
- Weekly breakdown cards
- Top 3 exercises per week
- Weekly completion % progress bar
- Empty state with emoji (📊)

---

## CSS Classes (Global)

```css
.transition-fast          /* 120ms ease-out */
.shadow-elev             /* Card elevation */
.shadow-elev-hover       /* Hover elevation */
.login-overlay           /* Auth page background */
.login-container         /* 375px phone frame */
.pwa-nav                 /* Bottom navigation */
.pwa-nav__btn            /* Nav button */
.pwa-nav__btn.is-active  /* Active nav item */
.station-card            /* Exercise card */
.station-card.completed  /* Completed exercise */
.spinner                 /* Loading animation */
.toast                   /* Notification */
.modal-overlay           /* Modal backdrop */
```

---

## Typography

**Font Stack:**
```
system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif
```

**Font Weights:**
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Common Sizes:**
- Page title: 24px (text-2xl)
- Section title: 20px (text-xl)
- Card title: 18px (text-lg)
- Body: 16px (text-base)
- Small: 14px (text-sm)
- Tiny: 12px (text-xs)

---

## State Management

### Loading States
- Button with spinner animation
- Disabled button state
- "Loading..." text suffix

### Error States
- Red banner (#dc2626 background)
- Error message text
- Input focus ring

### Success States
- Green banner (#31a24c background)
- "✅ Workout saved successfully!" message
- Auto-dismiss after 3 seconds

### Empty States
- Large emoji icon (64px)
- Heading text
- Description text
- Optional CTA button

---

## Icons Used

**Inline SVGs (20x20px):**
- Home (house icon)
- History (calendar icon)
- Summary (grid icon)
- Logout (exit icon)

**Emoji Icons:**
- Login: 💪 (bicep)
- History empty: 📅 (calendar)
- Summary empty: 📊 (chart)
- Bottom nav: 📷 (scan), 🎁 (rewards)

---

## Exercise Data

Total: 11 exercises, all with 4 max sets

1. **Bike** - 60 minutes
2. **Abs** - 100 reps
3. **Chest Press** - 20 reps
4. **Leg Press** - 20 reps
5. **Lat** - 20 reps
6. **Military** - 20 reps
7. **Crunch** - 100 reps
8. **Bicep Curls** - 20 reps
9. **Triceps** - 40 reps
10. **Overhead Pull** - 40 reps
11. **Row** - 20 reps

---

## Dependencies

**UI Libraries:**
- lucide-react (icon library)
- class-variance-authority
- clsx (classname merge)
- tailwind-merge

**Forms & Validation:**
- react-hook-form
- @hookform/resolvers

**Styling:**
- tailwindcss
- autoprefixer
- postcss

**Auth:**
- next-auth

**Data:**
- @prisma/client
- @tanstack/react-query

---

## Breakpoint Usage

```
< 600px  Mobile       Single column, card layouts, emoji
640px    Tablet       Two columns, hybrid layouts
768px    Desktop      Three columns, table views
1024px   Large        Full desktop, max-width containers
```

---

## Z-Index Stack

```
Focus/Tooltips    20000+
Login Overlay     10000
Modal             3200
Nav Bar           410
Default           0
```

---

## Performance Optimizations

- Image optimization with Next.js Image component
- Lazy loading for components
- API calls cached with React Query
- CSS-in-JS compiled to static CSS
- Tailwind JIT compilation

---

## Accessibility Features

- Semantic HTML structure
- Focus visible outlines (2px #C5282F)
- Color contrast ratios > 4.5:1
- Accessible form labels
- ARIA attributes where needed
- Keyboard navigation support
- Screen reader friendly

---

## PWA Features

- manifest.json for installation
- Icons: 192x192 and 512x512
- Standalone display mode
- Custom theme color (#C5282F)
- Background color (#F7F7F9)
- Safe area inset support
- Works offline (with service worker setup)

---

## Common Patterns

### Loading
```tsx
if (loading) {
  return <div className="spinner mx-auto mb-4"></div>
}
```

### Error Message
```tsx
{error && (
  <div className="p-3 rounded-lg bg-red-50 text-red-600">
    {error}
  </div>
)}
```

### Success Message
```tsx
{message && (
  <div className="p-4 rounded-lg bg-green-50 text-green-700">
    ✅ Success!
  </div>
)}
```

### Form Input
```tsx
<div>
  <label className="block text-sm font-medium mb-2">
    Email
  </label>
  <Input type="email" />
</div>
```

### Progress Bar
```tsx
<div className="w-full bg-border rounded-full h-3">
  <div
    className="bg-primary h-3 transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

---

## Animation Keyframes

### Splash Fade
```css
0%: opacity 0, scale 0.92
100%: opacity 1, scale 1
Duration: 3.5s
```

### Spinner
```css
0% → 360deg rotation
Duration: 0.6s (linear, infinite)
```

### Slide Up (Toast)
```css
0%: opacity 0, transform: translate(-50%, 20px)
100%: opacity 1, transform: translate(-50%, 0)
Duration: 0.3s
```

---

## Testing Checklist

- [ ] Login/register flow
- [ ] Exercise counter +/- buttons
- [ ] Save workout functionality
- [ ] History view (desktop table, mobile cards)
- [ ] Summary page calculations
- [ ] Responsive layouts at breakpoints
- [ ] Loading states
- [ ] Error handling
- [ ] PWA installation
- [ ] Offline functionality
- [ ] Navigation menu
- [ ] Logout functionality
- [ ] Form validation
- [ ] Empty states

---

## Future Enhancement Ideas

- [ ] Dark mode support
- [ ] Biometric authentication (Face ID, Touch ID)
- [ ] Video tutorials for exercises
- [ ] Real-time progress syncing
- [ ] Social sharing features
- [ ] Achievement badges/rewards
- [ ] Custom exercise definitions
- [ ] Workout reminders
- [ ] PDF export reports
- [ ] Advanced analytics dashboard

---

END OF QUICK REFERENCE
