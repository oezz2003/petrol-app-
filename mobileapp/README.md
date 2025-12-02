# Drilling Operations & HSE Mobile App

A React Native mobile application built with Expo for oil & gas drilling site operations and Health, Safety & Environment (HSE) management. This app replaces paper-based data collection with a modern mobile workflow.

## 🎯 App Overview

This app provides field engineers with tools to:
- Create and track drilling well records through a structured workflow
- Report and manage safety hazards (Hazard Hunt)
- Complete mandatory daily operational reports
- Track assigned safety tasks
- Perform voluntary HSE actions

## 📱 App Structure

### Navigation Architecture

The app uses **Expo Router** with file-based routing and a **Tab + Stack navigation** pattern:

```
Root Stack Navigator
├── Tab Navigator (3 tabs)
│   ├── Operations Tab
│   ├── HSE Tab
│   └── Profile Tab
└── Modal Screens
    ├── New Well Wizard
    ├── New Hazard Form
    ├── Hazard Details
    ├── Task Details
    └── Daily Report Modal
```

### Global State Management

**Location**: `store/AppContext.tsx`

Uses React Context API to manage app-wide state:
- **Wells**: Array of well records (in progress, completed, draft)
- **Tasks**: Assigned HSE tasks from management
- **Hazards**: User-reported hazards via Hazard Hunt
- **Voluntary Actions**: Optional HSE activities
- **Daily Reports**: Submitted daily operational reports

All data is currently **mock/in-memory** - no backend integration yet.

---

## 📄 Page-by-Page Breakdown

### 1. Operations Tab (`app/(tabs)/operations.tsx`)

**Purpose**: Main hub for well management

**What's on this page:**
- **"Start New Well" button** → Opens the 5-step New Well Wizard
- **Wells in Progress section** → Lists wells with status "In Progress" or "Draft"
- **Completed Wells section** → Lists wells with status "Completed"
- **Daily Report test button** → Opens the mandatory daily report modal

**Data displayed per well:**
- Well name (e.g., "Well Alpha-7")
- Location (e.g., "Site A, Block 12")
- Rig ID (e.g., "RIG-001")
- Status badge (color-coded)
- Last updated timestamp

**User actions:**
- Tap "Start New Well" → Navigate to well creation wizard
- Tap a well card → View well details (currently logs to console)
- Tap "Open Daily Report" → Test the daily report modal

---

### 2. New Well Wizard (`app/operations/new-well.tsx`)

**Purpose**: Multi-step form for creating new well records

**Flow Logic**: User cannot skip steps - must complete current step before advancing.

#### Step 1: Basic Data
**Fields:**
- Well name (required)
- Location (required)
- Rig name/ID (required)
- Notes (optional)

**Validation:** Cannot proceed if required fields are empty.

#### Step 2: Safety Checklist
**Content:**
- Pre-defined checklist items (from `store/AppContext.tsx`)
- Each item has a switch (checkbox)
- Required items marked with red asterisk (*)

**Logic:** Must check all required items to proceed.

**Example items:**
- Rig inspection completed (required)
- PPE checked (required)
- Tools inspected (required)
- Safety briefing conducted (required)
- Emergency equipment verified (optional)

#### Step 3: Photos
**Functionality:**
- "Add Photo" button (currently mocked with placeholder images)
- Photo thumbnails in grid layout
- Remove button (X) on each photo

**Note:** Uses placeholder URLs - future implementation needs `expo-image-picker`.

#### Step 4: Voice Notes
**Functionality:**
- "Record Voice Note" button (currently mocked)
- Displays mock duration (e.g., "00:45")
- List of recorded notes with timestamps
- Delete individual notes

**Note:** Mock implementation - future needs `expo-av` for real recording.

#### Step 5: Summary & Submit
**Display:**
- All basic data entered
- Checklist completion count (e.g., "4/5 items")
- Number of photos added
- Number of voice notes recorded

