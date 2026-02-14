# Requirements Document

## Project Description (Input)

Refactor the component detail page's kanji occurrences section (currently named "Kanji Using This Component" or "ComponentDetailKanjiList" in legacy). Continue the chunk-by-chunk refactoring approach. Completely replicate all functionality from the legacy section. Use SharedSection component with collapsible behavior. All adding/editing of occurrences should be done via dialogs (not inline editing), following the dialog-based pattern used in other refactored sections. Ensure APIs are implemented and verified. Follow naming conventions and ensure proper test coverage.

## Introduction

This specification covers the refactoring of the Kanji Occurrences section of the Component Detail page. This section displays all kanji that use this component, along with occurrence-level metadata (position, form variant, radical flag, analysis notes). The refactoring follows the established modular architecture with Root/Section/UI component hierarchy, uses the SharedSection component for consistent layout, and maintains full feature parity with the legacy implementation while adopting the dialog-based editing pattern.

## Requirements

### Requirement 1: Kanji Occurrences Section Display

**Objective:** As a user, I want to view all kanji that use this component in an organized list, so that I can understand where and how this component appears.

#### Acceptance Criteria

1. When the component detail page loads, the system shall display the Kanji Occurrences section using SharedSection with collapsible behavior
2. When the component has kanji occurrences, the system shall display them as an ordered list showing the kanji character, position, form (if assigned), radical flag, and analysis notes
3. When the component has no kanji occurrences, the system shall display an empty state message indicating no kanji are linked
4. When the section is collapsed, the system shall hide the occurrences list
5. The system shall default the section to open when occurrences exist and collapsed when empty

### Requirement 2: Add Kanji Button Placement

**Objective:** As a user, I want the Add Kanji button to be accessible in the section header, so that I can quickly link new kanji to this component.

#### Acceptance Criteria

1. When the Kanji Occurrences section is expanded, the system shall display the "Add Kanji" button in the SharedSection actions slot
2. When the Kanji Occurrences section is collapsed, the system shall hide the "Add Kanji" button
3. When the user clicks the "Add Kanji" button, the system shall open the Add Kanji dialog

### Requirement 3: Add Kanji Dialog

**Objective:** As a user, I want to link existing kanji to this component through a search dialog, so that I can build the component-kanji relationships.

#### Acceptance Criteria

1. When the Add Kanji dialog opens, the system shall display a searchable list of available kanji (excluding already-linked kanji)
2. When the user searches, the system shall filter kanji by character, meaning, or keywords
3. When the user selects a kanji, the system shall create the occurrence via the API and close the dialog
4. When the occurrence is created successfully, the system shall display the new occurrence in the list and show a success toast
5. If the create operation fails, then the system shall display an error toast notification
6. When the user cancels the dialog, the system shall close it without saving

### Requirement 4: Quick Create Kanji

**Objective:** As a user, I want to create a new kanji directly from the Add Kanji dialog when it doesn't exist, so that I can build my dictionary incrementally.

#### Acceptance Criteria

1. When the user's search yields no results, the system shall offer a "Create New Kanji" option
2. When the user chooses to create a new kanji, the system shall open the Quick Create Kanji dialog
3. When the kanji is created, the system shall automatically link it to this component
4. When the quick create is cancelled, the system shall return to the Add Kanji dialog

### Requirement 5: Occurrence Item Display

**Objective:** As a user, I want each occurrence to display relevant metadata at a glance, so that I can understand the component's role in each kanji.

#### Acceptance Criteria

1. The system shall display the kanji character as a clickable link to the kanji detail page
2. The system shall display the position type name if assigned
3. The system shall display the form variant if assigned
4. The system shall display a "Radical" badge if the occurrence is marked as radical
5. The system shall display analysis notes if present (truncated with expand option if long)
6. The system shall display up/down arrow buttons for reordering

### Requirement 6: Edit Occurrence Dialog

**Objective:** As a user, I want to edit occurrence metadata through a dialog, so that I can update position, form, radical flag, and notes in a focused interface.

#### Acceptance Criteria

