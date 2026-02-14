# Implementation Plan

## Task Overview

This implementation refactors the Components section of the kanji detail page following the established vocabulary section pattern. The work includes copying legacy shared components to the new location, implementing form validation with vee-validate + zod, ensuring mobile responsiveness, and extracting handler logic to composables. All code must follow new ESLint rules and pass quality checks without warnings.

---

## Tasks

- [x] 0. Copy Legacy Shared Components to New Location
- [x] 0.1 (P) Copy SharedQuickCreateComponent from legacy to src/shared/components/
  - Copy `src/legacy/shared/components/SharedQuickCreateComponent.vue` to `src/shared/components/`
  - Copy test file if exists and update import paths
  - Run `make lint-file FILE=src/shared/components/SharedQuickCreateComponent.vue`
  - Fix all ESLint violations (prop definitions, event typing, no `any` types)
  - Update to use design tokens if hardcoded values exist
  - Ensure TypeScript strict mode compliance
  - Run `make test-file FILE=src/shared/components/SharedQuickCreateComponent.test.ts` (if exists)
  - Verify all tests pass with no warnings
  - _Requirements: 11.7, 11.8_

- [x] 0.2 (P) Copy SharedPositionBadge from legacy to src/shared/components/
  - Copy `src/legacy/shared/components/SharedPositionBadge.vue` to `src/shared/components/`
  - Copy test file if exists and update import paths
  - Run `make lint-file FILE=src/shared/components/SharedPositionBadge.vue`
  - Fix all ESLint violations (prop definitions, event typing, no `any` types)
  - Update to use design tokens if hardcoded values exist
  - Ensure TypeScript strict mode compliance
  - Run `make test-file FILE=src/shared/components/SharedPositionBadge.test.ts` (if exists)
  - Verify all tests pass with no warnings
  - _Requirements: 11.7, 11.8_

- [x] 1. Type Definitions and Validation Schemas
- [x] 1.1 (P) Define ComponentOccurrenceWithDetails type in kanji-detail-types.ts
  - Extend base ComponentOccurrence with populated component, position, and form data
  - Include JSDoc comments explaining denormalized structure
  - Export from kanji-detail-types.ts for use across components
  - _Requirements: 1.1, 1.2, 1.6, 1.7_

- [x] 1.2 (P) Create zod validation schemas in kanji-detail-components-schema.ts
  - Define occurrenceEditSchema for validating position, form, radical, notes fields
  - Export TypeScript types inferred from schemas
  - Ensure optional fields (position, form, notes) validate only when populated
  - Keep schema file under 200 lines
  - _Requirements: 9.1, 9.2, 9.4, 9.6_

- [x] 2. Display Components (View Mode)
- [x] 2.1 (P) Create KanjiDetailComponentItem component
  - Display component character in large kanji font with design tokens
  - Show short meaning with ellipsis overflow for long text (prevent horizontal scroll)
  - Render position badge using SharedPositionBadge (import from src/shared/components/)
  - Display radical indicator (🔶 Radical badge) when isRadical is true
  - Include RouterLink to `/components/:id` for navigation
  - Apply card-style layout with responsive sizing (padding, border, border-radius from design tokens)
  - Ensure mobile-friendly sizing with min touch target 44x44px for link
  - Verify no horizontal overflow on 320px viewport
  - _Requirements: 1.2, 1.6, 1.7, 5.1, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 2.2 (P) Create KanjiDetailComponentsDisplay component
  - Accept occurrences array prop (ComponentOccurrenceWithDetails[])
  - Render empty state message when occurrences array is empty
  - Use CSS grid layout with `repeat(auto-fit, minmax(200px, 1fr))` for responsive columns
  - Map occurrences to KanjiDetailComponentItem components with proper keys
  - Apply spacing and gap using design token variables
  - Test mobile responsiveness at 320px, 375px, 768px breakpoints
  - Verify no horizontal scroll on any breakpoint
  - _Requirements: 1.1, 1.3, 1.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 11.3_

- [x] 3. Search and Quick-Create Functionality
- [x] 3.1 (P) Create KanjiDetailComponentSearch component
  - Implement search input with label and placeholder props
  - Filter availableComponents prop by character or shortMeaning (case-insensitive)
  - Display search results as clickable list items
  - Emit select event with componentId when result clicked
  - Show "Create New Component" button when search term has no matches
  - Emit create event with search term when "Create New" clicked
  - Apply debounced search if performance testing shows need (optional optimization)
  - _Requirements: 2.2, 2.3, 2.4, 3.1_

- [x] 4. Dialog Component (Edit Mode)
- [x] 4.1 Implement KanjiDetailDialogComponents dialog structure with form validation
  - Use Reka UI DialogRoot with open prop (v-model:open binding)
  - Load position types on mount using usePositionTypeRepository
  - Load all components for search using useComponentRepository
  - Calculate excludedIds from linkedOccurrences prop (map to componentIds)
  - Manage isQuickCreateMode state for toggling between search and quick-create views
  - Manage confirmation dialog state (showConfirmDialog, pendingRemoveOccurrenceId)
  - Apply scrollable content area with max-height: 80vh for mobile support
  - Set up vee-validate form with zod schema from kanji-detail-components-schema
  - Ensure all form inputs use max-width: 100% to prevent dialog overflow
  - _Requirements: 2.1, 2.5, 2.8, 4.1, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.1, 9.2_