**Actions:**
- **"Save as Draft"** → Saves well with status "DRAFT", returns to Operations
- **"Submit Well"** → Saves well with status "COMPLETED", returns to Operations

**Navigation:**
- Progress stepper at top shows current step (1-5)
- "Previous" button (appears from step 2 onwards)
- "Next" button (validates before advancing)

---

### 3. HSE Tab (`app/(tabs)/hse.tsx`)

**Purpose**: Health, Safety & Environment management hub

**Layout**: Three internal tabs with tab bar at top

#### Tab 1: Assigned Tasks

**What's shown:**
- List of tasks assigned by site management
- Sourced from `tasks` array in AppContext

**Each task card displays:**
- Task title
- Brief description
- Due date
- Status badge (Pending / In Progress / Completed / Overdue)

**Visual indicators:**
- Overdue tasks have **red left border** + red text

**User action:**
- Tap task → Navigate to Task Details screen

**Logic:** Tasks automatically become "Overdue" if:
- Current date > due date AND status ≠ "Completed"
- Checked every 60 seconds in AppContext

#### Tab 2: My Hazards (Hazard Hunt)

**What's shown:**
- "+ New Hazard Report" button (prominent)
- List of hazards created by this user
- Sourced from `hazards` array in AppContext

**Each hazard card displays:**
- Subject line
- Brief description (2 lines max)
- Location with 📍 icon
- Status badge (Open / In Progress / Closed)
- Priority badge (High / Medium / Low) with color coding
- Photo indicators if before/after photos exist
- Created date

**User actions:**
- Tap "+ New Hazard Report" → Navigate to New Hazard Form
- Tap hazard card → Navigate to Hazard Details

#### Tab 3: Voluntary Actions

**What's shown:**
- List of optional HSE activities users can perform
- Sourced from `voluntaryActions` array in AppContext

**Each action card displays:**
- Action title
- Description
- "Optional" label in yellow
- Checkbox (✓ if completed, empty box if not)

**User action:**
- Tap card → Toggle completion status (updates immediately)

**Example actions:**
- Housekeeping Check
- PPE Audit
- Fire Extinguisher Inspection

---

### 4. New Hazard Form (`app/hse/new-hazard.tsx`)

**Purpose**: Report safety hazards detected on site

**Form fields:**

**Required:**
- **Subject/Title** (text input)
- **Description** (multiline text area)
- **Location** (text input)

**Category Selection** (chip-style buttons):
- Housekeeping
- PPE
- Equipment
- Environmental
- Other

**Priority Selection** (chip-style buttons with color coding):
- Low → Yellow chip
- Medium → Orange chip
- High → Red chip when selected

**Optional:**
- **Before Photo** (image placeholder - can add/remove)
- **After Photo** (image placeholder - can add/remove)

**Actions:**
- **"Save as Draft"** → Creates hazard, returns to HSE tab
- **"Submit Hazard"** → Validates required fields, creates hazard with status "OPEN", returns to HSE tab

**Validation logic:**
- Prevents submission if subject, description, or location is empty
- Shows error messages under invalid fields

---

### 5. Hazard Details Screen (`app/hse/[id].tsx`)

**Purpose**: View and update existing hazard reports

**What's displayed:**
- Status and priority badges at top
- All hazard information in card sections:
  - Subject
  - Description
  - Location (with 📍 icon)
  - Category (capitalized)
  - Before/After photos (full size if available)
  - Notes (if any)
  - Timeline (created & last updated timestamps)

**Actions available:**
- **"Mark In Progress"** button (if status is not already "In Progress")
- **"Mark as Closed"** button (if status is not already "Closed")

**Logic:** Status changes update the hazard in AppContext and refresh the UI immediately.

---

### 6. Task Details Screen (`app/hse/task/[id].tsx`)

**Purpose**: View and complete assigned HSE tasks

**What's displayed:**
- Status badge
- Task title
- Full description
- Due date (highlighted in red if overdue)
- Timeline (assigned date, last updated)

