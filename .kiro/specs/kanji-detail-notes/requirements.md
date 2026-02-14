# Requirements Document

## Project Description (Input)

Refactor kanji detail notes sections. We've been working on the refactoring project. Next we want to continue working on the kanji detail page refactoring. We're working on it chunk by chunk. Next we'd like to work on the Notes sections. There are four different textarea free form note fields on this page: Education, Etymology, Semantic, Personal.

We need to completely replicate all functionality from the legacy sections. All existing functionality must continue to be possible in the refactored page.

Unlike most of the sections we've refactored up to now, the notes fields are one of the areas that I DO want inline editing as opposed to in dialog editing.

I also want to add a new thing of showing a letter count even when the field is collapsed. It should appear to the right of the note title with an appropriate amount of spacing and any other recommended styling. The purpose is so that at a glance without needing to expand, one can get an idea of how much is included in the field. Whether it's empty, whether it has some but could use more or so on. Of course, we don't need to interpret any of these things and display words, but I'm just describing the purpose. I just want to show the letter count (not word count).

One thing I'm unsure about right now is whether to do each notes field as its own Section component (in terms of Root/Section/UI architecture) or if some should go together.
However Semantic Analysis should be positioned after the Vocabulary section (new order is meanings, components, vocabulary, which is different than legacy).
And after semantic analysis will come stroke order, then the rest of the notes field in same order as legacy. So putting semantic analysis together with the other three doesn't seem possible maybe.
Think about what to do here and decide for me in terms of code organization etc, sections etc.

We also should probably use the new SharedSection component as we have been for other refactored sections etc. At least unless there's a reason not to use it. But whatever we use here, we should probably use the same sort of component for all of the note fields.

We need to ensure the APIs needed are implemented and if not then implement them in this project (in some cases, we thought the API was implemented but a piece was missing or sometimes there was an issue in the implementation). And we need to ensure proper test coverage and follow naming conventions like in the other refactored sections etc.

## Requirements

### Requirement 1: Notes Field Core Functionality

**Objective:** As a kanji researcher, I want to manage four distinct note types (Education, Etymology, Semantic, Personal) with inline editing, so that I can document kanji insights directly within the detail page.

#### Acceptance Criteria

1. The Kanji Detail Page shall display four distinct note sections: Education Notes, Etymology Notes, Semantic Analysis Notes, and Personal Notes
2. When user views a note section in collapsed state, the system shall display the note title with character count to the right
3. When user expands a note section, the system shall display the full textarea content with inline editing capability
4. When user edits note content in the textarea, the system shall update the character count in real-time
5. When user saves note changes, the Kanji Repository shall persist the updated text to the SQLite database
6. The system shall allow empty note fields (character count shows 0)
7. When user collapses a note section, the system shall preserve any unsaved changes until explicitly discarded or saved

### Requirement 2: Section Positioning and Layout

**Objective:** As a kanji researcher, I want note sections positioned according to semantic relationships, so that information flows logically through the page.

#### Acceptance Criteria

1. The Kanji Detail Page shall position Semantic Analysis Notes immediately after the Vocabulary section
2. The Kanji Detail Page shall position Stroke Order after Semantic Analysis Notes
3. The Kanji Detail Page shall position Education Notes, Etymology Notes, and Personal Notes after Stroke Order in that order
4. The system shall use SharedSection component for all note field sections to ensure consistent layout and behavior
5. When user navigates to kanji detail page, the system shall render all note sections in the specified order

### Requirement 3: Character Count Display

**Objective:** As a kanji researcher, I want to see character counts on collapsed note sections, so that I can assess content completeness at a glance without expanding each field.

#### Acceptance Criteria

1. When a note section is collapsed, the system shall display the character count to the right of the note title
2. The character count display shall use appropriate spacing (CSS design tokens) to separate it from the title
3. The character count shall reflect the total number of characters (not words) in the note field
4. When note content is empty, the system shall display "0" as the character count
5. When note content is updated, the system shall recalculate and update the character count immediately
6. The character count display shall use consistent typography and color styling aligned with the design system

### Requirement 4: Inline Editing Behavior

**Objective:** As a kanji researcher, I want to edit note content directly within the expanded section, so that I can efficiently update documentation without navigating to separate dialogs.

#### Acceptance Criteria

1. When user expands a note section, the system shall display an editable textarea element
2. When user clicks inside the textarea, the system shall activate the input field for editing
3. When user types in the textarea, the system shall update the content without validation constraints on length or format
4. When user clicks a save action, the Kanji Repository shall update the corresponding note field in the database
5. When user clicks a cancel action, the system shall revert the textarea content to the last saved state
6. The textarea shall support multi-line input with appropriate height and scroll behavior
7. The textarea shall preserve line breaks and whitespace formatting

