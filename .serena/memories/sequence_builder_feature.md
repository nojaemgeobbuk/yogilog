# Sequence Builder Feature

## Overview
Implemented a sequence builder feature that allows users to save and reuse asana combinations.

## New Files Created

### Store
- `store/useSequenceBuilderStore.ts` - Zustand store with AsyncStorage persistence
  - `currentBuildingAsanas` - Asanas being selected for a sequence
  - `savedSequences` - User's saved sequences
  - `favoriteAsanas` - User's favorite asanas
  - Actions: `addAsana`, `removeAsana`, `reorderAsanas`, `clearCurrentBuild`
  - Sequence management: `saveSequence`, `deleteSequence`, `updateSequence`, `loadSequenceToBuilder`
  - Favorites: `toggleFavoriteAsana`, `isFavoriteAsana`

### Components
- `components/SequenceBuilderBar.tsx` - Bottom bar showing selected pose count with "Save Sequence" button
- `components/SaveSequenceModal.tsx` - Modal for naming and saving sequences
- `components/SequenceListContent.tsx` - Displays saved sequences list
- `components/AsanaListContent.tsx` - Updated with favorite toggle (heart icon)

### Types
- `types/index.ts` - Added types:
  - `SequenceAsanaItem` - { itemId, asanaName }
  - `UserSequence` - { id, name, asanas, createdAt, updatedAt }
  - `SequenceBuilderStore` - Store interface

## Updated Files

### AsanaInput Component (`components/AsanaInput.tsx`)
- Added 3 tabs: "전체" (All), "내 시퀀스" (My Sequences), "즐겨찾기" (Favorites)
- Integrated with sequence builder store
- Added `sequenceBuilderMode` prop (default true)
- Shows favorite toggle (heart icon) on each asana
- Loading sequences adds all their asanas at once

### Write Modal (`app/(modals)/write.tsx`)
- Added `SequenceBuilderBar` component
- Added `clearCurrentBuild` on close/save
- Integrated with sequence builder store

### Edit Screen (`app/edit/[id].tsx`)
- Same updates as write modal

## Data Persistence
- Uses AsyncStorage (same pattern as useYogaStore)
- Storage key: "yogilog-sequences"
- Persisted: `savedSequences`, `favoriteAsanas`
- NOT persisted: `currentBuildingAsanas` (temporary state)

## Design
- Uses app identity color (Colors.primary = #E88D67) for buttons
- Black bar (Colors.text) with white text for sequence builder bar
- Beige (Colors.secondary) for icon backgrounds

## Future Enhancements (TODO)
- Connect to Supabase for cloud sync
- Drag-and-drop reordering of asanas in sequence
- Sequence editing functionality
