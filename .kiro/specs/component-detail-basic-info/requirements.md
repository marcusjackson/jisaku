# Requirements Document

## Introduction

Refactoring of the Component Detail Basic Information section from the legacy UI to the new architecture. This section displays and allows editing of general component attributes (stroke count, source kanji, can-be-radical flag) and radical-specific attributes (Kangxi number, Kangxi meaning, radical name in Japanese). The refactored section must replicate all functionality from the legacy `ComponentDetailBasicInfo.vue` while adopting the dialog-based editing pattern used in other refactored sections (e.g., Kanji Detail) and utilizing the `SharedSection` component for consistent layout.

## Project Description (Input)

Refactor component detail basic information section. Continue the chunk-by-chunk refactoring of the component detail page. Must completely replicate all functionality from the legacy section. UI/UX improvements: dialog-based editing instead of inline editing. Use SharedSection component. Ensure APIs are implemented and tests follow naming conventions.

## Requirements

### Requirement 1: Basic Information Display

**Objective:** As a user, I want to view the component's basic information at a glance, so that I can quickly understand its general and radical-related attributes.

#### Acceptance Criteria

1. When the component detail page loads, the Basic Information section shall display the component's stroke count (or "—" if null).
2. When the component detail page loads, the Basic Information section shall display the source kanji with a link to the kanji detail page (or "—" if no source kanji is associated).
3. When the component detail page loads, the Basic Information section shall display whether the component can be used as a radical ("Yes" or "No").
4. Where the component has `canBeRadical = true`, the Basic Information section shall display the Kangxi number (or "—" if null).
5. Where the component has `canBeRadical = true`, the Basic Information section shall display the Kangxi meaning (or "—" if null).
6. Where the component has `canBeRadical = true`, the Basic Information section shall display the radical name in Japanese (or "—" if null).
7. Where the component has `canBeRadical = false`, the Basic Information section shall NOT display radical-specific attributes (Kangxi number, Kangxi meaning, radical name).
8. The Basic Information section shall use `SharedSection` component with title "Basic Information".
9. The Basic Information section shall have a data-testid of `component-detail-basic-info`.

### Requirement 2: Edit Dialog Opening

**Objective:** As a user, I want to open an edit dialog to modify the component's basic information, so that I can update details without inline editing complexity.

#### Acceptance Criteria

1. When the section is displayed, the section shall show an "Edit" button in the section actions.
2. When the user clicks the "Edit" button, the system shall open a dialog for editing basic information.
3. The Edit button shall have a data-testid of `basic-info-edit-button`.
4. The dialog shall have a title "Edit Basic Information".

### Requirement 3: Basic Information Editing - General Attributes

**Objective:** As a user, I want to edit general component attributes within the dialog, so that I can update stroke count, source kanji, and radical status.

#### Acceptance Criteria

1. When the edit dialog opens, the Stroke Count field shall be pre-populated with the current value (or empty if null).
2. When the edit dialog opens, the Source Kanji field shall be pre-populated with the current source kanji (or "None" if null).
3. When the edit dialog opens, the "Can be Radical" checkbox shall reflect the current value.
4. When the user enters a stroke count, the system shall validate it is between 1 and 64.
5. If the stroke count is less than 1 or greater than 64, the dialog shall display a validation error and block save.
6. When the user selects a source kanji, the system shall allow selecting from available kanji options or "None".
7. When the user toggles "Can be Radical", the dialog shall show or hide the radical attributes section accordingly.

### Requirement 4: Basic Information Editing - Radical Attributes

**Objective:** As a user, I want to edit radical-specific attributes when the component can be a radical, so that I can document Kangxi dictionary information.

#### Acceptance Criteria

1. Where "Can be Radical" is checked, the dialog shall display the Kangxi Number input field.
2. Where "Can be Radical" is checked, the dialog shall display the Kangxi Meaning input field.
3. Where "Can be Radical" is checked, the dialog shall display the Radical Name (Japanese) input field.
4. When the user enters a Kangxi number, the system shall validate it is between 1 and 214.
5. Where "Can be Radical" is not checked, the dialog shall NOT display radical attribute fields.
6. When the dialog opens, the radical attribute fields shall be pre-populated with current values (or empty if null).

### Requirement 5: Saving Basic Information

**Objective:** As a user, I want to save my changes from the dialog, so that the component's basic information is updated.

#### Acceptance Criteria

1. When the user clicks the "Save" button with valid data, the system shall emit a save event with all changed fields.
2. When the save is successful, the system shall close the dialog and update the displayed information.
3. When the user clicks the "Cancel" button, the system shall close the dialog without saving changes.
4. When saving, the system shall only emit changes for fields that have been modified.
5. If "Can be Radical" is changed to false, the system shall clear/reset radical attribute values.
6. The Save button shall be disabled while submission is in progress.

### Requirement 6: API Integration

**Objective:** As a developer, I want the component update API to support individual field updates, so that the frontend can save changes efficiently.

#### Acceptance Criteria

1. The component repository shall provide an update method supporting partial updates.
2. When updating `sourceKanjiId`, the system shall accept `null` to clear the association.
3. When updating `canBeRadical` to `false`, the system shall optionally clear radical attributes.
4. The API shall return the updated component entity after a successful update.

### Requirement 7: Testing Requirements

**Objective:** As a developer, I want comprehensive test coverage for the basic information section, so that functionality is verified and regressions are prevented.

#### Acceptance Criteria

1. The section component shall have unit tests verifying display of all fields.
2. The dialog component shall have unit tests verifying form field rendering and validation.
3. The dialog component shall have unit tests verifying save/cancel behavior.
4. The schema (if any) shall have unit tests verifying validation rules.
5. E2E tests shall verify the complete edit flow from clicking Edit to saving changes.
6. All test files shall follow the naming convention `[ComponentName].test.ts`.
7. All test files shall be colocated with source files.

### Requirement 8: Architecture Compliance

**Objective:** As a developer, I want the refactored section to follow project architecture patterns, so that the codebase remains consistent and maintainable.

#### Acceptance Criteria

1. The Section component shall not exceed 250 lines of code.
2. The Dialog component shall not exceed 200 lines of code.
3. The section shall use `SharedSection` component for layout.
4. The section shall follow the naming convention `ComponentDetail[Descriptor].vue`.
5. The dialog shall follow the naming convention `ComponentDetailDialog[Descriptor].vue`.
6. All CSS shall use design token variables (no hardcoded values).
7. All interactive elements shall have appropriate `data-testid` attributes.
