# Feature Specification: Kanji Detail Vocabulary Section Refactor

**Feature Branch**: `001-kanji-detail-vocab`  
**Created**: 2026-01-10  
**Status**: Draft  
**Input**: Refactor Kanji Detail Vocabulary section with dialog-based editing, replicate all legacy functionality, implement required APIs, and ensure test coverage

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Vocabulary Using Kanji (Priority: P1)

Users can view a list of vocabulary entries that contain the current kanji, displaying each entry's word, reading (kana), and short meaning with links to vocabulary detail pages.

**Why this priority**: Viewing vocabulary is the primary use case for this section - users research kanji by examining vocabulary that uses them.

**Independent Test**: Can be fully tested by navigating to any kanji detail page and verifying the vocabulary list displays correctly with links.

**Acceptance Scenarios**:

1. **Given** a kanji with linked vocabulary, **When** user views the vocabulary section, **Then** all linked vocabulary entries are displayed with word, kana, and short meaning
2. **Given** a kanji with no linked vocabulary, **When** user views the vocabulary section, **Then** an empty state message "No vocabulary using this kanji" is displayed
3. **Given** a vocabulary entry displayed in the section, **When** user clicks on it, **Then** they navigate to that vocabulary's detail page

---

### User Story 2 - Link Existing Vocabulary to Kanji (Priority: P2)

Users can link existing vocabulary entries to the current kanji through a searchable dialog interface, finding vocabulary by word or meaning.

**Why this priority**: Adding links to existing vocabulary is a common task when building kanji knowledge, enabling users to connect their vocabulary database to kanji they're researching.

**Independent Test**: Can be tested by opening the edit dialog, searching for existing vocabulary not currently linked, and adding it to the kanji.

**Acceptance Scenarios**:

1. **Given** kanji detail page, **When** user clicks "Edit" button, **Then** vocabulary edit dialog opens
2. **Given** vocabulary edit dialog is open, **When** user clicks "Add Vocabulary" button, **Then** vocabulary search interface appears
3. **Given** vocabulary search interface, **When** user types search term, **Then** matching vocabulary entries are displayed (excluding already-linked entries)
4. **Given** search results displayed, **When** user selects a vocabulary entry, **Then** it is immediately linked to the kanji and appears in the list
5. **Given** vocabulary successfully linked, **When** dialog is closed, **Then** the vocabulary appears in the main view mode list

---

### User Story 3 - Quick Create and Link New Vocabulary (Priority: P3)

Users can create a new vocabulary entry and link it to the current kanji in one workflow, without leaving the kanji detail page.

**Why this priority**: When researching kanji, users often encounter new vocabulary they want to document immediately without disrupting their current workflow.

**Independent Test**: Can be tested by opening the edit dialog, initiating quick-create from search, entering new vocabulary data, and verifying it's created and linked.

**Acceptance Scenarios**:

1. **Given** vocabulary search shows no results, **When** user clicks "Create New" option, **Then** quick-create vocabulary dialog opens with search term pre-filled
2. **Given** quick-create dialog open, **When** user enters word, kana, and short meaning, **Then** new vocabulary is created and automatically linked to current kanji
3. **Given** new vocabulary created via quick-create, **When** user closes dialogs, **Then** the new vocabulary appears in the vocabulary list

---

### User Story 4 - Unlink Vocabulary from Kanji (Priority: P2)

Users can remove the link between vocabulary and kanji through the edit dialog only when destructive mode is enabled, with confirmation always required.

**Why this priority**: Maintaining accurate kanji-vocabulary relationships requires ability to remove incorrect or unwanted links.

**Independent Test**: Can be tested by enabling destructive mode, opening the edit dialog, clicking remove on a linked vocabulary, confirming, and verifying it's removed.

**Acceptance Scenarios**:

1. **Given** destructive mode is enabled and vocabulary edit dialog with linked vocabulary, **When** user clicks remove button on vocabulary entry, **Then** confirmation dialog appears
2. **Given** remove confirmation dialog, **When** user confirms, **Then** vocabulary link is removed from kanji
3. **Given** destructive mode is disabled, **When** user opens vocabulary edit dialog, **Then** remove buttons are not shown on vocabulary entries
4. **Given** vocabulary link removed, **When** user closes dialog, **Then** vocabulary no longer appears in main view mode list

---

### Edge Cases

