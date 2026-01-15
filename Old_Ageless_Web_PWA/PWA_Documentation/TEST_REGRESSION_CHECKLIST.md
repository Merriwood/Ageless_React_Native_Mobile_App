# Regression Test Checklist (Post-Refactor)

Purpose: Validate absolutely no functionality loss (menus, splash, registration, history/summary, authentication) after refactor and registration restoration.

## 1. Splash & Login
1. Clear localStorage key `mbh_lastActive` and reload.
2. Expect splash screen with logo + tagline fade. After ~3.5s splash removed, login overlay visible.
3. Reload within 2 minutes (without clearing activity). Expect splash skipped (login shows immediately). (If skipped incorrectly, verify override still commented.)

## 2. Registration (Two‑Step Flow)
1. On login form, ensure Register button text: `Register`.
2. First click: Goals group becomes visible; toast: "Select one or more goals..."; button stays `Register` (data-step set to `goals-shown`).
3. Select multiple goals (if available) and click Register again.
4. Button text changes to `Registering...` then resets to `Register` on success; inline success note: "Registration successful. Now please login" fades after ~3.5s.
5. Password field cleared. Goal checkboxes unchecked. Goals group collapses.
6. Token NOT auto-stored (localStorage `fitness-tracker-token` remains null). Attempt a login after to confirm still functional.

## 3. Authentication & Welcome
1. Sign in with valid credentials.
2. Expect: overlay hides, app container shows, welcome banner appears (fades), auto progress loaded.
3. Verify localStorage now holds `fitness-tracker-token`.

## 4. Main Menu
1. Hover (desktop) or tap (touch) menu icon: dropdown opens; icon gains active style.
2. Move pointer away: closes after ~320ms delay (no premature closure).
3. Fitness root hover/focus opens Fitness submenu; Food root opens Food submenu; they are mutually exclusive.
4. Submenus scroll on touch without closing (attempt a vertical scroll gesture inside submenu > 1s—should stay open until touchend + delay).
5. Outside pointer/click closes menu (single pointerdown listener; no double toggles).

## 5. Flyout Preview
1. Hover non-action items (e.g., Assessments) => flyout shows title & description; hides ~260ms after pointer leave.
2. Hover History/Summary (action items) still shows preview on desktop; on touch they should remain actionable without needing preview tap.
3. Flyout positions left if near right viewport edge; otherwise right.

## 6. History Modal
1. Open via Fitness submenu History: modal display = flex; placeholder row shows while loading (if network latency simulated).
2. Entries populate; clicking a row's edit button enters edit mode (fields pre-filled, banner/state updates as pre-refactor).
3. Delete button prompts confirmation; on confirm row removed; toast shows; if editing that date, edit mode exits.
4. Sorting by clicking date header toggles ascending/descending.

## 7. Summary Modal
1. Open Summary: placeholder row displays if data pending.
2. Weekly rows render; aggregated total sets column present.
3. While open, perform an exercise set save; summary refresh triggers automatically.

## 8. Exercise Interaction
1. Increment/decrement sets within boundary (0..maxSets); UI counts update; minus disabled at 0, plus at max.
2. Auto-save cycle occurs; if in History or Summary modals, refresh logic does not break.

## 9. Logout
1. Use Logout action (submenu). Expect token removed, app hides, login overlay shows again. Menu closed.

## 10. Service Worker Tag (If SW registered)
1. After activation message, small SW version tag appears bottom-right.

## 11. Error Handling
1. Force network error (offline dev tools) then trigger History fetch—toast shows error without JS crash.
2. Registration with existing email: error toast appears, button re-enabled, goals group remains visible for retry.

## 12. Accessibility / Focus (Baseline)
1. Tab to menu icon, press Enter: menu opens.
2. Shift+Tab away: menu hides after delay.

## 13. Regression Guard (Menu Close)
1. Rapid open/close (double click icon) should not leave stale `show` class.

## 14. Data Integrity
1. Create/edit/delete entry then open History—changes present.
2. Weekly summary reflects updates after save cycle.

## 15. Local Activity Tracking
1. After any interaction, confirm `mbh_lastActive` updates (throttled ~5s). Reload within 2 minutes → splash skipped. After waiting >2 minutes idle, reload → splash shown again.

---

If any step fails, capture console logs and note element state differences. All steps must PASS to assert zero functionality loss.

Optional Future Automated Tests:
- jsdom-based simulation of two-step registration and menu hover/close timing.
- Jest suite verifying `registerNewUser` POST payload contains array for multi-goal.

