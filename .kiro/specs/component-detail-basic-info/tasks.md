# Implementation Plan

## Task Overview

This plan implements the Component Detail Basic Information section refactoring. Tasks are organized to establish types first, then implement the dialog, section, and finally integrate into the Root component.

**Total**: 5 major tasks, 12 sub-tasks
**Requirements Coverage**: All 8 requirements (1–8) covered

---

## Tasks

- [x] 1. Extend module types with basic information save data structure
- [x] 1.1 Add the BasicInfoSaveData interface to the component detail types
  - Define the interface with all six editable fields: stroke count, source kanji ID, can-be-radical flag, Kangxi number, Kangxi meaning, and radical name Japanese
  - Export the new type from the module's public interface
  - _Requirements: 5.1, 5.4_

---

- [x] 2. Implement the basic information edit dialog
- [x] 2.1 (P) Create the dialog component with form structure
  - Implement a dialog that opens with a title "Edit Basic Information"
  - Add form fields for stroke count (number input), source kanji (combobox), and can-be-radical (checkbox)
  - Populate all fields with the component's current values when the dialog opens
  - Add Cancel and Save buttons with appropriate actions
  - _Requirements: 2.4, 3.1, 3.2, 3.3, 5.3, 5.6_

- [x] 2.2 Implement conditional radical attribute fields
  - Show Kangxi number, Kangxi meaning, and radical name fields only when can-be-radical is checked
  - Pre-populate these fields with current values when dialog opens
  - Hide these fields when can-be-radical is unchecked
  - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

- [x] 2.3 Add form validation logic
  - Validate stroke count is between 1 and 64 (or empty)
  - Validate Kangxi number is between 1 and 214 (or empty)
  - Display inline error messages below invalid fields
  - Block save when validation errors exist
  - _Requirements: 3.4, 3.5, 4.4_

- [x] 2.4 Implement save data emission
  - On save, emit structured data containing all six fields
  - Convert combobox "None" selection to null for source kanji
  - Clear radical attributes when can-be-radical is toggled to false
  - Close dialog after successful save emission
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 2.5\* Write unit tests for dialog component
  - Test form field rendering and pre-population
  - Test conditional display of radical fields
  - Test validation error display for stroke count and Kangxi number
  - Test save emission with correct data structure
  - Test cancel closes without emitting
  - _Requirements: 7.2, 7.3, 7.6, 7.7_

---

- [x] 3. Implement the basic information section component
- [x] 3.1 (P) Create the section component with view mode display
  - Use SharedSection component with title "Basic Information"
  - Display stroke count value or "—" placeholder
  - Display source kanji with a link to the kanji detail page, or "—" if none
  - Display can-be-radical status as "Yes" or "No"
  - Apply data-testid attribute to the section container
  - _Requirements: 1.1, 1.2, 1.3, 1.8, 1.9, 8.3, 8.7_

- [x] 3.2 Add conditional radical attributes display
  - When component can be radical, show Kangxi number, meaning, and radical name
  - Display "—" for any null values in radical attributes
  - Hide the radical attributes entirely when component cannot be radical
  - _Requirements: 1.4, 1.5, 1.6, 1.7_

- [x] 3.3 Integrate the edit dialog
  - Add Edit button in section actions slot with data-testid
  - Manage dialog open state internally
  - Pass component, source kanji, and kanji options to dialog
  - Forward dialog save event to parent
  - _Requirements: 2.1, 2.2, 2.3, 8.4, 8.5_

- [x] 3.4\* Write unit tests for section component
  - Test rendering of all display fields with values
  - Test rendering of placeholder "—" for null values
  - Test conditional display of radical attributes
  - Test source kanji link navigation target
  - Test edit button opens dialog
  - Test save event forwarding
  - _Requirements: 7.1, 7.6, 7.7_

---

- [x] 4. Update Root component with kanji loading and save handling
- [x] 4.1 Add kanji data loading for source kanji selection
  - Load all kanji options for the source kanji combobox
  - Resolve the source kanji entity from the component's source kanji ID
  - Include kanji repository in component dependencies
  - _Requirements: 3.6, 6.1_

- [x] 4.2 Implement basic info save handler
  - Handle save event from the basic info section
  - Call component repository update with the save data
  - Update local component state after successful save
  - Refresh source kanji reference if source kanji ID changed
  - Show success or error toast notification
  - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.3, 6.4_

- [x] 4.3 Wire up section component in page layout
  - Render the basic info section with required props
  - Connect save event to the handler
  - Verify component stays within file size limit after changes
  - _Requirements: 8.1, 8.2, 8.6_

---

- [x] 5. Add E2E test coverage for basic information editing
- [x] 5.1 Write E2E tests for the complete edit flow
  - Test opening dialog, modifying fields, saving, and verifying display updates
  - Test validation error flow with invalid stroke count
  - Test toggling radical status and editing radical fields
  - Test source kanji selection and link display
  - _Requirements: 7.5_
