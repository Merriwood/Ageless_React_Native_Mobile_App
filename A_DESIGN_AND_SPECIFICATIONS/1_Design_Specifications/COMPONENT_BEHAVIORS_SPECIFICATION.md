# Component Behaviors Specification
## PWA-Authoritative Behavior Definitions for React Native Implementation

**Date:** January 11, 2026
**Purpose:** Define primary and secondary behaviors for all components based on PWA's actual design and logic
**Authority:** PWA screenshots and codebase logic are the source of truth for all behaviors

---

## Table of Contents

1. [Global Component Behaviors](#global-component-behaviors)
2. [Screen 1: Login - Behaviors](#screen-1-login-behaviors)
3. [Screen 2: Register - Behaviors](#screen-2-register-behaviors)
4. [Screen 3: Home - Behaviors](#screen-3-home-behaviors)
5. [Screen 4: Dashboard - Behaviors](#screen-4-dashboard-behaviors)
6. [Screen 5: History - Behaviors](#screen-5-history-behaviors)
7. [Screen 6: Profile - Behaviors](#screen-6-profile-behaviors)
8. [Screen 7: Workout History - Behaviors](#screen-7-workout-history-behaviors)
9. [Screen 8: Fitness Summary - Behaviors](#screen-8-fitness-summary-behaviors)
10. [Screen 9: Progress Summary - Behaviors](#screen-9-progress-summary-behaviors)
11. [PWA-RN Behavior Matching Framework](#pwa-rn-behavior-matching-framework)

---

## GLOBAL COMPONENT BEHAVIORS

### Component 1: Primary Button
**Used On:** All screens
**Type:** Interactive Button

#### Primary Behavior (Default Interaction)
```
Trigger: User tap/click on button
Action: Immediate visual feedback (press animation)
Visual Feedback: Scale to 0.95, opacity change 100ms
Duration: 100ms press animation, return to normal 200ms
Next State: Executes associated action (navigate, submit, etc.)
On Success: Button returns to default state
On Disabled: Button cannot be tapped, opacity 0.5
```

#### Secondary Behavior (Loading State)
```
Trigger: Form submission or async operation initiated
Action: Show loading spinner inside button
Visual Feedback: Replace text with spinner, disable further taps
Duration: Until async operation completes
Spinner Style: 24x24px, rotating, 1.5-second rotation
Color: White (matches button text)
Next State: Return to default or show success/error
```

#### Tertiary Behavior (Hover State - PWA Desktop Only)
```
Trigger: Mouse hover over button (desktop web only)
Action: Opacity change
Visual Feedback: Reduce opacity to 0.85
Duration: 200ms transition
Return: Opacity returns to 1.0 on mouse leave
Note: May not apply to React Native mobile (no hover)
```

#### Verification Checklist
- [ ] PWA button shows what press animation duration?
- [ ] PWA button shows what opacity values for states?
- [ ] PWA button shows loading spinner? What size/style?
- [ ] PWA button disabled state opacity?
- [ ] PWA button returns to original state after action completes?

---

### Component 2: Secondary Button (Outline)
**Used On:** All screens
**Type:** Interactive Button (Alternative Style)

#### Primary Behavior (Default Interaction)
```
Trigger: User tap/click on secondary button
Action: Background color change
Visual Feedback: Background changes to light gray (#F5F5F5)
Duration: 100ms
Next State: Executes associated action
On Success: Returns to transparent background
On Disabled: Border and text become lighter (#CCCCCC)
```

#### Secondary Behavior (Loading State)
```
Trigger: Form submission or async operation
Action: Show loading spinner, disable taps
Spinner Color: Primary purple (#667eea) to match button border
Duration: Until operation completes
```

#### Verification Checklist
- [ ] PWA secondary button shows background color on press?
- [ ] PWA secondary button shows what colors?
- [ ] PWA secondary button loading spinner color matches button color?
- [ ] PWA secondary button disabled state appearance?

---

### Component 3: Text Input Field
**Used On:** Login, Register, Dashboard (weight input)
**Type:** Form Input

#### Primary Behavior (Default State)
```
Trigger: User taps input field
Action: Field gains focus
Visual Feedback:
  - Border color changes to primary purple (#667eea)
  - Background remains white (#FFFFFF)
  - Cursor appears in field
  - Keyboard shows on mobile
Duration: Immediate
```

#### Secondary Behavior (Error State)
```
Trigger: Validation fails (invalid email, required field empty, etc.)
Action: Show error styling
Visual Feedback:
  - Border color changes to red (#F44336)
  - Background changes to light red (#FFEBEE)
  - Error message appears below field (12px, red text)
Duration: Persistent until user corrects
Next State: When user corrects input, revert to default focus state
```

#### Tertiary Behavior (Filled State)
```
Trigger: User has entered valid input
Action: Maintain focus state styling
Visual Feedback: Purple border, white background, clear button or indicator
Next State: Ready for submission
```

#### Verification Checklist
- [ ] PWA input shows what border color on focus?
- [ ] PWA input shows what background on focus?
- [ ] PWA input shows what border color on error?
- [ ] PWA input shows error message where? (below/inline)
- [ ] PWA input shows error message font size?
- [ ] PWA input shows what feedback for valid input?

---

### Component 4: Password Input Field
**Used On:** Login, Register
**Type:** Form Input (Specialized)

#### Primary Behavior (Visibility Toggle)
```
Trigger: User taps visibility toggle icon
Action: Switch between masked and visible password
Visual Feedback:
  - Icon changes from eye-closed to eye-open (or vice versa)
  - Password characters toggle between dots and actual characters
Duration: Immediate
Icon Size: 24x24px (tappable hit target 44x44px)
Icon Position: Right side of input field, 12px from edge
```

#### Secondary Behavior (Focus State)
```
Same as Text Input Field:
- Border changes to purple on focus
- Keyboard shows
- Error state shows on validation failure
```

#### Tertiary Behavior (Visibility Persistence)
```
Trigger: Password field visibility state is set
Action: Maintain visibility state across interactions
Duration: Until user toggles visibility again
Note: Should remember visibility state within current session
```

#### Verification Checklist
- [ ] PWA password field shows visibility toggle icon?
- [ ] PWA icon size and position?
- [ ] PWA icon changes on toggle?
- [ ] PWA password changes from dots to text on toggle?
- [ ] PWA visibility state persists across field interactions?
- [ ] PWA shows what happens on focus?

---

### Component 5: Checkbox Input
**Used On:** Login (Remember Me), Register (Terms), Profile (Settings)
**Type:** Form Input (Boolean)

#### Primary Behavior (Toggle)
```
Trigger: User taps checkbox
Action: Toggle checked state
Visual Feedback:
  - Unchecked: Empty square outline, purple border
  - Checked: Filled square, purple background (#667eea), white checkmark
  - Animation: 150ms scale and color transition
Duration: 150ms animation
Hit Target: 44x44px (actual checkbox 20x20px, centered in hit area)
```

#### Secondary Behavior (Label Interaction)
```
Trigger: User taps label text associated with checkbox
Action: Toggle checkbox state
Visual Feedback: Same as direct checkbox tap
Note: Label should be tappable, not just the checkbox itself
```

#### Tertiary Behavior (Disabled State)
```
Trigger: Form is disabled or checkbox is disabled
Action: Prevent toggle
Visual Feedback:
  - Checkbox becomes light gray (#CCCCCC)
  - Label text becomes light gray (#CCCCCC)
  - No response to taps
```

#### Verification Checklist
- [ ] PWA checkbox shows what unchecked appearance?
- [ ] PWA checkbox shows what checked appearance?
- [ ] PWA checkbox animation duration?
- [ ] PWA checkbox size (actual element)?
- [ ] PWA checkbox hit target size?
- [ ] PWA shows what colors for checked/unchecked/disabled?
- [ ] PWA label is tappable?

---

### Component 6: Radio Button
**Used On:** Register (Fitness Goals)
**Type:** Form Input (Single Selection)

#### Primary Behavior (Selection)
```
Trigger: User taps radio button or label
Action: Select this option, deselect all others in group
Visual Feedback:
  - Selected: Circle filled with purple (#667eea), white dot in center
  - Unselected: Empty circle outline, gray border
  - Animation: 150ms color transition
Duration: 150ms
Hit Target: 44x44px per radio button option
```

#### Secondary Behavior (Visual Grouping)
```
Trigger: Multiple radio buttons in a group
Action: Group related options visually
Visual Feedback:
  - All options stacked vertically, 40px height per option
  - Selected option shows light purple background (#E8ECFF)
  - Label text aligned to right of radio button
  - 16px gap between radio and label
```

#### Tertiary Behavior (Group Reset)
```
Trigger: Form is cleared or reset
Action: All radio buttons return to unselected state
Visual Feedback: All circles become outlined, no selection highlighting
Duration: Immediate
```

#### Verification Checklist
- [ ] PWA radio button shows what selected appearance?
- [ ] PWA radio button shows what unselected appearance?
- [ ] PWA radio button size?
- [ ] PWA radio button group spacing?
- [ ] PWA radio button background on selection?
- [ ] PWA radio button animation duration?
- [ ] PWA label clickable for radio button?

---

### Component 7: Toggle Switch
**Used On:** Profile (Dark Mode, Email Notifications, Push Notifications)
**Type:** Form Input (Boolean)

#### Primary Behavior (Toggle On/Off)
```
Trigger: User taps or swipes toggle
Action: Switch between on and off states
Visual Feedback:
  - Off: Gray background (#E0E0E0), white circle on left
  - On: Purple background (#667eea), white circle on right
  - Animation: Smooth slide, 200ms duration
Duration: 200ms slide animation
Size: 44x24px (width x height)
Hit Target: 44x44px (switch itself within larger tappable area)
```

#### Secondary Behavior (Persistence)
```
Trigger: User toggles and dismisses screen
Action: Remember toggle state
Visual Feedback: Toggle maintains on/off state when screen reopens
Duration: Until user toggles again
Storage: Persisted via local storage or preferences
```

#### Tertiary Behavior (Disabled State)
```
Trigger: Toggle is disabled (e.g., feature unavailable)
Action: Prevent toggle action
Visual Feedback:
  - Opacity reduced to 0.5
  - No response to taps
  - Gray color regardless of on/off state
```

#### Verification Checklist
- [ ] PWA toggle shows what colors for on/off?
- [ ] PWA toggle shows what animation duration?
- [ ] PWA toggle size (actual element)?
- [ ] PWA toggle hit target size?
- [ ] PWA toggle persists state after screen close/reopen?
- [ ] PWA toggle disabled state appearance?
- [ ] PWA shows loading state for async toggles?

---

### Component 8: Card Container
**Used On:** Home (Feature cards, Stats cards), Dashboard (Exercise cards), History, Summary screens
**Type:** Layout Container

#### Primary Behavior (Visual Containment)
```
Trigger: Card appears on screen
Action: Display grouped content with visual separation
Visual Feedback:
  - White background (#FFFFFF)
  - Subtle shadow (0 2px 8px rgba(0,0,0,0.1))
  - Border radius 12px
  - Padding 16px
Duration: Persistent on screen
```

#### Secondary Behavior (Interactive Card)
```
Trigger: Card is tappable/clickable
Action: Navigate or expand content
Visual Feedback:
  - Background slightly darkens (opacity 0.95) on press
  - Scale reduces to 0.98
  - Animation: 100ms
Duration: 100ms press animation
Next State: Return to normal when tap released or navigation completes
```

#### Tertiary Behavior (Expanded/Active State)
```
Trigger: Card is selected or active
Action: Show emphasis
Visual Feedback:
  - Border becomes 2px solid purple (#667eea)
  - Background may remain white or shift slightly
  - Shadow becomes more pronounced
Duration: Persistent until deselected
```

#### Verification Checklist
- [ ] PWA card shows what shadow values?
- [ ] PWA card shows what border radius?
- [ ] PWA card shows what padding?
- [ ] PWA card shows what background?
- [ ] PWA card interactive behavior (if any)?
- [ ] PWA card active/selected state appearance?
- [ ] PWA card size variations across screens?

---

### Component 9: Bottom Navigation Bar
**Used On:** All main screens (Dashboard, History, Profile, etc.)
**Type:** Navigation Component

#### Primary Behavior (Tab Selection)
```
Trigger: User taps navigation tab
Action: Navigate to associated screen
Visual Feedback:
  - Active tab shows full icon + label, purple (#667eea)
  - Inactive tabs show lighter color (#999999)
  - No animation, immediate visual update
Duration: Immediate screen transition
```

#### Secondary Behavior (Visual State)
```
Configuration:
  - 4 tabs total: Home/Dashboard, History, Fitness, Profile
  - Height: 64px (including safe area padding)
  - Background: White (#FFFFFF)
  - Border top: 1px solid #E0E0E0
  - Each tab is 25% width

Icon + Label:
  - Icon: 24x24px, centered above label
  - Label: 12px font size, weight 500
  - Color: Active = #667eea, Inactive = #999999
  - Padding: 8px 0 (icon to label spacing)
```

#### Tertiary Behavior (Persistence)
```
Trigger: User navigates away from current screen
Action: Maintain navigation state
Visual Feedback: Current tab remains highlighted when returning
Duration: Until user selects different tab
Note: Selected tab state should persist across screen transitions
```

#### Verification Checklist
- [ ] PWA nav shows 4 tabs?
- [ ] PWA nav shows what icon + label style?
- [ ] PWA nav shows active/inactive colors?
- [ ] PWA nav height?
- [ ] PWA nav background and border?
- [ ] PWA nav shows label text for each tab?
- [ ] PWA nav shows what happens on tab selection?
- [ ] PWA nav persists selected state when navigating back?

---

### Component 10: Toast Notification
**Used On:** Dashboard (post-workout save), All screens (errors/confirmations)
**Type:** Feedback Component

#### Primary Behavior (Appearance)
```
Trigger: Action completes (success/error) or data saves
Action: Show temporary notification
Visual Feedback:
  - Container: 44px height, 16px 24px padding
  - Position: Floating above bottom nav (safe area aware)
  - Background: Depends on type
    - Success: Light green (#FFFFFF with green text, or light green background)
    - Error: Light red (#FFEBEE)
    - Info: Light blue (#FFFFFF with blue text)
  - Border radius: 8px
  - Shadow: 0 4px 12px rgba(0,0,0,0.15)
  - Icon: 16x16px on left side
  - Text: 14px, weight 500
```

#### Secondary Behavior (Auto-Dismiss)
```
Trigger: Toast appears on screen
Action: Auto-dismiss after duration
Duration: 3 seconds (3000ms) for success/info, 5 seconds for error
Dismiss Animation: Fade out, 300ms duration
Next State: Return to normal screen state
```

#### Tertiary Behavior (Manual Dismiss)
```
Trigger: User taps X button or swipes notification
Action: Immediately dismiss
Visual Feedback: Fade out animation, 300ms
Duration: 300ms
Note: Some PWA implementations may not have manual dismiss
```

#### Verification Checklist
- [ ] PWA toast shows what colors for success/error/info?
- [ ] PWA toast shows what duration before auto-dismiss?
- [ ] PWA toast shows what size and position?
- [ ] PWA toast shows icon? What size?
- [ ] PWA toast shows what text content?
- [ ] PWA toast shows manual dismiss option?
- [ ] PWA toast shows animation duration?

---

## SCREEN 1: LOGIN - BEHAVIORS

### Screen 1.1: Logo Container
**Component Type:** Image
**Primary Behavior:**
```
Trigger: Screen loads
Action: Display logo
Visual: 64x64px, centered horizontally
State: Static, no interaction
Verification:
  - [ ] PWA logo size?
  - [ ] PWA logo position?
  - [ ] PWA logo styling (shadow/border)?
```

### Screen 1.2: App Title "Ageless"
**Component Type:** Text
**Primary Behavior:**
```
Trigger: Below logo appears
Action: Display app name
Visual: 28px, weight 700, color #667eea
State: Static text
Verification:
  - [ ] PWA title shows "Ageless"?
  - [ ] PWA title font size?
  - [ ] PWA title weight?
  - [ ] PWA title color?
```

### Screen 1.3: Email Input
**Component Type:** Text Input
**Primary Behavior:**
```
Trigger: User taps email field
Action: Show keyboard, focus styling
Visual: Placeholder "user@example.com"
Validation: Real-time email format validation
Error Display: Red border + error message below
Verification:
  - [ ] PWA email placeholder text?
  - [ ] PWA email validation rules?
  - [ ] PWA email error message text?
  - [ ] PWA email error display location?
```

### Screen 1.4: Password Input
**Component Type:** Password Input
**Primary Behavior:**
```
Trigger: User taps password field
Action: Show keyboard, focus styling, visibility toggle
Visual: Placeholder "••••••••"
Behaviors:
  - Show/hide password on toggle
  - Validation on submission
Error Display: Red border + error message
Verification:
  - [ ] PWA password placeholder?
  - [ ] PWA password visibility toggle icon?
  - [ ] PWA password validation rules?
  - [ ] PWA password error message?
```

### Screen 1.5: Remember User ID Checkbox
**Component Type:** Checkbox
**Primary Behavior:**
```
Trigger: User taps checkbox or label
Action: Toggle remembered state
Visual: Checkbox + "Remember User ID" label
Persistence: State saved for next visit
Verification:
  - [ ] PWA checkbox label text?
  - [ ] PWA checkbox checked state persistence?
  - [ ] PWA checkbox styling?
```

### Screen 1.6: Sign In Button
**Component Type:** Primary Button
**Primary Behavior:**
```
Trigger: User taps button
Action: Validate inputs, submit form
Visual: 52px height, 100% width, gradient background
Loading State: Show spinner, disable further taps
Success: Navigate to Dashboard
Error: Show error toast or inline error message
Verification:
  - [ ] PWA button text is "Sign In"?
  - [ ] PWA button shows loading spinner?
  - [ ] PWA button error handling?
  - [ ] PWA button success navigation?
```

### Screen 1.7: Create Account Button
**Component Type:** Secondary Button
**Primary Behavior:**
```
Trigger: User taps button
Action: Navigate to Register screen
Visual: 44px height, 100% width, outline style
Verification:
  - [ ] PWA button text?
  - [ ] PWA button navigates to Register?
  - [ ] PWA button styling?
```

### Screen 1.8: Forgot Password Link
**Component Type:** Text Link
**Primary Behavior:**
```
Trigger: User taps link
Action: Navigate to password reset flow (or show message)
Visual: 12px, weight 400, color #667eea
Verification:
  - [ ] PWA link text?
  - [ ] PWA link destination?
  - [ ] PWA link styling?
```

### Screen 1.9: Error Message Container
**Component Type:** Error Display
**Primary Behavior:**
```
Trigger: Form validation fails or API returns error
Action: Show error message
Visual:
  - Background: #FFEBEE
  - Border: 1px solid #F44336
  - Padding: 12px 16px
  - Text: 14px, weight 400, color #F44336
  - Border radius: 8px
Position: Below buttons or inline with field
Verification:
  - [ ] PWA error container styling?
  - [ ] PWA error message font?
  - [ ] PWA error position?
  - [ ] PWA error message examples?
```

### Screen 1.10: Screen Transition
**Component Type:** Navigation Flow
**Primary Behavior:**
```
Trigger: Sign In successful
Action: Navigate to Dashboard
Animation: Slide transition (left to right or fade)
Duration: 300-400ms
Verification:
  - [ ] PWA transition animation?
  - [ ] PWA transition duration?
  - [ ] PWA transition direction?
```

---

## SCREEN 2: REGISTER - BEHAVIORS

### Screen 2.1: Header (Logo + Title)
**Component Type:** Header Section
**Primary Behavior:**
```
Trigger: Screen loads
Action: Display logo (smaller than login) + "Create Your Account" title
Visual:
  - Logo: 48x48px
  - Title: 28px, weight 700
  - Subtitle: 14px, weight 400 (optional)
Verification:
  - [ ] PWA logo size on Register?
  - [ ] PWA title text?
  - [ ] PWA subtitle present?
```

### Screen 2.2: Email Input
**Component Type:** Text Input
**Primary Behavior:**
```
Same as Login Screen 1.3
Verification:
  - [ ] PWA email field same as login?
  - [ ] PWA email validation same?
```

### Screen 2.3: Password Input
**Component Type:** Password Input
**Primary Behavior:**
```
Trigger: User taps password field
Action: Show keyboard, display password requirements indicator
Visual: Standard password input with visibility toggle
Password Requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
Verification:
  - [ ] PWA password requirements?
  - [ ] PWA shows requirements in real-time?
  - [ ] PWA requirement indicators (checkmarks/x)?
```

### Screen 2.4: Password Requirements Indicator
**Component Type:** Requirements Display
**Primary Behavior:**
```
Trigger: User types in password field
Action: Update requirement checklist in real-time
Visual:
  - Container: #F5F5F5 background, 12px padding, 8px border radius
  - Requirements listed as bullet points
  - Met requirement: Green checkmark (#4CAF50), strikethrough text
  - Unmet requirement: Red X (#F44336), normal text
  - Font: 12px, weight 400
  - Line height: 20px
Real-time Update:
  - Check each requirement as user types
  - Update visual feedback immediately
Verification:
  - [ ] PWA requirements text?
  - [ ] PWA shows met requirement indicator?
  - [ ] PWA shows unmet requirement indicator?
  - [ ] PWA updates in real-time?
  - [ ] PWA requirement styling?
```

### Screen 2.5: Confirm Password Input
**Component Type:** Password Input
**Primary Behavior:**
```
Trigger: User taps confirm password field
Action: Show keyboard, validate match with password field
Visual: Standard password input with visibility toggle
Validation:
  - Field turns red if password doesn't match
  - Show "Passwords match" indicator when they do
  - Update in real-time as user types
Verification:
  - [ ] PWA shows password match indicator?
  - [ ] PWA shows match in real-time?
  - [ ] PWA styling for match/mismatch?
  - [ ] PWA placeholder text?
```

### Screen 2.6: Fitness Goal Label + Radio Group
**Component Type:** Form Section
**Primary Behavior:**
```
Trigger: Screen displays section
Action: Show fitness goal selection
Visual:
  - Label: "What's Your Fitness Goal?" (16px, weight 600)
  - 4 radio button options:
    - Weight Loss
    - Muscle Gain
    - General Fitness
    - Athletic Performance
  - Each option: 40px height, 16px left padding for radio
  - Selected option: Light purple background (#E8ECFF)
Behavior:
  - Only one option selectable at a time
  - Default: First option selected (or none)
Verification:
  - [ ] PWA goal options text?
  - [ ] PWA number of goal options?
  - [ ] PWA default selection?
  - [ ] PWA styling for selected option?
```

### Screen 2.7: Terms & Privacy Checkbox
**Component Type:** Checkbox
**Primary Behavior:**
```
Trigger: User sees form
Action: Display required checkbox
Visual: Checkbox + "I agree to Terms of Service and Privacy Policy"
Requirement: Must be checked to submit
Behavior:
  - Link text in "Terms" and "Privacy Policy" are tappable
  - Tapping links opens respective documents
  - Unchecked state: Create Account button disabled
  - Checked state: Create Account button enabled
Verification:
  - [ ] PWA checkbox label text?
  - [ ] PWA shows links as tappable?
  - [ ] PWA button enabled/disabled based on checkbox?
  - [ ] PWA links destination?
```

### Screen 2.8: Create Account Button
**Component Type:** Primary Button
**Primary Behavior:**
```
Trigger: User taps button
Action: Validate all fields, submit form
Visual: 52px height, 100% width, gradient background
Disabled State: If terms not checked or password invalid
Loading State: Show spinner while submitting
Success: Navigate to Login screen with success message
Error: Show error toast or inline error message
Verification:
  - [ ] PWA button text?
  - [ ] PWA button disabled state trigger?
  - [ ] PWA button loading state?
  - [ ] PWA success navigation?
  - [ ] PWA error handling?
```

### Screen 2.9: Sign In Link
**Component Type:** Text Link
**Primary Behavior:**
```
Trigger: User taps link
Action: Navigate back to Login screen
Visual: "Already have an account? Sign In" or similar
Verification:
  - [ ] PWA link text?
  - [ ] PWA link destination?
  - [ ] PWA link styling?
```

---

## SCREEN 3: HOME - BEHAVIORS

### Screen 3.1: Hero Section
**Component Type:** Hero Container
**Primary Behavior:**
```
Trigger: Screen loads
Action: Display hero banner with gradient background
Visual:
  - Height: 280px
  - Gradient: #667eea to #764ba2
  - Content centered: Logo (64x64px) + Headline + Subheading
  - Logo margin top: 24px
  - Headline: "Transform Your Fitness" (32px, weight 700, white)
  - Subheading: Motivational text (14px, weight 400, 80% white opacity)
Verification:
  - [ ] PWA hero height?
  - [ ] PWA hero gradient colors?
  - [ ] PWA hero text content?
  - [ ] PWA hero text colors?
```

### Screen 3.2-3.4: Feature Cards
**Component Type:** Card Group (3 cards)
**Primary Behavior:**
```
Trigger: Below hero section
Action: Display 3 feature cards in overlapping layout
Visual:
  - 3 cards: Track Progress, Smart Workouts, Offline Ready
  - Layout: Horizontal scroll OR static grid depending on PWA
  - Card height: 120px
  - Card overlap: -32px (overlaps with hero section)
  - Each card has icon (32x32px) + title (14px, weight 600)
Icons: 📊 📱 💪 (or custom icons)
Behavior:
  - Cards are tappable (may navigate or show info)
  - Slight elevation with shadows
Verification:
  - [ ] PWA shows 3 feature cards?
  - [ ] PWA card titles?
  - [ ] PWA card icons?
  - [ ] PWA card layout (overlap/grid)?
  - [ ] PWA card interactive behavior?
```

### Screen 3.5: Why Ageless Section
**Component Type:** Content Section
**Primary Behavior:**
```
Trigger: Below feature cards
Action: Display stats in 3-column grid
Visual:
  - Title: "Why Ageless?" (24px, weight 600)
  - 3 stat cards:
    - 10K+ / Active Users
    - 1M+ / Workouts Logged
    - 98% / User Satisfaction
  - Font sizes: Numbers 18px weight 700, Labels 12px weight 400
  - Spacing: 12px between columns
Verification:
  - [ ] PWA stat numbers?
  - [ ] PWA stat labels?
  - [ ] PWA stat styling?
  - [ ] PWA stat layout (3-column)?
```

### Screen 3.6-3.9: Getting Started List
**Component Type:** Feature List
**Primary Behavior:**
```
Trigger: Below stats section
Action: Display 4 feature list items
Visual:
  - Title: "Getting Started" (24px, weight 600)
  - 4 items:
    - Full-Body Workouts
    - Weekly Progress Tracking
    - Works Offline
    - Secure & Private
  - Each item: 60px height, 32x32px icon + text
  - Icon position: Left, text right-aligned
  - Font: 16px, weight 400
Verification:
  - [ ] PWA list items text?
  - [ ] PWA list items icons?
  - [ ] PWA list layout?
  - [ ] PWA list styling?
```

### Screen 3.10: Call-to-Action Button
**Component Type:** Primary Button
**Primary Behavior:**
```
Trigger: At bottom of content
Action: Navigate to Register or Dashboard (depending on auth state)
Visual: 56px height, 100% width, gradient background
Text: "Get Started" or "Enter App"
Verification:
  - [ ] PWA button text?
  - [ ] PWA button destination (authenticated vs. not)?
  - [ ] PWA button styling?
```

### Screen 3.11: Footer
**Component Type:** Footer Section
**Primary Behavior:**
```
Trigger: At bottom of screen
Action: Display footer with links and copyright
Visual:
  - Background: #F5F5F5
  - Content: Privacy Policy | Terms of Service | Contact Support
  - Copyright: "© 2024 Ageless. All rights reserved."
  - Font: 12px, weight 400, color #666666
  - Links: Tappable, color #667eea
Verification:
  - [ ] PWA footer links?
  - [ ] PWA footer link destinations?
  - [ ] PWA copyright text?
  - [ ] PWA footer styling?
```

---

## SCREEN 4: DASHBOARD - BEHAVIORS

### Screen 4.1: Fixed Header
**Component Type:** Header
**Primary Behavior:**
```
Trigger: Screen loads
Action: Display fixed header at top
Visual:
  - Height: 64px (including status bar safe area)
  - Background: White (#FFFFFF)
  - Title: "Today's Workout" (18px, weight 600)
  - Menu button: Right side, 24x24px, hamburger or three-dots icon
  - Safe area padding: Top 12px, bottom 12px
Position: Sticky at top (remains visible when scrolling)
Verification:
  - [ ] PWA header text?
  - [ ] PWA header height?
  - [ ] PWA menu button presence?
  - [ ] PWA header stays fixed on scroll?
```

### Screen 4.2: Date Picker
**Component Type:** Date Navigation
**Primary Behavior:**
```
Trigger: Below header (sticky)
Action: Allow user to navigate between dates
Visual:
  - Height: 56px
  - Background: White (#FFFFFF)
  - Left arrow: 24x24px button, left side
  - Date display: Center, format "Monday, January 8"
  - Right arrow: 24x24px button, right side
  - Border bottom: 1px solid #E0E0E0
Position: Sticky below header (stays visible when scrolling content below)
Behavior:
  - Tap left arrow: Go to previous day
  - Tap right arrow: Go to next day
  - Tap date text: Show calendar picker (optional PWA feature)
  - Update exercise data when date changes
Verification:
  - [ ] PWA date format?
  - [ ] PWA arrows behavior?
  - [ ] PWA date picker on text tap?
  - [ ] PWA updates content when date changes?
```

### Screen 4.3: Progress Card
**Component Type:** Status Card
**Primary Behavior:**
```
Trigger: Below date picker
Action: Display today's progress
Visual:
  - Height: 120px
  - Padding: 16px
  - Title: "Progress" (16px, weight 600)
  - Percentage: 45% (24px, weight 700, color #667eea)
  - Progress bar: 8px height, #667eea fill, #E0E0E0 background
  - Subtitle: "5 of 11 exercises completed" (12px, weight 400)
Behavior:
  - Percentage updates as user logs exercises
  - Progress bar fills proportionally
Verification:
  - [ ] PWA progress percentage display?
  - [ ] PWA progress bar styling?
  - [ ] PWA text content?
  - [ ] PWA updates in real-time?
```

### Screen 4.4: Weight Input
**Component Type:** Input with Unit Display
**Primary Behavior:**
```
Trigger: Below progress card
Action: Allow user to input current weight
Visual:
  - Layout: Flex row with label, input, unit
  - Label: "Weight Today" (14px, weight 500)
  - Input: Text field, 48px height, right-aligned text
  - Unit: "lbs" or "kg" (12px, right side, gray color)
  - Placeholder: "Enter weight"
Behavior:
  - Input validates numeric values
  - Updates stored weight when user finishes editing
  - Auto-save with 2-second debounce
  - Show success toast when saved
Verification:
  - [ ] PWA input placeholder?
  - [ ] PWA unit display?
  - [ ] PWA validation (numeric only)?
  - [ ] PWA auto-save behavior?
  - [ ] PWA success feedback?
```

### Screen 4.5-4.15: Exercise Grid
**Component Type:** 2-Column Card Grid
**Primary Behavior:**
```
Trigger: Below weight input
Action: Display 11 exercise types as 2-column grid
Visual:
  - Grid layout: 2 columns, 16px gap
  - Cards: 140px height, 12px border radius
  - Each card shows:
    - Icon (40x40px, centered top)
    - Exercise name (16px, weight 600, centered below icon)
    - Target sets indicator (12px, weight 400, gray)
    - Control buttons: Minus button | Set count | Plus button
    - Minus button: 32x32px, left-aligned
    - Set count: 14px, weight 700, center, display current count
    - Plus button: 32x32px, right-aligned
  - Button colors: Minus/Plus = light gray (#F5F5F5) background

Exercises:
1. Bike / 2. Abs / 3. Chest Press / 4. Leg Press
5. Lat / 6. Military / 7. Crunch / 8. Bicep Curls
9. Triceps / 10. Overhead Pull / 11. Row

Behavior:
  - Minus button: Decrease count by 1 (minimum 0)
  - Plus button: Increase count by 1 (maximum likely 100)
  - Count updates in real-time
  - Updates trigger auto-save (2-second debounce)
  - Cards may show active state if count > 0
  - Show toast confirmation after save
Verification:
  - [ ] PWA exercise list (all 11)?
  - [ ] PWA exercise names match exactly?
  - [ ] PWA grid layout (2-column)?
  - [ ] PWA button behavior (+/-)?
  - [ ] PWA auto-save behavior?
  - [ ] PWA active card styling?
  - [ ] PWA count display?
```

### Screen 4.16: Toast Notification
**Component Type:** Feedback
**Primary Behavior:**
```
Trigger: After weight/exercises saved
Action: Show success toast
Visual: "Saved!" message, 44px height, green styling
Duration: Auto-dismiss after 3 seconds
Position: Above bottom navigation
Verification:
  - [ ] PWA toast message text?
  - [ ] PWA toast colors?
  - [ ] PWA toast duration?
  - [ ] PWA toast position?
```

### Screen 4.17: Bottom Navigation
**Component Type:** Navigation
**Primary Behavior:**
```
Same as global behavior
Verification:
  - [ ] PWA "Dashboard" tab active?
  - [ ] PWA other tabs visible?
```

---

## SCREEN 5: HISTORY - BEHAVIORS

### Screen 5.1: Header
**Component Type:** Header
**Primary Behavior:**
```
Trigger: Screen loads
Action: Display header with title and filter button
Visual:
  - Height: 64px
  - Title: "Workout History" (18px, weight 600)
  - Filter button: Right side, 24x24px funnel icon
Position: Fixed at top
Verification:
  - [ ] PWA title text "Workout History"?
  - [ ] PWA header height?
  - [ ] PWA filter button presence?
```

### Screen 5.2: Desktop Table View (768px+)
**Component Type:** Data Table
**Primary Behavior:**
```
Trigger: Screen wider than 768px
Action: Display table view
Visual:
  - Header row: 48px height, gradient background (#667eea to #764ba2)
  - Columns: Date | Weight | Completed | Details | Actions
  - Header text: 14px, weight 600, white color
  - Data rows: 56px height, alternating striped (even rows #F9F9F9)
  - Row text: 14px, weight 400
  - Actions column: Edit (icon), Delete (icon)
  - Icons: 20x20px, tappable hit area 44x44px
Scrolling:
  - Table scrolls vertically
  - Header remains sticky when scrolling
Behavior:
  - Hover state on rows (PWA desktop feature)
  - Edit button navigates to edit screen
  - Delete button shows confirmation dialog
Verification:
  - [ ] PWA table column headers?
  - [ ] PWA table row height?
  - [ ] PWA table striping?
  - [ ] PWA header sticky behavior?
  - [ ] PWA action button behavior?
```

### Screen 5.3: Mobile Card View (<768px)
**Component Type:** Card List
**Primary Behavior:**
```
Trigger: Screen narrower than 768px
Action: Display card view
Visual:
  - Cards: 100% width, 16px padding on sides, 12px gap between cards
  - Card structure:
    - Header row: Date (left) | Completion % (right)
    - Progress bar: 4px height, #667eea fill color, #E0E0E0 background
    - Exercise summary: "5 exercises • 47 sets" (12px, weight 400)
    - Expandable indicator: "↓" arrow, right-aligned
  - Card padding: 16px
  - Border radius: 12px
  - Background: White
Expandable Content:
  - Tap card or expand arrow: Show exercise details
  - Expanded height: up to 300px
  - Details: List of exercises with set counts
  - Fade animation when expanding
Verification:
  - [ ] PWA card layout (mobile)?
  - [ ] PWA card content structure?
  - [ ] PWA expandable behavior?
  - [ ] PWA expansion animation?
```

### Screen 5.4: Action Buttons (Mobile)
**Component Type:** Action Group
**Primary Behavior:**
```
Trigger: Within each card
Action: Edit or delete workout
Visual:
  - Buttons displayed below exercise summary (mobile)
  - Edit button: Background #E8ECFF, text #667eea, 12px font
  - Delete button: Background #FFEBEE, text #F44336, 12px font
  - Button size: Flex, minimum 44px hit target
Behavior:
  - Edit tap: Navigate to edit screen for that workout
  - Delete tap: Show confirmation dialog
Verification:
  - [ ] PWA action button text?
  - [ ] PWA button colors?
  - [ ] PWA button position?
  - [ ] PWA action behavior?
```

### Screen 5.5: Pagination / Load More
**Component Type:** Button
**Primary Behavior:**
```
Trigger: Scrolled to bottom of list or initial load shows limited data
Action: Load additional workout records
Visual: Button "Load More Workouts" (44px height)
Behavior:
  - Tap loads next batch of workouts (e.g., 20 per page)
  - Show loading spinner while fetching
  - Append new workouts to existing list
  - Hide button if all workouts loaded
Verification:
  - [ ] PWA button text?
  - [ ] PWA loading behavior?
  - [ ] PWA pagination style?
```

### Screen 5.6: Pull-to-Refresh
**Component Type:** Refresh Control
**Primary Behavior:**
```
Trigger: User pulls down from top of list (mobile)
Action: Refresh workout data from server
Visual:
  - Pull down area: 64px trigger height
  - Refresh icon: 24x24px, rotates during refresh
  - Refresh animation: Spins while loading
  - Duration: Until API returns data
Behavior:
  - Pull to specific point triggers refresh
  - Release fires API call
  - Animation shows loading state
  - Data updates when complete
  - Show success indicator (e.g., green checkmark) briefly
Verification:
  - [ ] PWA pull-to-refresh present?
  - [ ] PWA trigger height?
  - [ ] PWA animation style?
  - [ ] PWA success feedback?
```

### Screen 5.7: Empty State
**Component Type:** Placeholder
**Primary Behavior:**
```
Trigger: User has no workouts logged
Action: Show empty state message
Visual:
  - Icon: 64x64px, empty/no data icon
  - Title: "No Workouts Yet" (18px, weight 600)
  - Subtitle: "Start logging your first workout today" (14px, weight 400)
  - Button: "Start Workout" (44px height, primary style)
Behavior:
  - Button navigates to Dashboard
Verification:
  - [ ] PWA empty state icon?
  - [ ] PWA empty state text?
  - [ ] PWA button destination?
```

---

## SCREEN 6: PROFILE - BEHAVIORS

### Screen 6.1: Fixed Header
**Component Type:** Header
**Primary Behavior:**
```
Trigger: Screen loads
Action: Display fixed header
Visual:
  - Height: 64px
  - Title: "Profile" (18px, weight 600)
Position: Fixed at top
Verification:
  - [ ] PWA header text?
  - [ ] PWA header styling?
```

### Screen 6.2: Avatar Card
**Component Type:** Profile Card
**Primary Behavior:**
```
Trigger: Below header
Action: Display user avatar and name
Visual:
  - Card height: 120px
  - Content: Avatar (80x80px) + Name (16px, weight 600) below
  - Avatar: Circular with 3px border, color #667eea
  - Layout: Centered
  - Padding: 16px
Behavior:
  - Tap avatar: Show options to change (if PWA supports)
Verification:
  - [ ] PWA avatar size?
  - [ ] PWA avatar border?
  - [ ] PWA name display?
  - [ ] PWA avatar tap behavior?
```

### Screen 6.3-6.5: Statistics Cards (3 total)
**Component Type:** Stats Display
**Primary Behavior:**
```
Trigger: Below avatar card
Action: Display 3 statistics in grid
Visual:
  - 3 columns, 16px gap
  - Each card shows: Large number (24px, weight 700, color #667eea) + Label (12px)
  - Examples: 47 / Days Active | 156 / Total Workouts | 2,847 / Total Sets
  - Cards: White background, light shadow
Verification:
  - [ ] PWA stat numbers?
  - [ ] PWA stat labels?
  - [ ] PWA stat styling?
```

### Screen 6.6-6.8: Account Settings Section
**Component Type:** Settings List
**Primary Behavior:**
```
Trigger: Below stats
Action: Display account-related settings
Visual:
  - Section title: "Account" (14px, weight 600)
  - List items:
    - Change Password (arrow icon right)
    - Email Notifications (toggle switch right)
    - Push Notifications (toggle switch right)
  - Item height: 52px (with padding)
  - Font: 16px, weight 400
  - Divider: 1px border between items
Behavior:
  - "Change Password" tap: Navigate to change password screen
  - Toggle switches: Update preference immediately, persist state
Verification:
  - [ ] PWA section title?
  - [ ] PWA list items?
  - [ ] PWA toggle switches?
  - [ ] PWA toggle persistence?
```

### Screen 6.9-6.11: Preferences Section
**Component Type:** Settings List
**Primary Behavior:**
```
Trigger: Below account section
Action: Display user preferences
Visual:
  - Section title: "Preferences" (14px, weight 600)
  - List items:
    - Dark Mode (toggle switch right)
    - Weight Units (shows "Pounds" with arrow)
    - Language (shows "English" with arrow)
  - Item height: 52px
Behavior:
  - Toggle switches: Update preference immediately
  - Other items: Show selection menu on tap
Verification:
  - [ ] PWA preference items?
  - [ ] PWA toggle behavior?
  - [ ] PWA menu options (weight units/language)?
```

### Screen 6.12-6.14: About Section
**Component Type:** Settings List
**Primary Behavior:**
```
Trigger: Below preferences
Action: Display app info and links
Visual:
  - Section title: "About" (14px, weight 600)
  - List items:
    - App Version (shows "1.0.0", no arrow)
    - Privacy Policy (arrow)
    - Terms of Service (arrow)
    - Contact Support (arrow)
Behavior:
  - Version: Display only, no tap action
  - Links: Open respective documents/screens on tap
Verification:
  - [ ] PWA about items?
  - [ ] PWA version text?
  - [ ] PWA link destinations?
```

### Screen 6.15: Danger Zone Section
**Component Type:** Destructive Actions
**Primary Behavior:**
```
Trigger: Below about section
Action: Display destructive account action
Visual:
  - Title: "Danger Zone" (14px, weight 600, color #F44336)
  - Button: "Delete Account" (44px height, red styling)
  - Button background: #FFEBEE
  - Button text: #F44336
Behavior:
  - Tap button: Show confirmation modal
  - Modal: "Are you sure?" with Cancel/Delete buttons
  - Cancel: Close modal
  - Delete: Confirm, call API, logout, navigate to login
Verification:
  - [ ] PWA danger zone title?
  - [ ] PWA delete button styling?
  - [ ] PWA confirmation modal?
  - [ ] PWA delete API call?
```

### Screen 6.16: Logout Button
**Component Type:** Primary Button
**Primary Behavior:**
```
Trigger: At bottom of profile content
Action: Logout user
Visual: 56px height, 100% width, gradient background
Behavior:
  - Tap: Show confirmation dialog
  - Dialog: "Are you sure you want to logout?"
  - Options: Cancel / Logout
  - Cancel: Close dialog
  - Logout: Clear auth token, navigate to login screen
Verification:
  - [ ] PWA logout button text?
  - [ ] PWA confirmation dialog?
  - [ ] PWA logout behavior?
```

### Screen 6.17: Delete Account Modal
**Component Type:** Modal Dialog
**Primary Behavior:**
```
Trigger: User taps "Delete Account" button
Action: Show confirmation dialog
Visual:
  - Modal background: Centered card on overlay
  - Title: "Delete Account?" (18px, weight 600)
  - Message: "This action cannot be undone. All your data will be permanently deleted."
  - Button area: Cancel (secondary) and Delete (primary/red)
  - Button spacing: 12px between buttons
Behavior:
  - Cancel: Dismiss modal, return to profile
  - Delete: Call delete API, logout, navigate to login
Verification:
  - [ ] PWA modal text?
  - [ ] PWA button labels?
  - [ ] PWA button styling?
  - [ ] PWA modal dismiss behavior?
```

---

## SCREEN 7: WORKOUT HISTORY - BEHAVIORS

### Screen 7.1-7.7: All Components
**Behavior:**
```
NOTE: Screen 7 is identical to Screen 5 (History) in all respects.
ONLY DIFFERENCE: Title is "Workout History" instead of just "History" in some contexts.

This screen is used to verify that the PWA-titled "Workout History" screen
matches the History screen design and behaviors exactly.

Copy all verification points from Screen 5 for Screen 7.
The PWA will dictate if there are any subtle layout/styling differences.

Verification Priority:
  - [ ] PWA title is "Workout History"?
  - [ ] PWA layout matches History screen?
  - [ ] PWA functionality matches History screen?
  - [ ] All components match Screen 5?
```

---

## SCREEN 8: FITNESS SUMMARY - BEHAVIORS

### Screen 8.1: Fixed Header with Period Selector
**Component Type:** Header with Control
**Primary Behavior:**
```
Trigger: Screen loads
Action: Display header with title and period selector
Visual:
  - Height: 64px
  - Title: "Fitness Summary" (18px, weight 600)
  - Period selector: Button on right showing current period
  - Button text: "This Week" / "This Month" / "All Time"
  - Font: 12px, weight 500
  - Button size: 80px width approximately
Position: Fixed at top
Behavior:
  - Tap period button: Show dropdown menu
  - Menu options: "This Week", "This Month", "All Time"
  - Select option: Update data displayed below
  - Show loading state while fetching new data
Verification:
  - [ ] PWA header text?
  - [ ] PWA period selector button?
  - [ ] PWA period options?
  - [ ] PWA period selection behavior?
```

### Screen 8.2-8.4: Primary Statistics Cards (3 total)
**Component Type:** Stats Grid
**Primary Behavior:**
```
Trigger: Below header
Action: Display 3 primary statistics
Visual:
  - Grid: 3 columns, 16px gap
  - Each card shows:
    - Icon: 32x32px emoji or icon
    - Number: 18px, weight 700, color #667eea
    - Label: 12px, weight 400
  - Examples:
    - 📊 / 156 / Total Workouts
    - 💪 / 178.5 / Avg Weight
    - ⚡ / 2,847 / Total Sets
  - Card height: 100px
Verification:
  - [ ] PWA stat labels?
  - [ ] PWA stat numbers?
  - [ ] PWA stat icons?
  - [ ] PWA grid layout?
```

### Screen 8.5-8.6: Secondary Statistics (2 cards)
**Component Type:** Secondary Stats
**Primary Behavior:**
```
Trigger: Below primary stats
Action: Display 2 secondary statistics
Visual:
  - Grid: 2 columns, 16px gap
  - Each shows: Label and value
  - Examples:
    - "Best Week" / "March 15-21"
    - "Current Streak" / "12 days"
  - Font: 14px for label, 16px weight 700 for value
  - Card height: 80px
Verification:
  - [ ] PWA secondary stats labels?
  - [ ] PWA secondary stats values?
```

### Screen 8.7: Weekly Breakdown Title
**Component Type:** Section Title
**Primary Behavior:**
```
Trigger: Below secondary stats
Action: Display section title
Visual:
  - Text: "Weekly Breakdown" (18px, weight 600)
  - Margin top: 24px
Verification:
  - [ ] PWA title text?
```

### Screen 8.8-8.13: Weekly Breakdown Cards (6 cards visible, expandable)
**Component Type:** Expandable Card List
**Primary Behavior:**
```
Trigger: Below weekly breakdown title
Action: Display 52 weeks (or relevant period) as cards
Visual - Collapsed:
  - Height: 120px
  - Card structure:
    - Week date: "Week of Jan 7" (16px, weight 600)
    - Completion: "92% completed" (14px, weight 400, color #4CAF50)
    - Progress bar: 4px height, green fill
    - Exercise summary: "5 exercises, 47 sets" (12px)
  - Layout: Vertical stacking, 12px gap
Behavior - Expandable:
  - Tap card: Expand to show details
  - Expanded height: Up to 200px
  - Expanded view shows: List of exercises from that week
  - Collapse icon: Arrow pointing down (collapsed) or up (expanded)
  - Arrow tappable hit area: 44x44px
Animation:
  - Expand: 300ms, smooth height animation
  - Collapse: 300ms, smooth height animation
Verification:
  - [ ] PWA card height (collapsed)?
  - [ ] PWA expansion animation duration?
  - [ ] PWA expanded content?
  - [ ] PWA week date format?
  - [ ] PWA exercise summary format?
```

### Screen 8.14-8.20: Top Exercises Ranking
**Component Type:** Ranking List
**Primary Behavior:**
```
Trigger: Below weekly breakdown
Action: Display top 7 exercises by frequency/sets
Visual:
  - Title: "Top Exercises" (16px, weight 600)
  - List items: 40px height per item
  - Item structure:
    - Rank number: "1." (14px, weight 600, color #667eea)
    - Exercise name: "Chest Press" (14px, weight 400)
    - Set count: "156 sets" (12px, weight 600, color #667eea, right-aligned)
  - Font: 14px default for names
  - Divider: 1px border between items (optional)
Behavior:
  - Tap item: Show exercise details or history (optional PWA feature)
Verification:
  - [ ] PWA top exercises list?
  - [ ] PWA ranking format?
  - [ ] PWA exercise names?
  - [ ] PWA set counts?
  - [ ] PWA tap behavior (if any)?
```

### Screen 8.21: Bottom Navigation
**Component Type:** Navigation
**Primary Behavior:**
```
Verify: Summary tab is active in bottom nav
Verification:
  - [ ] PWA navigation shows Summary tab active?
```

---

## SCREEN 9: PROGRESS SUMMARY - BEHAVIORS

### Screen 9.1: Fixed Header with Gradient
**Component Type:** Header
**Primary Behavior:**
```
Trigger: Screen loads
Action: Display fixed header with gradient background
Visual:
  - Height: 64px
  - Gradient: #667eea to #764ba2
  - Title: "📈 Progress Summary" (18px, weight 600, white text)
  - Subtitle: "52 Week Overview" (12px, weight 400, white text)
Position: Fixed at top, sticky during scroll
Verification:
  - [ ] PWA header text?
  - [ ] PWA header gradient?
  - [ ] PWA header colors?
  - [ ] PWA header sticky behavior?
```

### Screen 9.2: Scroll Hint Bar
**Component Type:** Instruction Display
**Primary Behavior:**
```
Trigger: Below header, visible above table
Action: Display scrolling instructions
Visual:
  - Height: 32px
  - Background: #F5F5F5
  - Text: "↔️ Scroll horizontally | ↕️ Scroll vertically" (12px, weight 400)
  - Centered
  - Border bottom: 1px solid #E0E0E0
Position: Sticky, stays visible when scrolling table
Duration: May disappear after user scrolls once (PWA behavior)
Verification:
  - [ ] PWA hint bar present?
  - [ ] PWA hint text?
  - [ ] PWA sticky behavior?
  - [ ] PWA dismissal behavior?
```

### Screen 9.3: Table Header (Sticky)
**Component Type:** Data Table Header
**Primary Behavior:**
```
Trigger: Below scroll hint
Action: Display table header
Visual:
  - Height: 48px
  - Background: Gradient #667eea to #764ba2
  - Text: 14px, weight 600, white color
  - Columns (14 total):
    - Week Of (130px min width)
    - Avg Wt (60px)
    - Bike, Abs, Chest Press, Leg Press, Lat, Military, Crunch,
      Bicep Curls, Triceps, Overhead Pull, Row (each 60px)
    - Total Sets (60px)
  - Text alignment: Center for numeric columns, left for Week Of
Position: Sticky, remains at top when scrolling table vertically
Behavior:
  - Horizontal scroll reveals more columns on narrow screens
Verification:
  - [ ] PWA header column names?
  - [ ] PWA header sticky behavior?
  - [ ] PWA column count and names?
  - [ ] PWA header styling?
```

### Screen 9.4: Table Rows (52 weeks of data)
**Component Type:** Data Table Body
**Primary Behavior:**
```
Trigger: Below header
Action: Display 52 rows of weekly data
Visual:
  - Height: 40px per row
  - Background: Alternating white and #F9F9F9
  - Text: 12px, weight 400
  - Data example row: "Jan 7-13" | 178.5 | 12 | 8 | 10 | 9 | 7 | 11 | 6 | 9 | 8 | 10 | 7 | 97
  - Text alignment: Center for numeric, left for date
  - Padding: 12px 8px per cell
Scrolling:
  - Vertical scroll: Loads next 10 rows (or shows all depending on PWA)
  - Horizontal scroll: Reveals columns on narrow screens
Behavior:
  - Tap row: May show week details (PWA dependent)
  - Numbers update based on logged exercises
Verification:
  - [ ] PWA row height?
  - [ ] PWA data format?
  - [ ] PWA striping colors?
  - [ ] PWA scrolling behavior?
  - [ ] PWA row tap behavior?
```

### Screen 9.5: Sticky Footer Hint
**Component Type:** Footer Display
**Primary Behavior:**
```
Trigger: At bottom of table
Action: Display footer hint
Visual:
  - Height: 32px
  - Background: #F5F5F5
  - Text: "Showing 10 of 52 weeks | Last updated: Today" (12px, weight 400)
  - Centered
Position: Sticky, visible at bottom of scroll area
Verification:
  - [ ] PWA footer text format?
  - [ ] PWA footer styling?
  - [ ] PWA footer sticky behavior?
```

### Screen 9.6: Empty State (if no data)
**Component Type:** Placeholder
**Primary Behavior:**
```
Trigger: User has no weekly data (new account)
Action: Show empty state
Visual:
  - Icon: 64x64px, empty/no data icon
  - Title: "No Progress Data" (18px, weight 600)
  - Subtitle: "Start logging exercises to see your progress" (14px, weight 400)
  - Button: "Start Workout" (44px height, primary style)
Behavior:
  - Button navigates to Dashboard
Verification:
  - [ ] PWA empty state present?
  - [ ] PWA empty state text?
  - [ ] PWA button destination?
```

---

## PWA-RN BEHAVIOR MATCHING FRAMEWORK

### Purpose
This framework ensures that React Native component behaviors match the PWA exactly, not just visually but functionally.

### Behavior Categories to Verify Per Component

#### 1. User Interaction Behaviors
**Questions to Answer from PWA:**
- [ ] What triggers the interaction? (Tap, swipe, long-press, etc.)
- [ ] What is the immediate visual feedback?
- [ ] What is the next state after interaction?
- [ ] What animation occurs? (Duration, easing)
- [ ] What happens if user cancels or releases?

#### 2. Input Validation Behaviors
**Questions to Answer from PWA:**
- [ ] When does validation occur? (On blur, real-time, on submit)
- [ ] What are the validation rules? (Exact specifications)
- [ ] How is error displayed? (Color, position, font, icon)
- [ ] What is the error message text? (Exact wording)
- [ ] How does error clear? (On type, on blur, etc.)

#### 3. State Persistence Behaviors
**Questions to Answer from PWA:**
- [ ] What states are saved? (User selections, toggles, inputs)
- [ ] Where are states saved? (LocalStorage, AsyncStorage, server)
- [ ] When are states saved? (Immediate, debounced, on submit)
- [ ] How long do states persist? (Session only, permanent)
- [ ] How does state clear? (On logout, manual clear, timeout)

#### 4. Animation Behaviors
**Questions to Answer from PWA:**
- [ ] What triggers animation? (Load, scroll, interaction, state change)
- [ ] What type of animation? (Fade, slide, scale, rotate, etc.)
- [ ] What is the duration? (Exact milliseconds)
- [ ] What is the easing? (Ease-in, ease-out, ease-in-out, linear)
- [ ] Do animations stack or queue?

#### 5. Error Handling Behaviors
**Questions to Answer from PWA:**
- [ ] How are errors displayed? (Toast, inline, modal, banner)
- [ ] What is the error message? (Exact text)
- [ ] How long are errors shown? (Auto-dismiss duration)
- [ ] Can user dismiss errors? (Close button, tap to dismiss)
- [ ] What happens after error? (Retry option, navigation)

#### 6. Loading Behaviors
**Questions to Answer from PWA:**
- [ ] What triggers loading state? (API call, form submission, navigation)
- [ ] What is the loading visual? (Spinner, skeleton, progress bar)
- [ ] Where is loading shown? (Overlay, component-level, global)
- [ ] How long might loading last? (Min/max duration)
- [ ] What happens if loading fails? (Error state)

#### 7. Navigation Behaviors
**Questions to Answer from PWA:**
- [ ] What triggers navigation? (Button tap, link tap, gesture, auto)
- [ ] What is the transition animation? (Slide, fade, push, pop)
- [ ] What is the transition duration? (Exact milliseconds)
- [ ] Is back navigation available? (Device back, back button)
- [ ] What is preserved when navigating back? (Scroll position, state)

#### 8. Responsive Behaviors
**Questions to Answer from PWA:**
- [ ] How does component change at different screen sizes?
- [ ] At what breakpoints do changes occur? (600px, 768px, 800px, 1024px)
- [ ] What changes? (Layout, font size, spacing, visibility)
- [ ] Are there mobile vs. desktop-specific behaviors?

### Verification Process Per Component

**For each component, perform this checklist:**

1. **Screenshot Analysis**
   - [ ] Extract default state visual
   - [ ] Extract interaction state visual
   - [ ] Extract error/loading state visual
   - [ ] Extract disabled state visual

2. **Logic Analysis**
   - [ ] Review PWA source code for component
   - [ ] Document validation rules
   - [ ] Document API calls
   - [ ] Document state management
   - [ ] Document event handlers

3. **Behavior Documentation**
   - [ ] Write primary behavior description
   - [ ] Write secondary behavior description
   - [ ] Write tertiary behavior description (if applicable)
   - [ ] Document all edge cases

4. **React Native Implementation Planning**
   - [ ] Match visual design exactly
   - [ ] Match validation rules exactly
   - [ ] Match animation duration exactly
   - [ ] Match state persistence exactly
   - [ ] Match error handling exactly

5. **Testing Criteria**
   - [ ] Behavior matches PWA screenshot
   - [ ] Behavior matches PWA code logic
   - [ ] All validation works correctly
   - [ ] All animations timing matches
   - [ ] All error states display correctly
   - [ ] All loading states display correctly

### Common Behavior Mismatches to Avoid

**Issue 1: Animation Duration Mismatch**
- PWA: Button press 100ms
- React Native: Button press 300ms
- Fix: Adjust React Native animation to 100ms exactly

**Issue 2: Validation Timing Mismatch**
- PWA: Real-time validation as user types
- React Native: Validation only on blur
- Fix: Add real-time validation listener

**Issue 3: Error Message Text Mismatch**
- PWA: "Email must be valid"
- React Native: "Invalid email format"
- Fix: Use exact PWA text

**Issue 4: State Persistence Mismatch**
- PWA: Toggle state persists forever
- React Native: Toggle state clears on app restart
- Fix: Add persistent storage solution

**Issue 5: Loading Behavior Mismatch**
- PWA: Shows spinner for all requests
- React Native: No loading indicator
- Fix: Add loading UI component

### Comparison Template (Per Screen, Per Component)

```markdown
## Component Name

### PWA Behavior (From Screenshots + Code)
- **Trigger:** [What causes the behavior]
- **Visual:** [How it looks]
- **Duration:** [How long it lasts]
- **Next State:** [What happens next]

### React Native Implementation
- **Should Trigger:** [Same as PWA]
- **Should Look:** [Same as PWA]
- **Should Animate:** [Same duration as PWA]
- **Should Result:** [Same next state as PWA]

### Verification Checklist
- [ ] PWA behavior observed from screenshot?
- [ ] PWA behavior verified in code?
- [ ] React Native matches visual?
- [ ] React Native matches timing?
- [ ] React Native matches logic?
- [ ] React Native tested on device?
- [ ] Behavior matches PWA exactly?
```

---

## Success Criteria

✅ **All Component Behaviors Documented**
- Primary behavior defined for each component
- Secondary behavior defined where applicable
- Tertiary behaviors captured for complex components

✅ **PWA-Source-of-Truth Applied**
- All behaviors derived from PWA screenshots
- All behaviors verified against PWA source code
- No assumptions, all backed by actual PWA design

✅ **React Native Implementation Ready**
- Developers have exact behavior specifications
- Developers know what to match
- Developers can verify implementation against this document

✅ **Comparison Framework Ready**
- Framework provided for matching PWA to React Native
- Checklists provided per component
- Common pitfalls documented

✅ **Next Step: Screenshot Analysis**
- When PWA screenshots provided, analyze behaviors
- Compare to this specification document
- Create React Native behavior adjustments as needed
- Ensure perfect behavior parity

---

*Created January 11, 2026*
*Component Behaviors Specification with PWA Authority*
*All behaviors defined by actual PWA design and logic*
*Ready for PWA screenshot behavior analysis*