- [x] 4.2 Implement component search and link functionality in dialog
  - Render KanjiDetailComponentSearch with filtered components (excluding linked)
  - Handle select event by emitting link event to parent Section
  - Close dialog after successful link (update:open event)
  - Clear search state when dialog closes
  - _Requirements: 2.2, 2.3, 2.4, 2.7_

- [x] 4.3 Implement quick-create component flow in dialog
  - Handle create event from Search by switching to quick-create mode
  - Open SharedQuickCreateComponent dialog (import from src/shared/components/)
  - Pre-populate initialCharacter prop if search term is single character
  - Handle quick-create submit by emitting create event to parent
  - Close both dialogs (quick-create and main dialog) after successful creation
  - Handle quick-create cancel by returning to search mode
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.4 Implement occurrence editing controls in dialog with validation
  - Display list of linkedOccurrences with editable fields
  - Render dropdown for position type selection (load all position types, ensure mobile-friendly menu)
  - Render dropdown for component form selection (load forms by componentId, ensure mobile-friendly menu)
  - Render checkbox for isRadical flag
  - Render textarea for analysisNotes (max-width: 100%)
  - Use vee-validate to bind fields to form schema
  - Display field-level validation errors below inputs
  - Clear validation errors when user corrects invalid fields
  - Prevent form submission when validation errors exist
  - Handle field changes and emit update events to parent (or manage local state and save on dialog close)
  - _Requirements: 2.6, 4.1, 4.2, 7.1, 7.2, 7.3, 9.3, 9.4, 9.5, 9.6_

- [x] 4.5 Implement occurrence unlinking with confirmation
  - Show unlink button for each occurrence only when destructiveMode prop is true
  - Hide unlink buttons when destructiveMode is false
  - Handle unlink button click by storing occurrenceId in pendingRemoveOccurrenceId
  - Open SharedConfirmDialog when unlink clicked (do NOT delete immediately)
  - Handle confirmation by emitting unlink event with pending ID
  - Handle cancel by clearing pending ID and closing confirmation dialog
  - Close confirmation dialog after successful unlink
  - _Requirements: 4.3, 4.4, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 5. Section Component (Orchestrator)
- [x] 5.1 Create KanjiDetailSectionComponents component
  - Wrap content in SharedSection component with title "Components"
  - Render "Edit" button in actions slot (size="sm", variant="secondary")
  - Manage dialogOpen state (toggled by Edit button and dialog close events)
  - Pass occurrences, allComponents, and destructiveMode props to Display and Dialog
  - Emit link, unlink, and create events to parent Root component
  - Follow vocabulary section pattern for structure and event handling
  - File naming: `KanjiDetailSectionComponents.vue` (Section prefix, Components suffix)
  - _Requirements: 1.5, 2.1, 10.3, 10.4, 10.5, 11.1, 11.2, 11.5_

- [x] 6. Handler Composable and Root Integration
- [x] 6.1 Create use-kanji-detail-components-handlers composable
  - Accept kanjiId and occurrences as reactive refs
  - Accept component and occurrence repositories as parameters
  - Implement handleLink: create occurrence via repository, show toast, refresh data
  - Implement handleUnlink: delete occurrence via repository, show toast, refresh data
  - Implement handleCreate: create component, create occurrence, show toast, refresh data
  - Return handler functions for use in Root component
  - Catch all errors and convert to toast error messages
  - Keep composable under 200 lines
  - File naming: `use-kanji-detail-components-handlers.ts`
  - _Requirements: 2.5, 2.7, 4.4, 6.1, 6.2, 6.3, 6.4, 6.5, 10.3, 10.4, 11.4, 11.5, 11.9, 11.10_

- [x] 6.2 Integrate KanjiDetailSectionComponents into KanjiDetailRoot
  - Import KanjiDetailSectionComponents in Root component
  - Load component occurrences data using useKanjiDetailData (or equivalent composable)
  - Import and call use-kanji-detail-components-handlers composable (do NOT add handlers inline in Root)
  - Pass occurrences, allComponents, and destructiveMode props to Section
  - Wire Section events (link, unlink, create) to handlers from composable
  - Render Section component in appropriate position (after vocabulary section in template)
  - Ensure Root component stays under 200 lines after integration
  - _Requirements: 2.5, 2.7, 4.4, 6.6, 10.6, 11.4, 11.5, 11.9, 11.10_

- [x] 7. Component Testing
- [x] 7.1\* Baseline unit tests for display components
  - Test KanjiDetailComponentItem renders character, meaning, badges, and navigation link
  - Test KanjiDetailComponentsDisplay renders grid, empty state, and proper item count
  - Test component prop validation and TypeScript types
  - Run `make test-file FILE=path/to/file.test.ts` to verify
  - Ensure no warnings in test output
  - _Requirements: 10.1, 10.7, 10.9_

