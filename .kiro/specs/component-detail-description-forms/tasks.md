# Implementation Plan

## Overview

Refactor the component detail page's Description and Forms Management sections using the new architecture patterns. This plan covers 5 major tasks with UI components, section components, Root integration, and testing.

**Requirements Coverage**: 1.1-1.5, 2.1-2.5, 3.1-3.5, 4.1-4.3, 5.1-5.5, 6.1-6.5, 7.1-7.6, 8.1-8.6, 9.1-9.5, 10.1-10.5

---

## Tasks

- [x] 1. Create Description Section Components
- [x] 1.1 (P) Build inline textarea for description editing
  - Create a component that displays description text or placeholder when empty
  - Enable edit mode when user clicks on the display area
  - Save the value automatically when the field loses focus (blur event)
  - Convert empty strings to null before saving
  - Emit save event with the new value for parent handling
  - _Requirements: 2.1, 2.2, 2.5_

- [x] 1.2 Build the Description section wrapper
  - Use SharedSection with "Description" title and collapsible behavior
  - Set default open state based on whether description has content
  - Embed the description textarea component inside the section
  - Forward save events to the parent component
  - Add appropriate test IDs for E2E testing
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Create Forms Section UI Components
- [x] 2.1 (P) Build the form item display component
  - Display form character prominently with Japanese font styling
  - Show form name, stroke count (with 画 suffix), and usage notes
  - Include up/down arrow buttons for reordering with proper disabled states
  - Show edit button that emits event when clicked
  - Conditionally show delete button based on destructive mode prop
  - Emit events for edit, delete, move-up, and move-down actions
  - _Requirements: 3.2, 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2.2 (P) Build the add/edit form dialog component
  - Create dialog with form fields: character, form name, stroke count, usage notes
  - Make character field editable in add mode and read-only in edit mode
  - Pre-populate fields with existing values when editing
  - Validate that character is required (not empty)
  - Convert empty optional fields to null on submit
  - Parse stroke count string to number or null
  - Emit submit event with form data or cancel event
  - _Requirements: 5.1, 5.2, 5.5, 6.1, 6.2, 6.3_

- [x] 2.3 Build the Forms section wrapper
  - Use SharedSection with "Forms" title and collapsible behavior
  - Set default open state based on whether forms array has items
  - Place Add Form button in actions slot using isOpen scoped prop for visibility
  - Display empty state message when no forms exist
  - Render list of form items with index and total for reorder button states
  - Manage dialog open/close state for add and edit operations
  - Manage delete confirmation dialog state
  - Track which form is being edited or deleted
  - Forward CRUD and reorder events to parent
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3_

- [x] 3. Integrate Sections into Root Component
- [x] 3.1 Add forms data loading to Root
  - Import and use the component form repository
  - Load forms by component ID after loading the component
  - Store forms in a reactive ref
  - Reload forms list after any CRUD operation
  - _Requirements: 9.2_

- [x] 3.2 Add description update handler to Root
  - Create handler that calls repository updateField for description
  - Update local component state after successful save
  - Show success toast notification on save
  - Show error toast if save fails
  - _Requirements: 2.3, 2.4, 9.1_

- [x] 3.3 Add form CRUD handlers to Root
  - Create handler for adding new forms via repository create method
  - Create handler for updating existing forms via repository update method
  - Create handler for removing forms via repository remove method
  - Refresh forms list after each operation
  - Show appropriate toast notifications for success and failure
  - _Requirements: 5.3, 5.4, 6.4, 6.5, 7.4, 7.5, 7.6, 9.2, 9.4, 9.5_

- [x] 3.4 Add form reorder handler to Root
  - Create handler that calls repository reorder with new ID order
  - Refresh forms list after reorder completes
  - Handle errors with toast notification
  - _Requirements: 8.6, 9.3_

- [x] 3.5 Render new sections in Root template
  - Import and register Description and Forms section components
  - Place Description section after BasicInfo section
  - Place Forms section after Description section
  - Pass component description to Description section
  - Pass forms array, component ID, and destructive mode to Forms section
  - Wire up event handlers for all section events
  - _Requirements: 1.1, 3.1_

- [x] 4. Add Unit Tests for New Components
- [x] 4.1 (P) Write unit tests for description textarea component
  - Test that it displays the provided value
  - Test that it shows placeholder when value is null
  - Test that clicking enters edit mode
  - Test that blur triggers save event with current value
  - Test that empty value saves as null
  - _Requirements: 10.1, 10.2_

- [x] 4.2 (P) Write unit tests for form item component
  - Test that it displays all form fields correctly
  - Test that up arrow is disabled when index is 0
  - Test that down arrow is disabled when index equals total minus 1
  - Test that delete button visibility respects destructive mode
  - Test that all buttons emit correct events
  - _Requirements: 10.1, 10.2_

- [x] 4.3 (P) Write unit tests for form dialog component
  - Test add mode shows editable character field
  - Test edit mode shows disabled character field with existing value
  - Test submit emits data with proper field conversions
  - Test cancel emits cancel event
  - Test character validation prevents empty submission
  - _Requirements: 10.1, 10.2_

- [x] 4.4 (P) Write unit tests for section components
  - Test Description section collapsible default state based on content
  - Test Forms section collapsible default state based on forms array
  - Test Forms section hides Add button when collapsed
  - Test Forms section shows empty state when forms array is empty
  - Test all events are properly forwarded
  - _Requirements: 10.1, 10.2_

- [x] 5. Add E2E Tests
- [x] 5.1 Write E2E tests for description functionality
  - Test inline editing flow: click to edit, type, blur to save
  - Test that changes persist after page reload
  - Test clearing description saves null value
  - Test success toast appears after save
  - _Requirements: 10.3, 10.4_

- [x] 5.2 Write E2E tests for forms CRUD and reordering
  - Test adding a new form via dialog
  - Test editing an existing form via dialog
  - Test deleting a form with destructive mode and confirmation
  - Test reordering forms with arrow buttons
  - Test forms persist after page reload
  - Test appropriate toasts appear for all operations
  - _Requirements: 10.3, 10.4, 10.5_

- [x] 5.3 Verify all tests pass and no regressions
  - Run full test suite to confirm no existing tests break
  - Run type check to confirm no type errors
  - Run lint to confirm code style compliance
  - _Requirements: 10.4, 10.5_
