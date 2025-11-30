# RedNotebook Mobile

A React Native mobile application compatible with RedNotebook desktop journal format, built with Expo.

## Overview

RedNotebook Mobile allows users to create, edit, and manage journal entries that are fully compatible with the RedNotebook desktop application. The app uses the same YAML file format and folder structure (`YYYY/MM/DD.txt`) as RedNotebook.

## Features

### Core Functionality
- **Journal Entry Management**: Create, edit, and view journal entries by date
- **Tag System**: Add, remove, and browse entries by tags
- **Calendar View**: Visual calendar with indicators for days with entries
- **Today Quick Access**: Dedicated tab for quick daily journaling

### Cloud Sync
- **Google Drive Integration**: Sync journal files with Google Drive
- **OneDrive Integration**: Sync journal files with Microsoft OneDrive
- **Bidirectional Sync**: Upload local entries and download cloud entries

### Offline-First
- All entries are stored locally using AsyncStorage
- Works fully offline without cloud connectivity
- Sync when connectivity is available

## Project Structure

```
├── App.tsx                 # Root component with providers
├── context/
│   ├── JournalContext.tsx  # Journal state management
│   └── SyncContext.tsx     # Cloud sync state management
├── models/
│   ├── JournalEntry.ts     # Entry data model with YAML support
│   └── SyncState.ts        # Sync state data model
├── services/
│   ├── LocalStorageService.ts  # Local YAML file operations
│   ├── GoogleDriveService.ts   # Google Drive API integration
│   └── OneDriveService.ts      # OneDrive/Microsoft Graph integration
├── screens/
│   ├── CalendarScreen.tsx      # Main calendar view
│   ├── TodayScreen.tsx         # Today's entry editor
│   ├── TagsScreen.tsx          # Browse all tags
│   ├── TagEntriesScreen.tsx    # Entries filtered by tag
│   ├── SettingsScreen.tsx      # App settings and sync
│   └── EntryEditorScreen.tsx   # Full entry editor modal
├── components/
│   ├── Calendar.tsx            # Calendar widget
│   ├── EntryEditor.tsx         # Entry text/tags editor
│   ├── EntryPreviewCard.tsx    # Entry preview card
│   ├── TagChip.tsx             # Tag display chip
│   └── ...                     # Other UI components
├── navigation/
│   ├── MainTabNavigator.tsx    # Bottom tab navigation
│   └── *StackNavigator.tsx     # Individual stack navigators
└── utils/
    └── dateUtils.ts            # Date formatting utilities
```

## RedNotebook Compatibility

### File Format
Entries are stored as YAML files with the following structure:
```yaml
text: |
  This is my journal entry text.
  It can span multiple lines.
tags:
  - mood
  - work
  - example
```

### Folder Structure
Cloud sync uses the same folder structure as RedNotebook:
```
RedNotebookMobile/Journal/
├── 2024/
│   ├── 01/
│   │   ├── 01.txt
│   │   ├── 15.txt
│   │   └── 31.txt
│   └── 02/
│       └── 14.txt
└── 2025/
    └── 01/
        └── 01.txt
```

## Tech Stack

- **React Native** with **Expo SDK 54**
- **React Navigation 7** for navigation
- **AsyncStorage** for local persistence
- **js-yaml** for YAML parsing/serialization
- **Replit Integrations** for OAuth (Google Drive, OneDrive)

## Design System

The app follows Material Design principles with a custom color palette:
- Primary: #1976D2 (Material Blue 700)
- Accent: #FFA726 (Material Orange 400)
- See `design_guidelines.md` for full specifications

## Recent Changes

- **2024-11-30**: Initial implementation
  - Created complete app structure
  - Implemented local storage with RedNotebook format
  - Added Google Drive and OneDrive sync services
  - Built all screens and navigation
  - Created calendar component with entry indicators
  - Implemented tag management system

## Development

Run the app:
```bash
npm run dev
```

Test on device:
- Scan QR code with Expo Go (Android/iOS)
- Or use web browser at localhost:8081

## User Preferences

- Clean, minimal UI following iOS design patterns
- No emojis in the application
- Material Design icons from Feather icon set
