# Design Components Specification & PWA Matching Framework
## Granular Component Catalog for All 9 React Native Screens

**Date:** January 11, 2026
**Purpose:** Detailed component inventory with specifications for exact PWA matching
**Format:** Component-level granularity for precise visual parity

---

## Table of Contents
1. [Global Components (Used Across All Screens)](#global-components)
2. [Screen 1: Login Components](#screen-1-login)
3. [Screen 2: Register Components](#screen-2-register)
4. [Screen 3: Home Components](#screen-3-home)
5. [Screen 4: Dashboard Components](#screen-4-dashboard)
6. [Screen 5: History Components](#screen-5-history)
7. [Screen 6: Profile Components](#screen-6-profile)
8. [Screen 7: Workout History Components](#screen-7-workout-history)
9. [Screen 8: Fitness Summary Components](#screen-8-fitness-summary)
10. [Screen 9: Progress Summary Components](#screen-9-progress-summary)
11. [PWA Matching Framework](#pwa-matching-framework)

---

## GLOBAL COMPONENTS

### Component 1: Primary Button
**Used On:** All screens
**Type:** Interactive Button

**Specifications:**
```
Container:
  - Height: 52-56px
  - Width: 100% (full width)
  - Padding: 12px 24px (internal)
  - Border Radius: 12px
  - Background: Linear Gradient (#667eea → #764ba2)
  - Box Shadow: 0 4px 8px rgba(0,0,0,0.12)

Text:
  - Font Size: 16px
  - Font Weight: 600
  - Color: #FFFFFF
  - Text Alignment: Center
  - Letter Spacing: 0px

States:
  - Default: Full opacity (1.0)
  - Hover: Opacity 0.85
  - Pressed: Opacity 0.7
  - Disabled: Opacity 0.5
  - Loading: Show spinner inside, disable tap

Animations:
  - Press Animation: 100ms scale 0.95
  - Hover Animation: 200ms opacity change
```

**Variations:**
- **Small (32px height):** Padding 8px 16px, font 12px
- **Medium (44px height):** Padding 10px 20px, font 14px
- **Large (56px height):** Padding 12px 24px, font 16px

**PWA Matching Points:**
- [ ] Exact gradient colors (#667eea to #764ba2)
- [ ] Exact height (52px vs 56px)
- [ ] Exact border radius (12px)
- [ ] Exact font size and weight
- [ ] Exact shadow values
- [ ] Exact padding values
- [ ] Exact text color

---

### Component 2: Secondary Button
**Used On:** All screens
**Type:** Interactive Button

**Specifications:**
```
Container:
  - Height: 44-48px
  - Width: 100% (full width)
  - Padding: 10px 20px (internal)
  - Border Radius: 12px
  - Background: Transparent
  - Border: 2px solid #667eea
  - Box Shadow: None

Text:
  - Font Size: 16px
  - Font Weight: 600
  - Color: #667eea
  - Text Alignment: Center
  - Letter Spacing: 0px

States:
  - Default: Transparent background
  - Hover: Background #F5F5F5
  - Pressed: Opacity 0.7
  - Disabled: Opacity 0.5

Animations:
  - Press Animation: 100ms scale 0.95
  - Hover Animation: 200ms background change
```

**PWA Matching Points:**
- [ ] Exact border color (#667eea)
- [ ] Exact border width (2px)
- [ ] Exact height (44px vs 48px)
- [ ] Exact border radius (12px)
- [ ] Exact font size and weight
- [ ] Exact text color
- [ ] Hover background color

---

### Component 3: Text Input Field
**Used On:** Login, Register, Dashboard
**Type:** Form Input

**Specifications:**
```
Container:
  - Height: 48px
  - Width: 100%
  - Padding: 12px 16px (internal)
  - Border Radius: 8px
  - Background: #F5F5F5 (default)
  - Border: 1px solid #E0E0E0

Label (Above Input):
  - Font Size: 14px
  - Font Weight: 500
  - Color: #1A1A1A
  - Margin Below: 8px

Placeholder Text:
  - Font Size: 14px
  - Font Weight: 400
  - Color: #CCCCCC

Input Text:
  - Font Size: 14px
  - Font Weight: 400
  - Color: #1A1A1A
  - Line Height: 20px

Focus State:
  - Border: 2px solid #667eea
  - Background: #FFFFFF
  - Box Shadow: 0 4px 8px rgba(0,0,0,0.12)

Error State:
  - Border: 2px solid #F44336
  - Background: #FFEBEE
  - Error Message Below:
    - Font Size: 12px
    - Color: #F44336
    - Margin Top: 4px
```

**PWA Matching Points:**
- [ ] Exact height (48px)
- [ ] Exact padding (12px 16px)
- [ ] Exact border radius (8px)
- [ ] Exact background colors (default, focus, error)
- [ ] Exact border colors and widths
- [ ] Exact font sizes and weights
- [ ] Exact shadow values

---

### Component 4: Password Input Field
**Used On:** Login, Register
**Type:** Form Input with Visibility Toggle

**Specifications:**
```
[Same as Text Input above, PLUS:]

Visibility Toggle Icon:
  - Position: Right side of input, 16px from edge
  - Icon Size: 24x24px
  - Icon Color: #666666 (inactive)
  - Icon Color Pressed: #667eea (active)
  - Hit Target: 44x44px (minimum)
  - Icon Type: Eye (open/closed)

Container with Icon:
  - Padding Right: 48px (accommodate icon)
  - Display: Flex
  - Align Items: Center
```

**PWA Matching Points:**
- [ ] Exact icon size (24x24px)
- [ ] Exact icon position (16px from right)
- [ ] Exact icon colors (both states)
- [ ] Exact hit target size (44x44px)
- [ ] Exact container padding adjustment

---

### Component 5: Checkbox Input
**Used On:** Login (Save ID), Register (Terms)
**Type:** Form Input

**Specifications:**
```
Checkbox Box:
  - Size: 20x20px
  - Border Radius: 4px
  - Border: 2px solid #667eea
  - Background (Unchecked): Transparent
  - Background (Checked): #667eea

Checkmark Icon:
  - Size: 12x8px
  - Stroke Width: 2px
  - Color: #FFFFFF
  - Position: Centered in box

Label:
  - Font Size: 14px
  - Font Weight: 400
  - Color: #1A1A1A
  - Margin Left: 8px

Container:
  - Height: 44px (minimum, for hit target)
  - Display: Flex
  - Align Items: Center
  - Padding: 0 0 0 0
```

**PWA Matching Points:**
- [ ] Exact checkbox size (20x20px)
- [ ] Exact border radius (4px)
- [ ] Exact border width and color (2px #667eea)
- [ ] Exact checkmark size and stroke
- [ ] Exact label font size and color
- [ ] Exact spacing (8px left margin)

---

### Component 6: Radio Button
**Used On:** Register (Fitness Goals)
**Type:** Form Input

**Specifications:**
```
Radio Circle:
  - Size: 20x20px
  - Border Radius: 50% (full circle)
  - Border: 2px solid #667eea
  - Background (Unselected): Transparent
  - Background (Selected): #667eea

Inner Circle (Selected):
  - Size: 10x10px
  - Position: Centered
  - Color: #FFFFFF
  - Border Radius: 50%

Label:
  - Font Size: 14px
  - Font Weight: 400
  - Color: #1A1A1A
  - Margin Left: 12px

Container:
  - Height: 40px (minimum)
  - Display: Flex
  - Align Items: Center
  - Padding: 4px 0
  - Margin Bottom: 8px (between options)

Selected State Background:
  - Background: #E8ECFF (light purple)
  - Border Radius: 8px
  - Padding: 8px 12px
```

**PWA Matching Points:**
- [ ] Exact circle size (20x20px)
- [ ] Exact inner circle size (10x10px)
- [ ] Exact border width and color (2px #667eea)
- [ ] Exact label spacing and font
- [ ] Exact selected state background color
- [ ] Exact container height and spacing

---

### Component 7: Toggle Switch
**Used On:** Profile (Dark Mode, Notifications)
**Type:** Form Input

**Specifications:**
```
Track:
  - Width: 44px
  - Height: 24px
  - Border Radius: 12px
  - Background (Off): #E0E0E0
  - Background (On): #4CAF50
  - Padding: 2px

Knob (Toggle):
  - Size: 20x20px
  - Border Radius: 50% (circle)
  - Background: #FFFFFF
  - Box Shadow: 0 2px 4px rgba(0,0,0,0.1)
  - Position (Off): 2px from left
  - Position (On): 22px from left (44-20-2)

Animation:
  - Duration: 200ms
  - Easing: ease-in-out
  - Property: transform (translateX)

Container:
  - Height: 44px (hit target)
  - Display: Flex
  - Align Items: Center
  - Justify Content: Space-Between
```

**PWA Matching Points:**
- [ ] Exact track width (44px)
- [ ] Exact track height (24px)
- [ ] Exact track border radius (12px)
- [ ] Exact knob size (20x20px)
- [ ] Exact knob positions (2px, 22px)
- [ ] Exact colors (off/on)
- [ ] Exact animation duration (200ms)

---

### Component 8: Card Container
**Used On:** Home, Dashboard, History, Profile
**Type:** Container

**Specifications:**
```
Container:
  - Border Radius: 12px
  - Background: #FFFFFF
  - Padding: 16px (default)
  - Margin Bottom: 12px
  - Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
  - Border: None
  - Width: 100%

Variations by Screen:
  - Home Feature Cards:
    - Padding: 16px 12px
    - Height: 120px
    - Shadow: Elevation 2
    - Margin: 8px horizontal
  - Dashboard Exercise Cards:
    - Padding: 16px
    - Height: 140px
    - Shadow: Elevation 1
    - Margin: 8px (gap)
  - History Cards (Mobile):
    - Padding: 16px
    - Height: Auto (expandable)
    - Shadow: Elevation 1

Hover State:
  - Shadow: 0 4px 12px rgba(0,0,0,0.15)
  - Transition: 200ms

Pressed State:
  - Opacity: 0.95
  - Scale: 0.98
  - Transition: 100ms
```

**PWA Matching Points:**
- [ ] Exact border radius (12px)
- [ ] Exact padding values (per variation)
- [ ] Exact shadow values (per variation)
- [ ] Exact background color (#FFFFFF)
- [ ] Exact margin/spacing (per variation)
- [ ] Exact height (per variation)

---

### Component 9: Bottom Navigation Bar
**Used On:** Dashboard, History, Profile (All screens with nav)
**Type:** Navigation Container

**Specifications:**
```
Container:
  - Height: 64px (including safe area)
  - Width: 100%
  - Background: #FFFFFF
  - Border Top: 1px solid #E0E0E0
  - Box Shadow: 0 -2px 8px rgba(0,0,0,0.08)
  - Position: Fixed bottom of screen
  - Z-Index: 100

Safe Area:
  - iOS: +8px bottom padding
  - Android: +0px bottom padding

Navigation Items (4 total):
  - Width: 25% each
  - Height: 56px (above safe area)
  - Padding: 8px 0
  - Hit Target: 44x44px minimum
  - Display: Flex column, center

Item Content:
  - Icon: 24x24px
  - Label: 12px font, 400 weight
  - Icon-to-Label Spacing: 4px
  - Text Alignment: Center

Active State:
  - Background: #E8ECFF
  - Icon Color: #667eea
  - Label Color: #667eea
  - Transition: 200ms

Inactive State:
  - Background: Transparent
  - Icon Color: #666666
  - Label Color: #666666
  - Transition: 200ms

Items:
  1. Dashboard (house icon)
  2. History (clock icon)
  3. Summary (chart icon)
  4. Profile (user icon)
```

**PWA Matching Points:**
- [ ] Exact height (64px)
- [ ] Exact item width (25% each)
- [ ] Exact icon size (24x24px)
- [ ] Exact label font (12px, 400)
- [ ] Exact spacing (4px icon-label)
- [ ] Exact colors (active/inactive)
- [ ] Exact background colors
- [ ] Exact border and shadow

---

### Component 10: Toast Notification
**Used On:** Dashboard (Save status)
**Type:** Notification

**Specifications:**
```
Container:
  - Height: 44px
  - Width: 100% - 24px margins
  - Padding: 12px 16px
  - Border Radius: 8px
  - Background: #1A1A1A
  - Position: Fixed bottom (above nav bar)
  - Margin: 12px
  - Z-Index: 50
  - Box Shadow: 0 4px 12px rgba(0,0,0,0.15)

Layout:
  - Display: Flex
  - Align Items: Center
  - Justify Content: Flex-start
  - Gap: 8px

Icon:
  - Size: 16x16px
  - Color: #FFFFFF
  - Margin Right: 8px

Text:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #FFFFFF
  - Line Height: 16px

Animation:
  - Entrance: Fade in + slide up (200ms)
  - Duration on screen: 3 seconds
  - Exit: Fade out (200ms)

Color Variations:
  - Success: #4CAF50 (instead of #1A1A1A)
  - Error: #F44336 (instead of #1A1A1A)
  - Info: #2196F3 (instead of #1A1A1A)
```

**PWA Matching Points:**
- [ ] Exact height (44px)
- [ ] Exact padding (12px 16px)
- [ ] Exact border radius (8px)
- [ ] Exact background color
- [ ] Exact font size (12px)
- [ ] Exact icon size (16x16px)
- [ ] Exact spacing (8px gap)
- [ ] Exact animation timing

---

## SCREEN 1: LOGIN

### Component 1.1: Logo Container
**Location:** Top of screen, centered
**Type:** Image/Logo

**Specifications:**
```
Image:
  - Size: 64x64px
  - Border Radius: 0px (square)
  - Margin Bottom: 12px
  - Display: Centered
  - Background: None
  - Aspect Ratio: 1:1

Container:
  - Width: 100%
  - Display: Flex
  - Justify Content: Center
  - Padding Top: 48px
  - Padding Bottom: 0px
```

**PWA Matching Points:**
- [ ] Exact logo size (64x64px)
- [ ] Exact logo margins (12px below)
- [ ] Logo centered on screen
- [ ] Exact top padding (48px)

---

### Component 1.2: App Title "Ageless"
**Location:** Below logo
**Type:** Typography (Heading)

**Specifications:**
```
Text:
  - Content: "Ageless"
  - Font Size: 28px
  - Font Weight: 700
  - Color: #667eea
  - Text Alignment: Center
  - Letter Spacing: 0px
  - Line Height: 36px

Container:
  - Width: 100%
  - Margin Bottom: 8px
  - Display: Flex
  - Justify Content: Center
```

**PWA Matching Points:**
- [ ] Exact text "Ageless"
- [ ] Exact font size (28px)
- [ ] Exact font weight (700)
- [ ] Exact color (#667eea)
- [ ] Exact margin below (8px)

---

### Component 1.3: Tagline
**Location:** Below app title
**Type:** Typography (Subtitle)

**Specifications:**
```
Text:
  - Content: "Your Fitness Journey Starts Here"
  - Font Size: 14px
  - Font Weight: 400
  - Color: #666666
  - Text Alignment: Center
  - Letter Spacing: 0px
  - Line Height: 20px

Container:
  - Width: 100%
  - Margin Bottom: 32px
  - Display: Flex
  - Justify Content: Center
  - Padding Horizontal: 24px
```

**PWA Matching Points:**
- [ ] Exact tagline text
- [ ] Exact font size (14px)
- [ ] Exact color (#666666)
- [ ] Exact margin below (32px)

---

### Component 1.4: Email Input
**Location:** Below tagline
**Type:** Form Input (inherits from Global Component 3)

**Screen-Specific Variations:**
```
Label: "Email Address"
Placeholder: "Enter your email..."
Width: 100%
Margin Bottom: 16px
Margin Horizontal: 24px
```

**PWA Matching Points:**
- [ ] Label text "Email Address"
- [ ] Placeholder text "Enter your email..."
- [ ] Inherits all global input specifications

---

### Component 1.5: Password Input
**Location:** Below email input
**Type:** Form Input (inherits from Global Component 4)

**Screen-Specific Variations:**
```
Label: "Password"
Placeholder: "Enter your password..."
Width: 100%
Margin Bottom: 16px
Margin Horizontal: 24px
Icon: Eye icon (visibility toggle)
```

**PWA Matching Points:**
- [ ] Label text "Password"
- [ ] Placeholder text "Enter your password..."
- [ ] Visibility toggle icon present
- [ ] Inherits all global input specifications

---

### Component 1.6: Save User ID Checkbox
**Location:** Below password input
**Type:** Checkbox (inherits from Global Component 5)

**Screen-Specific Variations:**
```
Label: "Remember my user ID"
Width: 100%
Margin Bottom: 24px
Margin Horizontal: 24px
Hit Target Height: 44px
```

**PWA Matching Points:**
- [ ] Checkbox size (20x20px)
- [ ] Label text "Remember my user ID"
- [ ] Exact spacing from password (24px below)
- [ ] Inherits all global checkbox specifications

---

### Component 1.7: Sign In Button
**Location:** Below checkbox
**Type:** Button (inherits from Global Component 1)

**Screen-Specific Variations:**
```
Text: "Sign In"
Height: 52px
Width: 100% - 48px margins
Margin Horizontal: 24px
Margin Bottom: 12px
Loading State: Show spinner
```

**PWA Matching Points:**
- [ ] Button text "Sign In"
- [ ] Exact height (52px)
- [ ] Exact margins (24px horizontal)
- [ ] Exact gradient colors
- [ ] Inherits all global button specifications

---

### Component 1.8: Create Account Button
**Location:** Below Sign In button
**Type:** Secondary Button (inherits from Global Component 2)

**Screen-Specific Variations:**
```
Text: "Create Account"
Height: 44px
Width: 100% - 48px margins
Margin Horizontal: 24px
Margin Bottom: 24px
```

**PWA Matching Points:**
- [ ] Button text "Create Account"
- [ ] Exact height (44px)
- [ ] Exact margins (24px horizontal)
- [ ] Exact border color (#667eea)
- [ ] Inherits all global secondary button specifications

---

### Component 1.9: Forgot Password Link
**Location:** Below buttons
**Type:** Typography (Link)

**Specifications:**
```
Text:
  - Content: "Forgot Password?"
  - Font Size: 12px
  - Font Weight: 400
  - Color: #667eea
  - Text Decoration: Underline
  - Text Alignment: Center

Container:
  - Width: 100%
  - Margin Top: 24px
  - Display: Flex
  - Justify Content: Center
  - Hit Target: 44px height
```

**PWA Matching Points:**
- [ ] Link text "Forgot Password?"
- [ ] Exact font size (12px)
- [ ] Exact color (#667eea)
- [ ] Underline decoration present
- [ ] Centered alignment

---

### Component 1.10: Error Message Container
**Location:** Below input field (when error occurs)
**Type:** Error Message

**Specifications:**
```
Container:
  - Background: #FFEBEE
  - Border: 1px solid #F44336
  - Border Radius: 8px
  - Padding: 12px 16px
  - Margin: 8px 24px 0 24px
  - Display: Flex
  - Align Items: Center
  - Gap: 8px

Icon:
  - Size: 16x16px
  - Color: #F44336
  - Type: Error icon

Text:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #F44336
  - Line Height: 16px

Animation:
  - Entrance: Fade in (200ms)
  - Exit: Fade out (200ms)
```

**PWA Matching Points:**
- [ ] Exact background color (#FFEBEE)
- [ ] Exact border color (#F44336)
- [ ] Exact padding (12px 16px)
- [ ] Exact icon size (16x16px)
- [ ] Exact font size (12px)

---

## SCREEN 2: REGISTER

[Continuing with all Screen 2 components: 2.1-2.12...]

### Component 2.1: Header Container
**Location:** Top section
**Type:** Container

**Specifications:**
```
Container:
  - Background: #FFFFFF
  - Width: 100%
  - Padding Top: 16px (safe area)
  - Padding Bottom: 0px

Logo:
  - Size: 48x48px (smaller than login)
  - Margin Bottom: 12px
  - Centered
```

**PWA Matching Points:**
- [ ] Exact logo size (48x48px vs 64x64px on login)
- [ ] Exact padding top (16px)

---

### Component 2.2: Register Title
**Location:** Below logo
**Type:** Typography (Heading)

**Specifications:**
```
Text:
  - Content: "Create Your Account"
  - Font Size: 28px
  - Font Weight: 700
  - Color: #667eea
  - Text Alignment: Center
  - Margin Bottom: 8px
```

**PWA Matching Points:**
- [ ] Exact title text
- [ ] Exact font size (28px)
- [ ] Exact color (#667eea)

---

### Component 2.3: Register Subtitle
**Type:** Typography

**Specifications:**
```
Text:
  - Content: "Start your fitness journey"
  - Font Size: 14px
  - Font Weight: 400
  - Color: #666666
  - Text Alignment: Center
  - Margin Bottom: 32px
```

**PWA Matching Points:**
- [ ] Exact subtitle text
- [ ] Exact font size (14px)
- [ ] Exact color (#666666)

---

### Component 2.4: Email Input
**Type:** Form Input (Global Component 3)
**Label:** "Email Address"

---

### Component 2.5: Password Input
**Type:** Form Input (Global Component 4)
**Label:** "Password"

---

### Component 2.6: Password Requirements Indicator
**Location:** Below password input
**Type:** Custom Container

**Specifications:**
```
Container:
  - Background: #F5F5F5
  - Border: 1px solid #E0E0E0
  - Border Radius: 8px
  - Padding: 12px 16px
  - Margin: 12px 24px 0 24px
  - Width: 100% - 48px

Requirements List:
  - Display: Flex column
  - Gap: 8px between items

Per Requirement Item:
  - Display: Flex
  - Align Items: Center
  - Gap: 8px

Checkmark Icon:
  - Size: 12x10px
  - Color: #4CAF50 (when met)
  - Color: #CCCCCC (when not met)
  - Type: Checkmark

Text:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #1A1A1A
  - Line Height: 16px

Requirements:
  1. "At least 8 characters"
  2. "One uppercase letter"
  3. "One number"
  4. "One special character"

Animation:
  - Icon color change: 150ms
  - Smooth transition on each requirement met
```

**PWA Matching Points:**
- [ ] Exact container background (#F5F5F5)
- [ ] Exact border color (#E0E0E0)
- [ ] Exact padding (12px 16px)
- [ ] Exact icon size (12x10px)
- [ ] Exact checkmark colors (both states)
- [ ] Exact text font size (12px)
- [ ] Exact spacing between items (8px)
- [ ] All 4 requirements listed exactly

---

### Component 2.7: Confirm Password Input
**Type:** Form Input (Global Component 4)
**Label:** "Confirm Password"

**Addition:**
```
Password Match Indicator (Right side):
  - When Matches: ✓ Green checkmark (16x16px, #4CAF50)
  - When Doesn't Match: ✗ Red X (16x16px, #F44336)
  - Position: 16px from right edge
  - Animation: 150ms appearance

Text Indicator:
  - Font Size: 10px
  - Color: #4CAF50 (matching) or #F44336 (not matching)
  - Position: Below input
```

**PWA Matching Points:**
- [ ] Match indicator present
- [ ] Exact icon size (16x16px)
- [ ] Exact colors for both states
- [ ] Exact position (16px from right)

---

### Component 2.8: Fitness Goal Label
**Location:** Below confirm password
**Type:** Typography (Label)

**Specifications:**
```
Text:
  - Content: "Fitness Goal (Optional)"
  - Font Size: 14px
  - Font Weight: 500
  - Color: #1A1A1A
  - Margin Bottom: 8px
  - Margin Horizontal: 24px
```

**PWA Matching Points:**
- [ ] Exact label text
- [ ] Exact font size (14px)
- [ ] Exact font weight (500)

---

### Component 2.9: Radio Button Group (Fitness Goals)
**Location:** Below fitness goal label
**Type:** Radio Button Group (inherits from Global Component 6)

**Specifications:**
```
Container:
  - Display: Flex column
  - Margin Horizontal: 24px
  - Gap: 8px between options
  - Margin Bottom: 20px

Options (4 total):
  1. "Lose Weight"
  2. "Build Muscle"
  3. "General Fitness"
  4. "Athletic Performance"

Per Option:
  - Height: 40px
  - Display: Flex
  - Align Items: Center
  - Padding: 4px 0

Selected Option:
  - Background: #E8ECFF (light purple)
  - Padding: 8px 12px
  - Border Radius: 8px
  - Margin: 4px -12px
```

**PWA Matching Points:**
- [ ] All 4 options listed exactly
- [ ] Exact radio button size (20x20px)
- [ ] Exact spacing (8px between options)
- [ ] Exact selected state background (#E8ECFF)
- [ ] Exact font size (14px)

---

### Component 2.10: Terms & Privacy Checkbox
**Location:** Below fitness goal options
**Type:** Checkbox (Global Component 5)

**Specifications:**
```
Checkbox Size: 20x20px
Margin Bottom: 24px
Margin Horizontal: 24px

Label Text:
  - Content: "I agree to Terms of Service and Privacy Policy"
  - Font Size: 12px
  - Font Weight: 400
  - Color: #1A1A1A
  - Line Height: 16px

Links in Text:
  - "Terms of Service": Color #667eea, underline
  - "Privacy Policy": Color #667eea, underline

Required:
  - Cannot submit form without checking
  - Show error if not checked
```

**PWA Matching Points:**
- [ ] Exact label text
- [ ] Exact checkbox size (20x20px)
- [ ] Exact font size (12px)
- [ ] Link colors (#667eea)
- [ ] Links underlined

---

### Component 2.11: Create Account Button
**Type:** Primary Button (Global Component 1)

**Specifications:**
```
Text: "Create Account"
Height: 52px
Width: 100% - 48px
Margin Horizontal: 24px
Margin Bottom: 24px

Disabled State:
  - Opacity: 0.5
  - Disabled until:
    [ ] Email filled
    [ ] Password filled
    [ ] Confirm password matches
    [ ] Password meets all requirements
    [ ] Fitness goal selected
    [ ] Terms accepted
```

**PWA Matching Points:**
- [ ] Exact button text
- [ ] Exact disabled state conditions (all 6 met)
- [ ] Inherits global button specs

---

### Component 2.12: Sign In Link
**Location:** Below Create Account button
**Type:** Typography (Link)

**Specifications:**
```
Text:
  - Content: "Already have an account? Sign In"
  - Font Size: 12px
  - Font Weight: 400
  - Color: #1A1A1A
  - Text Alignment: Center
  - Margin Top: 16px
  - Margin Bottom: 32px

Link Part:
  - "Sign In": Color #667eea, underline
  - Hit Target: 44px height
```

**PWA Matching Points:**
- [ ] Exact text
- [ ] Exact font size (12px)
- [ ] Link color (#667eea)
- [ ] Link underlined

---

## SCREEN 3: HOME

[Components 3.1-3.15: Hero section, feature cards, stats, getting started, footer...]

### Component 3.1: Hero Section Container
**Location:** Top of screen
**Type:** Container

**Specifications:**
```
Container:
  - Height: 280px (flexible, min 200px)
  - Width: 100%
  - Background: Linear Gradient (#667eea 0% → #764ba2 100°)
  - Padding: 32px 24px
  - Safe Area Top: 16px (adjust padding)
  - Display: Flex flex-column
  - Justify Content: Center
  - Align Items: Center
```

**PWA Matching Points:**
- [ ] Exact gradient colors (#667eea → #764ba2)
- [ ] Exact gradient angle (135 degrees)
- [ ] Exact height (280px)
- [ ] Exact padding (32px 24px)

---

### Component 3.2: Hero Logo
**Type:** Image

**Specifications:**
```
Image:
  - Size: 64x64px
  - Border Radius: 0px
  - Margin Bottom: 16px
  - Background: None
```

**PWA Matching Points:**
- [ ] Exact size (64x64px)
- [ ] Exact margin below (16px)

---

### Component 3.3: Hero Headline
**Type:** Typography (Heading)

**Specifications:**
```
Text:
  - Content: "Transform Your Fitness"
  - Font Size: 32px
  - Font Weight: 700
  - Color: #FFFFFF
  - Text Alignment: Center
  - Line Height: 40px
  - Margin Bottom: 8px
```

**PWA Matching Points:**
- [ ] Exact text
- [ ] Exact font size (32px)
- [ ] Exact color (#FFFFFF)

---

### Component 3.4: Hero Subheading
**Type:** Typography

**Specifications:**
```
Text:
  - Content: "Track workouts, achieve goals, build habits"
  - Font Size: 14px
  - Font Weight: 400
  - Color: #FFFFFF (80% opacity = rgba(255,255,255,0.8))
  - Text Alignment: Center
  - Line Height: 20px
  - Margin Bottom: 32px
```

**PWA Matching Points:**
- [ ] Exact text
- [ ] Exact font size (14px)
- [ ] Exact color with opacity (80%)

---

### Component 3.5-3.7: Feature Cards Group
**Location:** Overlapping hero section
**Type:** Card Grid

**Container Specifications:**
```
Container:
  - Position: Relative
  - Top: -32px (overlap effect)
  - Width: 100%
  - Display: Grid
  - Grid Template Columns: 1fr 1fr 1fr
  - Gap: 8px horizontal
  - Padding Horizontal: 24px
  - Padding Vertical: 0px
  - Margin Bottom: 16px

Per Card:
  - Height: 120px
  - Padding: 16px 12px
  - Border Radius: 12px
  - Background: #FFFFFF
  - Box Shadow: 0 4px 8px rgba(0,0,0,0.12)
  - Display: Flex flex-column
  - Justify Content: Center
  - Align Items: Center
  - Gap: 8px
```

**Card 3.5: Track Progress**
```
Icon: 📊 (40x40px)
Title:
  - Text: "Track Progress"
  - Font Size: 14px
  - Font Weight: 500
  - Color: #1A1A1A
  - Text Alignment: Center
```

**Card 3.6: Smart Workouts**
```
Icon: 💪 (40x40px)
Title:
  - Text: "Smart Workouts"
  - Font Size: 14px
  - Font Weight: 500
  - Color: #1A1A1A
  - Text Alignment: Center
```

**Card 3.7: Offline Ready**
```
Icon: 📱 (40x40px)
Title:
  - Text: "Offline Ready"
  - Font Size: 14px
  - Font Weight: 500
  - Color: #1A1A1A
  - Text Alignment: Center
```

**PWA Matching Points (All Cards):**
- [ ] Exact icon size (40x40px)
- [ ] Exact card height (120px)
- [ ] Exact padding (16px 12px)
- [ ] Exact title font size (14px)
- [ ] Exact card shadow
- [ ] Exact gap between cards (8px)
- [ ] Exact overlap effect (-32px top margin)

---

### Component 3.8: Stats Section Title
**Location:** Below feature cards
**Type:** Typography

**Specifications:**
```
Text:
  - Content: "Why Ageless?"
  - Font Size: 24px
  - Font Weight: 600
  - Color: #1A1A1A
  - Text Alignment: Left
  - Margin Bottom: 16px
  - Margin Horizontal: 24px
```

**PWA Matching Points:**
- [ ] Exact text
- [ ] Exact font size (24px)
- [ ] Exact font weight (600)

---

### Component 3.9-3.11: Stats Cards Group
**Location:** Below stats title
**Type:** Stat Card Grid

**Container Specifications:**
```
Container:
  - Width: 100%
  - Display: Grid
  - Grid Template Columns: 1fr 1fr 1fr
  - Gap: 8px
  - Padding Horizontal: 24px
  - Margin Bottom: 24px

Per Stat:
  - Flex: 1
  - Text Alignment: Center

Number:
  - Font Size: 18px
  - Font Weight: 700
  - Color: #667eea
  - Line Height: 22px
  - Margin Bottom: 4px

Label:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666
  - Line Height: 16px
```

**Stat 3.9: Active Users**
```
Number: "10K+"
Label: "Active Users"
```

**Stat 3.10: Workouts Logged**
```
Number: "1M+"
Label: "Workouts Logged"
```

**Stat 3.11: User Satisfaction**
```
Number: "98%"
Label: "User Satisfaction"
```

**PWA Matching Points (All Stats):**
- [ ] Exact number font size (18px, weight 700)
- [ ] Exact label font size (12px, weight 400)
- [ ] Exact number color (#667eea)
- [ ] Exact label color (#666666)
- [ ] Exact spacing between number and label (4px)

---

### Component 3.12: Getting Started Title
**Type:** Typography

**Specifications:**
```
Text:
  - Content: "Getting Started"
  - Font Size: 24px
  - Font Weight: 600
  - Color: #1A1A1A
  - Text Alignment: Left
  - Margin Bottom: 16px
  - Margin Horizontal: 24px
```

**PWA Matching Points:**
- [ ] Exact text "Getting Started"
- [ ] Exact font size (24px)

---

### Component 3.13-3.16: Feature List Items
**Location:** Below getting started title
**Type:** List Items

**Container:**
```
- Display: Flex column
- Padding Horizontal: 0px
- Margin Bottom: 32px
```

**Per Item (Height: 60px min):**
```
- Padding: 12px 24px
- Border Bottom: 1px solid #E0E0E0
- Last Item: No border bottom
- Display: Flex
- Align Items: Center
- Gap: 12px
- Height: Min 60px

Icon:
  - Size: 32x32px
  - Position: Left

Content:
  - Display: Flex flex-column
  - Flex: 1

Feature Name:
  - Font Size: 16px
  - Font Weight: 600
  - Color: #1A1A1A
  - Margin Bottom: 4px

Description:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666
  - Line Height: 16px

Right Arrow:
  - Icon: → (20x20px)
  - Color: #666666
  - Position: Right
```

**Item 3.13: Full-Body Workouts**
```
Icon: 🏋️
Name: "Full-Body Workouts"
Description: "Track multiple exercise types"
```

**Item 3.14: Weekly Progress**
```
Icon: 📈
Name: "Weekly Progress"
Description: "See your improvements over time"
```

**Item 3.15: Works Offline**
```
Icon: 💾
Name: "Works Offline"
Description: "Never lose your data"
```

**Item 3.16: Secure & Private**
```
Icon: 🔒
Name: "Secure & Private"
Description: "Your data stays with you"
```

**PWA Matching Points (All Items):**
- [ ] Exact icon size (32x32px)
- [ ] Exact item height (60px min)
- [ ] Exact padding (12px 24px)
- [ ] Exact feature name font (16px, weight 600)
- [ ] Exact description font (12px, weight 400)
- [ ] Exact spacing (12px gap icon-content)
- [ ] Border present and color (#E0E0E0)

---

### Component 3.17: Get Started Button
**Location:** Below feature list
**Type:** Primary Button (Global Component 1)

**Specifications:**
```
Text: "Get Started"
Height: 56px
Width: 100% - 48px
Margin Horizontal: 24px
Margin Top: 32px
Margin Bottom: 12px
```

**PWA Matching Points:**
- [ ] Exact button text
- [ ] Exact height (56px)
- [ ] Exact margins

---

### Component 3.18: Sign In Link
**Location:** Below Get Started button
**Type:** Typography (Link)

**Specifications:**
```
Text:
  - Content: "Already using Ageless? Sign In"
  - Font Size: 14px
  - Font Weight: 400
  - Color: #1A1A1A
  - Text Alignment: Center
  - Margin Bottom: 32px

Link Part:
  - "Sign In": Color #667eea, underline
```

**PWA Matching Points:**
- [ ] Exact text
- [ ] Exact font size (14px)
- [ ] Link color and underline

---

### Component 3.19: Footer Section
**Location:** Bottom of screen
**Type:** Container

**Specifications:**
```
Container:
  - Background: #F5F5F5
  - Padding: 24px 24px 40px 24px
  - Width: 100%
  - Border Top: None

Links Row:
  - Display: Flex
  - Justify Content: Center
  - Gap: 16px
  - Margin Bottom: 8px
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666

Links:
  1. "Privacy" (link)
  2. "Terms" (link)
  3. "Contact" (link)

Copyright:
  - Text: "© 2026 Ageless. All rights reserved."
  - Font Size: 10px
  - Font Weight: 400
  - Color: #CCCCCC
  - Text Alignment: Center
  - Margin Top: 8px
```

**PWA Matching Points:**
- [ ] Exact background color (#F5F5F5)
- [ ] Exact footer padding (24px 24px 40px 24px)
- [ ] Exact link spacing (16px)
- [ ] Exact text colors (both sections)
- [ ] Exact copyright text

---

[Continuing with Screens 4-9 components in same detailed format...]

---

## SCREEN 4: DASHBOARD

### Component 4.1: Fixed Header
**Type:** Header

**Specifications:**
```
Container:
  - Height: 64px (with safe area)
  - Background: #FFFFFF
  - Border Bottom: 1px solid #E0E0E0
  - Padding: 16px 24px (adjusted for safe area)
  - Position: Fixed top
  - Z-Index: 50
  - Display: Flex
  - Justify Content: Space-between
  - Align Items: Center

Title:
  - Text: "Today's Workout"
  - Font Size: 18px
  - Font Weight: 600
  - Color: #1A1A1A

Menu Button (Right):
  - Icon: ⋯ (24x24px)
  - Color: #666666
  - Hit Target: 44x44px
```

**PWA Matching Points:**
- [ ] Exact height (64px)
- [ ] Exact title text and font
- [ ] Exact menu icon size (24x24px)

---

### Component 4.2: Sticky Date Picker
**Type:** Date Navigation

**Specifications:**
```
Container:
  - Height: 56px
  - Background: #FFFFFF
  - Border Bottom: 1px solid #E0E0E0
  - Padding: 12px 24px
  - Position: Sticky top (below fixed header)
  - Z-Index: 40
  - Display: Flex
  - Justify Content: Space-between
  - Align Items: Center
  - Margin Top: 64px (account for fixed header)

Left Arrow:
  - Icon Size: 32x32px
  - Color: #667eea
  - Hit Target: 44x44px
  - Disabled Opacity: 0.3 (at boundaries)

Date Display:
  - Font Size: 14px
  - Font Weight: 500
  - Color: #1A1A1A
  - Text Alignment: Center
  - Format: "January 11, 2026"

Right Arrow:
  - Icon Size: 32x32px
  - Color: #667eea
  - Hit Target: 44x44px
  - Disabled Opacity: 0.3 (at boundaries)

Animation:
  - Arrow press: 100ms scale 0.9
```

**PWA Matching Points:**
- [ ] Exact height (56px)
- [ ] Exact arrow icon size (32x32px)
- [ ] Exact arrow color (#667eea)
- [ ] Exact font size (14px)
- [ ] Exact date format
- [ ] Sticky positioning verified

---

### Component 4.3: Progress Card
**Type:** Card

**Specifications:**
```
Container:
  - Width: 100% - 48px
  - Height: 120px
  - Background: #FFFFFF
  - Padding: 16px 20px
  - Border Radius: 12px
  - Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
  - Margin: 24px 24px 0 24px
  - Display: Flex flex-column
  - Justify Content: Space-between

Header Row:
  - Display: Flex
  - Justify Content: Space-between
  - Align Items: Center
  - Margin Bottom: 12px

Title:
  - Text: "Today's Progress"
  - Font Size: 16px
  - Font Weight: 600
  - Color: #1A1A1A

Percentage:
  - Text: "45%"
  - Font Size: 18px
  - Font Weight: 700
  - Color: #667eea
  - Text Alignment: Right

Progress Bar:
  - Height: 8px
  - Background: #E0E0E0
  - Border Radius: 4px
  - Filled Portion:
    - Width: 45% (example)
    - Background: Linear Gradient (#667eea → #764ba2)
    - Border Radius: 4px
    - Animation: Smooth fill on update (300ms)
  - Margin: 12px 0

Exercise Count:
  - Text: "6 of 13 exercises"
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666
```

**PWA Matching Points:**
- [ ] Exact card height (120px)
- [ ] Exact progress bar height (8px)
- [ ] Exact padding (16px 20px)
- [ ] Exact title font (16px, weight 600)
- [ ] Exact percentage font (18px, weight 700)
- [ ] Exact progress bar colors (gradient)
- [ ] Exact count text font (12px)

---

### Component 4.4: Weight Input
**Type:** Form Input with Unit

**Specifications:**
```
Container:
  - Height: 56px
  - Width: 100% - 48px
  - Background: #FFFFFF
  - Padding: 12px 16px
  - Border Radius: 12px
  - Border: 1px solid #E0E0E0
  - Margin: 24px 24px 0 24px
  - Display: Flex
  - Align Items: Center
  - Justify Content: Space-between

Left Section:
  - Label:
    - Text: "Weight"
    - Font Size: 14px
    - Font Weight: 500
    - Color: #1A1A1A

Input Field:
  - Flex: 1
  - Font Size: 14px
  - Font Weight: 400
  - Color: #1A1A1A
  - Placeholder: "Enter weight..."
  - Placeholder Color: #CCCCCC
  - Text Alignment: Right
  - Border: None
  - Background: Transparent
  - Margin Left: 8px

Right Section:
  - Unit:
    - Text: "lbs" or "kg"
    - Font Size: 12px
    - Font Weight: 400
    - Color: #666666
    - Padding Right: 8px

Focus State:
  - Border: 2px solid #667eea
  - Background: #FFFFFF
  - Box Shadow: 0 4px 8px rgba(0,0,0,0.12)
```

**PWA Matching Points:**
- [ ] Exact height (56px)
- [ ] Exact padding (12px 16px)
- [ ] Exact border (1px solid #E0E0E0)
- [ ] Exact label font (14px, weight 500)
- [ ] Exact input font (14px, weight 400)
- [ ] Exact unit font (12px, weight 400)
- [ ] Focus border color (#667eea)
- [ ] Focus border width (2px)

---

### Component 4.5-4.16: Exercise Cards Grid
**Location:** Below weight input
**Type:** Card Grid

**Container Specifications:**
```
Container:
  - Width: 100%
  - Display: Grid
  - Grid Template Columns: 1fr 1fr (2-column)
  - Gap: 16px
  - Padding: 24px 24px 0 24px
  - Margin Bottom: 100px (for nav bar)

Per Card:
  - Height: 140px
  - Background: #FFFFFF
  - Padding: 16px
  - Border Radius: 12px
  - Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
  - Display: Flex flex-column
  - Justify Content: Space-between

Active State:
  - Background: #E8ECFF
  - Border: 2px solid #667eea
```

**Per Card Header:**
```
- Display: Flex
- Justify Content: Space-between
- Align Items: Flex-start
- Margin Bottom: 12px

Exercise Name:
  - Font Size: 16px
  - Font Weight: 600
  - Color: #1A1A1A
  - Flex: 1

Target Sets:
  - Text: "8 sets" (example)
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666
```

**Exercise Icon:**
```
- Size: 40x40px
- Emoji or icon
- Margin: 12px 0
```

**Controls (Bottom Row):**
```
- Display: Flex
- Align Items: Center
- Justify Content: Space-between
- Gap: 8px

Minus Button:
  - Size: 32x32px
  - Background: #F5F5F5
  - Border Radius: 6px
  - Icon: "-" (16px, #666666)
  - Hit Target: 44x44px

Count Display:
  - Font Size: 14px
  - Font Weight: 700
  - Color: #667eea
  - Text Alignment: Center
  - Min Width: 30px
  - Margin: 0 12px

Plus Button:
  - Size: 32x32px
  - Background: #E8ECFF
  - Border Radius: 6px
  - Icon: "+" (16px, #667eea)
  - Hit Target: 44x44px
  - Active: Color #667eea
```

**Exercise Cards (List):**
```
4.5: Bike
4.6: Abs
4.7: Chest Press
4.8: Leg Press
4.9: Lat
4.10: Military
4.11: Crunch
4.12: Bicep Curls
4.13: Triceps
4.14: Overhead Pull
4.15: Row
[Additional exercises as needed]
```

**PWA Matching Points (All Cards):**
- [ ] Exact card height (140px)
- [ ] Exact card padding (16px)
- [ ] Exact grid gap (16px)
- [ ] Exact icon size (40x40px)
- [ ] Exact button sizes (32x32px)
- [ ] Exact control spacing (8px gap)
- [ ] Exact font sizes (16px name, 12px sets, 14px count)
- [ ] Exact button colors (background, borders)
- [ ] All exercise names listed exactly

---

### Component 4.17: Toast Notification
**Type:** Notification (Global Component 10)
**Location:** Bottom of screen (above nav bar)

**Screen-Specific Variations:**
```
Position: 12px above bottom nav
Content Examples:
  - "Saved to offline queue"
  - "Workout saved"
  - "Sync complete"
```

**PWA Matching Points:**
- [ ] Inherits all global toast specifications
- [ ] Correct position above nav bar

---

### Component 4.18: Bottom Navigation Bar
**Type:** Navigation (Global Component 9)
**Active Tab:** Dashboard (first item highlighted)

**PWA Matching Points:**
- [ ] Inherits all global nav bar specifications
- [ ] Dashboard tab active
- [ ] All 4 items present (Dashboard, History, Summary, Profile)

---

## SCREEN 5: HISTORY

[Components 5.1-5.12: Header, table/cards, pagination, pull-to-refresh, empty state...]

### Component 5.1: Fixed Header
**Type:** Header

**Specifications:**
```
Container:
  - Height: 64px
  - Background: #FFFFFF
  - Border Bottom: 1px solid #E0E0E0
  - Padding: 16px 24px (with safe area)
  - Position: Fixed top
  - Z-Index: 50
  - Display: Flex
  - Justify Content: Space-between

Title:
  - Text: "Workout History"
  - Font Size: 18px
  - Font Weight: 600
  - Color: #1A1A1A

Filter Button (Right):
  - Icon: 🔍 (24x24px)
  - Color: #666666
  - Hit Target: 44x44px
```

**PWA Matching Points:**
- [ ] Title text "Workout History" (not "History")
- [ ] Exact font size (18px)
- [ ] Filter icon present

---

### Component 5.2: Desktop Table View (768px+)
**Type:** Table

**Specifications:**
```
Container:
  - Width: 100%
  - Margin: 0 24px
  - Background: #FFFFFF
  - Border Collapse: Collapse

Table Header:
  - Height: 48px
  - Background: Linear Gradient (#667eea → #764ba2)
  - Color: #FFFFFF
  - Position: Sticky top
  - Z-Index: 10

Header Cells:
  - Padding: 12px 16px
  - Text Alignment: Center
  - Font Size: 14px
  - Font Weight: 500
  - Border Right: 1px solid rgba(255,255,255,0.2)
  - First Cell: Left alignment

Columns:
  1. "Date" (left)
  2. "Weight"
  3. "Completed"
  4. "Details"
  5. "Actions" (right)

Table Rows:
  - Height: 56px
  - Border Bottom: 1px solid #E0E0E0
  - Background: #FFFFFF
  - Hover: #F5F5F5
  - Even Rows: #F9F9F9

Data Cells:
  - Padding: 12px 16px
  - Font Size: 14px
  - Font Weight: 400
  - Color: #1A1A1A
  - Text Alignment: Center
  - First Cell: Left, bold
  - First Cell Background: #FAFAFA
  - First Cell Even Rows: #F5F5F5

Action Links:
  - Font Size: 12px
  - Color: #667eea
  - Underline: On hover
```

**PWA Matching Points (Desktop Table):**
- [ ] Exact header height (48px)
- [ ] Exact gradient colors (#667eea → #764ba2)
- [ ] Exact row height (56px)
- [ ] Exact cell padding (12px 16px)
- [ ] Exact border colors and widths
- [ ] All 5 columns present
- [ ] Exact font sizes and colors
- [ ] Hover states correct

---

### Component 5.3: Mobile Card View (<768px)
**Type:** Card List

**Specifications:**
```
Container:
  - Padding: 16px 24px
  - Display: Flex flex-column
  - Gap: 12px

Per Card:
  - Width: 100%
  - Background: #FFFFFF
  - Padding: 16px
  - Border Radius: 12px
  - Box Shadow: 0 2px 8px rgba(0,0,0,0.1)

Card Header:
  - Display: Flex
  - Justify Content: Space-between
  - Align Items: Center
  - Margin Bottom: 8px

Date:
  - Font Size: 16px
  - Font Weight: 600
  - Color: #1A1A1A
  - Text: "January 11, 2026"

Completion:
  - Font Size: 14px
  - Font Weight: 400
  - Color: #4CAF50
  - Text: "13/13"
  - Right aligned

Progress Bar:
  - Height: 4px
  - Background: #E0E0E0
  - Filled: 100% #4CAF50
  - Border Radius: 2px
  - Margin: 8px 0

Exercise Summary:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666
  - Max 3 lines before truncation
  - Text: "Bike (12), Abs (8), Chest Press (10)..."

Action Buttons (Bottom):
  - Display: Flex
  - Gap: 8px
  - Margin Top: 12px

Edit Button:
  - Height: 36px
  - Flex: 1
  - Background: #E8ECFF
  - Border Radius: 8px
  - Font: 12px weight 600, #667eea
  - Text: "Edit"

Delete Button:
  - Height: 36px
  - Flex: 1
  - Background: #FFEBEE
  - Border Radius: 8px
  - Font: 12px weight 600, #F44336
  - Text: "Delete"

Expandable Details:
  - Initially hidden
  - Tap to expand
  - Max height: 300px when expanded
  - Background: #F5F5F5
  - Padding: 12px 16px
  - Margin Top: 12px
  - Border Top: 1px solid #E0E0E0
  - Animation: 200ms collapse/expand
```

**PWA Matching Points (Mobile Cards):**
- [ ] Exact card padding (16px)
- [ ] Exact card border radius (12px)
- [ ] Exact button heights (36px)
- [ ] Exact button colors (both variants)
- [ ] Exact font sizes and weights
- [ ] Exact progress bar height (4px)
- [ ] Expandable details present

---

### Component 5.4: Pagination Button
**Type:** Button

**Specifications:**
```
Container:
  - Height: 44px
  - Width: 100% - 48px
  - Margin: 24px 24px
  - Background: #FFFFFF
  - Border: 2px solid #E0E0E0
  - Border Radius: 8px
  - Font Size: 14px
  - Font Weight: 600
  - Color: #1A1A1A
  - Text: "Load More Workouts"
  - Text Alignment: Center

Active State:
  - Border Color: #667eea
  - Cursor: pointer

Pressed State:
  - Opacity: 0.7
```

**PWA Matching Points:**
- [ ] Exact height (44px)
- [ ] Exact border (2px solid #E0E0E0)
- [ ] Exact font (14px, weight 600)
- [ ] Button text "Load More Workouts"
- [ ] Active border color (#667eea)

---

### Component 5.5: Pull-to-Refresh
**Type:** Gesture Indicator

**Specifications:**
```
Trigger Area:
  - Position: Top 64px of screen (below header)
  - Height: 64px (pull distance)

Indicator:
  - Position: Centered above list
  - Icon: Circular refresh arrow (24x24px)
  - Color: #667eea
  - Animation: Rotate 360° on drag

Text:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666
  - Text: "Release to refresh"
  - Shows on sufficient drag

Refresh State:
  - Icon: Spinning (continuous)
  - Visible during data load
  - Duration: ~1-2 seconds
```

**PWA Matching Points:**
- [ ] Trigger area size (64px)
- [ ] Icon size (24x24px)
- [ ] Icon color (#667eea)
- [ ] Text present and color

---

### Component 5.6: Empty State
**Type:** Placeholder State

**Specifications:**
```
Container:
  - Height: 100% - header - nav
  - Display: Flex flex-column
  - Justify Content: Center
  - Align Items: Center
  - Gap: 16px
  - Padding: 24px

Icon:
  - Size: 64x64px
  - Emoji: 📅
  - Color: #CCCCCC
  - Margin Bottom: 12px

Title:
  - Text: "No Workouts Yet"
  - Font Size: 24px
  - Font Weight: 600
  - Color: #1A1A1A
  - Text Alignment: Center

Message:
  - Text: "Get started by logging your first workout"
  - Font Size: 14px
  - Font Weight: 400
  - Color: #666666
  - Text Alignment: Center

Button:
  - Text: "Start Workout"
  - Height: 44px
  - Width: 200px max
  - Style: Gradient button
```

**PWA Matching Points:**
- [ ] Icon size (64x64px)
- [ ] Title font (24px, weight 600)
- [ ] Message text exact
- [ ] Button present and styled

---

### Component 5.7: Bottom Navigation
**Type:** Navigation (Global Component 9)
**Active Tab:** History (second item highlighted)

---

## SCREEN 6: PROFILE

[Components 6.1-6.15: Header, avatar card, stats, settings, logout...]

### Component 6.1: Fixed Header
**Specifications:**
```
Container:
  - Height: 64px
  - Background: #FFFFFF
  - Border Bottom: 1px solid #E0E0E0
  - Padding: 16px 24px

Title:
  - Text: "Profile"
  - Font Size: 18px
  - Font Weight: 600
  - Color: #1A1A1A
```

**PWA Matching Points:**
- [ ] Title text "Profile"
- [ ] Exact font size (18px)

---

### Component 6.2: Avatar Card
**Type:** Card

**Specifications:**
```
Container:
  - Width: 100% - 48px
  - Height: 120px
  - Background: #FFFFFF
  - Padding: 16px
  - Border Radius: 12px
  - Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
  - Margin: 24px 24px 0 24px
  - Display: Flex
  - Align Items: Center
  - Gap: 16px

Avatar:
  - Size: 80x80px
  - Border Radius: 40px (circle)
  - Background: #E8ECFF
  - Border: 3px solid #667eea
  - Display: Flex
  - Justify Content: Center
  - Align Items: Center
  - Content: User initials
    - Font: 24px weight 600, #667eea

User Info:
  - Display: Flex flex-column
  - Flex: 1
  - Gap: 4px

Name:
  - Font Size: 18px
  - Font Weight: 600
  - Color: #1A1A1A

Email:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666

Join Date:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #CCCCCC
  - Text: "Joined 6 months ago"
```

**PWA Matching Points:**
- [ ] Avatar size (80x80px)
- [ ] Avatar border (3px solid #667eea)
- [ ] Avatar border radius (40px = circle)
- [ ] User info spacing (4px gap)
- [ ] Font sizes (18px name, 12px email, 12px date)
- [ ] Exact text for join date

---

### Component 6.3-6.5: Statistics Cards
**Type:** Stat Cards Grid

**Container:**
```
- Width: 100% - 48px
- Display: Grid
- Grid Template Columns: 1fr 1fr 1fr
- Gap: 8px
- Margin: 24px 24px 0 24px
```

**Per Stat:**
```
- Background: #FFFFFF
- Padding: 16px 12px
- Border Radius: 12px
- Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Text Alignment: Center
- Display: Flex flex-column
- Align Items: Center
- Justify Content: Center
- Gap: 4px

Number:
  - Font Size: 24px
  - Font Weight: 700
  - Color: #667eea

Label:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666
```

**Statistics:**
```
6.3: 47 / Days Active
6.4: 156 / Total Workouts
6.5: 2,847 / Total Sets
```

**PWA Matching Points (All Stats):**
- [ ] Exact number font (24px, weight 700)
- [ ] Exact label font (12px, weight 400)
- [ ] Exact number color (#667eea)
- [ ] Exact stat values

---

### Component 6.6: Account Section
**Type:** Settings Section

**Specifications:**
```
Container:
  - Width: 100% - 48px
  - Margin: 24px 24px
  - Background: #FFFFFF
  - Border Radius: 12px
  - Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
  - Overflow: Hidden

Title:
  - Font Size: 16px
  - Font Weight: 600
  - Color: #1A1A1A
  - Padding: 16px 16px 12px 16px
  - Margin Bottom: 0px

List Items:
  - Display: Flex flex-column
  - Border Top: 1px solid #E0E0E0 (between items)

Per Item:
  - Height: 48px
  - Padding: 12px 16px
  - Display: Flex
  - Justify Content: Space-between
  - Align Items: Center
  - Text: 14px weight 400
  - Color: #1A1A1A

Right Element:
  - Arrow icon (16x16px, #666666)
  - OR Toggle switch (44x24px)
```

**Items:**
```
6.6: Change Password (arrow)
6.7: Email Notifications (toggle)
6.8: Push Notifications (toggle)
```

**PWA Matching Points (All Items):**
- [ ] Section title "Account"
- [ ] Exact item height (48px)
- [ ] Exact padding (12px 16px)
- [ ] Exact font size (14px)
- [ ] Borders between items
- [ ] Right elements correct (arrow or toggle)

---

### Component 6.9: Preferences Section
**Type:** Settings Section (Same styling as Component 6.6)

**Items:**
```
6.9: Dark Mode (toggle)
6.10: Weight Units (shows "Pounds", arrow)
6.11: Language (shows "English", arrow)
```

---

### Component 6.12: About Section
**Type:** Settings Section (Same styling)

**Items:**
```
6.12: App Version (shows "1.0.0", no arrow)
6.13: Privacy Policy (arrow)
6.14: Terms of Service (arrow)
6.15: Contact Support (arrow)
```

---

### Component 6.16: Danger Zone Section
**Type:** Settings Section with Warning Styling

**Specifications:**
```
Container: Same as other sections

Title:
  - Text: "Danger Zone"
  - Font Size: 16px
  - Font Weight: 600
  - Color: #F44336 (red instead of black)

Delete Account Button:
  - Height: 48px
  - Background: #FFEBEE (light red)
  - Border: 2px solid #F44336
  - Border Radius: 12px
  - Font: 16px weight 600, #F44336
  - Text: "Delete Account"
  - Margin: 12px 0 16px 0

Active State:
  - Background: #F44336
  - Color: #FFFFFF
```

**PWA Matching Points:**
- [ ] Title text "Danger Zone"
- [ ] Title color (#F44336)
- [ ] Button background (#FFEBEE)
- [ ] Button border (#F44336)
- [ ] Button text color (#F44336)

---

### Component 6.17: Logout Button
**Type:** Primary Button (Global Component 1)

**Specifications:**
```
Text: "Logout"
Height: 56px
Width: 100% - 48px
Margin: 24px 24px 40px 24px
Color: #FFFFFF
Background: Gradient (#667eea → #764ba2)
```

**PWA Matching Points:**
- [ ] Button text "Logout"
- [ ] Exact height (56px)
- [ ] Exact margins
- [ ] Gradient colors correct

---

### Component 6.18: Delete Account Confirmation Modal
**Type:** Modal Dialog

**Specifications:**
```
Overlay:
  - Background: rgba(0,0,0,0.5)
  - Position: Fixed fullscreen
  - Z-Index: 200

Card:
  - Width: 90% (min 280px, max 480px)
  - Background: #FFFFFF
  - Border Radius: 16px
  - Padding: 24px
  - Box Shadow: 0 12px 24px rgba(0,0,0,0.15)
  - Position: Centered
  - Display: Flex flex-column
  - Gap: 16px

Title:
  - Text: "Delete Account?"
  - Font Size: 24px
  - Font Weight: 600
  - Color: #1A1A1A

Message:
  - Text: "This action cannot be undone. All your data will be permanently deleted."
  - Font Size: 14px
  - Font Weight: 400
  - Color: #666666
  - Line Height: 20px

Button Group:
  - Display: Flex flex-column
  - Gap: 8px
  - Margin Top: 24px

Cancel Button:
  - Height: 44px
  - Background: #F5F5F5
  - Border: None
  - Border Radius: 8px
  - Font: 16px weight 600, #1A1A1A
  - Text: "Cancel"

Delete Button:
  - Height: 44px
  - Background: #F44336
  - Border: None
  - Border Radius: 8px
  - Font: 16px weight 600, #FFFFFF
  - Text: "Delete Account"

Animation:
  - Entrance: Fade in (200ms)
  - Scale: 0.95 → 1.0 (200ms)
```

**PWA Matching Points:**
- [ ] Modal overlay color (rgba(0,0,0,0.5))
- [ ] Card border radius (16px)
- [ ] Exact dialog text
- [ ] Title font (24px, weight 600)
- [ ] Message font (14px, weight 400)
- [ ] Button sizing and colors

---

### Component 6.19: Bottom Navigation
**Type:** Navigation (Global Component 9)
**Active Tab:** Profile (fourth item highlighted)

---

## SCREEN 7: WORKOUT HISTORY

### Note: Screen 7 (Workout History) uses the same components as Screen 5 (History) with ONE key difference:

**Component 7.1: Header Title**
**Difference:**
```
SCREEN 5 (History):        "Workout History"
SCREEN 7 (Workout History): "Workout History"

✓ Both screens have IDENTICAL titles!
✓ This matches the PWA design specifications
```

**All other components (7.2-7.7) are IDENTICAL to Screen 5:**
- 7.2: Table View (desktop)
- 7.3: Card View (mobile)
- 7.4: Pagination
- 7.5: Pull-to-refresh
- 7.6: Empty state
- 7.7: Bottom Navigation (with History tab active)

**PWA Matching Points:**
- [ ] Verify title matches Screen 5 exactly
- [ ] All components identical to Screen 5
- [ ] No additional components

---

## SCREEN 8: FITNESS SUMMARY

[Components 8.1-8.10: Header, stats, weekly breakdown, rankings...]

### Component 8.1: Fixed Header with Period Selector
**Type:** Header with Dropdown

**Specifications:**
```
Container:
  - Height: 64px
  - Background: #FFFFFF
  - Border Bottom: 1px solid #E0E0E0
  - Padding: 16px 24px
  - Position: Fixed
  - Z-Index: 50
  - Display: Flex
  - Justify Content: Space-between
  - Align Items: Center

Title:
  - Text: "Fitness Summary"
  - Font Size: 18px
  - Font Weight: 600
  - Color: #1A1A1A

Period Selector Button (Right):
  - Button Text: "This Week"
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666
  - Background: #F5F5F5
  - Height: 32px
  - Padding: 8px 12px
  - Border Radius: 6px
  - Hit Target: 44x44px

Dropdown Options:
  - "This Week"
  - "This Month"
  - "All Time"
```

**PWA Matching Points:**
- [ ] Title text "Fitness Summary"
- [ ] Period selector button present
- [ ] Exact button font (12px)
- [ ] Exact button background (#F5F5F5)
- [ ] All dropdown options present

---

### Component 8.2-8.4: Primary Statistics Cards (3 columns)
**Type:** Stat Cards Grid

**Container:**
```
- Width: 100% - 48px
- Display: Grid
- Grid Template Columns: 1fr 1fr 1fr
- Gap: 8px
- Margin: 24px 24px 0 24px
```

**Per Card:**
```
- Height: 100px
- Background: #FFFFFF
- Padding: 16px 12px
- Border Radius: 12px
- Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Display: Flex flex-column
- Align Items: Center
- Justify Content: Center
- Gap: 8px

Icon:
  - Size: 40x40px
  - Emoji or icon

Value:
  - Font Size: 28px
  - Font Weight: 700
  - Color: #667eea
  - Margin Top: 8px

Label:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666
  - Margin Top: 4px
```

**Statistics:**
```
8.2: 📊 / 156 / Total Workouts
8.3: 💪 / 178.5 / Avg Weight
8.4: ⚡ / 2,847 / Total Sets
```

**PWA Matching Points (All Cards):**
- [ ] Exact icon size (40x40px)
- [ ] Exact card height (100px)
- [ ] Exact value font (28px, weight 700)
- [ ] Exact label font (12px, weight 400)
- [ ] Exact stat values

---

### Component 8.5-8.6: Secondary Statistics (2 columns)
**Type:** Stat Cards

**Container:**
```
- Width: 100% - 48px
- Display: Grid
- Grid Template Columns: 1fr 1fr
- Gap: 8px
- Margin: 24px 24px 0 24px
```

**Per Card:**
```
- Height: 80px
- Background: #FFFFFF
- Padding: 16px
- Border Radius: 12px
- Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Display: Flex
- Justify Content: Space-between
- Align Items: Center

Left (Label):
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666

Right (Value):
  - Font Size: 24px
  - Font Weight: 700
  - Color: #667eea
```

**Statistics:**
```
8.5: "Best Week" / "March 15-21"
8.6: "Current Streak" / "12 days"
```

---

### Component 8.7: Weekly Breakdown Title
**Type:** Typography

**Specifications:**
```
Text: "Weekly Breakdown"
Font Size: 18px
Font Weight: 600
Color: #1A1A1A
Margin: 24px 24px 12px 24px
```

---

### Component 8.8-8.N: Weekly Breakdown Cards
**Type:** Card List with Expandable Details

**Per Card:**
```
Container:
  - Width: 100% - 48px
  - Height: 120px (collapsed)
  - Background: #FFFFFF
  - Padding: 16px
  - Border Radius: 12px
  - Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
  - Margin: 0 24px 12px 24px
  - Display: Flex flex-column
  - Justify Content: Space-between

Header:
  - Display: Flex
  - Justify Content: Space-between
  - Align Items: Center
  - Margin Bottom: 12px

Week Date:
  - Font Size: 16px
  - Font Weight: 600
  - Color: #1A1A1A
  - Text: "Jan 8-14"

Completion:
  - Font Size: 14px
  - Font Weight: 400
  - Color: #4CAF50
  - Text: "12/13"

Progress Bar:
  - Height: 4px
  - Background: #E0E0E0
  - Filled: 92% #4CAF50
  - Border Radius: 2px
  - Margin: 8px 0

Exercise Summary:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #666666
  - Text: "Top exercise: Bike (14 sets)"

Expand Arrow (Right):
  - Icon: → (16x16px)
  - Color: #666666
  - Position: Top right
  - Hit Target: 44x44px

Expanded State:
  - Max height: 200px
  - Background: Remains white
  - Exercises listed as grid (2 columns)
  - Per exercise: "Bike - 14 sets"
  - Font: 12px weight 400, #666666
  - Line spacing: 8px
  - Top border: 1px solid #E0E0E0
  - Padding top: 12px
  - Animation: 200ms height transition
```

**PWA Matching Points (All Cards):**
- [ ] Exact card height (120px collapsed)
- [ ] Exact padding (16px)
- [ ] Exact progress bar height (4px)
- [ ] Exact font sizes (16px date, 14px completion, 12px summary)
- [ ] Exact progress bar color (#4CAF50)
- [ ] Expandable content present

---

### Component 8.9-8.N+3: Top Exercises Ranking
**Type:** Ranking List

**Title:**
```
Text: "Top Exercises This Week"
Font Size: 18px
Font Weight: 600
Color: #1A1A1A
Margin: 24px 24px 12px 24px
```

**Container:**
```
- Width: 100% - 48px
- Background: #FFFFFF
- Border Radius: 12px
- Box Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Margin: 0 24px 24px 24px
- Overflow: Hidden
```

**Per Ranking Item:**
```
- Height: 40px
- Padding: 12px 16px
- Border Bottom: 1px solid #E0E0E0
- Last Item: No border bottom
- Display: Flex
- Justify Content: Space-between
- Align Items: Center
- Hover: Background #F5F5F5

Left Section:
  - Display: Flex
  - Align Items: Center
  - Gap: 8px

Rank Number:
  - Font Size: 14px
  - Font Weight: 600
  - Color: #666666
  - Width: 20px
  - Text: "1.", "2.", "3."

Exercise Name:
  - Font Size: 14px
  - Font Weight: 400
  - Color: #1A1A1A

Right Section:
  - Set Count:
    - Font Size: 12px
    - Font Weight: 600
    - Color: #667eea
    - Text: "14 sets"
```

**Example Rankings:**
```
1. Bike - 14 sets
2. Abs - 12 sets
3. Chest Press - 10 sets
```

**PWA Matching Points (All Items):**
- [ ] Exact item height (40px)
- [ ] Exact padding (12px 16px)
- [ ] Exact rank font (14px, weight 600)
- [ ] Exact exercise name font (14px, weight 400)
- [ ] Exact set count font (12px, weight 600)
- [ ] Exact colors (all sections)

---

### Component 8.10: Bottom Navigation
**Type:** Navigation (Global Component 9)
**Active Tab:** Summary (third item highlighted)

---

## SCREEN 9: PROGRESS SUMMARY

[Components 9.1-9.6: Header, scroll hint, table, footer...]

### Component 9.1: Fixed Header with Gradient
**Type:** Header

**Specifications:**
```
Container:
  - Height: 64px (with safe area)
  - Background: Linear Gradient (#667eea → #764ba2)
  - Color: #FFFFFF
  - Padding: 16px 24px (adjusted for safe area)
  - Position: Fixed top
  - Z-Index: 50
  - Display: Flex flex-column
  - Justify Content: Center

Title:
  - Text: "📈 Progress Summary"
  - Font Size: 28px
  - Font Weight: 700
  - Color: #FFFFFF
  - Line Height: 36px

Subtitle:
  - Text: "52-week fitness tracking - Weekly exercise breakdown"
  - Font Size: 12px
  - Font Weight: 400
  - Color: rgba(255,255,255,0.8)
  - Line Height: 16px
  - Margin Top: 0px
```

**PWA Matching Points:**
- [ ] Title text includes emoji 📈
- [ ] Exact title font (28px, weight 700)
- [ ] Exact subtitle text
- [ ] Exact subtitle font (12px, weight 400)
- [ ] Gradient colors (#667eea → #764ba2)

---

### Component 9.2: Sticky Scroll Hint Bar
**Type:** Info Bar

**Specifications:**
```
Container:
  - Height: 32px
  - Background: #F5F5F5
  - Border Bottom: 1px solid #E0E0E0
  - Padding: 8px 24px
  - Position: Sticky (below fixed header)
  - Top: 64px (account for header)
  - Z-Index: 40
  - Display: Flex
  - Justify Content: Center
  - Align Items: Center
  - Text Alignment: Center

Text:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #CCCCCC
  - Content: "↔️ Scroll horizontally to see all columns | ↕️ Scroll vertically to see all 52 weeks"
```

**PWA Matching Points:**
- [ ] Exact height (32px)
- [ ] Exact background color (#F5F5F5)
- [ ] Exact text and formatting
- [ ] Sticky positioning verified

---

### Component 9.3: Table Header
**Type:** Table Element

**Specifications:**
```
Container:
  - Height: 48px
  - Background: Linear Gradient (#667eea → #764ba2)
  - Color: #FFFFFF
  - Position: Sticky top
  - Z-Index: 30
  - Top: 64px + 32px (account for header + hint)

Header Cells:
  - Padding: 12px 8px
  - Text Alignment: Center
  - Font Size: 12px
  - Font Weight: 600
  - Border Right: 1px solid rgba(255,255,255,0.2)
  - First Cell: Left alignment, min-width 130px
  - Last Cell: No right border

Columns (14 total):
  1. "Week Of" (left, wider)
  2. "Avg Wt"
  3. "Bike"
  4. "Abs"
  5. "Chest Press"
  6. "Leg Press"
  7. "Lat"
  8. "Military"
  9. "Crunch"
  10. "Bicep Curls"
  11. "Triceps"
  12. "Overhead Pull"
  13. "Row"
  14. "Total Sets"
```

**PWA Matching Points:**
- [ ] Exact header height (48px)
- [ ] Exact gradient colors
- [ ] All 14 columns listed exactly
- [ ] Exact font size (12px, weight 600)
- [ ] Sticky positioning verified
- [ ] Z-index hierarchy correct

---

### Component 9.4: Table Rows
**Type:** Table Data

**Specifications:**
```
Per Row:
  - Height: 40px
  - Border Bottom: 1px solid #E0E0E0
  - Background: #FFFFFF
  - Even Rows: #F9F9F9
  - Hover: #F5F5F5

Data Cells:
  - Padding: 12px 8px
  - Font Size: 12px
  - Font Weight: 400
  - Color: #1A1A1A
  - Text Alignment: Center
  - Border Right: 1px solid #E0E0E0

First Cell (Week Of):
  - Text Alignment: Left
  - Font Weight: 600
  - Min Width: 130px
  - Background: #FAFAFA
  - Even Row Background: #F5F5F5

Data Format:
  - Week Of: "Jan 7-13" format
  - Avg Wt: Number (e.g., "178.5")
  - Exercises: Number (e.g., "12")
  - Total Sets: Number (e.g., "97")
```

**Example Data Row:**
```
Week Of: "Jan 7-13"
Avg Wt: "178.5"
Bike: "12"
Abs: "8"
Chest Press: "10"
Leg Press: "9"
Lat: "7"
Military: "11"
Crunch: "6"
Bicep Curls: "9"
Triceps: "8"
Overhead Pull: "10"
Row: "7"
Total Sets: "97"
```

**PWA Matching Points (All Rows):**
- [ ] Exact row height (40px)
- [ ] Exact cell padding (12px 8px)
- [ ] Exact font (12px, weight 400 for data)
- [ ] Exact borders and colors
- [ ] All data values match PWA exactly
- [ ] 52-week data complete

---

### Component 9.5: Sticky Footer Hint
**Type:** Info Bar (Fixed Bottom)

**Specifications:**
```
Container:
  - Height: 32px
  - Background: #F5F5F5
  - Border Top: 1px solid #E0E0E0
  - Padding: 8px 24px
  - Position: Fixed bottom
  - Width: 100%
  - Z-Index: 40
  - Display: Flex
  - Justify Content: Center
  - Align Items: Center

Text:
  - Font Size: 12px
  - Font Weight: 400
  - Color: #CCCCCC
  - Content: "Showing 10 of 52 weeks | Last updated: Today"
  - Text Alignment: Center

Strong Text Parts:
  - "10", "52", "Today"
  - Font Weight: 600
  - Color: #1A1A1A
```

**PWA Matching Points:**
- [ ] Exact height (32px)
- [ ] Exact text format
- [ ] Strong text parts bolded
- [ ] Fixed positioning verified

---

### Component 9.6: Empty State
**Type:** Placeholder

**Specifications (if no data):**
```
Icon: 📅 (64x64px)
Title: "No Data Yet"
Message: "Complete your first week to see progress tracking"
Font sizes and styling: Same as Screen 5
```

---

---

## PWA MATCHING FRAMEWORK

### Framework Overview
This framework provides a systematic approach to matching each React Native component to PWA screenshots.

---

### Phase 1: Component Extraction
**Duration:** 1-2 weeks (as screenshots received)
**Purpose:** Catalog existing visual differences

For each screenshot received:

1. **Identify all components visible**
   - Refer to component list above
   - Cross-reference with screen layout

2. **Extract specifications from PWA screenshot**
   - Use color picker for exact hex codes
   - Measure pixel values using design tools
   - Screenshot zoomed details for clarity

3. **Compare to documented specifications**
   - Note any deviations found
   - Document exact differences

4. **Create PWA_COMPONENT_MATCHING_REPORT.md**
   - Per-component comparison table
   - Exact PWA values vs. plan values
   - Recommended specification updates

---

### Phase 2: Specification Refinement
**Duration:** 1 week (after all screenshots analyzed)
**Purpose:** Update specifications to PWA-verified values

1. **Update DESIGN_COMPONENTS_SPECIFICATION.md**
   - Add PWA-verified measurements for each component
   - Note any deviations from plan
   - Add PWA-specific styling notes

2. **Create PWA_COMPONENT_MATCHING_CHECKLIST.md**
   - Per-screen component verification tasks
   - Specific measurements to verify during coding
   - Component interdependency notes

3. **Get team sign-offs**
   - Design lead reviews all comparisons
   - Product manager confirms visual accuracy
   - Development lead confirms feasibility

---

### Phase 3: Implementation with Verification
**Duration:** 4-5 weeks (during development)
**Purpose:** Code components with PWA visual parity

For each screen implementation:

1. **Reference PWA_COMPONENT_MATCHING_CHECKLIST.md**
   - Check exact measurements for each component
   - Verify all sub-components present
   - Confirm spacing and sizing

2. **Compare implemented component to PWA screenshot**
   - Visual side-by-side comparison
   - Pixel-perfect verification
   - Color/typography/spacing confirmation

3. **Iterate until perfect match**
   - Adjust measurements as needed
   - Test on actual device sizes
   - Verify responsive behavior matches PWA

---

### Component Matching Checklist Template

For each component, verify:

```
Component: [Name]
Screen: [Screen Number]
Component ID: [#.#]

Visual Verification:
  [ ] Container dimensions exact (W x H)
  [ ] Padding/margin exact (all sides)
  [ ] Border radius exact
  [ ] Background color exact (hex code)
  [ ] Border color and width exact
  [ ] Box shadow exact values
  [ ] Icon/image size exact
  [ ] Icon/image color exact (if colored)

Typography Verification:
  [ ] Font size exact (px)
  [ ] Font weight exact (100-900)
  [ ] Text color exact (hex code)
  [ ] Line height exact (px or unit)
  [ ] Letter spacing exact (if applicable)
  [ ] Text transformation (none, uppercase, lowercase)

State Verification:
  [ ] Default state matches PWA
  [ ] Hover state matches PWA (if applicable)
  [ ] Active state matches PWA (if applicable)
  [ ] Focused state matches PWA (if applicable)
  [ ] Disabled state matches PWA (if applicable)
  [ ] Loading state matches PWA (if applicable)

Responsiveness Verification:
  [ ] Mobile view (375px) matches PWA
  [ ] Tablet view (600px) matches PWA
  [ ] Desktop view (800px+) matches PWA
  [ ] Breakpoints trigger at correct sizes
  [ ] Spacing adjusts proportionally

Animation Verification (if applicable):
  [ ] Duration exact (ms)
  [ ] Easing function exact (ease-in-out, etc.)
  [ ] Direction correct
  [ ] Staggering correct (if multiple items)

Integration Verification:
  [ ] Component spacing from neighboring components exact
  [ ] Z-index hierarchy correct
  [ ] Scroll behavior correct (fixed, sticky, scrollable)
  [ ] Gesture behavior correct (if applicable)

Notes:
  [Differences from plan]
  [Adjustments made]
  [Concerns or issues]

Status:
  [ ] Complete - Matches PWA exactly
  [ ] Minor adjustments needed
  [ ] Significant rework needed
```

---

### Per-Screen Matching Priority

**Priority 1 (Week 1-2):**
- Screen 1: Login (Components 1.1-1.10)
- Screen 2: Register (Components 2.1-2.12)

**Priority 2 (Week 2-3):**
- Screen 3: Home (Components 3.1-3.19)
- Screen 4: Dashboard (Components 4.1-4.18)

**Priority 3 (Week 3-4):**
- Screen 5: History (Components 5.1-5.7)
- Screen 6: Profile (Components 6.1-6.19)

**Priority 4 (Week 3-4):**
- Screen 7: Workout History (Components 7.1-7.7)
- Screen 8: Fitness Summary (Components 8.1-8.10)
- Screen 9: Progress Summary (Components 9.1-9.6)

**Global Components (Ongoing):**
- Components 1-10 (used throughout all screens)

---

### Success Criteria Per Component

Each component is considered "complete" when:

✅ **All dimensions match PWA** (width, height, padding, margin, spacing)
✅ **All colors match PWA** (background, text, borders, icons)
✅ **All typography matches PWA** (size, weight, line height, color)
✅ **All states match PWA** (default, hover, active, disabled, loading)
✅ **All interactions match PWA** (animations, gestures, transitions)
✅ **Responsive behavior matches PWA** (all breakpoints correct)
✅ **Integration with neighboring components correct** (z-index, spacing, alignment)
✅ **No visual regressions** (consistency across whole screen)

---

### Tools for PWA Matching

**For Color Extraction:**
- Chrome Color Picker extension
- Figma color picker (if PWA is designed in Figma)
- Browser DevTools (inspect element → computed styles)

**For Measurement:**
- Figma (if PWA is in Figma)
- Sketch (if PWA is in Sketch)
- Browser DevTools (inspect element → box model)
- Screenshot + image editing tool (as last resort)

**For Screenshot Comparison:**
- Side-by-side image viewer
- Figma inspection view
- Browser DevTools device emulator
- Actual devices (iPhone, Android)

---

### Common Pitfalls to Avoid

1. **Color Matching Inaccuracy**
   - Ensure hex codes are extracted exactly
   - Account for opacity/alpha values
   - Test on actual devices (screen gamma differences)

2. **Spacing Inconsistency**
   - Padding vs. margin confusion
   - Cumulative spacing between nested elements
   - Safe area adjustments on iOS/Android

3. **Font Rendering Differences**
   - System font rendering varies slightly
   - Test actual size on device vs. design tools
   - Account for line-height and letter-spacing

4. **Icon Size Mismatches**
   - Verify actual pixel size, not perceived size
   - Account for viewBox if SVG
   - Emoji rendering variations across platforms

5. **Z-Index Conflicts**
   - Fixed vs. absolute vs. relative positioning
   - Stacking context creation
   - Modal/overlay layering

6. **Responsive Breakpoint Errors**
   - Exact pixel breakpoints vs. approximate ranges
   - Component behavior at breakpoint boundaries
   - Safe area adjustments at different sizes

---

This framework ensures that every component is verified against PWA screenshots for pixel-perfect visual parity.

