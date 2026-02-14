# Implementation Plan

## Overview

This plan implements the Kanji Occurrences section for the Component Detail page. Tasks are organized by dependency order: API first, then shared components, then module components, finally integration and testing.

## Task Dependencies

```
1. API Extension
   ↓
2. Shared Components Migration
   ↓
3. UI Components (3.1-3.4 can be parallel after 2)
   ↓
4. Section Component
   ↓
5. Root Integration
   ↓
6. E2E Testing
```

---

## Tasks

- [x] 1. Extend Component Occurrence Repository with Joined Query
- [x] 1.1 Add OccurrenceWithKanji type to component-types.ts
  - Define interface extending ComponentOccurrence with kanji and position properties
  - Export from component module index
  - _Requirements: 11_

- [x] 1.2 Implement getByComponentIdWithKanji method in repository
  - Add SQL join query for kanjis and position_types tables
  - Map joined row data to OccurrenceWithKanji type
  - Return ordered by display_order
  - Add unit tests for the new method
  - _Requirements: 11_

---

- [x] 2. Migrate Shared Components from Legacy
- [x] 2.1 Migrate SharedEntitySearch component (P)
  - Copy from legacy/shared/components to shared/components
  - Update imports to use new base components and types
  - Update type imports to use new API types
  - Simplify if needed (remove unused features)
  - Add unit test file
  - _Requirements: 3_

- [x] 2.2 Migrate SharedQuickCreateKanji component (P)
  - Copy from legacy/shared/components to shared/components
  - Update imports to new base components
  - Update type imports and validation schema
  - Add unit test file
  - _Requirements: 4_

- [x] 2.3 Add OccurrenceUpdateData type to component-detail-types.ts
  - Define type for edit dialog form data
  - Include positionTypeId, componentFormId, isRadical, analysisNotes
  - _Requirements: 6, 12_

---

- [x] 3. Create UI Components
- [x] 3.1 Create ComponentDetailOccurrenceItem component (P)
  - Display kanji character as RouterLink to detail page
  - Show position badge using SharedPositionBadge
  - Show form name badge if form assigned
  - Show "Radical" badge if isRadical is true
  - Display analysis notes (truncated if long)
  - Add reorder buttons (up/down arrows)
  - Add edit button (always visible)
  - Add delete button (only in destructive mode)
  - Emit edit, delete, move-up, move-down events
  - Style consistent with ComponentDetailFormItem
  - Add unit test file
  - _Requirements: 5, 9, 10_

- [x] 3.2 Create ComponentDetailDialogAddKanji component (P)
  - Use BaseDialog wrapper with title "Add Kanji"
  - Integrate SharedEntitySearch with entityType="kanji"
  - Pass filtered kanji list (exclude already-linked IDs)
  - Handle select event to emit kanji ID
  - Handle createNew event to open quick create
  - Include SharedQuickCreateKanji dialog
  - Emit update:open, select, create events
  - Add unit test file
  - _Requirements: 3, 4_

- [x] 3.3 Create ComponentDetailDialogEditOccurrence component (P)
  - Use BaseDialog wrapper with title "Edit Occurrence"
  - Display kanji character as read-only header context
  - Position dropdown using BaseSelect with None option
  - Form dropdown using BaseSelect with None option (hide if no forms)
  - Is Radical checkbox using BaseCheckbox
  - Analysis notes textarea using BaseTextarea
  - Save and Cancel buttons
  - Reset form state when dialog opens
  - Emit submit with OccurrenceUpdateData on save
  - Add unit test file
  - _Requirements: 6, 7, 12_

---

- [x] 4. Create Section Component
- [x] 4.1 Create ComponentDetailSectionOccurrences component
  - Use SharedSection with collapsible behavior
  - Compute defaultOpen based on whether occurrences exist
  - Add "Add Kanji" button in actions slot (hidden when collapsed)
  - Render list of ComponentDetailOccurrenceItem components
  - Show empty state when no occurrences
  - Manage dialog state for add, edit, delete dialogs
  - Track editingOccurrence and deletingOccurrence refs
  - Handle item edit click to open edit dialog
  - Handle item delete click to open confirm dialog
  - Handle reorder with move-up/move-down logic
  - Include ComponentDetailDialogAddKanji
  - Include ComponentDetailDialogEditOccurrence
  - Include SharedConfirmDialog for delete confirmation
  - Emit add, create, update, remove, reorder events to parent
  - Add unit test file
  - _Requirements: 1, 2, 8, 9_

---

- [x] 5. Integrate with ComponentDetailRoot
- [x] 5.1 Add occurrence data loading to root
  - Import useComponentOccurrenceRepository
  - Add occurrences ref of type OccurrenceWithKanji[]
  - Add positionTypes ref loaded from usePositionTypeRepository
  - Load occurrences in loadComponent function using getByComponentIdWithKanji
  - Load all kanji for search (kanjiOptions already exists)
  - _Requirements: 11, 12_

- [x] 5.2 Add occurrence event handlers to root
  - handleOccurrenceAdd: create occurrence and reload
  - handleOccurrenceCreate: create kanji first, then create occurrence
  - handleOccurrenceUpdate: update occurrence and reload
  - handleOccurrenceRemove: remove occurrence and reload
  - handleOccurrenceReorder: reorder and reload
  - Show toast notifications for success/error
  - _Requirements: 3, 4, 6, 7, 8, 9_

- [x] 5.3 Render ComponentDetailSectionOccurrences in root template
  - Add section between Forms and Actions sections
  - Pass all required props: occurrences, forms, positionTypes, allKanji, componentId, isDestructiveMode
  - Wire up event handlers
  - _Requirements: 1, 2_

---

- [x] 6. Add E2E Tests
- [x] 6.1 Add E2E tests for occurrence display and navigation
  - Navigate to component detail page with linked kanji
  - Verify occurrences section is visible
  - Verify kanji characters are displayed
  - Click kanji link and verify navigation to kanji detail
  - Navigate back to component detail
  - _Requirements: 1, 5, 10_

- [x] 6.2 Add E2E tests for adding kanji occurrence
  - Open Add Kanji dialog from section header
  - Search for existing kanji
  - Select kanji from results
  - Verify occurrence appears in list
  - Verify success toast shown
  - _Requirements: 2, 3_

- [x] 6.3 Add E2E tests for quick create kanji flow
  - Open Add Kanji dialog
  - Search for non-existent kanji
  - Click Create New option
  - Fill quick create form
  - Submit and verify occurrence created
  - _Requirements: 4_

- [x] 6.4 Add E2E tests for editing occurrence metadata
  - Click edit button on occurrence item
  - Verify edit dialog opens with current values
  - Change position type dropdown
  - Change form dropdown (if forms exist)
  - Toggle radical checkbox
  - Update analysis notes
  - Save and verify changes persist
  - _Requirements: 6, 7, 12_

- [x] 6.5 Add E2E tests for deleting occurrence
  - Enable destructive mode
  - Click delete button on occurrence
  - Verify confirmation dialog appears
  - Confirm deletion
  - Verify occurrence removed from list
  - _Requirements: 8_

- [x] 6.6 Add E2E tests for reordering occurrences
  - Add multiple kanji to component
  - Use up/down buttons to reorder
  - Verify order persists after page reload
  - _Requirements: 9_

---

## Validation Checklist

- [x] All 13 requirements have mapped tasks
- [x] API extension tested with unit tests
- [x] All UI components have colocated unit tests
- [x] E2E tests cover all major user flows
- [x] File sizes within limits per design estimates
- [x] No TypeScript errors
- [x] Linting passes
