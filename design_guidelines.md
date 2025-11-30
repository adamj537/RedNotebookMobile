# RedNotebook Mobile App - Design Guidelines

## Authentication & Account Management

**Authentication Required:**
- The app requires authentication for cloud sync (Google Drive & OneDrive)
- Implement separate auth flows for each cloud service (not general app login)
- Auth is optional - users can use the app offline without signing in

**Auth Implementation:**
- Google Sign-In button on Sync Settings screen (using Replit integration)
- Microsoft Sign-In button on Sync Settings screen (using Replit integration)
- No separate login/signup screens - auth happens in-context when user wants to enable sync
- Display signed-in status for each service with account email/name
- Include sign-out option for each service independently
- No account deletion needed (no app-specific accounts)

**Profile/Settings:**
- Include a Settings screen accessible from tab navigation
- User preferences: sync frequency (manual/auto), default tags, date format
- About section with app version and RedNotebook compatibility info

---

## Navigation Architecture

**Root Navigation: Bottom Tab Bar (4 tabs)**

1. **Calendar Tab** (Home) - Calendar icon
   - Primary screen for browsing journal entries by date
   
2. **Today Tab** - Edit/Document icon  
   - Quick access to today's entry for fast journaling
   
3. **Tags Tab** - Tag/Label icon
   - Browse all tags and filter entries by tag
   
4. **Settings Tab** - Settings/Gear icon
   - App preferences and sync configuration

**Navigation Pattern:**
- Each tab has its own stack navigator
- Floating Action Button (FAB) for "New Entry" positioned in bottom-right
- Entry editor opens as a modal screen from any tab

---

## Screen Specifications

### 1. Calendar Screen (Tab 1 - Home)

**Purpose:** Browse journal entries by date and view entry previews

**Layout:**
- Header: Default with app title "RedNotebook"
  - Right button: Sync status indicator (cloud icon with badge)
  - Transparent background
- Main content: Scrollable view
  - Calendar component (monthly view) at top
  - Entry preview card below calendar showing selected date's content
  
**Components:**
- Calendar widget with date selection
- Dates with entries should have a subtle dot indicator
- Entry preview card:
  - Date header with format "Monday, January 15, 2024"
  - Entry text preview (first 150 characters, faded ellipsis)
  - Tag chips displayed horizontally
  - "Edit" button (text button, right-aligned)
  
**Safe Area Insets:**
- Top: headerHeight + Spacing.xl
- Bottom: tabBarHeight + Spacing.xl

### 2. Today Screen (Tab 2)

**Purpose:** Quick access to edit today's journal entry

**Layout:**
- Header: Default with date as title (e.g., "Tuesday, Jan 16")
  - Right button: Save icon (only shown when edited)
  - Transparent background
- Main content: Scrollable form
  - Entry text area (multiline, auto-expanding)
  - Tags section with chips and add tag input

**Components:**
- Large text input for entry content
- Tag chip list with remove (×) buttons
- Add tag input field with "+ Add Tag" placeholder
- Word count indicator (subtle, bottom of text area)

**Safe Area Insets:**
- Top: headerHeight + Spacing.xl
- Bottom: tabBarHeight + Spacing.xl + Spacing.lg (for keyboard avoidance)

### 3. Tags Screen (Tab 3)

**Purpose:** Browse all tags and filter entries

**Layout:**
- Header: Default with title "Tags"
  - Search bar for filtering tags
  - Non-transparent (white background)
- Main content: List view
  - Tag items showing tag name and entry count

**Components:**
- Search bar in header
- List items: Tag name, count badge, chevron right
- Tapping a tag navigates to filtered entry list
- Empty state: "No tags yet. Add tags to your entries to see them here."

**Safe Area Insets:**
- Top: Spacing.xl (non-transparent header)
- Bottom: tabBarHeight + Spacing.xl

### 4. Settings Screen (Tab 4)

**Purpose:** App configuration and cloud sync management

**Layout:**
- Header: Default with title "Settings"
  - Non-transparent background
- Main content: Scrollable sections

**Sections:**
1. **Cloud Sync**
   - Google Drive: Account email or "Sign in" button
   - OneDrive: Account email or "Sign in" button  
   - Sync Now button (primary, full-width)
   - Last synced timestamp
   - Auto-sync toggle

2. **Preferences**
   - Date format picker
   - Default tags input
   - Theme (Light/Dark/System)

3. **About**
   - App version
   - RedNotebook compatibility version
   - Data location path (read-only)

**Safe Area Insets:**
- Top: Spacing.xl
- Bottom: tabBarHeight + Spacing.xl

### 5. Entry Editor (Modal)

**Purpose:** Create or edit a journal entry for any date

**Layout:**
- Header: Custom with date and action buttons
  - Left: Cancel button
  - Center: Date (tappable to change date)
  - Right: Save button
  - Non-transparent background
