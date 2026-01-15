# Granular Design Refinement Plan
## Ageless React Native Mobile Application - All 9 Screens

**Date:** January 11, 2026
**Scope:** Complete visual design specifications for production refinement
**Target:** High-fidelity, production-ready screens before deployment testing

---

## Table of Contents
1. [Design System Foundation](#design-system-foundation)
2. [Global Design Tokens](#global-design-tokens)
3. [Screen-by-Screen Specifications](#screen-by-screen-specifications)
4. [Navigation System](#navigation-system)
5. [Implementation Priority Matrix](#implementation-priority-matrix)

---

## Design System Foundation

### Design Philosophy
The Ageless app follows a **modern fitness app aesthetic**:
- Clean, minimal interface with functional density
- Progressive disclosure of information
- Emphasis on visual progress and achievement
- Accessibility-first approach
- Mobile-first, gesture-driven design

### Platform Considerations
- **Primary:** iOS 14+ and Android 10+
- **Orientation:** Portrait-first (landscape supported)
- **Safe Areas:** Full notch/safe area support
- **Gesture Support:** Swipe, tap, long-press
- **Animations:** Smooth, 300-400ms transitions

---

## Global Design Tokens

### Color Palette

#### Primary Colors
```
Primary Purple:     #667eea (RGB: 102, 126, 234)
Dark Purple:        #764ba2 (RGB: 118, 75, 162)
Light Purple:       #8B9BF4 (RGB: 139, 155, 244)
Accent:             #667eea
```

#### Semantic Colors
```
Success Green:      #4CAF50 (RGB: 76, 175, 80)
Warning Orange:     #FF9800 (RGB: 255, 152, 0)
Error Red:          #F44336 (RGB: 244, 67, 54)
Info Blue:          #2196F3 (RGB: 33, 150, 243)
```

#### Neutral Colors
```
White:              #FFFFFF
Light Gray:         #F5F5F5 (Backgrounds)
Medium Gray:        #E0E0E0 (Borders)
Dark Gray:          #333333 (Text)
Text Primary:       #1A1A1A (100% opacity)
Text Secondary:     #666666 (66% opacity)
Text Disabled:      #CCCCCC (40% opacity)
```

#### Gradients
```
Primary Gradient:   #667eea → #764ba2 (135deg)
Success Gradient:   #4CAF50 → #45a049
Error Gradient:     #F44336 → #E53935
```

### Typography

#### Font Family
```
Primary:            System font stack
  iOS:              -apple-system
  Android:          Roboto
  Web:              BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
  Fallback:         sans-serif
```

#### Font Sizes
```
H1 (Display):       32px, weight 700, line-height 40px
H2 (Large Title):   28px, weight 700, line-height 36px
H3 (Title):         24px, weight 600, line-height 32px
H4 (Subtitle):      18px, weight 600, line-height 26px
H5 (Label Large):   16px, weight 600, line-height 22px
Body Large:         16px, weight 400, line-height 24px
Body Medium:        14px, weight 400, line-height 20px (default)
Body Small:         12px, weight 400, line-height 16px
Label Medium:       14px, weight 500, line-height 20px
Label Small:        12px, weight 500, line-height 16px
Caption:            10px, weight 400, line-height 14px
```

#### Font Weights
```
Light:              300
Regular:            400
Medium:             500
Semibold:           600
Bold:               700
```

### Spacing Scale (8px Base)
```
0px:                0
4px:                xs
8px:                sm (0.5 unit)
12px:               md (1 unit)
16px:               lg (1.5 units)
24px:               xl (2 units)
32px:               2xl (2.5 units)
40px:               3xl (3 units)
48px:               4xl (4 units)
56px:               5xl (5 units)
64px:               6xl (6 units)
```

### Border Radius
```
None:               0px
Small:              4px
Medium:             8px
Large:              12px
XL:                 16px
Full:               9999px
```

### Shadows
```
Elevation 1:        0 2px 4px rgba(0,0,0,0.1)
Elevation 2:        0 4px 8px rgba(0,0,0,0.12)
Elevation 3:        0 8px 16px rgba(0,0,0,0.15)
Elevation 4:        0 12px 24px rgba(0,0,0,0.15)
```

### Component Sizes

#### Button Heights
```
Small:              32px (padding: 8px 16px)
Medium:             44px (padding: 12px 24px) [Default]
Large:              56px (padding: 16px 32px)
```

#### Input/Field Heights
```
Standard:           48px (padding: 12px 16px)
Small:              40px (padding: 8px 12px)
```

#### Icon Sizes
```
Small:              16px
Medium:             24px (default)
Large:              32px
XL:                 48px
2XL:                64px
```

---

## Screen-by-Screen Specifications

### SCREEN 1: Login Screen

#### 1.1 Overall Structure
```
Safe Area Top Padding:      16px
Container Max Width:        100%
Container Padding:          24px (sides), 32px (vertical)
Safe Area Bottom Padding:   24px
Background:                 White (#FFFFFF)
```

#### 1.2 Layout Sections (Top to Bottom)

**Section A: Header (Logo & Title)**
- Height: Flexible
- Spacing: 48px top padding
- Content:
  - App Logo: 64x64px, center-aligned
  - App Name: "Ageless" or "MindBodyHeart"
    - Font: H2 (28px, weight 700)
    - Color: Primary Purple (#667eea)
    - Margin below logo: 12px
  - Tagline: "Your Fitness Journey Starts Here"
    - Font: Body Medium (14px, weight 400)
    - Color: Text Secondary (#666666)
    - Margin below: 32px

**Section B: Email Input**
- Spacing from header: 32px
- Input Height: 48px
- Input Padding: 12px 16px
- Input Border: 1px solid Medium Gray (#E0E0E0)
- Input Border Radius: 8px
- Input Background: Light Gray (#F5F5F5)
- Input Font: Body Medium (14px, weight 400)
- Label (above input):
  - Font: Label Medium (14px, weight 500)
  - Color: Text Primary (#1A1A1A)
  - Margin below label: 8px
- Placeholder Text:
  - Color: Text Disabled (#CCCCCC)
- Focus State:
  - Border: 2px solid Primary Purple (#667eea)
  - Background: White (#FFFFFF)
  - Shadow: Elevation 2

**Section C: Password Input**
- Spacing from email: 16px
- Same dimensions as email input
- Label: "Password"
- Password Visibility Toggle:
  - Position: Right inside input (16px from edge)
  - Icon Size: 20px
  - Icon Color: Text Secondary (#666666)
  - Hit Target: 44x44px
  - Color on press: Primary Purple (#667eea)

**Section D: Checkbox - Save User ID**
- Spacing from password: 16px
- Checkbox Size: 20x20px
- Border: 2px solid Primary Purple (#667eea)
- Border Radius: 4px
- Checked Fill: Primary Purple (#667eea)
- Checkmark: White, weight 2px, size 12x8px
- Label Text:
  - Font: Body Medium (14px, weight 400)
  - Color: Text Primary (#1A1A1A)
  - Margin left from checkbox: 8px
- Hit Target: 44px height minimum

**Section E: Primary Button - Sign In**
- Spacing from checkbox: 24px
- Width: 100%
- Height: 52px
- Background: Linear gradient (#667eea to #764ba2)
- Text: "Sign In"
  - Font: Label Large (16px, weight 600)
  - Color: White (#FFFFFF)
- Border Radius: 12px
- Active State:
  - Opacity: 0.85
  - Shadow: Elevation 3
- Disabled State:
  - Opacity: 0.5
  - Cursor: Not allowed
- Loading State:
  - Show spinner inside button
  - Disable interaction

**Section F: Secondary Button - Create Account**
- Spacing from Sign In: 12px
- Width: 100%
- Height: 44px
- Background: Transparent
- Border: 2px solid Primary Purple (#667eea)
- Text: "Create Account"
  - Font: Label Large (16px, weight 600)
  - Color: Primary Purple (#667eea)
- Border Radius: 12px
- Active State:
  - Background: Light Gray (#F5F5F5)

**Section G: Footer Links**
- Spacing from buttons: 24px
- Content: "Forgot Password?" (centered)
- Font: Body Small (12px, weight 400)
- Color: Primary Purple (#667eea)
- Text Decoration: Underline
- Hit Target: 44px height

**Section H: Divider & Social (Optional Enhancement)**
- Spacing: 24px above
- Divider: 1px line #E0E0E0 with 12px margins
- Center text: "OR"
  - Font: Body Small (12px, weight 400)
  - Color: Text Secondary (#666666)
  - Background: White (cover line)
- Social buttons below:
  - "Continue with Google" and "Continue with Apple"
  - Height: 44px
  - Width: 100%
  - Spacing between: 12px
  - Border: 1px solid Medium Gray (#E0E0E0)
  - Background: White
  - Border Radius: 8px

#### 1.3 Error States
- Error Message Container:
  - Background: #FFEBEE (light red)
  - Border: 1px solid #F44336
  - Border Radius: 8px
  - Padding: 12px 16px
  - Margin: 8px 0 0 0
  - Position: Below input field
  - Icon: Error icon (red) + text
  - Text Font: Body Small (12px, weight 400)
  - Text Color: #F44336

#### 1.4 Responsive Behavior
- Max Width: 600px (center on large screens)
- Portrait: 100% width - 48px padding
- Landscape: 100% width - 48px padding, reduce header size

---

### SCREEN 2: Register Screen

#### 2.1 Overall Structure
- Same as Login Screen (24px padding, 32px vertical)
- Background: White (#FFFFFF)

#### 2.2 Layout Sections

**Section A: Header**
- Logo: 48x48px (smaller than login)
- Title: "Create Your Account"
  - Font: H2 (28px, weight 700)
  - Color: Primary Purple (#667eea)
- Subtitle: "Start your fitness journey"
  - Font: Body Medium (14px, weight 400)
  - Color: Text Secondary (#666666)
- Spacing below: 32px

**Section B: Email Input**
- Same as login screen
- Label: "Email Address"

**Section C: Password Input**
- Same as login screen
- Label: "Password"
- Visibility toggle: Included

**Section D: Password Requirements Indicator**
- Spacing from password input: 12px
- Container:
  - Background: Light Gray (#F5F5F5)
  - Padding: 12px 16px
  - Border Radius: 8px
  - Border: 1px solid Medium Gray (#E0E0E0)
- Requirements list:
  - Font: Body Small (12px, weight 400)
  - Color: Text Primary (#1A1A1A)
  - Checkmark icon (green when met, gray when not)
  - Requirements:
    1. "At least 8 characters" (12px checkmark icon)
    2. "One uppercase letter" (12px checkmark icon)
    3. "One number" (12px checkmark icon)
    4. "One special character" (12px checkmark icon)
  - Icon spacing: 8px from text
  - Line spacing: 8px between requirements
- Real-time update: Change icons as user types

**Section E: Confirm Password Input**
- Spacing from requirements: 16px
- Same dimensions as password input
- Label: "Confirm Password"
- Show password match indicator:
  - Green checkmark when matches
  - Red X when doesn't match
  - Position: Right side of input

**Section F: Optional Fitness Goal**
- Spacing from confirm password: 20px
- Label: "Fitness Goal (Optional)"
  - Font: Label Medium (14px, weight 500)
  - Color: Text Primary (#1A1A1A)
  - Margin below: 8px
- Radio Button Options:
  - Height: 40px each
  - Spacing between: 8px
  - Options:
    1. ◯ Lose Weight
    2. ◯ Build Muscle
    3. ◯ General Fitness
    4. ◯ Athletic Performance
  - Radio button size: 20x20px
  - Label margin from button: 12px
  - Selected state:
    - Radio: Filled circle with Primary Purple
    - Background: Light Purple (#E8ECFF)
  - Font: Body Medium (14px, weight 400)

**Section G: Terms & Privacy Checkbox**
- Spacing: 20px
- Checkbox: 20x20px, style per login screen
- Label Text: "I agree to Terms of Service and Privacy Policy"
  - Font: Body Small (12px, weight 400)
  - Color: Text Primary (#1A1A1A)
  - Terms link color: Primary Purple (#667eea)
  - Underline: On links
- Required: Cannot proceed without checking

**Section H: Create Account Button**
- Spacing from checkbox: 24px
- Width: 100%
- Height: 52px
- Style: Same as Sign In button (gradient)
- Disabled State:
  - Opacity: 0.5 until all required fields filled
  - Checkmark requirements met
  - Terms accepted

**Section I: Sign In Link**
- Spacing: 16px below button
- Text: "Already have an account? Sign In"
  - Font: Body Small (12px, weight 400)
  - Color: Text Primary (#1A1A1A)
  - "Sign In" link color: Primary Purple (#667eea)
- Text alignment: Center
- Underline: On link only

#### 2.3 Responsive Behavior
- Same as login
- Keep form fields full width
- Stack all elements vertically

---

### SCREEN 3: Home Screen

#### 3.1 Overall Structure
- Background: Linear gradient (top: Primary Purple #667eea, bottom: White)
- Safe Area: Full coverage
- Container Padding: 24px (sides), 0px (top)

#### 3.2 Layout Sections

**Section A: Hero Header**
- Height: 280px (flexible on smaller screens)
- Background: Linear gradient (#667eea → #764ba2)
- Padding: 32px 24px
- Content:
  - Logo: 64x64px, top center
  - Main Headline: "Transform Your Fitness"
    - Font: H1 (32px, weight 700)
    - Color: White (#FFFFFF)
    - Alignment: Center
    - Margin below: 8px
  - Subheading: "Track workouts, achieve goals, build habits"
    - Font: Body Medium (14px, weight 400)
    - Color: White with 80% opacity
    - Alignment: Center
    - Margin below: 32px

**Section B: Feature Cards (3 columns)**
- Spacing from hero: -32px (overlap effect)
- Card height: 120px each
- Card width: 100% width / 3 - 8px margins
- Card padding: 16px 12px
- Card background: White (#FFFFFF)
- Card border radius: 12px
- Card shadow: Elevation 2
- Card spacing: 8px horizontal gap, 16px below group
- Content per card:
  - Icon: 40x40px, centered
  - Title: "Feature Name"
    - Font: Label Medium (14px, weight 500)
    - Color: Text Primary (#1A1A1A)
    - Margin above icon: 8px
    - Text alignment: Center
- Features:
  1. 📊 "Track Progress" with bar chart icon
  2. 💪 "Smart Workouts" with bicep icon
  3. 📱 "Offline Ready" with phone icon

**Section C: Stats Section**
- Background: White (#FFFFFF)
- Padding: 24px 24px 0 24px
- Title: "Why Ageless?"
  - Font: H3 (24px, weight 600)
  - Color: Text Primary (#1A1A1A)
  - Margin below: 16px
- Stats container:
  - 3 stat items side by side
  - Stat spacing: 8px between
  - Stat item structure:
    - Number (e.g., "10K+")
      - Font: H4 (18px, weight 700)
      - Color: Primary Purple (#667eea)
    - Label (e.g., "Active Users")
      - Font: Body Small (12px, weight 400)
      - Color: Text Secondary (#666666)
      - Margin above: 4px
  - Stats:
    1. "10K+" / "Active Users"
    2. "1M+" / "Workouts Logged"
    3. "98%" / "User Satisfaction"

**Section D: Main Content Area**
- Background: White
- Padding: 24px 24px
- Title: "Getting Started"
  - Font: H3 (24px, weight 600)
  - Color: Text Primary (#1A1A1A)
  - Margin below: 16px

**Section E: Feature List**
- List items: 4 major features
- Item height: 60px minimum
- Item padding: 12px 16px
- Item border bottom: 1px solid Medium Gray (#E0E0E0)
- Item layout:
  - Icon: 32x32px on left
  - Content on right:
    - Feature name: Label Large (16px, weight 600)
    - Description: Body Small (12px, weight 400)
    - Color of description: Text Secondary (#666666)
  - Spacing icon to content: 12px
  - Arrow icon on right: 20x20px, Text Secondary
- Features:
  1. 🏋️ "Full-Body Workouts" / "Track multiple exercise types"
  2. 📈 "Weekly Progress" / "See your improvements over time"
  3. 💾 "Works Offline" / "Never lose your data"
  4. 🔒 "Secure & Private" / "Your data stays with you"

**Section F: Call-to-Action**
- Spacing from features: 32px
- Primary Button: "Get Started"
  - Height: 56px
  - Width: 100%
  - Style: Gradient button (#667eea to #764ba2)
  - Font: Label Large (16px, weight 600)
  - Color: White
  - Margin bottom: 12px

**Section G: Secondary Action**
- Text: "Already using Ageless? Sign In"
  - Font: Body Medium (14px, weight 400)
  - Color: Text Primary (#1A1A1A)
  - "Sign In" link: Primary Purple (#667eea), underlined
  - Text alignment: Center

**Section H: Footer**
- Spacing: 32px top
- Height: Auto
- Background: Light Gray (#F5F5F5)
- Padding: 24px 24px 40px
- Content:
  - Links row: "Privacy" | "Terms" | "Contact"
  - Font: Body Small (12px, weight 400)
  - Color: Text Secondary (#666666)
  - Spacing between: 16px
  - Text alignment: Center
  - Copyright line below:
    - "© 2026 Ageless. All rights reserved."
    - Font: Caption (10px, weight 400)
    - Color: Text Disabled (#CCCCCC)
    - Margin above: 8px

#### 3.3 Responsive Behavior
- Mobile portrait: Full-width sections
- Mobile landscape: Reduce hero height to 180px
- Tablet (600px+):
  - Feature cards: 3 in a row
  - Stats: 3 in a row
  - Container max width: 600px, centered
- Desktop (800px+):
  - Container max width: 800px
  - Feature cards: 3 in a row with more spacing
  - Stats: Side by side with more spacing

---

### SCREEN 4: Dashboard Screen

#### 4.1 Overall Structure
- Safe Area: Full coverage
- Background: Light Gray (#F5F5F5)
- Top Bar: Fixed position, sticky
- Content: Scrollable below top bar

#### 4.2 Layout Sections

**Section A: Fixed Header**
- Height: 64px (including safe area)
- Background: White (#FFFFFF)
- Border bottom: 1px solid Medium Gray (#E0E0E0)
- Padding: 16px 24px (with safe area adjustment)
- Layout: Flexbox, space-between
- Left element:
  - Title: "Today's Workout"
    - Font: H4 (18px, weight 600)
    - Color: Text Primary (#1A1A1A)
- Right element:
  - Menu button (three dots)
    - Icon: 24x24px
    - Color: Text Secondary (#666666)
    - Hit target: 44x44px

**Section B: Date Picker (Sticky Header)**
- Position: Below fixed header, sticky on scroll
- Height: 56px
- Background: White (#FFFFFF)
- Padding: 12px 24px
- Border bottom: 1px solid Medium Gray (#E0E0E0)
- Layout: Center
- Content:
  - Date display: "January 11, 2026"
    - Font: Label Medium (14px, weight 500)
    - Color: Text Primary (#1A1A1A)
  - Navigation arrows:
    - Left arrow button: 32x32px, hit target 44x44px
    - Right arrow button: 32x32px, hit target 44x44px
    - Spacing from text: 16px each side
    - Icon color: Primary Purple (#667eea)
    - Active: Full opacity
    - Disabled: 30% opacity (at boundaries)

**Section C: Content Scrollable Area**
- Padding: 24px 24px 100px (bottom padding for nav bar)
- Background: Light Gray (#F5F5F5)
- Scroll behavior: iOS bounce, Android standard

**Section D: Progress Card**
- Width: 100%
- Height: 120px
- Background: White (#FFFFFF)
- Padding: 16px 20px
- Border radius: 12px
- Box shadow: Elevation 1
- Layout:
  - Top row:
    - Title: "Today's Progress"
      - Font: Label Large (16px, weight 600)
      - Color: Text Primary (#1A1A1A)
    - Percentage: "45%"
      - Font: H4 (18px, weight 700)
      - Color: Primary Purple (#667eea)
      - Text alignment: Right
  - Progress bar (below):
    - Height: 8px
    - Width: 100% - 40px (margin adjustment)
    - Background: Medium Gray (#E0E0E0)
    - Border radius: 4px
    - Filled portion:
      - Background: Linear gradient (#667eea to #764ba2)
      - Width: 45% of progress bar
      - Animation: Smooth fill on update
    - Margin top: 12px
  - Bottom row (below progress bar):
    - Items completed: "6 of 13 exercises"
      - Font: Body Small (12px, weight 400)
      - Color: Text Secondary (#666666)

**Section E: Weight Input**
- Spacing from progress: 24px
- Height: 56px
- Padding: 12px 16px
- Background: White (#FFFFFF)
- Border: 1px solid Medium Gray (#E0E0E0)
- Border radius: 12px
- Layout: Flexbox
- Left:
  - Label: "Weight"
    - Font: Label Medium (14px, weight 500)
    - Color: Text Primary (#1A1A1A)
- Input field:
  - Width: Flexible
  - Font: Body Medium (14px, weight 400)
  - Color: Text Primary (#1A1A1A)
  - Placeholder: "Enter weight..."
  - Text alignment: Right
  - Padding right: 8px
- Right:
  - Unit: "lbs" or "kg"
    - Font: Body Small (12px, weight 400)
    - Color: Text Secondary (#666666)
    - Padding: 0 8px
- Focus state:
  - Border: 2px solid Primary Purple (#667eea)
  - Background: White
  - Shadow: Elevation 2

**Section F: Exercise Cards Grid**
- Spacing from weight input: 24px
- Layout: 2-column grid
- Gap: 16px between cards
- Per card:
  - Height: 140px
  - Background: White (#FFFFFF)
  - Padding: 16px
  - Border radius: 12px
  - Box shadow: Elevation 1
  - Layout:
    - Header:
      - Exercise name
        - Font: Label Large (16px, weight 600)
        - Color: Text Primary (#1A1A1A)
      - Target sets (right-aligned)
        - Font: Body Small (12px, weight 400)
        - Color: Text Secondary (#666666)
        - Content: "8 sets"
    - Icon/Image:
      - Emoji or icon: 40x40px
      - Margin: 12px top
    - Controls (bottom):
      - Minus button: 32x32px
        - Background: Light Gray (#F5F5F5)
        - Border radius: 6px
        - Icon: "-" (16px, color Text Secondary)
        - Hit target: 44x44px
      - Count display:
        - Font: Label Medium (14px, weight 700)
        - Color: Primary Purple (#667eea)
        - Margin: 0 12px
        - Min width: 30px, center text
      - Plus button: 32x32px
        - Background: Light Purple (#E8ECFF)
        - Border radius: 6px
        - Icon: "+" (16px, color Primary Purple)
        - Hit target: 44x44px
    - Active state (tapped):
      - Background: Light Purple (#E8ECFF)
      - Border: 2px solid Primary Purple (#667eea)

**Section G: Toast Notification**
- Position: Bottom of screen (above nav bar)
- Height: 44px
- Margin: 12px
- Background: Dark Gray (#1A1A1A) or color-coded
- Padding: 12px 16px
- Border radius: 8px
- Text:
  - Font: Body Small (12px, weight 400)
  - Color: White (#FFFFFF)
  - Content: "Saved to offline queue" (example)
  - Icon: 16x16px on left
  - Spacing: 8px from icon to text

**Section H: Bottom Navigation Bar**
- Height: 64px (including safe area)
- Background: White (#FFFFFF)
- Border top: 1px solid Medium Gray (#E0E0E0)
- Padding: 8px 0 (with safe area adjustment)
- Position: Fixed at bottom
- Layout: Flexbox, space-around
- 4 nav items: Dashboard | History | Summary | Profile
- Each nav item:
  - Width: 25% of screen width
  - Hit target: 44x44px minimum
  - Icon: 24x24px
  - Label (below icon):
    - Font: Body Small (12px, weight 400)
    - Margin top: 4px
  - Active state:
    - Icon color: Primary Purple (#667eea)
    - Label color: Primary Purple (#667eea)
    - Background: Light Purple (#E8ECFF)
  - Inactive state:
    - Icon color: Text Secondary (#666666)
    - Label color: Text Secondary (#666666)
    - Background: Transparent

#### 4.3 Responsive Behavior
- Mobile portrait: 2-column exercise grid
- Mobile landscape: 2-column exercise grid (smaller height)
- Tablet (600px+): 3-column exercise grid

---

### SCREEN 5: History Screen

#### 5.1 Overall Structure
- Safe Area: Full coverage
- Background: Light Gray (#F5F5F5)
- Header: Fixed, 64px height
- Content: Scrollable
- Bottom Nav: Fixed, 64px height

#### 5.2 Layout Sections

**Section A: Fixed Header**
- Height: 64px
- Background: White (#FFFFFF)
- Border bottom: 1px solid Medium Gray (#E0E0E0)
- Padding: 16px 24px (with safe area)
- Title: "Workout History"
  - Font: H4 (18px, weight 600)
  - Color: Text Primary (#1A1A1A)
- Right: Filter button
  - Icon: Funnel (24x24px)
  - Color: Text Secondary (#666666)
  - Hit target: 44x44px

**Section B: Scrollable Content**
- Padding: 16px 24px 100px
- Background: Light Gray (#F5F5F5)

**Section C: Workout History List (Desktop View - Table)**
- Display: Table on screens 768px+
- Table styling:
  - Background: White (#FFFFFF)
  - Border collapse: Collapse
  - Width: 100%
  - Margin bottom: 24px

- **Table Header (thead):**
  - Height: 48px
  - Background: Primary gradient (#667eea to #764ba2)
  - Color: White (#FFFFFF)
  - Position: Sticky on scroll
  - Z-index: 10
  - th element:
    - Padding: 12px 16px
    - Text alignment: Center
    - Font: Label Medium (14px, weight 500)
    - Border right: 1px solid rgba(255,255,255,0.2)
  - th:first-child:
    - Text alignment: Left
  - Columns:
    1. "Date" (left)
    2. "Weight"
    3. "Completed"
    4. "Details"
    5. "Actions" (right)

- **Table Body (tbody):**
  - tr element:
    - Height: 56px
    - Border bottom: 1px solid Medium Gray (#E0E0E0)
    - Background: White
    - Hover state:
      - Background: Light Gray (#F5F5F5)
  - tr:nth-child(even):
    - Background: #F9F9F9

- **Table Cell (td):**
  - Padding: 12px 16px
  - Text alignment: Center
  - Font: Body Medium (14px, weight 400)
  - Color: Text Primary (#1A1A1A)
  - td:first-child:
    - Text alignment: Left
    - Font weight: 600
    - Color: Text Primary (#1A1A1A)
    - Background: #FAFAFA

- **Sample Data Rows:**
  ```
  | Date             | Weight | Completed | Details              | Actions      |
  | Jan 11, 2026    | 178.5  | 13/13    | All exercises done  | Edit | Delete |
  | Jan 10, 2026    | 178.2  | 12/13    | 1 exercise skipped  | Edit | Delete |
  | Jan 9, 2026     | 178.0  | 13/13    | All exercises done  | Edit | Delete |
  ```

**Section D: Workout History List (Mobile View - Cards)**
- Display: Flex column on screens <768px
- Per card:
  - Width: 100%
  - Background: White (#FFFFFF)
  - Padding: 16px
  - Border radius: 12px
  - Box shadow: Elevation 1
  - Margin bottom: 12px
  - Card content:
    - Header row:
      - Date: "January 11, 2026"
        - Font: Label Large (16px, weight 600)
        - Color: Text Primary (#1A1A1A)
      - Completion: "13/13"
        - Font: Body Medium (14px, weight 400)
        - Color: Success Green (#4CAF50)
        - Right aligned
    - Progress bar:
      - Height: 4px
      - Background: Medium Gray (#E0E0E0)
      - Filled: 100% Success Green (#4CAF50)
      - Border radius: 2px
      - Margin: 8px 0
    - Exercise list:
      - Font: Body Small (12px, weight 400)
      - Color: Text Secondary (#666666)
      - Max 3 lines before truncation
      - "Bike (12), Abs (8), Chest Press (10)..."
    - Action buttons (below):
      - Layout: Space-between, 8px gap
      - Edit button:
        - Height: 36px
        - Flex: 1
        - Background: Light Purple (#E8ECFF)
        - Border: None
        - Border radius: 8px
        - Font: Label Small (12px, weight 600)
        - Color: Primary Purple (#667eea)
      - Delete button:
        - Height: 36px
        - Flex: 1
        - Background: #FFEBEE
        - Border: None
        - Border radius: 8px
        - Font: Label Small (12px, weight 600)
        - Color: Error Red (#F44336)

**Section E: Expandable Details (Mobile)**
- Tap card to expand
- Expanded state:
  - Max height: 300px
  - Background: Light Gray (#F5F5F5)
  - Padding: 12px 16px
  - Margin top: 12px
  - Border top: 1px solid Medium Gray (#E0E0E0)
  - Content:
    - All exercises in detail
    - Font: Body Small (12px, weight 400)
    - Color: Text Secondary (#666666)
    - Per exercise: Name and set count
    - Line spacing: 6px
  - Collapse animation: 200ms

**Section F: Pagination (if applicable)**
- Position: Bottom of list
- Margin: 24px 0
- Button: "Load More Workouts"
  - Height: 44px
  - Width: 100%
  - Background: White (#FFFFFF)
  - Border: 2px solid Medium Gray (#E0E0E0)
  - Border radius: 8px
  - Font: Label Medium (14px, weight 600)
  - Color: Text Primary (#1A1A1A)
  - Active state: Border color Primary Purple (#667eea)

**Section G: Pull-to-Refresh**
- Trigger area: Top 64px of scrollable area
- Indicator:
  - Icon: Refresh circular arrow
  - Size: 24x24px
  - Color: Primary Purple (#667eea)
  - Animation: Rotate on drag
  - Position: Centered above list
- Text: "Release to refresh"
  - Font: Body Small (12px, weight 400)
  - Color: Text Secondary (#666666)

#### 5.3 Empty State
- When no workouts:
  - Icon: 64x64px calendar
  - Title: "No Workouts Yet"
    - Font: H3 (24px, weight 600)
    - Color: Text Primary (#1A1A1A)
  - Message: "Get started by logging your first workout"
    - Font: Body Medium (14px, weight 400)
    - Color: Text Secondary (#666666)
  - Button: "Start Workout"
    - Height: 44px
    - Style: Gradient button
  - Center vertically in view (with 100px offset for header)

---

### SCREEN 6: Profile Screen

#### 6.1 Overall Structure
- Safe Area: Full coverage
- Background: Light Gray (#F5F5F5)
- Header: Fixed, 64px
- Content: Scrollable
- Bottom Nav: Fixed, 64px

#### 6.2 Layout Sections

**Section A: Fixed Header**
- Height: 64px
- Background: White (#FFFFFF)
- Border bottom: 1px solid Medium Gray (#E0E0E0)
- Padding: 16px 24px (with safe area)
- Title: "Profile"
  - Font: H4 (18px, weight 600)
  - Color: Text Primary (#1A1A1A)

**Section B: Scrollable Content**
- Padding: 24px 24px 100px
- Background: Light Gray (#F5F5F5)

**Section C: User Avatar Card**
- Width: 100%
- Height: 120px
- Background: White (#FFFFFF)
- Padding: 16px
- Border radius: 12px
- Box shadow: Elevation 1
- Layout: Flexbox
- Left side:
  - Avatar image: 80x80px
  - Border radius: 40px (circle)
  - Background: Light Purple (#E8ECFF)
  - Border: 3px solid Primary Purple (#667eea)
  - Placeholder: User icon or initials
    - Font: H3 (24px, weight 600)
    - Color: Primary Purple (#667eea)
- Right side:
  - Padding left: 16px
  - Name:
    - Font: H4 (18px, weight 600)
    - Color: Text Primary (#1A1A1A)
  - Email:
    - Font: Body Small (12px, weight 400)
    - Color: Text Secondary (#666666)
    - Margin top: 4px
  - Join date:
    - Font: Body Small (12px, weight 400)
    - Color: Text Disabled (#CCCCCC)
    - Content: "Joined 6 months ago"
    - Margin top: 4px

**Section D: Statistics Section**
- Spacing from avatar: 24px
- Background: White (#FFFFFF)
- Padding: 16px
- Border radius: 12px
- Box shadow: Elevation 1
- Layout: 3 columns
- Per stat:
  - Width: 33% - 5px
  - Alignment: Center
  - Number:
    - Font: H3 (24px, weight 700)
    - Color: Primary Purple (#667eea)
  - Label:
    - Font: Body Small (12px, weight 400)
    - Color: Text Secondary (#666666)
    - Margin top: 4px
- Statistics:
  1. "47" / "Days Active"
  2. "156" / "Total Workouts"
  3. "2,847" / "Total Sets"

**Section E: Account Section**
- Spacing: 24px
- Title: "Account"
  - Font: Label Large (16px, weight 600)
  - Color: Text Primary (#1A1A1A)
  - Margin bottom: 12px
- List items:
  - Height: 48px
  - Background: White (#FFFFFF)
  - Padding: 12px 16px
  - Border bottom: 1px solid Medium Gray (#E0E0E0)
  - Layout: Flexbox, space-between
  - First item: No top border radius
  - Last item: Border radius bottom 12px, no border bottom
  - First item: Border radius top 12px
  - Text:
    - Font: Body Medium (14px, weight 400)
    - Color: Text Primary (#1A1A1A)
  - Right arrow:
    - Icon: 16x16px
    - Color: Text Secondary (#666666)
  - Items:
    1. "Change Password" (arrow)
    2. "Email Notifications" (toggle switch)
    3. "Push Notifications" (toggle switch)

**Section F: Preferences Section**
- Spacing: 24px
- Title: "Preferences"
  - Font: Label Large (16px, weight 600)
  - Color: Text Primary (#1A1A1A)
  - Margin bottom: 12px
- List items: Same style as Account section
- Items:
  1. "Dark Mode" (toggle switch)
  2. "Weight Units" (shows "Pounds", arrow)
  3. "Language" (shows "English", arrow)

**Section G: About Section**
- Spacing: 24px
- Title: "About"
  - Font: Label Large (16px, weight 600)
  - Color: Text Primary (#1A1A1A)
  - Margin bottom: 12px
- List items: Same style
- Items:
  1. "App Version" (shows "1.0.0", no arrow, no tap)
  2. "Privacy Policy" (arrow)
  3. "Terms of Service" (arrow)
  4. "Contact Support" (arrow)

**Section H: Danger Zone Section**
- Spacing: 32px (larger separation)
- Title: "Danger Zone"
  - Font: Label Large (16px, weight 600)
  - Color: Error Red (#F44336)
  - Margin bottom: 12px
- Delete Account Button:
  - Height: 48px
  - Width: 100%
  - Background: #FFEBEE (light red)
  - Border: 2px solid Error Red (#F44336)
  - Border radius: 12px
  - Font: Label Large (16px, weight 600)
  - Color: Error Red (#F44336)
  - Active state:
    - Background: Error Red (#F44336)
    - Color: White (#FFFFFF)

**Section I: Logout Button**
- Spacing: 24px from danger zone
- Height: 56px
- Width: 100%
- Background: Linear gradient (#667eea to #764ba2)
- Border radius: 12px
- Font: Label Large (16px, weight 600)
- Color: White (#FFFFFF)
- Margin bottom: 40px (safe area adjustment)

#### 6.3 Toggle Switch Component
- Width: 44px
- Height: 24px
- Background (off): Medium Gray (#E0E0E0)
- Background (on): Success Green (#4CAF50)
- Border radius: 12px
- Toggle knob:
  - Size: 20px circle
  - Background: White (#FFFFFF)
  - Position: Off (2px from left), On (22px from left)
  - Animation: 200ms slide
  - Shadow: Elevation 1

#### 6.4 Modal - Delete Account Confirmation
- Background: Dark overlay (rgba(0,0,0,0.5))
- Card:
  - Background: White (#FFFFFF)
  - Border radius: 16px
  - Width: 90% (min 280px, max 480px)
  - Padding: 24px
  - Box shadow: Elevation 4
- Title: "Delete Account?"
  - Font: H3 (24px, weight 600)
  - Color: Text Primary (#1A1A1A)
  - Margin bottom: 8px
- Message: "This action cannot be undone. All your data will be permanently deleted."
  - Font: Body Medium (14px, weight 400)
  - Color: Text Secondary (#666666)
  - Margin bottom: 24px
- Button group:
  - Layout: Column, full width
  - Cancel button:
    - Height: 44px
    - Background: Light Gray (#F5F5F5)
    - Border: None
    - Border radius: 8px
    - Font: Label Large (16px, weight 600)
    - Color: Text Primary (#1A1A1A)
    - Margin bottom: 8px
  - Delete button:
    - Height: 44px
    - Background: Error Red (#F44336)
    - Border: None
    - Border radius: 8px
    - Font: Label Large (16px, weight 600)
    - Color: White (#FFFFFF)

---

### SCREEN 7: Workout History Screen (PWA-Titled)

#### 7.1 Overall Structure
- Same as History Screen (5.1-5.3)
- Title variation: "Workout History" instead of "History"

#### 7.2 Additional Enhancements
- Add collapse/expand animations (200ms ease-in-out)
- Cards: Add swipe action hints (iOS) "← Swipe to actions"
  - Font: Caption (10px, weight 400)
  - Color: Text Disabled (#CCCCCC)
  - Show only on first load
- Add shimmer loading skeleton (3 cards)
  - Height: 56px
  - Background: Light Gray (#F5F5F5) with animated gradient

---

### SCREEN 8: Fitness Summary Screen (PWA-Titled)

#### 8.1 Overall Structure
- Safe Area: Full coverage
- Background: Light Gray (#F5F5F5)
- Header: Fixed, 64px
- Content: Scrollable
- Bottom Nav: Fixed, 64px

#### 8.2 Layout Sections

**Section A: Fixed Header**
- Height: 64px
- Background: White (#FFFFFF)
- Border bottom: 1px solid Medium Gray (#E0E0E0)
- Padding: 16px 24px
- Title: "Fitness Summary"
  - Font: H4 (18px, weight 600)
  - Color: Text Primary (#1A1A1A)
- Right: Period selector dropdown
  - Button: "This Week"
    - Font: Body Small (12px, weight 400)
    - Color: Text Secondary (#666666)
    - Background: Light Gray (#F5F5F5)
    - Height: 32px
    - Padding: 8px 12px
    - Border radius: 6px
    - Hit target: 44x44px
  - Options: "This Week" | "This Month" | "All Time"

**Section B: Scrollable Content**
- Padding: 24px 24px 100px
- Background: Light Gray (#F5F5F5)

**Section C: Primary Stats Cards (3 columns)**
- Width per card: 33% - 5.33px (accounting for 16px total gap)
- Height: 100px
- Background: White (#FFFFFF)
- Padding: 16px 12px
- Border radius: 12px
- Box shadow: Elevation 1
- Gap: 8px between cards
- Content:
  - Icon: 40x40px, color Primary Purple
  - Value:
    - Font: H2 (28px, weight 700)
    - Color: Primary Purple (#667eea)
    - Margin top: 8px
  - Label:
    - Font: Body Small (12px, weight 400)
    - Color: Text Secondary (#666666)
    - Margin top: 4px
- Stats:
  1. Icon: 📊, Value: "156", Label: "Total Workouts"
  2. Icon: 💪, Value: "178.5", Label: "Avg Weight"
  3. Icon: ⚡, Value: "2,847", Label: "Total Sets"

**Section D: Secondary Stats (Optional)**
- Spacing: 24px from primary stats
- Layout: 2 columns
- Per card: Height 80px
- Content:
  - Label (left):
    - Font: Body Small (12px, weight 400)
    - Color: Text Secondary (#666666)
  - Value (right):
    - Font: H3 (24px, weight 700)
    - Color: Primary Purple (#667eea)
- Stats:
  1. "Best Week" / "March 15-21"
  2. "Current Streak" / "12 days"

**Section E: Weekly Breakdown**
- Spacing: 24px
- Title: "Weekly Breakdown"
  - Font: H4 (18px, weight 600)
  - Color: Text Primary (#1A1A1A)
  - Margin bottom: 12px

- Per week card:
  - Width: 100%
  - Height: 120px
  - Background: White (#FFFFFF)
  - Padding: 16px
  - Border radius: 12px
  - Box shadow: Elevation 1
  - Margin bottom: 12px
  - Layout:
    - Top row:
      - Week date: "Jan 8-14"
        - Font: Label Large (16px, weight 600)
        - Color: Text Primary (#1A1A1A)
      - Completion: "12/13"
        - Font: Body Medium (14px, weight 400)
        - Color: Success Green (#4CAF50)
        - Right aligned
    - Progress bar:
      - Height: 4px
      - Background: Medium Gray (#E0E0E0)
      - Filled: 92% Success Green (#4CAF50)
      - Border radius: 2px
      - Margin: 8px 0
    - Exercise summary:
      - Font: Body Small (12px, weight 400)
      - Color: Text Secondary (#666666)
      - Content: "Top exercise: Bike (14 sets)"
    - Expand arrow (right side):
      - Icon: 16x16px
      - Color: Text Secondary (#666666)
      - Position: Top right
      - Hit target: 44x44px
  - Expanded state:
    - Max height: 200px
    - Content:
      - Exercises list with set counts
      - Grid: 2 columns
      - Per item:
        - Font: Body Small (12px, weight 400)
        - Line spacing: 8px
        - Example: "Bike - 14 sets", "Abs - 8 sets"
      - Background: Light Gray (#F5F5F5)
      - Padding: 12px 0
      - Margin top: 12px
      - Border top: 1px solid Medium Gray (#E0E0E0)

**Section F: Top Exercises Ranking**
- Spacing: 24px
- Title: "Top Exercises This Week"
  - Font: H4 (18px, weight 600)
  - Color: Text Primary (#1A1A1A)
  - Margin bottom: 12px

- Ranking list:
  - Per item: Height 40px
  - Background: White (#FFFFFF)
  - Padding: 12px 16px
  - Border bottom: 1px solid Medium Gray (#E0E0E0)
  - Layout: Flexbox, space-between
  - Left:
    - Rank: "1.", "2.", "3."
      - Font: Label Medium (14px, weight 600)
      - Color: Text Secondary (#666666)
      - Margin right: 12px
    - Exercise name:
      - Font: Body Medium (14px, weight 400)
      - Color: Text Primary (#1A1A1A)
  - Right:
    - Set count: "14 sets"
      - Font: Body Small (12px, weight 400)
      - Color: Primary Purple (#667eea)
      - Font weight: 600
  - Background on hover: Light Gray (#F5F5F5)
  - First item: Border radius top 12px
  - Last item: Border radius bottom 12px, no border bottom

#### 8.3 Responsive Behavior
- Mobile portrait: 3 primary stats in 1 row
- Mobile landscape: 3 primary stats in 1 row
- Tablet (600px+): Full width sections
- Desktop (800px+): Sidebar layout possible (optional enhancement)

---

### SCREEN 9: Progress Summary Screen (PWA-Titled)

#### 9.1 Overall Structure
- Safe Area: Full coverage
- Background: White (#FFFFFF)
- Header: Fixed, 64px
- Content: Scrollable horizontal and vertical
- Footer: Fixed, 32px (scroll hint)

#### 9.2 Layout Sections

**Section A: Fixed Header**
- Height: 64px
- Background: Linear gradient (#667eea to #764ba2)
- Color: White (#FFFFFF)
- Padding: 16px 24px (with safe area)
- Layout: Flexbox, center
- Title: "📈 Progress Summary"
  - Font: H2 (28px, weight 700)
  - Color: White (#FFFFFF)
- Subtitle: "52-week fitness tracking - Weekly exercise breakdown"
  - Font: Body Small (12px, weight 400)
  - Color: White with 80% opacity
  - Below title

**Section B: Scroll Hint (Sticky Below Header)**
- Height: 32px
- Background: Light Gray (#F5F5F5)
- Padding: 8px 24px
- Border bottom: 1px solid Medium Gray (#E0E0E0)
- Content: "↔️ Scroll horizontally to see all columns | ↕️ Scroll vertically to see all 52 weeks"
  - Font: Body Small (12px, weight 400)
  - Color: Text Disabled (#CCCCCC)
  - Text alignment: Center

**Section C: Table Container**
- Position: Below header
- Height: Flexible (full viewport - 64px - 32px - safe area)
- Overflow: Auto (both axes)
- Background: White (#FFFFFF)
- Padding: 24px

**Section D: Table Structure**
- Width: 100% or min-width for horizontal scroll
- Border collapse: Collapse
- Background: White (#FFFFFF)

- **Table Header (thead):**
  - Height: 48px
  - Background: Primary gradient (#667eea to #764ba2)
  - Color: White (#FFFFFF)
  - Position: Sticky on scroll
  - Z-index: 10
  - th element:
    - Padding: 12px 8px
    - Text alignment: Center
    - Font: Label Small (12px, weight 600)
    - Border right: 1px solid rgba(255,255,255,0.2)
  - th:first-child:
    - Text alignment: Left
    - Min width: 130px
  - Columns:
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

- **Table Body (tbody):**
  - tr element:
    - Height: 40px
    - Border bottom: 1px solid Medium Gray (#E0E0E0)
    - Background: White
    - Hover state:
      - Background: Light Gray (#F5F5F5)
  - tr:nth-child(even):
    - Background: #F9F9F9
  - tr:nth-child(even) td:first-child:
    - Background: #F5F5F5

- **Table Cell (td):**
  - Padding: 12px 8px
  - Text alignment: Center
  - Font: Body Small (12px, weight 400)
  - Color: Text Primary (#1A1A1A)
  - Border right: 1px solid Medium Gray (#E0E0E0)
  - td:first-child:
    - Text alignment: Left
    - Font weight: 600
    - Color: Text Primary (#1A1A1A)
    - Min width: 130px
    - Background: #FAFAFA
  - .number class:
    - Font weight: 500

- **Data Example (Week Rows):**
  ```
  Week Of | Avg Wt | Bike | Abs | Chest Press | Leg Press | Lat | Military | Crunch | Bicep Curls | Triceps | Overhead Pull | Row | Total Sets
  Jan 7-13| 178.5  | 12   | 8   | 10          | 9         | 7   | 11       | 6      | 9           | 8       | 10            | 7   | 97
  Dec 31- | 177.8  | 14   | 9   | 11          | 10        | 8   | 12       | 7      | 10          | 9       | 11            | 8   | 109
  ```

**Section E: Footer Hint (Fixed Bottom)**
- Height: 32px
- Background: Light Gray (#F5F5F5)
- Border top: 1px solid Medium Gray (#E0E0E0)
- Padding: 8px 24px
- Content: "Showing 10 of 52 weeks | Last updated: Today"
  - Font: Body Small (12px, weight 400)
  - Color: Text Disabled (#CCCCCC)
  - Text alignment: Center
  - Strong text: "10", "52", "Today"
    - Font weight: 600
    - Color: Text Primary (#1A1A1A)

#### 9.3 Table Features
- **Horizontal Scroll:**
  - Enable on mobile for off-screen columns
  - iOS: Momentum scroll
  - Android: Standard scroll
  - Scroll bar: Light, minimal visibility
  - Min column width: Maintain readability

- **Vertical Scroll:**
  - Sticky header stays at top
  - Enable for all 52 weeks
  - Smooth scroll on all platforms

- **Responsive Breakpoint (768px+):**
  - Show all columns without horizontal scroll (if possible)
  - Increase padding
  - Increase font size slightly

#### 9.4 Empty State
- When no data:
  - Icon: 64x64px calendar
  - Title: "No Data Yet"
  - Message: "Complete your first week to see progress tracking"
  - Center in table area with 100px top offset

---

## Navigation System

### Bottom Navigation Architecture

#### Position & Dimensions
- Height: 64px (including safe area)
- Width: 100%
- Position: Fixed at bottom of screen
- Safe area adjustment: +8px bottom padding (iOS)
- z-index: 100 (above all other content)

#### Visual Style
- Background: White (#FFFFFF)
- Border top: 1px solid Medium Gray (#E0E0E0)
- Box shadow: 0 -2px 8px rgba(0,0,0,0.08)

#### Navigation Items (4 total)

**Item 1: Dashboard**
- Icon: House/Dashboard
- Label: "Dashboard"
- Route: /dashboard
- Icon color (inactive): Text Secondary (#666666)
- Icon color (active): Primary Purple (#667eea)
- Label color (inactive): Text Secondary (#666666)
- Label color (active): Primary Purple (#667eea)
- Background (active): Light Purple (#E8ECFF)

**Item 2: History**
- Icon: History/Clock
- Label: "History"
- Route: /history
- Same colors as Item 1

**Item 3: Summary**
- Icon: Chart/Graph
- Label: "Summary"
- Route: /summary
- Same colors as Item 1

**Item 4: Profile**
- Icon: User/Person
- Label: "Profile"
- Route: /profile
- Same colors as Item 1

#### Navigation Item Structure (Each)
```
Width:                      25% of screen
Height:                     56px (above safe area)
Padding:                    8px 0
Hit target minimum:         44x44px
Layout:                     Flex column, center
Content:
  - Icon:                   24x24px, centered
  - Label:                  Body Small (12px, weight 400)
  - Spacing icon to label:  4px
  - Text alignment:         Center
Active state:
  - Background:             Light Purple (#E8ECFF)
  - Icon color:             Primary Purple (#667eea)
  - Label color:            Primary Purple (#667eea)
  - Animation:              50ms background fade
Inactive state:
  - Background:             Transparent
  - Icon color:             Text Secondary (#666666)
  - Label color:            Text Secondary (#666666)
Pressed state:
  - Opacity:                0.7
  - Animation:              100ms
```

#### Navigation Behavior
- Active route: Highlighted with background and color
- Transition: Smooth 200ms animation on route change
- Prevents: Bottom sheet/modal overlays the nav
- Accessibility: Each item has hit target 44x44px minimum
- Deep linking: Direct navigation to each route

---

## Implementation Priority Matrix

### Priority 1: Critical Foundation (Weeks 1-2)
These must be completed before any other work.

**Task 1.1:** Define and implement global design tokens
- [ ] Color palette CSS variables
- [ ] Typography system
- [ ] Spacing scale
- [ ] Border radius values
- [ ] Shadow definitions
- **Deliverable:** Design tokens file (CSS, TailwindCSS config, or JSON)
- **Files affected:** All screens
- **Time estimate:** 4-6 hours

**Task 1.2:** Implement Login Screen
- [ ] Complete layout structure
- [ ] All input fields (email, password)
- [ ] Button styles and states
- [ ] Form validation
- [ ] Error message display
- **Files affected:** [login-screen.html](login-screen.html), app/(auth)/login.tsx
- **Time estimate:** 8-10 hours

**Task 1.3:** Implement Register Screen
- [ ] Complete layout structure
- [ ] All input fields
- [ ] Password strength indicator
- [ ] Password requirements checklist
- [ ] Terms acceptance checkbox
- [ ] Button styles
- **Files affected:** [register-screen.html](register-screen.html), app/(auth)/register.tsx
- **Time estimate:** 10-12 hours

**Task 1.4:** Bottom Navigation Bar
- [ ] Navigation component structure
- [ ] All 4 nav items with icons
- [ ] Active state styling
- [ ] Route integration
- [ ] Safe area handling
- **Files affected:** All dashboard screens
- **Time estimate:** 6-8 hours

### Priority 2: Core Functionality (Weeks 2-3)
These build on Priority 1 and enable app usage.

**Task 2.1:** Home Screen Enhancement
- [ ] Hero section with gradient
- [ ] Feature cards
- [ ] Stats section
- [ ] Feature list
- [ ] Call-to-action buttons
- [ ] Footer links
- **Files affected:** [home-screen.html](home-screen.html), app/index.tsx
- **Time estimate:** 12-14 hours

**Task 2.2:** Dashboard Screen Refinement
- [ ] Fixed header styling
- [ ] Date picker component
- [ ] Progress card
- [ ] Weight input field
- [ ] Exercise grid cards (2 columns)
- [ ] Button controls (+/-)
- [ ] Toast notifications
- **Files affected:** [dashboard-screen.html](dashboard-screen.html), app/dashboard/index.tsx
- **Time estimate:** 14-16 hours

**Task 2.3:** Profile Screen
- [ ] Avatar card
- [ ] Statistics display
- [ ] Account settings section
- [ ] Preferences section
- [ ] About section
- [ ] Danger zone section
- [ ] Logout button
- [ ] Toggle switch component
- [ ] Delete confirmation modal
- **Files affected:** [profile-screen.html](profile-screen.html), app/profile/index.tsx
- **Time estimate:** 12-14 hours

### Priority 3: Secondary Features (Weeks 3-4)
These complete the application.

**Task 3.1:** History Screen
- [ ] Fixed header
- [ ] Desktop table view
- [ ] Mobile card view
- [ ] Expandable details
- [ ] Edit/Delete buttons
- [ ] Pull-to-refresh
- [ ] Pagination
- [ ] Empty state
- **Files affected:** [history-screen.html](history-screen.html), app/history/index.tsx
- **Time estimate:** 14-16 hours

**Task 3.2:** Fitness Summary Screen
- [ ] Fixed header with period selector
- [ ] Primary stats cards (3 columns)
- [ ] Secondary stats
- [ ] Weekly breakdown cards
- [ ] Top exercises ranking
- [ ] Expandable content
- **Files affected:** [fitness-summary-screen.html](fitness-summary-screen.html), components
- **Time estimate:** 12-14 hours

**Task 3.3:** Progress Summary Screen
- [ ] Fixed header with gradient
- [ ] Scroll hint sticky bar
- [ ] 52-week table
- [ ] Sticky header on scroll
- [ ] Horizontal/vertical scrolling
- [ ] Footer hint
- [ ] Responsive table layout
- **Files affected:** [progress-summary-screen.html](progress-summary-screen.html), components
- **Time estimate:** 10-12 hours

**Task 3.4:** Workout History Screen (PWA-Titled)
- [ ] Same as History Screen with PWA title
- [ ] Ensure title accuracy: "Workout History"
- [ ] All features from History Screen
- **Files affected:** [workout-history-screen.html](workout-history-screen.html)
- **Time estimate:** 10 hours (based on History Screen)

### Priority 4: Enhancements (Post-Launch)
These improve UX but aren't critical for launch.

**Task 4.1:** Animations & Transitions
- [ ] Screen transitions (200-300ms)
- [ ] Button press feedback (100ms)
- [ ] Loading spinners
- [ ] Pull-to-refresh animation
- [ ] Card expansion animations
- [ ] Progress bar animations
- **Time estimate:** 8-10 hours

**Task 4.2:** Advanced Features
- [ ] Biometric authentication
- [ ] Social login (Google, Apple)
- [ ] Charts and visualizations
- [ ] Heatmap view for progress
- [ ] Custom date range export
- **Time estimate:** 20+ hours

**Task 4.3:** Performance Optimization
- [ ] Code splitting
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Bundle size reduction
- [ ] Caching strategies
- **Time estimate:** 12-16 hours

---

## Summary & Recommendations

### Total Development Time
- **Priority 1 (Critical):** 28-36 hours
- **Priority 2 (Core):** 38-44 hours
- **Priority 3 (Secondary):** 46-52 hours
- **Priority 4 (Enhancements):** 28+ hours
- **Total:** 140-176 hours (~4-5 weeks, full-time)

### Recommended Approach
1. **Week 1:** Complete Priority 1 (foundation & auth screens)
2. **Week 2:** Complete Priority 2 (home, dashboard, profile)
3. **Week 3:** Complete Priority 3 (history & summary screens)
4. **Post-Launch:** Implement Priority 4 enhancements

### Quality Assurance
- Visual review on iOS 12.4" and Android 5.0"
- Responsive testing at all breakpoints
- Accessibility audit (WCAG 2.1 AA)
- Performance profiling (Lighthouse score 90+)
- A/B testing key flows after launch

---

*This granular design plan provides the foundation for high-quality implementation.*
*Reference this document when designing and building each screen.*
*Update as new requirements emerge during development.*
