# Requirements Document

## Introduction

This feature refactors the Components section of the kanji detail page from the legacy implementation to the new modular architecture. The refactored section must replicate all existing functionality while following established patterns from other refactored sections (readings, meanings, vocabulary). Key improvements include moving edit operations from inline editing to a dedicated dialog interface, using the new SharedSection component, and ensuring complete API support for all operations.

## Requirements

### Requirement 1: Component Display and List Management

**Objective:** As a user, I want to view all components linked to a kanji in a clear, organized layout, so that I can understand the compositional structure of the kanji.

#### Acceptance Criteria

1. When the Components section loads, the Kanji Detail Page shall display all component occurrences linked to the kanji ordered by display_order
2. When a component occurrence exists, the Kanji Detail Page shall display the component character, short meaning, position badge, and radical indicator for each occurrence
3. When no components are linked, the Kanji Detail Page shall display an empty state message indicating no components are present
4. When multiple components are displayed, the Kanji Detail Page shall use a grid layout consistent with other refactored sections
5. The Kanji Detail Page shall use the SharedSection component for consistent layout and collapsibility
6. When a component has a position type, the Kanji Detail Page shall display a position badge using the existing SharedPositionBadge component
7. When a component is marked as radical (is_radical = true), the Kanji Detail Page shall display a visual indicator (radical badge)

### Requirement 2: Component Linking via Dialog

**Objective:** As a user, I want to add and manage components through a dedicated dialog interface with explicit save/cancel actions, so that I can review changes before committing them.

#### Acceptance Criteria

1. When the user clicks the "Edit" action button, the Kanji Detail Page shall open a dialog for component management
2. When the dialog opens, the Kanji Detail Page shall display a search interface for finding and selecting components
3. When searching for components, the Kanji Detail Page shall exclude components already linked to the current kanji
4. When the user selects a component from search results, the Kanji Detail Page shall add it to local edit state (not immediately saved)
5. When the dialog is opened, the Kanji Detail Page shall display Cancel and Save buttons in the footer
6. When the user clicks Save, the Kanji Detail Page shall persist all changes to the database and close the dialog
7. When the user clicks Cancel, the Kanji Detail Page shall discard all pending changes and close the dialog
8. When a component is added, the Kanji Detail Page shall set display_order to the next sequential value based on existing occurrences

### Requirement 3: Quick Create Component

**Objective:** As a user, I want to create a new component directly from the kanji detail page when the needed component doesn't exist, so that I can maintain workflow continuity.

#### Acceptance Criteria

1. When the user searches for a component that doesn't exist, the Kanji Detail Page shall provide a "Create New Component" option
2. When the user triggers quick create, the Kanji Detail Page shall open the SharedQuickCreateComponent dialog
3. When the user enters a single character in search, the Kanji Detail Page shall pre-populate the quick create dialog with that character
4. When a component is created via quick create, the Kanji Detail Page shall automatically link the new component to the current kanji
5. When quick create is successful, the Kanji Detail Page shall close the quick create dialog and return to the main edit dialog

### Requirement 4: Component Editing and Removal

**Objective:** As a user, I want to modify component occurrence details or remove components from a kanji, so that I can maintain accurate compositional analysis.

#### Acceptance Criteria

1. When the edit dialog is open, the Kanji Detail Page shall allow editing position type, component form, and is_radical flag for each occurrence
2. When the user modifies occurrence fields, the Kanji Detail Page shall update local edit state (changes not saved until Save button clicked)
3. When the edit dialog is open, the Kanji Detail Page shall provide a remove/delete action for each component occurrence (in destructive mode only)
4. When the user removes a component, the Kanji Detail Page shall update local edit state to mark occurrence for deletion
5. When the user clicks Save, the Kanji Detail Page shall persist all edits and deletions to the database
6. When an occurrence is removed, the Kanji Detail Page shall recalculate display_order values for remaining occurrences to maintain sequence
7. Analysis notes shall NOT be editable from the kanji detail dialog (only editable from component detail page)

### Requirement 5: Navigation to Component Detail

**Objective:** As a user, I want to navigate to the full component detail page from the components list, so that I can view and edit comprehensive component information.

#### Acceptance Criteria

1. When a component is displayed in the list, the Kanji Detail Page shall provide a clickable link to the component's detail page
2. When the user clicks the component link, the Kanji Detail Page shall navigate to /components/:id route
3. The Kanji Detail Page shall use RouterLink for navigation to maintain SPA behavior
4. When navigating away, the Kanji Detail Page shall preserve any unsaved changes in the dialog (if open) via browser warning

### Requirement 6: API Implementation and Data Integrity

**Objective:** As a developer, I want complete API support for component occurrence operations, so that the UI can perform all necessary data operations reliably.

#### Acceptance Criteria

1. The Component Occurrence Repository shall provide methods: getByParentId(kanjiId), create(input), update(id, input), delete(id), reorder(occurrenceIds)
2. When creating a component occurrence, the API shall validate that the component exists and the kanji exists
3. When updating display_order, the API shall ensure all occurrences for the kanji have unique, sequential order values
4. When deleting an occurrence, the API shall automatically recalculate display_order for remaining occurrences
5. When any mutation occurs, the API shall trigger database persistence via schedulePersist()
6. The API shall return properly typed entities (ComponentOccurrence) with all fields mapped from database rows
7. If any API method is missing or incomplete, the Implementation Phase shall implement or fix the required functionality