**Actions available:**
- **"Start Task"** button (changes status to "In Progress")
  - Only shown if status is "Pending" or "Overdue"
- **"Mark as Completed"** button (changes status to "Completed")
  - Only shown if status is not already "Completed"

**Logic:** Status changes update the task in AppContext immediately.

---

### 7. Daily Report Modal (`app/daily-report-modal.tsx`)

**Purpose**: Mandatory end-of-day operational report

**Modal behavior:**
- **Full-screen presentation**
- **Cannot be dismissed** - no close button, no swipe-to-dismiss gesture
- Only closes after successful submission

**Header displays:**
- Current date (full format)
- Current time

**Form fields:**

**Required:**
- **Well/Location** (text input)
- **Summary of Operations** (multiline text area)
- **Safety Status** (two large toggle buttons):
  - ✓ Safe (green button)
  - ⚠ Issues (red button)

**Conditional field:**
- **Issues Description** (multiline)
  - Only appears if "Issues" is selected
  - Becomes required if visible

**Submission:**
- "Submit Report" button
- Validates all required fields
- Shows error messages if fields are missing
- On success: Saves report to AppContext, closes modal, returns to Operations

**Access:**
- Test button on Operations screen
- **Future**: Automatic popup at 18:00 and 23:59 daily (not yet implemented)

---

### 8. Profile Tab (`app/(tabs)/profile.tsx`)

**Purpose**: User profile and settings (placeholder)

**Current state:**
- Simple centered text: "Profile" title
- Subtitle: "User profile and settings coming soon..."

**Future implementation:**
- User information
- App settings
- Logout button
- Theme preferences

---

## 🔄 Data Flow Logic

### How data moves through the app:

1. **App Initialization** (`app/_layout.tsx`)
   - `AppProvider` wraps entire app
   - Mock data loaded into Context state
   - All screens access state via `useApp()` hook

2. **Creating a Well** (Operations → New Well Wizard)
   ```
   User fills form → Validates each step → Reaches Step 5
   → Clicks "Submit Well" → Calls addWell() from AppContext
   → New well added to wells array with status "COMPLETED"
   → Returns to Operations tab → Well appears in "Completed Wells"
   ```

3. **Creating a Hazard** (HSE → New Hazard)
   ```
   User fills form → Selects category & priority → Adds photos
   → Clicks "Submit Hazard" → Validates required fields
   → Calls addHazard() from AppContext with status "OPEN"
   → Returns to HSE tab → Hazard appears in "My Hazards"
   ```

4. **Updating Task Status** (HSE → Task Details)
   ```
   User views task → Clicks "Mark as Completed"
   → Calls updateTask(id, {status: "COMPLETED"}) from AppContext
   → Task status updates in state → UI refreshes
   → Returns to list → Badge changes to "Completed"
   ```

5. **Automatic Overdue Detection**
   - AppContext runs interval check every 60 seconds
   - Compares task due dates with current time
   - Updates status to "OVERDUE" if past due and not completed

---

## 🎨 UI Component Library

All reusable components located in `components/ui/`:

### Button (`Button.tsx`)
**Props:**
- `title`: Button text
- `onPress`: Click handler
- `variant`: 'primary' | 'secondary' | 'danger' | 'outline'
- `size`: 'small' | 'medium' | 'large'
- `disabled`: Boolean
- `loading`: Shows spinner

### Card (`Card.tsx`)
**Props:**
- `children`: Content
- `style`: Custom styles
- `noPadding`: Remove default padding

### Input (`Input.tsx`)
**Props:**
- `label`: Field label
- `value`: Current value
- `onChangeText`: Change handler
- `error`: Error message
- `required`: Shows red asterisk
- All standard TextInput props

### StatusBadge (`StatusBadge.tsx`)
**Props:**
- `status`: WellStatus | TaskStatus | HazardStatus | HazardPriority
- Automatically applies correct color and label