1. When the user clicks the Edit button on an occurrence item, the system shall open the Edit Occurrence dialog pre-populated with current values
2. When the Edit dialog opens, the system shall display fields for: position (dropdown), form (dropdown), is radical (checkbox), and analysis notes (textarea)
3. The kanji character shall be displayed as read-only in the dialog header for context
4. When the user submits the form, the system shall update the occurrence via the API and close the dialog
5. When the occurrence is updated successfully, the system shall reflect the changes in the list and show a success toast
6. If the update operation fails, then the system shall display an error toast notification

### Requirement 7: Radical Flag Behavior

**Objective:** As a user, I want the radical flag to be mutually exclusive per kanji, so that each kanji has at most one radical component.

#### Acceptance Criteria

1. When the user sets an occurrence as radical, the system shall unset any existing radical for that kanji
2. When the radical flag is set, the system shall update the kanji's radical_id to point to this component
3. When the radical flag is unset, the system shall clear the kanji's radical_id if it was this component
4. The system shall display a visual indicator on the occurrence when it is marked as radical

### Requirement 8: Delete Occurrence Functionality

**Objective:** As a user, I want to remove kanji-component links when destructive mode is enabled, so that I can correct mistakes.

#### Acceptance Criteria

1. While destructive mode is enabled, the system shall display a delete button on each occurrence item
2. While destructive mode is disabled, the system shall hide the delete buttons
3. When the user clicks the delete button, the system shall display a confirmation dialog with warning about losing analysis notes
4. When the user confirms deletion, the system shall remove the occurrence via the API and update the list
5. When deletion is successful, the system shall show a success toast notification
6. If the delete operation fails, then the system shall display an error toast notification

### Requirement 9: Occurrence Reordering

**Objective:** As a user, I want to reorder occurrences, so that I can control the display order of kanji using this component.

#### Acceptance Criteria

1. When viewing the occurrences list, the system shall display up/down arrow buttons for reordering
2. When the user clicks the up arrow, the system shall move the occurrence up in the order
3. When the user clicks the down arrow, the system shall move the occurrence down in the order
4. When the occurrence is at the top of the list, the system shall disable the up arrow button
5. When the occurrence is at the bottom of the list, the system shall disable the down arrow button
6. When reorder is successful, the system shall persist the new order via the API

### Requirement 10: Kanji Navigation

**Objective:** As a user, I want to navigate to kanji detail pages from the occurrences list, so that I can quickly access related kanji.

#### Acceptance Criteria

1. When the user clicks on a kanji character in the occurrences list, the system shall navigate to the kanji detail page
2. The navigation shall preserve proper back button behavior

### Requirement 11: API Integration

**Objective:** As a developer, I want robust API methods for occurrence management, so that the UI can reliably persist changes.

#### Acceptance Criteria

1. The system shall provide an API method to get all occurrences for a component with joined kanji and position data
2. The system shall provide an API method to create a new occurrence (linking kanji to component)
3. The system shall provide an API method to update occurrence fields (position, form, radical, notes)
4. The system shall provide an API method to delete an occurrence
5. The system shall provide an API method to reorder occurrences
6. The system shall handle radical flag changes with proper kanji.radical_id synchronization
7. The system shall throw appropriate errors for not-found and validation failures

### Requirement 12: Position Types and Forms Data

**Objective:** As a developer, I want access to position types and component forms for dropdowns, so that the edit dialog can present valid options.

#### Acceptance Criteria

1. The system shall provide access to all position types for the position dropdown
2. The system shall provide access to the component's forms for the form dropdown
3. The system shall display "None" as the first option in both dropdowns for unset values

### Requirement 13: Test Coverage

**Objective:** As a developer, I want comprehensive test coverage, so that the refactored section is reliable and maintainable.

#### Acceptance Criteria

1. The system shall have unit tests for all new composables
2. The system shall have component tests for new UI components
3. The system shall have E2E tests covering: adding kanji (search + quick create), editing occurrence metadata, deleting occurrences, reordering, and navigation
4. The system shall pass all existing E2E tests for component detail functionality
5. The system shall have no type errors and pass linting