### Requirement 7: Mobile Responsiveness and UI Constraints

**Objective:** As a user, I want the Components section to work flawlessly on mobile devices, so that I can manage components on any screen size without usability issues.

#### Acceptance Criteria

1. When the Components section is displayed on mobile devices, the Kanji Detail Page shall use responsive grid layout that prevents horizontal scrolling
2. When the dialog is opened on mobile, the Kanji Detail Page shall ensure all form inputs (text, select, textarea) fit within the viewport without extending beyond screen boundaries
3. When select/dropdown menus are opened, the Kanji Detail Page shall ensure options display properly within the viewport on mobile devices
4. When long text is displayed (meanings, notes), the Kanji Detail Page shall use ellipsis overflow to prevent horizontal extension
5. When touch targets (buttons, links) are rendered, the Kanji Detail Page shall ensure minimum 44x44px size for accessibility
6. The Kanji Detail Page shall be tested on mobile breakpoints: 320px, 375px, 768px, 1024px

### Requirement 8: Destructive Actions and Confirmation

**Objective:** As a user, I want explicit confirmation before unlinking components in destructive mode, so that I cannot accidentally delete data.

#### Acceptance Criteria

1. When destructiveMode is false, the Kanji Detail Page shall hide all delete/unlink buttons from the UI
2. When destructiveMode is true, the Kanji Detail Page shall display delete/unlink buttons for each component occurrence
3. When the user clicks an unlink button, the Kanji Detail Page shall not immediately delete the occurrence
4. When the user clicks an unlink button, the Kanji Detail Page shall open a confirmation dialog requiring explicit user confirmation
5. When the user confirms deletion in the confirmation dialog, the Kanji Detail Page shall delete the occurrence and close the dialog
6. When the user cancels in the confirmation dialog, the Kanji Detail Page shall close the dialog without deleting the occurrence
7. The Kanji Detail Page shall use SharedConfirmDialog component for all destructive confirmations

### Requirement 9: Form Validation and Data Integrity

**Objective:** As a developer, I want all form inputs validated using vee-validate and zod schemas, so that invalid data cannot be submitted to the API.

#### Acceptance Criteria

1. When forms exist in the dialog (occurrence editing, search), the Kanji Detail Page shall use vee-validate for form management
2. When validation rules are needed, the Kanji Detail Page shall define zod schemas for type-safe validation
3. When the user submits a form with invalid data, the Kanji Detail Page shall display field-level error messages
4. When the user corrects invalid fields, the Kanji Detail Page shall clear error messages in real-time
5. The Kanji Detail Page shall prevent form submission when validation errors exist
6. When optional fields exist (position, form, notes), the Kanji Detail Page shall validate them only when populated

### Requirement 10: Testing and Code Quality

**Objective:** As a developer, I want comprehensive test coverage and adherence to coding standards, so that the refactored code is maintainable and reliable.

#### Acceptance Criteria

1. The implementation shall include colocated unit tests for all new components (.test.ts files)
2. The implementation shall include E2E tests covering: view mode display, add component via dialog, quick create component, edit occurrence details, remove component, navigation to component detail, mobile responsiveness
3. When files are created, the implementation shall follow naming conventions: KanjiDetailSectionComponents, KanjiDetailComponentsDisplay, KanjiDetailDialogComponents, use-kanji-detail-components-handlers.ts, kanji-detail-components-schema.ts
4. When components are created, the implementation shall prefix all component names with "KanjiDetail" and all file names with "kanji-detail"
5. When Section components are created, the implementation shall follow the pattern KanjiDetailSection[Name] where [Name] is Components
6. The implementation shall respect file size limits: Root ≤ 200 lines, Section ≤ 250 lines, UI ≤ 200 lines, Composable ≤ 200 lines
7. The implementation shall use TypeScript strict mode with no `any` types
8. The implementation shall use CSS design token variables for all styling
9. When tests are run, the implementation shall produce no warnings in test output
10. The implementation shall pass all checks: `pnpm test`, `pnpm test:e2e`, `pnpm lint`, `pnpm type-check`
11. When E2E tests are written, the implementation shall ensure each test case completes within 1 second

### Requirement 11: Consistency with Refactored Sections

**Objective:** As a developer, I want the Components section to follow the same patterns as other refactored sections, so that the codebase maintains architectural consistency.

#### Acceptance Criteria

1. The implementation shall use SharedSection component for section layout (matching KanjiDetailSectionVocabulary pattern)
2. The implementation shall use a dedicated dialog component for editing (matching KanjiDetailDialogVocabulary pattern)
3. The implementation shall separate display and search/edit into distinct components (matching vocabulary section pattern)
4. The implementation shall use the same action button placement and styling as other refactored sections
5. The implementation shall follow the same event handling patterns (emit from child, handle in parent/section)
6. The implementation shall use the same loading state and error handling patterns
7. When legacy components are needed (SharedQuickCreateComponent, SharedPositionBadge), the implementation shall copy the component code to the new location (src/shared/components/) instead of importing from legacy
8. When copying legacy components, the implementation shall ensure the copied code follows all new ESLint rules and coding standards
9. The implementation shall extract handler logic to composables (use-kanji-detail-components-handlers.ts) instead of adding inline handlers to KanjiDetailRoot
10. When handler composables are created, the implementation shall follow the naming pattern use-kanji-detail-[feature]-handlers.ts