- Main content: Scrollable form
  - Entry text area (focus on mount)
  - Tags section

**Form Buttons:** In header (Cancel left, Save right)

**Safe Area Insets:**
- Top: Spacing.xl
- Bottom: insets.bottom + Spacing.xl (no tab bar in modal)

---

## Design System

### Color Palette

**Primary Colors:**
- Primary: #1976D2 (Material Blue 700) - for FAB, primary buttons, selected states
- PrimaryDark: #0D47A1 (Material Blue 900) - for pressed states
- Accent: #FFA726 (Material Orange 400) - for tag chips, highlights

**Neutral Colors:**
- Background: #FAFAFA (Light gray) - app background
- Surface: #FFFFFF - cards, modals
- Border: #E0E0E0 - dividers, input borders
- TextPrimary: #212121 - main text
- TextSecondary: #757575 - secondary text, hints
- TextDisabled: #BDBDBD

**Semantic Colors:**
- Success: #4CAF50 (Material Green) - sync success
- Error: #F44336 (Material Red) - sync errors
- Warning: #FF9800 (Material Orange) - offline state

### Typography

**Font Family:** System default (Roboto on Android, San Francisco on iOS)

**Text Styles:**
- Headline1: 24sp, Medium, TextPrimary - screen titles
- Headline2: 20sp, Medium, TextPrimary - section headers
- Body1: 16sp, Regular, TextPrimary - entry text, main content
- Body2: 14sp, Regular, TextSecondary - secondary text, metadata
- Caption: 12sp, Regular, TextSecondary - timestamps, hints
- Button: 14sp, Medium, uppercase - button labels

### Spacing Scale
- xs: 4
- sm: 8
- md: 12
- lg: 16
- xl: 24
- xxl: 32

---

## Visual Design

### Icons
- Use Material Icons from @expo/vector-icons
- Icon size: 24 for tab bar, 20 for inline actions
- Never use emojis

### Entry Cards & Lists
- Cards: White background, 1dp elevation
- Border radius: 8
- Padding: Spacing.lg
- Entry preview text: Body1, 3 line max with ellipsis

### Tag Chips
- Background: Accent color with 20% opacity
- Text: Accent color, Body2
- Border radius: 16
- Padding: Spacing.sm horizontal, Spacing.xs vertical
- Remove button (×): 16sp, appears on hover/long-press

### Buttons
- Primary button: Filled, Primary color, Spacing.lg padding, 8 border radius
- Secondary button: Outlined, Border color, same padding/radius
- Text button: No background, Primary color text
- All buttons have ripple effect on press

### Floating Action Button (FAB)
- Position: Bottom-right, 16 from bottom, 16 from right
- Size: 56 × 56
- Background: Primary color
- Icon: Plus or Edit (white, 24sp)
- **Shadow specifications (EXACT):**
  - shadowOffset: { width: 0, height: 2 }
  - shadowOpacity: 0.10
  - shadowRadius: 2
- Elevation: 6dp (Android)

### Calendar Component
- Current date: Accent color border
- Selected date: Primary color background, white text
- Dates with entries: Small dot below (Accent color)
- Weekend dates: TextSecondary color
- Today: Bold text

### Input Fields
- Border: 1px solid Border color
- Focused border: 2px solid Primary color
- Border radius: 4
- Padding: Spacing.md
- Multiline text area: Min height 200

### Sync Status Indicator
- Small badge on cloud icon in header
- Green: Synced
- Orange: Syncing (with spinner)
- Gray: Not signed in
- Red: Error (with error count)

---

## Interaction Design

### Gestures
- Swipe left/right on calendar to change month
- Swipe down on entry editor to dismiss (if no changes)
- Pull-to-refresh on calendar screen to sync

### Loading States
- Entry loading: Skeleton placeholder matching entry card
- Sync in progress: Progress indicator in header, disable sync button
- Offline mode: Toast notification, orange indicator

### Empty States
- No entry for date: "No entry for this date. Tap Edit to start writing."
- No tags: "Add tags to organize your entries."
- All use illustration placeholder (simple icon, 48sp) with text below

### Feedback
- Save success: Brief toast "Entry saved"
- Sync complete: Toast with count "3 entries synced"
- Error states: Alert dialog with error message and retry option
- All touchable components: Material ripple effect

---

## Accessibility

- Minimum touch target: 48 × 48
- Color contrast: WCAG AA compliant (4.5:1 for normal text)
- Screen reader labels for all interactive elements
- Tab navigation support (Android)
- Larger text support via system settings
- Focus indicators on all inputs
- Error messages announced to screen readers

---

## Assets

**Required Assets:**
None - use system icons exclusively

**Optional Enhancement Assets:**
- App icon (1024×1024): Stylized notebook with red accent
- Splash screen: App icon centered on Primary color background