### Requirement 5: API Layer and Repository Support

**Objective:** As a developer, I want a complete API layer for note field operations, so that components can interact with the database through consistent repository patterns.

#### Acceptance Criteria

1. The Kanji Repository shall provide a method to fetch all note fields for a given kanji ID
2. The Kanji Repository shall provide individual update methods for each note type (Education, Etymology, Semantic, Personal)
3. When repository update method is called, the system shall validate kanji existence before attempting update
4. When repository update succeeds, the system shall return the updated kanji object with all current field values
5. If repository update fails, the system shall throw an error with descriptive message
6. The Kanji Repository shall use prepared SQL statements to prevent injection vulnerabilities
7. The system shall implement repository methods in `src/api/kanji/kanji-mutations.ts` following the established pattern

### Requirement 6: Component Architecture and File Organization

**Objective:** As a developer, I want note sections organized following Root/Section/UI hierarchy with proper file size limits, so that the codebase remains maintainable and consistent with project standards.

#### Acceptance Criteria

1. The system shall create separate Section components for Education, Etymology, and Personal notes (grouped together in file organization)
2. The system shall create a separate Section component for Semantic Analysis notes (positioned differently in layout)
3. Each Section component shall respect the 250-line limit for Section-tier components
4. If a Section component approaches the line limit, the system shall split into ViewMode and EditMode components
5. The system shall follow naming convention: `KanjiSectionEducationNotes.vue`, `KanjiSectionEtymologyNotes.vue`, etc.
6. The system shall colocate test files with component files following pattern `[Component].test.ts`
7. The system shall use TypeScript strict mode with explicit type definitions (no `any` types)

### Requirement 7: Testing Coverage

**Objective:** As a developer, I want comprehensive test coverage for note field functionality, so that changes to note sections do not introduce regressions.

#### Acceptance Criteria

1. The system shall include unit tests for all repository note update methods
2. The system shall include unit tests for character count calculation logic
3. The system shall include E2E tests for inline editing workflow (expand, edit, save, collapse)
4. The system shall include E2E tests for character count display in collapsed state
5. E2E tests shall use `data-testid` attributes following naming pattern `kanji-{section}-{element}`
6. E2E tests shall use state-based waits (`.toBeVisible()`) rather than arbitrary timeouts
7. When E2E tests save note changes, tests shall verify persistence by reloading page and checking content

### Requirement 8: Legacy Feature Parity

**Objective:** As a kanji researcher, I want all existing note field functionality from the legacy UI to work in the refactored page, so that no capabilities are lost during migration.

#### Acceptance Criteria

1. The system shall support all note field operations available in `src/legacy/` implementation
2. When user enters text exceeding textarea visible area, the system shall enable vertical scrolling
3. When user switches between kanji records, the system shall load the correct note content for each kanji
4. When user saves note content with special characters (line breaks, unicode), the system shall preserve exact formatting
5. If legacy implementation supports keyboard shortcuts for save/cancel, the refactored version shall maintain those shortcuts
6. The system shall migrate any existing note data from legacy structure to new structure without data loss

### Requirement 9: Design System Integration

**Objective:** As a designer/developer, I want note sections to use established design tokens and SharedSection component, so that UI remains consistent across the application.

#### Acceptance Criteria

1. All note section components shall use CSS design token variables (no hardcoded colors, spacing, or font sizes)
2. The system shall use SharedSection component from `src/shared/components/` for all note field sections
3. When displaying character count, the system shall use appropriate CSS variables for spacing (`--spacing-*`) and typography (`--font-*`, `--color-*`)
4. Textarea styling shall use design token variables for border, background, padding, and focus states
5. The system shall follow established patterns from other refactored sections (meanings, components, vocabulary)
6. If SharedSection requires enhancement for inline editing use case, the system shall extend it in backward-compatible way

### Requirement 10: Error Handling and Loading States

**Objective:** As a kanji researcher, I want clear feedback during note operations, so that I understand when saves succeed or fail.

#### Acceptance Criteria

1. When note save operation is in progress, the system shall display a loading indicator on the save button
2. If note save operation fails, the system shall display an error toast notification with actionable message
3. When note save operation succeeds, the system shall provide visual confirmation (e.g., brief success state on save button)
4. If kanji data fails to load on page mount, the system shall display an empty state or error message for note sections
5. The system shall disable save button during save operation to prevent duplicate submissions
6. When user attempts to navigate away with unsaved note changes, the system should provide a confirmation prompt (if technically feasible and consistent with other sections)
