# .925 palette + rebrand — file changes

Drop these 12 files into `Ageless_REACT-Native_Mobile_Application/mobile-app/`,
overwriting the existing files at the matching paths. No dependencies, routes,
or business logic were changed — this is a styling + branding pass only,
with two exceptions noted below under "Bugs fixed."

## Palette

Obsidian & Rhodium, steel blue accent. Defined once in `theme/tokens.ts`,
consumed everywhere else via the existing `theme.colors.*` tokens.

| Token | Old | New |
|---|---|---|
| `colors.primary` | `#C5282F` (red) | `#D4D6D9` (Rhodium Silver / platinum) |
| `colors.accent` *(new)* | — | `#5B7A93` (steel blue) |
| `colors.accentMuted` *(new)* | — | `#9FB4C4` (soft steel) |
| `colors.background` | `#F7F7F9` | `#0B0B0D` (Obsidian) |
| `colors.surface` | `#FFFFFF` | `#18181B` (Graphite Black) |
| `colors.surfaceAlt` | `#F2F2F7` | `#212124` |
| `colors.text.primary` | `#111111` | `#D4D6D9` |
| `colors.text.secondary` | `#666666` | `#909295` |
| `colors.text.onPrimary` | `#FFFFFF` | `#0B0B0D` |
| `colors.border.light` | `#E2E3E6` | `#3A3B3E` |
| `colors.border.strong` | `#D0D1D4` | `#4A4B4E` |
| `colors.status.success` | `#31a24c` (green) | `#4A6478` (mid steel) |
| `colors.status.warning` | `#F59E0B` (amber) | `#8B7355` (muted brass) |
| `colors.status.error` | `#EF4444` (red) | `#8B4A46` (muted brick red) |

**Two roles for one old token.** The app used `theme.colors.primary` for two
different jobs: solid button fills, and plain accent text/icons (links,
emphasis numbers, icon accents). Those need different colors now that
primary is light instead of dark, so I added `colors.accent` for the
text/icon role and kept `colors.primary` for button fills. Every file below
that used `primary` as a text/icon color got redirected to `accent`
explicitly — button fills were left alone since they inherit the new
platinum automatically.

**Header bars.** Several screens filled their top bar with
`theme.colors.primary` (i.e. the old red). With primary now light,
that would put a big platinum block at the top of every screen. I changed
those specific header backgrounds to `theme.colors.background` instead, so
the app reads as one continuous dark surface with the `.925` wordmark and
icons sitting in platinum on top — matching the approved mockups. This
only affects the handful of lines noted per file below; it's not a token
change, since header styling needed to diverge from generic "primary" usage.

## Files changed

**`theme/tokens.ts`** — palette rewrite (table above), plus `accent` /
`accentHover` / `accentMuted` added to the color tokens, plus the
completed-card shadow color changed from green to steel.

**`app/dashboard/index.tsx`** — header bg → background, header title/icon →
platinum, progress fill → steel accent, disabled control button → border/
text-secondary tokens, `.925` rebrand. Plus-button fill (platinum) and
completed-card border (steel) were already token-driven and needed no
changes beyond the token file.

**`app/history/index.tsx`** — exercise chip and skipped-tag backgrounds →
surfaceAlt, emphasis numbers → accent, Edit button → surfaceAlt/platinum
text, Delete button → muted danger red (kept deliberately distinct from the
rest of the palette — see "Destructive actions" below).

**`app/profile/index.tsx`** — header bg → background (was hardcoded
`#C5282F`, not even token-driven), header text/icon → platinum, all five
row icons (mail, person, info, 2× external-link) → accent, link text →
accent, `.925` rebrand.

**`app/(auth)/login.tsx`** — heart icon removed entirely (JSX + the now-
unused `logo`/`logoText` styles deleted), `.925` rebrand, Face ID label →
accent. Split the shared `btnText` style into `btnPrimaryText`/
`btnSecondaryText` since the primary (platinum) and secondary (dark) buttons
now need opposite text colors — this was a real, necessary fix, not
optional polish. Error box, collapsible card, and bottom action buttons
swept to token colors.

**`app/(auth)/register.tsx`** — full sweep, `.925` rebrand, 5 checkbox
icons and the "Sign In" link → accent. **Also fixes a pre-existing bug**:
this file referenced `theme.colors.text`, `.textSecondary`, `.border`,
`.success`, `.warning`, `.error` — none of which exist at those paths in
`tokens.ts` (the real paths are `text.primary`, `text.secondary`,
`border.light`, `status.success`, etc.). Those would have resolved to
`undefined` at runtime. Fixed to the correct nested paths throughout.

