# Implementation Plan: Kanji Detail Notes

## Overview

Implementation tasks for four kanji note field sections (Education, Etymology, Semantic, Personal) with inline editing and character count display.

**Total Tasks**: 6 major tasks, 16 sub-tasks  
**Estimated Effort**: ~20-25 hours

---

## Tasks

- [x] 1. Enhance SharedSection with header-extra slot
- [x] 1.1 Add optional slot for extra header content
  - Add `header-extra` named slot after the title in collapsible trigger
  - Position slot content to the right of title with appropriate flexbox layout
  - Style using design tokens for spacing, typography, and muted color
  - Ensure slot is optional and doesn't affect existing usages
  - Verify backward compatibility with all current SharedSection consumers
  - _Requirements: 3.1, 3.2, 9.2, 9.6_

- [x] 1.2 (P) Add unit tests for header-extra slot
  - Test that slot content renders when provided
  - Test that section works normally when slot is not used
  - Test that slot content is visible in both collapsed and expanded states
  - _Requirements: 7.2_

---

- [x] 2. Create inline textarea UI component for notes editing
- [x] 2.1 Build display mode showing text or placeholder
  - Show current text content or placeholder when empty
  - Make entire display area clickable to enter edit mode
  - Apply appropriate styling using design tokens for text and placeholder states
  - Calculate and expose character count as reactive computed property
  - Emit character count updates when content changes
  - _Requirements: 4.1, 4.2, 3.3, 3.4, 3.5, 9.4_

- [x] 2.2 Build edit mode with textarea and save/cancel actions
  - Switch to editable textarea when user clicks to edit
  - Support multi-line input with proper height and scrolling
  - Preserve line breaks and whitespace formatting
  - Add Save and Cancel buttons below textarea
  - Emit save event with current value on Save click
  - Revert to last saved value on Cancel click
  - Handle Escape key to cancel editing
  - Update character count in real-time as user types
  - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 8.2, 8.4_

- [x] 2.3 (P) Add unit tests for textarea component
  - Test display mode renders content and placeholder correctly
  - Test clicking enters edit mode
  - Test save emits event with current value
  - Test cancel reverts to original value
  - Test character count updates on input
  - Test Escape key cancels edit
  - _Requirements: 7.2_

---

- [x] 3. Create note section components
- [x] 3.1 Build Semantic Analysis notes section
  - Use SharedSection with collapsible enabled
  - Display character count in header-extra slot
  - Set default open based on whether content exists
  - Include NotesTextarea for inline editing
  - Emit save event when user saves changes
  - Apply appropriate test IDs for E2E testing
  - Use placeholder text describing semantic analysis purpose
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 3.6, 6.2, 6.5, 9.2_

- [x] 3.2 (P) Build Etymology notes section
  - Follow same pattern as Semantic section
  - Use title "Etymology Notes"
  - Use placeholder text describing etymology purpose
  - Apply appropriate test IDs
  - _Requirements: 1.1, 1.2, 1.3, 2.3, 3.1, 6.1, 6.5, 9.2_

- [x] 3.3 (P) Build Education & Mnemonics notes section
  - Follow same pattern as Semantic section
  - Use title "Education & Mnemonics"
  - Use placeholder text describing education/mnemonics purpose
  - Apply appropriate test IDs
  - _Requirements: 1.1, 1.2, 1.3, 2.3, 3.1, 6.1, 6.5, 9.2_

- [x] 3.4 (P) Build Personal notes section
  - Follow same pattern as Semantic section
  - Use title "Personal Notes"
  - Use placeholder text describing personal notes purpose
  - Apply appropriate test IDs
  - _Requirements: 1.1, 1.2, 1.3, 2.3, 3.1, 6.1, 6.5, 9.2_

- [x] 3.5 (P) Add unit tests for all note section components
  - Test each section renders with correct title
  - Test character count displays in collapsed header
  - Test save event is emitted to parent
  - Test section expands to show textarea
  - _Requirements: 7.2, 6.6_

---

- [x] 4. Create notes handler composable
- [x] 4.1 Implement save handlers for all four note types
  - Create handler function for semantic notes save
  - Create handler function for etymology notes save
  - Create handler function for education notes save
  - Create handler function for personal notes save
  - Use repository updateField method to persist changes
  - Update local kanji ref on successful save
  - Show success toast after save completes
  - Show error toast if save fails
  - _Requirements: 1.5, 5.1, 5.2, 5.3, 5.4, 5.5, 10.2, 10.3_

- [x] 4.2 (P) Add unit tests for notes handlers
  - Test each handler calls repository with correct field name
  - Test kanji ref is updated on success
  - Test success toast is shown
  - Test error toast is shown on failure
  - _Requirements: 7.1, 5.6_

---

- [x] 5. Integrate note sections into Root component
- [x] 5.1 Add note sections to page layout in correct positions
  - Import all four note section components
  - Import notes handler composable
  - Add Semantic Analysis section after Vocabulary section
  - Add Etymology, Education, Personal sections after Semantic (placeholder for Stroke Order between)
  - Pass appropriate notes props from kanji data
  - Wire save events to handler functions
  - Verify section order matches requirements
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.3_

- [x] 5.2 Handle loading and error states for note sections
  - Ensure notes display correctly when kanji loads
  - Handle case when notes are null/empty
  - Preserve unsaved changes when section collapses
  - _Requirements: 1.6, 1.7, 10.4_

---

- [x] 6. Add E2E test coverage for note functionality
- [x] 6.1 Test character count display in collapsed sections
  - Navigate to kanji with existing notes
  - Verify character count visible in each collapsed section header
  - Verify count shows 0 for empty notes
  - Verify count matches actual content length
  - _Requirements: 7.4, 3.3, 3.4_

- [x] 6.2 Test inline editing workflow
  - Expand a note section
  - Verify textarea is visible
  - Enter new content in textarea
  - Click save and verify content persists
  - Reload page and verify content was saved
  - Test cancel reverts to original content
  - _Requirements: 7.3, 7.6, 7.7, 8.1_

- [x] 6.3 Test all four note types save independently
  - Edit and save each note type
  - Verify each saves without affecting others
  - Verify special characters and line breaks are preserved
  - Test switching between kanji loads correct notes
  - _Requirements: 7.5, 8.4, 8.3_

---

## Requirements Coverage

| Requirement | Tasks                            |
| ----------- | -------------------------------- |
| 1.1-1.7     | 2.1, 2.2, 3.1-3.4, 4.1, 5.1, 5.2 |
| 2.1-2.5     | 3.1, 5.1                         |
| 3.1-3.6     | 1.1, 2.1, 3.1-3.4, 6.1           |
| 4.1-4.7     | 2.1, 2.2                         |
| 5.1-5.7     | 4.1, 4.2                         |
| 6.1-6.7     | 3.1-3.5                          |
| 7.1-7.7     | 1.2, 2.3, 3.5, 4.2, 6.1-6.3      |
| 8.1-8.6     | 2.2, 5.1, 6.2, 6.3               |
| 9.1-9.6     | 1.1, 2.1, 3.1-3.4                |
| 10.1-10.6   | 4.1, 5.2                         |

## Execution Notes

- Tasks 1.2, 2.3, 3.2, 3.3, 3.4, 3.5, 4.2 marked (P) can be parallelized
- Task 2 (textarea component) should complete before Task 3 (sections) begins
- Task 4 (handlers) can run in parallel with Task 3
- Task 5 (integration) requires Tasks 3 and 4 complete
- Task 6 (E2E tests) requires Task 5 complete