### ProgressStepper (`ProgressStepper.tsx`)
**Props:**
- `currentStep`: Current step number (1-indexed)
- `totalSteps`: Total number of steps
- `labels`: Optional array of step labels

---

## 🗂️ Project File Structure

```
mobileapp/
├── app/
│   ├── _layout.tsx                    # Root layout with AppProvider
│   ├── (tabs)/
│   │   ├── _layout.tsx                # Tab navigation setup
│   │   ├── operations.tsx             # Operations home
│   │   ├── hse.tsx                    # HSE home with 3 tabs
│   │   ├── profile.tsx                # Profile placeholder
│   │   └── [index.tsx, explore.tsx]   # Hidden default screens
│   ├── operations/
│   │   └── new-well.tsx               # 5-step well wizard
│   ├── hse/
│   │   ├── new-hazard.tsx             # Hazard creation form
│   │   ├── [id].tsx                   # Hazard details (dynamic)
│   │   └── task/
│   │       └── [id].tsx               # Task details (dynamic)
│   └── daily-report-modal.tsx         # Mandatory report modal
├── components/
│   ├── ui/                            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ProgressStepper.tsx
│   ├── operations/
│   │   └── WellCard.tsx               # Well list item
│   └── hse/
│       ├── HazardCard.tsx             # Hazard list item
│       └── TaskCard.tsx               # Task list item
├── store/
│   └── AppContext.tsx                 # Global state + mock data
├── types/
│   └── index.ts                       # TypeScript definitions
├── constants/
│   ├── Colors.ts                      # Color palette
│   └── theme.ts                       # Original theme (not used)
└── package.json                       # Dependencies
```

---

## 🚀 Running the App

### Prerequisites
- Node.js installed
- npm or yarn package manager

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npx expo start
```

Then choose your platform:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser
- Scan QR code with Expo Go app on physical device

### Common Issues

**Network Error on Start:**
If you see `TypeError: fetch failed`, try:
```bash
npx expo start --offline
```

**Clear Cache:**
```bash
npx expo start --clear
```

---

## 📝 Mock Data

The app includes realistic mock data in `store/AppContext.tsx`:

### Wells (2 examples)
- **Well Alpha-7**: In Progress, partially completed checklist
- **Well Beta-3**: Completed with photos and voice notes

### HSE Tasks (3 examples)
- **Weekly Safety Inspection**: Pending, due Dec 2
- **Environmental Compliance Report**: Overdue, due Nov 29
- **PPE Inventory Check**: In Progress, due Dec 5

### Hazards (3 examples)
- **Oil spill**: High priority, In Progress, with before photo
- **Damaged safety harness**: Medium priority, Closed, with before/after photos
- **Cluttered walkway**: Low priority, Open, with before photo

### Voluntary Actions (3 examples)
- Housekeeping Check (incomplete)
- PPE Audit (incomplete)
- Fire Extinguisher Inspection (completed)

---

## 🔧 Future Enhancements

### Immediate Next Steps
1. **Real Photo Capture**: Integrate `expo-image-picker`
2. **Real Voice Recording**: Integrate `expo-av`
3. **Local Persistence**: Use AsyncStorage or SQLite
4. **Backend API**: Replace Context CRUD with API calls
5. **Authentication**: Add login/user management

### Planned Features
- Search and filter functionality for wells/hazards
- Export reports as PDF
- Offline data sync queue
- Push notifications for overdue tasks
- Biometric authentication
- Multi-language support

---

## 🛠️ Technology Stack

- **Framework**: React Native 0.81.5
- **Router**: Expo Router 6.0.14 (file-based routing)
- **UI**: React Native components (no external UI library)
- **State**: React Context API
- **Language**: TypeScript 5.9.2
- **Build Tool**: Expo SDK 54.0.23
- **Platform Support**: iOS, Android, Web

---

## 📄 License

This project is for internal use only.

## 👥 Support

For questions or issues, contact the development team.

---

**Last Updated**: December 2025  
**Version**: 1.0.0 (Initial Release)
