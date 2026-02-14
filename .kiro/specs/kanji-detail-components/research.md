# Research & Design Decisions

---

**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

---

## Summary

- **Feature**: `kanji-detail-components`
- **Discovery Scope**: Extension (refactoring existing functionality to new architecture)
- **Key Findings**:
  - Component occurrence API is complete with all CRUD + reorder operations
  - Vocabulary section provides complete pattern reference for dialog-based entity linking
  - SharedSection, SharedConfirmDialog, and SharedQuickCreateComponent are available for reuse
  - Position badge and component forms are legacy components requiring migration or reference

## Research Log

### Existing API Completeness

- **Context**: Verify component occurrence repository has all needed operations for CRUD and reordering
- **Sources Consulted**: `src/api/component/component-occurrence-repository.ts`
- **Findings**:
  - `getById(id)`, `getAll()`, `getByParentId(kanjiId)`, `getByComponentId(componentId)`, `getRadicalOccurrence(kanjiId)` - Read operations ✅
  - `create(input)` with auto display_order calculation ✅
  - `update(id, input)` supporting componentFormId, positionTypeId, isRadical, analysisNotes ✅
  - `remove(id)`, `removeByKanjiId(kanjiId)` - Delete operations ✅
  - `reorder(ids)` for manual ordering ✅
- **Implications**: No API gaps. Full CRUD support exists. Reorder may need wrapper for simplified UX.

### Vocabulary Section Pattern Analysis

- **Context**: Understand established pattern for entity linking via dialog
- **Sources Consulted**: `KanjiDetailSectionVocabulary.vue`, `KanjiDetailDialogVocabulary.vue`, `KanjiDetailVocabularyDisplay.vue`
- **Findings**:
  - Section component: Minimal, delegates to Display (view mode) and Dialog (edit mode)
  - Dialog: Handles search, link, unlink, quick-create modes; uses SharedConfirmDialog for destructive confirmation
  - Display: Simple list rendering with VocabularyItem components
  - Separation of concerns: Display = pure view, Dialog = all interaction logic
- **Implications**: Components section should follow same three-component pattern (Section, Display, Dialog)

### Shared Component Availability

- **Context**: Identify reusable components for the implementation
- **Sources Consulted**: `src/shared/components/`, `src/legacy/shared/components/`
- **Findings**:
  - `SharedSection` - Available in `src/shared/components/` (refactored version) ✅
  - `SharedConfirmDialog` - Available in `src/shared/components/` ✅
  - `SharedQuickCreateComponent` - Only in legacy (`src/legacy/shared/components/`) ⚠️
  - `SharedPositionBadge` - Only in legacy (`src/legacy/shared/components/`) ⚠️
- **Implications**:
  - Quick-create and position badge need to be copied from legacy to `src/shared/components/` as part of this implementation
  - Copied components must be updated to follow all new ESLint rules and coding standards
  - No direct imports from legacy allowed - must copy/paste and refactor

### Position Type and Component Form Data

- **Context**: Understanding optional fields for component occurrences
- **Sources Consulted**: `src/api/position/`, `src/api/component/component-form-repository.ts`
- **Findings**:
  - Position types: Lookup table with usePositionTypeRepository() available
  - Component forms: Child entities of components with useComponentFormRepository() available
  - Both are optional fields on component_occurrences table
- **Implications**: Dialog needs to load position types and component forms for selection dropdowns

### Mobile Responsiveness Requirements

- **Context**: User emphasized mobile-first design with no horizontal scrolling
- **Sources Consulted**: User feedback, existing component CSS patterns
- **Findings**:
  - Grid layout must use `minmax(200px, 1fr)` with auto-fit for responsive columns
  - Long text fields (meaning, analysis notes) need overflow handling with ellipsis
  - Touch targets for buttons must be minimum 44x44px
  - Dialog content must be scrollable on small viewports
  - Form inputs (text, select, textarea) must not extend beyond dialog boundaries
  - Select/dropdown menus must display options properly within mobile viewport
- **Implications**:
  - CSS design tokens and flexbox/grid must prevent fixed widths
  - All form controls need explicit width constraints (max-width: 100%)
  - Test on mobile breakpoints: 320px, 375px, 768px, 1024px
  - Use Reka UI components with proper mobile styling

### Destructive Mode Confirmation

- **Context**: User requires explicit confirmation for component unlinking in destructive mode
- **Sources Consulted**: Vocabulary dialog confirmation pattern
- **Findings**:
  - SharedConfirmDialog pattern: Store pending action ID, show dialog, execute on confirm
  - Delete/unlink button only visible when `destructiveMode` prop is true
  - Confirmation dialog prevents accidental data loss
- **Implications**: Must implement two-step delete: button click → show confirmation → execute on confirm

## Architecture Pattern Evaluation