- What happens when user searches for vocabulary already linked to the kanji? System excludes already-linked vocabulary from search results
- How does system handle adding duplicate vocabulary links? System validates and prevents duplicate links, showing error message
- What happens when quick-create vocabulary already exists with same word? System creates the vocabulary (duplicates allowed at vocabulary level) and links it
- How does system handle vocabulary with null/missing kana or short_meaning? System displays vocabulary with placeholder text "(no reading)" or "(no meaning)"
- What happens when user navigates away with unsaved changes in dialog? Dialog-based approach means all changes are saved immediately upon action, so no unsaved state exists

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display all vocabulary entries linked to the current kanji, showing word, kana (reading), and short meaning for each entry
- **FR-002**: System MUST provide clickable links on each vocabulary entry that navigate to the vocabulary detail page
- **FR-003**: System MUST display an empty state message when no vocabulary is linked to the kanji
- **FR-004**: System MUST provide an "Edit" button that opens a dialog for managing vocabulary links
- **FR-005**: System MUST allow users to search for existing vocabulary by word or meaning within the edit dialog
- **FR-006**: System MUST exclude already-linked vocabulary from search results to prevent duplicates
- **FR-007**: System MUST allow users to link selected vocabulary to the kanji immediately upon selection
- **FR-008**: System MUST provide quick-create vocabulary functionality accessible from the search interface
- **FR-009**: System MUST pre-fill quick-create form with the search term when initiated from "Create New" option
- **FR-010**: System MUST automatically link newly-created vocabulary to the current kanji
- **FR-011**: System MUST allow users to remove vocabulary links through the edit dialog only when destructive mode is enabled
- **FR-012**: System MUST require confirmation before removing vocabulary links
- **FR-013**: System MUST validate that vocabulary being added is not already linked to the kanji
- **FR-014**: System MUST display appropriate error or success messages for all operations (link, create, unlink)
- **FR-015**: System MUST use SharedSection component for consistent layout with other kanji detail sections
- **FR-016**: System MUST use dialog-based editing rather than inline editing for all modifications
- **FR-017**: System MUST maintain vocabulary list state in sync with database operations
- **FR-018**: System MUST provide accessible keyboard navigation throughout all dialog interfaces
- **FR-019**: System MUST follow naming conventions established in other refactored kanji detail sections

### Key Entities

- **Vocabulary**: Represents a vocabulary entry with word (required), kana/reading (optional), short meaning (optional), and unique ID
- **Kanji**: Represents the current kanji being viewed, with unique ID and character
- **VocabKanji**: Junction entity linking vocabulary to kanji, enabling many-to-many relationship (one vocabulary can contain multiple kanji, one kanji appears in multiple vocabulary entries)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can view all linked vocabulary for any kanji in under 1 second
- **SC-002**: Users can find and link existing vocabulary to kanji in under 10 seconds
- **SC-003**: Users can create and link new vocabulary to kanji in under 15 seconds
- **SC-004**: Users can remove vocabulary links in under 5 seconds
- **SC-005**: All vocabulary operations (link, create, unlink) complete successfully 100% of the time without data loss
- **SC-006**: Section maintains consistent visual design and interaction patterns with other refactored kanji detail sections
- **SC-007**: All interactive elements are keyboard accessible, meeting WCAG 2.1 Level AA standards
- **SC-008**: Test coverage achieves minimum 80% for all new components and composables
- **SC-009**: E2E tests validate complete user workflows without flaky failures
- **SC-010**: Code adheres to file size limits (Section ≤250 lines, UI components ≤200 lines, Composables ≤200 lines)

## Assumptions _(optional)_

- SharedSection component is already implemented and available in `@/shared/components`
- SharedEntitySearch component (or equivalent) exists for vocabulary search functionality
- SharedQuickCreateVocabulary component exists for quick-create functionality
- SharedConfirmDialog component exists for destructive action confirmations
- API layer at `src/api/vocabulary/` has basic vocabulary repository implemented
- VocabKanji repository exists for managing vocabulary-kanji junction records
- Database schema includes `vocabulary` table with columns: id, word, kana, short_meaning
- Database schema includes `vocab_kanji` junction table with columns: id, vocab_id, kanji_id
- Toast notification system is available for success/error messages
- RouterLink component is available for navigation to vocabulary detail pages
- Destructive mode is a global setting accessible throughout kanji detail page

## Dependencies _(optional)_

- Requires SharedSection component from `@/shared/components` with standardized layout and event forwarding (already implemented, reused from Meanings/Readings sections)
- Requires SharedConfirmDialog component for destructive action confirmations
- Requires Reka UI Dialog component for edit dialog modal
- Requires vee-validate 4.x and zod 3.x for form validation
- Requires API layer vocabulary repository with methods: getAll, getById, create
- Requires API layer vocab-kanji repository with methods: getByKanjiId, create, remove, and new join method getByKanjiIdWithVocabulary
- Requires routing configuration for vocabulary detail page navigation
- Requires existing test infrastructure (Vitest, Testing Library, Playwright)
- Requires toast notification system for operation feedback
- Requires design token CSS variables in `src/styles/`

## Out of Scope _(optional)_

- Editing vocabulary details (word, kana, meaning) from within kanji detail page - users must navigate to vocabulary detail page
- Reordering vocabulary entries in the list - no display_order support needed
- Filtering or sorting vocabulary list - simple chronological display is sufficient
- Bulk operations (link/unlink multiple vocabulary at once) - single-item operations only
- Vocabulary usage statistics or analytics within this section
- Migration of legacy data or code - this is a fresh implementation
- Performance optimization beyond standard requirements - standard query performance is acceptable