**`app/(auth)/forgot-password.tsx`** — success box → `primaryLight`/steel
border/soft-steel text (replacing the green success state, consistent with
the "muted steel for confirmations" rule), error box → surfaceAlt/status
error, button/link → onPrimary/accent.

**`components/modals/ProgressSummaryScreen.tsx`** — the real, wired-in
Progress Summary table. Overlay, modal, header card, table container →
dark tokens; table header row stays platinum-filled (button/fill
convention); header-row divider switched from a white-based to a dark-based
rgba so it's still visible against the now-light header; data row stripes
and borders → surface/surfaceAlt/border tokens.

**`components/modals/HistoryModal.tsx`** — modal container, expanded-row
background → dark tokens; Delete button changed from a solid light-red
fill to a subtle tinted danger treatment (`status.error` at 12% opacity)
to sit better on a dark surface; exercise-count emphasis text → accent.

**`components/modals/ChangePasswordModal.tsx`** — submit button spinner
and text → onPrimary token (the only two hardcoded values in this file).

**`components/modals/SummaryModal.tsx`** — full sweep + `.925` rebrand.
**This component is not currently imported or rendered anywhere** — the
dashboard uses `ProgressSummaryScreen.tsx` instead. Confirmed via repo-wide
search before touching it. I recolored it anyway since it's a complete,
functional component that might get wired in later, but flagging this so
it doesn't cause confusion — recoloring it has no effect on the live app.
Worth a decision on your end: keep as a spare/alternate implementation, or
delete it to reduce confusion.

**`components/auth/BiometricIcon.tsx`** — this is the actual Face ID icon
used on the login screen (a hand-built SVG with corner brackets + face
outline — it was already well-built, nothing structurally wrong with it).
Recolored: icon color now follows `accent` instead of `primary` (matching
the steel "Face ID" label text next to it), and the circular badge
background changed from solid white to the dark `surfaceAlt` tone. Shadow
opacity bumped from 0.1 to 0.3 since a black shadow needs more opacity to
register against a dark surface.

## Bugs fixed (not just recolored)

1. **`register.tsx`** — broken theme references (`theme.colors.text`,
   `.textSecondary`, `.border`, `.success`, `.warning`, `.error`) pointed at
   paths that don't exist in the token file. Fixed to the correct nested
   paths as part of the sweep, since I was already rewriting every styled
   line in that file.
2. **`login.tsx`** — shared `btnText` style assumed white text worked for
   both the primary and secondary buttons. That stopped being true once
   primary became a light color. Split into two styles; see above.

## Destructive actions

Delete (History) and Logout (Profile, unchanged — already used
`status.error`) intentionally keep a distinct muted red rather than
platinum or steel. Destructive actions conventionally stay visually
distinct as a safety signal regardless of brand palette.

## Known remaining items (not included in this pass)

- **`components/SyncIndicator.tsx`** — has 2 hardcoded `#DC2626` (red)
  values for a sync-conflict list item. Not touched; should become
  `theme.colors.status.error` for consistency.
- **`components/dev/DesignAuditScreen.tsx`** — a dev-only audit tool.
  Contains hardcoded hex values, but only as *text strings describing*
  stale audit results, not actual UI styling. Not touched.
- **`components/ui/DatePicker.tsx`, `DateSelector.tsx`,
  `components/modals/ScanModal.tsx`** — all use `theme.colors.primaryLight`
  for a selected/highlighted state. Not touched directly, but they'll
  automatically pick up the new muted-steel value from `tokens.ts` with no
  further work needed.
- **`components/auth/FaceIDIcon.tsx`** — a second, unused Face ID icon
  implementation (confirmed not imported anywhere except the dev audit
  screen). Not touched. `BiometricIcon.tsx` above is the one actually in
  use.
- Everything else in `components/ui/` (`Button`, `Card`, `Input`,
  `DateSelector`), `components/layout/` (`BottomNav`, `MyABSDrawer`), and
  `components/OfflineBadge.tsx` / `SyncIndicator.tsx`'s non-error styling
  references `theme.colors.*` tokens purely with no hardcoded hex — they'll
  inherit the new palette automatically once `tokens.ts` is in place, no
  edits needed.

## One real-device limitation (not a code issue)

The Dynamic Island itself (the pill at the top of newer iPhones) is
camera/sensor hardware — iOS always renders that exact pixel area black,
regardless of what any app does. The platinum-filled pill in the earlier
mockups was accurate for a marketing screenshot but can't reflect in the
actual shipped app.