- [x] 7.2\* Baseline unit tests for search, dialog, and composable
  - Test KanjiDetailComponentSearch filters and displays results correctly
  - Test search emit events (select, create) with correct payloads
  - Test KanjiDetailDialogComponents manages state (modes, confirmation, pending IDs)
  - Test dialog event emissions (link, unlink, create, update:open)
  - Test form validation errors display and clear correctly
  - Test use-kanji-detail-components-handlers calls repositories and shows toasts
  - Run `make test-file FILE=path/to/file.test.ts` for each component
  - Ensure no warnings in test output
  - _Requirements: 10.1, 10.7, 10.9_

- [x] 7.3 Integration tests for dialog flows
  - Test complete link flow: open dialog → search → select → create occurrence → close dialog
  - Test quick-create flow: open dialog → search (no results) → create new → create component + occurrence → close dialogs
  - Test unlink flow: open dialog → click unlink (destructiveMode) → confirm → delete occurrence → refresh list
  - Test edit occurrence flow: open dialog → change position/form/notes → save → update occurrence
  - Test cancel flows: cancel search, cancel quick-create, cancel confirmation
  - Test form validation: invalid inputs show errors, valid inputs clear errors, submission blocked on errors
  - Run `make test-file FILE=path/to/dialog.test.ts`
  - Ensure no warnings in test output
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 9.3, 9.4, 9.5, 10.2, 10.9_

- [x] 7.4 E2E tests for components section
  - Test: Navigate to kanji detail page, verify components section displays with correct occurrences
  - Test: Click Edit button, search for component, select and link, verify occurrence appears in display
  - Test: Click Edit button, search for non-existent component, create via quick-create, verify auto-linked occurrence
  - Test: Enable destructive mode, click Edit, click unlink button, confirm, verify occurrence removed
  - Test: Click component character/link, verify navigation to component detail page
  - Test: Verify mobile responsiveness (no horizontal scroll) at 375px viewport
  - Test: Verify position badge and radical indicator display when applicable
  - Test: Verify form validation errors display on invalid input, clear on valid input
  - Each test case must complete within 1 second
  - Ensure no warnings in E2E test output
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 9.3, 9.4, 9.5, 10.2, 10.9, 10.11_

- [x] 8. Code Quality and Documentation
- [x] 8.1 Verify file size compliance and code quality
  - Run `make lint-file FILE=path/to/file.vue` for each new component
  - Run `make lint-file FILE=path/to/file.ts` for each new TypeScript file
  - Fix all ESLint violations before proceeding
  - Run `pnpm type-check` and resolve all TypeScript errors
  - Verify file sizes: Section ≤250 lines, Dialog ≤250 lines, Display ≤200 lines, Item ≤200 lines, Search ≤200 lines, Composable ≤200 lines, Schema ≤200 lines
  - Ensure all CSS uses design token variables (no hardcoded colors, spacing, etc.)
  - Verify no `any` types exist in TypeScript code
  - Ensure all components use `<script setup>` with TypeScript
  - _Requirements: 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.8_

- [x] 8.2 Run full test suite and verify coverage
  - Run `pnpm test` and ensure all unit/integration tests pass
  - Run `pnpm test:e2e` and ensure all E2E tests pass
  - Verify no warnings in test output
  - Run `pnpm ci:full` for complete validation
  - Verify test coverage meets project standards
  - Fix any failing tests or regressions
  - _Requirements: 10.9, 10.10_

- [x] 8.3 Verify implementation with Playwright MCP
  - Navigate to kanji detail page (ensure NOT on legacy page)
  - Verify Components section renders correctly
  - Test complete flow: open dialog, search, link component, verify display
  - Test quick-create flow: search non-existent, create, verify auto-link
  - Test delete flow: enable destructive mode, unlink with confirmation
  - Test mobile responsiveness at 375px viewport
  - Test all form fields and validation behavior
  - Verify no UI issues, broken links, or console errors
  - _Requirements: 10.2, 10.11_

---

## Notes

- Tasks marked with `(P)` can be executed in parallel when dependencies allow
- Tasks marked with `*` are optional test coverage tasks that can be deferred if rapid MVP delivery is prioritized
- All requirements are mapped to tasks using numeric IDs only
- Dialog component may exceed 250 lines initially; if so, extract occurrence editing to separate component (KanjiDetailComponentOccurrenceEditor.vue)
- All files must be prefixed with `KanjiDetail` (components) or `kanji-detail` (TypeScript files)
- Section component must follow pattern: `KanjiDetailSectionComponents`
- Handler composable must follow pattern: `use-kanji-detail-components-handlers.ts`
- NO imports from legacy allowed - copy SharedQuickCreateComponent and SharedPositionBadge to src/shared/ first
- Use `make lint-file` and `make test-file` for targeted checks instead of running on all files
- Verify all work with Playwright MCP before marking complete
