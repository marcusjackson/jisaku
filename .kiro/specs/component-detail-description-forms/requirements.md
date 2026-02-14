# Requirements Document

## Project Description (Input)

Refactor the component detail page's description and forms management sections. Continue the chunk-by-chunk refactoring approach. Completely replicate all functionality from legacy sections. Use SharedSection component with collapsible behavior. Move "Add Form" button to SharedSection actions slot (hidden when collapsed, following the pattern in KanjiSectionStrokeOrder). Ensure APIs are implemented and verified. Follow naming conventions and ensure proper test coverage.

## Introduction

This specification covers the refactoring of two sections of the Component Detail page: the Description section and the Forms Management section. The refactoring follows the established modular architecture with Root/Section/UI component hierarchy, uses the SharedSection component for consistent layout, and maintains full feature parity with the legacy implementation.

## Requirements

### Requirement 1: Description Section Display

**Objective:** As a user, I want to view and edit the component's description inline, so that I can document the semantic meaning of the component without opening a dialog.

#### Acceptance Criteria

1. When the component detail page loads, the system shall display the Description section using SharedSection with collapsible behavior
2. When the component has a description value, the system shall display the description text in an inline editable textarea
3. When the component has no description, the system shall display a placeholder prompting the user to add a description
4. When the section is collapsed, the system shall hide the description content
5. The system shall default the section to open when a description exists and collapsed when empty

### Requirement 2: Description Inline Editing

**Objective:** As a user, I want to edit the description directly in the section, so that I can update it without modal dialogs.

#### Acceptance Criteria

1. When the user clicks on the description textarea, the system shall enable editing mode
2. When the user modifies the description and blurs the field, the system shall save the updated description via the API
3. When the description is saved successfully, the system shall display a success toast notification
4. If the save operation fails, then the system shall display an error toast notification
5. When the user clears the description field, the system shall save a null value

### Requirement 3: Forms Section Display

**Objective:** As a user, I want to view all form variants of a component in an organized list, so that I can understand the visual variations.

#### Acceptance Criteria

1. When the component detail page loads, the system shall display the Forms section using SharedSection with collapsible behavior
2. When the component has forms, the system shall display them as an ordered list with character, name, stroke count, and usage notes
3. When the component has no forms, the system shall display an empty state message explaining what forms are
4. When the section is collapsed, the system shall hide the forms list
5. The system shall default the section to open when forms exist and collapsed when empty

### Requirement 4: Add Form Button Placement

**Objective:** As a user, I want the Add Form button to be accessible in the section header, so that I can quickly add new form variants.

#### Acceptance Criteria

1. When the Forms section is expanded, the system shall display the "Add Form" button in the SharedSection actions slot
2. When the Forms section is collapsed, the system shall hide the "Add Form" button
3. When the user clicks the "Add Form" button, the system shall open the Add Form dialog

### Requirement 5: Add Form Dialog

**Objective:** As a user, I want to add new form variants through a structured dialog, so that I can document visual variations systematically.

#### Acceptance Criteria

1. When the Add Form dialog opens, the system shall display form fields for: character (required), form name (optional), stroke count (optional), and usage notes (optional)
2. When the user submits the form with valid data, the system shall create the form via the API and close the dialog
3. When the form is created successfully, the system shall display the new form in the list and show a success toast
4. If the create operation fails, then the system shall display an error toast notification
5. When the user cancels the dialog, the system shall close it without saving

### Requirement 6: Edit Form Dialog

**Objective:** As a user, I want to edit existing form variants, so that I can correct or update their information.

#### Acceptance Criteria

1. When the user clicks the Edit button on a form item, the system shall open the Edit Form dialog pre-populated with current values
2. When the Edit dialog opens, the system shall display the character as read-only (non-editable)
3. When the user submits the form with valid data, the system shall update the form via the API and close the dialog
4. When the form is updated successfully, the system shall reflect the changes in the list and show a success toast
5. If the update operation fails, then the system shall display an error toast notification

### Requirement 7: Delete Form Functionality

**Objective:** As a user, I want to delete form variants when destructive mode is enabled, so that I can remove obsolete entries.

#### Acceptance Criteria

1. While destructive mode is enabled, the system shall display a delete button on each form item
2. While destructive mode is disabled, the system shall hide the delete buttons
3. When the user clicks the delete button, the system shall display a confirmation dialog
4. When the user confirms deletion, the system shall remove the form via the API and update the list
5. When deletion is successful, the system shall show a success toast notification
6. If the delete operation fails, then the system shall display an error toast notification

### Requirement 8: Form Reordering

**Objective:** As a user, I want to reorder form variants, so that I can control their display priority.

#### Acceptance Criteria

1. When viewing the forms list, the system shall display up/down arrow buttons for reordering
2. When the user clicks the up arrow, the system shall move the form up in the order
3. When the user clicks the down arrow, the system shall move the form down in the order
4. When the form is at the top of the list, the system shall disable the up arrow button
5. When the form is at the bottom of the list, the system shall disable the down arrow button
6. When reorder is successful, the system shall persist the new order via the API

### Requirement 9: API Integration

**Objective:** As a developer, I want robust API methods for description and forms management, so that the UI can reliably persist changes.

#### Acceptance Criteria

1. The system shall provide an API method to update the component description field
2. The system shall provide API methods to create, read, update, and delete component forms
3. The system shall provide an API method to reorder component forms
4. The system shall validate required fields before API operations
5. The system shall throw appropriate errors for not-found and validation failures

### Requirement 10: Test Coverage

**Objective:** As a developer, I want comprehensive test coverage, so that the refactored sections are reliable and maintainable.

#### Acceptance Criteria

1. The system shall have unit tests for all new composables
2. The system shall have component tests for new UI components
3. The system shall have E2E tests covering description editing, form CRUD, and reordering
4. The system shall pass all existing E2E tests for component detail functionality
5. The system shall have no type errors and pass linting