| Option                  | Description                                             | Strengths                                                            | Risks / Limitations                                | Notes                                    |
| ----------------------- | ------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| Three-Component Pattern | Section (orchestrator) + Display (view) + Dialog (edit) | Follows established vocabulary pattern, clear separation of concerns | Requires three files minimum                       | Aligns with existing refactored sections |
| Inline Editing          | Legacy pattern with inline add/edit UI                  | Fewer files, simpler state management                                | Inconsistent with new architecture, poor mobile UX | Explicitly rejected per requirements     |

## Design Decisions

### Decision: Use Three-Component Pattern (Section + Display + Dialog)

- **Context**: Components section needs to match vocabulary section architecture
- **Alternatives Considered**:
  1. Single component with all logic inline
  2. Two components (Section + Dialog, no separate Display)
  3. Three components (Section + Display + Dialog)
- **Selected Approach**: Three components matching vocabulary pattern
- **Rationale**:
  - Consistency across refactored sections
  - Display component can be reused independently
  - Dialog isolates edit complexity
  - Follows single responsibility principle
- **Trade-offs**: More files to maintain vs. clear boundaries and reusability
- **Follow-up**: Ensure naming convention follows `KanjiDetail[Section|Display|Dialog]Components`
  Copy Legacy Shared Components to New Location

- **Context**: SharedQuickCreateComponent and SharedPositionBadge exist only in legacy
- **Alternatives Considered**:
  1. Import directly from legacy for MVP
  2. Copy components to `src/shared/` and update to follow new standards
  3. Rebuild components from scratch in new shared folder
- **Selected Approach**: Copy from legacy to `src/shared/components/` and update to follow new ESLint rules
- **Rationale**:
  - Project standards prohibit importing from legacy
  - Copying and refactoring is faster than rebuilding from scratch
  - Ensures all code follows current standards and conventions
- **Trade-offs**: More upfront work vs. cleaner architecture and no legacy coupling
- **Follow-up**: Ensure copied components have full test coverage and pass all linting/type checks
- **Follow-up**: Create follow-up task to migrate SharedQuickCreateComponent and SharedPositionBadge to `src/shared/`

### Decision: Auto-Calculate display_order on Add, Manual Reorder Not MVP

- **Context**: Component occurrences have display_order field for sequencing
- **Alternatives Considered**:
  1. Auto-append to end, no manual reordering (MVP)
  2. Drag-and-drop reordering in dialog
  3. Up/down arrows for manual ordering
- **Selected Approach**: Auto-append for MVP, defer manual reordering
- **Rationale**:
  - Repository already handles auto-calculation in `create()`
  - Manual reordering is complex UX (drag-drop or arrows)
  - Legacy has no reordering UI either
- **Trade-offs**: Less control for users vs. simpler implementation
- **Follow-up**: If users request ordering, add as enhancement task

### Decision: Load Position Types and Component Forms in Dialog

- **Context**: Occurrence editing requires optional position and form selection
- **Alternatives Considered**:
  1. Load all options in dialog mount
  2. Load on-demand when user focuses dropdown
  3. Pre-load in parent Root component
- **Selected Approach**: Load in dialog mount
- **Rationale**:
  - Keeps data loading localized to where it's used
  - Position types and forms are small lookup tables
  - Dialog iMobile form inputs extending beyond viewport — **Mitigation**: Use max-width: 100% on all form controls, test on 320px breakpoint
- **Risk**: Component occurrence data structure changes — **Mitigation**: TypeScript strict types ensure compile-time safety
- **Risk**: Mobile horizontal overflow — **Mitigation**: Use CSS grid auto-fit with min/max, test on mobile breakpoints
- **Risk**: Confirmation dialog state management errors — **Mitigation**: Follow exact pattern from vocabulary dialog (proven working code)
- **Risk**: Copied legacy components have ESLint violations — **Mitigation**: Run lint on copied files immediately, fix before proceeding
- **Risk**: Form validation errors not displaying properly — **Mitigation**: Use vee-validate + zod following existing patterns in other modules
- **Risk**: Handler composables exceed file size limits — **Mitigation**: Split into separate query/mutation files if needed
- **Risk**: Test warnings in output — **Mitigation**: Run tests incrementally with Makefile, fix warnings immediately

## Risks & Mitigations

- **Risk**: Legacy component imports create coupling — **Mitigation**: Document in implementation notes, create follow-up migration task
- **Risk**: Component occurrence data structure changes — **Mitigation**: TypeScript strict types ensure compile-time safety
- **Risk**: Mobile horizontal overflow — **Mitigation**: Use CSS grid auto-fit with min/max, test on mobile breakpoints
- **Risk**: Confirmation dialog state management errors — **Mitigation**: Follow exact pattern from vocabulary dialog (proven working code)

## References

- [Vocabulary Section Pattern](../../../src/modules/kanji-detail/components/KanjiDetailSectionVocabulary.vue) — Established refactored section template
- [Component Occurrence Repository](../../../src/api/component/component-occurrence-repository.ts) — Complete API reference
- [SharedSection Component](../../../src/shared/components/SharedSection.vue) — Generic section wrapper
- [SharedConfirmDialog](../../../src/shared/components/SharedConfirmDialog.vue) — Confirmation dialog pattern
