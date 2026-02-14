# Research: Kanji Detail Vocabulary Section Refactor

**Feature**: 001-kanji-detail-vocab  
**Date**: 2026-01-10  
**Status**: Complete

## Phase 0: Research & Discovery

### Research Task 1: Dialog-Based Editing Pattern

**Question**: How should vocabulary editing be structured using dialog-based UI instead of inline editing?

**Decision**: Use single edit dialog with embedded search/list interface

**Rationale**:

- **Examined existing patterns**: KanjiDetailDialogMeanings and KanjiDetailDialogReadings use single dialog with tab/mode switching for different views
- **Mobile considerations**: Single dialog prevents multiple modals stacking on small screens
- **User flow**: Edit button → Dialog with current vocabulary list + "Add Vocabulary" button → Search interface expands within dialog → Actions (link/unlink) happen immediately → Close dialog to save
- **Consistency**: Matches established pattern from Meanings section (meanings list + add meaning UI in same dialog)

**Alternatives considered**:

1. **Separate dialogs for each action** (add, remove, quick-create) - Rejected: Increases cognitive load, requires multiple dialog open/close cycles
2. **Inline editing like legacy** - Rejected: Spec explicitly requires dialog-based editing for consistency
3. **Full-screen modal on mobile** - Rejected: Other sections use standard dialog that adapts responsively

**Implementation**:

- KanjiDetailSectionVocabulary: Thin wrapper with "Edit" button
- KanjiDetailDialogVocabulary: Main edit dialog containing vocabulary list + search interface
- KanjiDetailVocabularySearch: Reusable search component for finding/adding vocabulary
- Search expands/collapses within dialog to conserve vertical space

---

### Research Task 2: Vocabulary Search Component Approach

**Question**: Should we reuse SharedEntitySearch or create vocabulary-specific search?

**Decision**: Create KanjiDetailVocabularySearch component specific to this feature

**Rationale**:

- **SharedEntitySearch analysis**: Designed for kanji/component search with specific props (character, strokeCount, shortMeaning). Not flexible enough for vocabulary (needs word, kana, shortMeaning)
- **Exclusion logic**: Need to filter out already-linked vocabulary - easier to implement with custom component
- **Quick-create integration**: Vocabulary quick-create workflow differs from kanji/component (different fields, validation)
- **File size**: SharedEntitySearch would need significant modifications - creating focused component stays within limits

**Alternatives considered**:

1. **Extend SharedEntitySearch** - Rejected: Would make SharedEntitySearch generic and complex, violating single responsibility
2. **Use plain input + manual filtering** - Rejected: Loses autocomplete UX and accessibility features
3. **Create SharedVocabularySearch in shared/** - Rejected: Only used in this one feature, premature abstraction

**Implementation**:

- KanjiDetailVocabularySearch.vue (~120 lines): Autocomplete input, result list, "Create New" option
- Uses api/vocabulary/vocabulary-queries.ts for search
- Filters results to exclude vocabularyList.map(v => v.id)
- Emits `select` event with vocabulary ID, `create` event with search term

---

### Research Task 3: Quick-Create Vocabulary Integration

**Question**: How should quick-create vocabulary be integrated into the edit workflow?

**Decision**: Modal dialog launched from search "Create New" option

**Rationale**:

- **Legacy pattern**: Legacy uses SharedQuickCreateVocabulary component as modal dialog
- **User flow**: Search returns no results → "Create New" button → Quick-create modal opens → Submit → New vocabulary created + linked → Quick-create modal closes → Returns to edit dialog with new vocabulary in list
- **Form validation**: vee-validate + zod for word (required), kana (optional), shortMeaning (optional)
- **Auto-fill**: Search term pre-fills the `word` field for convenience

**Alternatives considered**:

1. **Inline form in search results** - Rejected: Clutters search UI, difficult on mobile
2. **Separate page navigation** - Rejected: Disrupts workflow, user loses context
3. **Expand search component** - Rejected: Violates file size limits, mixes responsibilities

**Implementation**:

- KanjiDetailQuickCreateVocabulary.vue (~150 lines): Modal dialog with vee-validate form
- kanji-detail-vocabulary-quick-create-schema.ts: Zod schema for validation
- Dialog opened by KanjiDetailDialogVocabulary when search emits `create` event
- On submit: Creates vocabulary via api, creates vocab-kanji link, closes dialog
- Success toast notification confirms creation

---

### Research Task 4: Destructive Mode Integration for Unlink

**Question**: How should destructive mode affect vocabulary unlinking?

**Decision**: Remove buttons only shown when destructive mode enabled, confirmation always required

**Rationale**:

- **Spec correction**: User Story 4 clarified that unlinking only possible when destructive mode enabled
- **Consistency**: Matches pattern from Meanings section where deletions require destructive mode
- **UI approach**: In edit dialog, vocabulary items show remove button only when `destructiveMode === true`
- **Confirmation**: SharedConfirmDialog used for all unlink actions (no bypass like legacy had)
- **Safety**: Prevents accidental data loss - junction table records are data

**Alternatives considered**:

1. **Always show remove, disable when not destructive** - Rejected: Confusing UX, questions why disabled
2. **Different confirmation based on mode** - Rejected: Adds complexity, spec requires confirmation always
3. **Soft delete with undo** - Rejected: Over-engineered for this feature

**Implementation**:

- KanjiDetailVocabularyItem receives `destructiveMode` prop
- v-if="destructiveMode" on remove button
- Click remove → SharedConfirmDialog opens
- Confirm → Emit unlink event → Handler calls vocab-kanji repository deleteById
- Success toast notification confirms unlink

---

### Research Task 5: Mobile Responsiveness for Dialog Forms

**Question**: How to ensure vocabulary dialogs work properly on mobile (320px+)?

**Decision**: Use responsive layout patterns from existing kanji detail dialogs

**Rationale**:

- **Examined existing dialogs**: KanjiDetailDialogMeanings, KanjiDetailDialogReadings use:
  - `max-width: min(90vw, 600px)` for dialog container
  - Flex column layout that stacks on mobile
  - Input fields with `width: 100%` and appropriate min-width
  - Padding scales with viewport (design tokens)
- **Select menus**: No select menus in this feature (search uses autocomplete list, not native select)
- **Touch targets**: Buttons sized to ≥44px tap target (design tokens enforce)
- **Scroll behavior**: Dialog content scrollable when exceeds viewport height (Reka UI Dialog handles)

**Alternatives considered**:

1. **Full-screen modal on mobile** - Rejected: Inconsistent with other sections
2. **Separate mobile layout** - Rejected: Responsive layout works for all sizes
3. **Native mobile UI** - Rejected: This is PWA, maintains web UI across devices

**Implementation**:

- Dialog max-width: `min(90vw, 600px)`
- Search input width: `100%` with min-width for readability
- Vocabulary list items: Flex row wrapping to column on narrow screens
- Quick-create form: Vertical layout (already mobile-friendly)
- Test in E2E: Viewport set to 375x667 (mobile) and 1280x720 (desktop)

---

### Research Task 6: API Layer Requirements

**Question**: What API methods are needed for vocabulary CRUD operations?

**Decision**: Use existing API layer - all required methods already implemented

**Findings**:

- **Existing in src/api/vocabulary/**:
  - `useVocabularyRepository().getAll()` - Get all vocabulary for search
  - `useVocabularyRepository().create(input)` - Create new vocabulary (quick-create)
  - `useVocabKanjiRepository().getByKanjiId(kanjiId)` - Get vocab-kanji links for kanji
  - `useVocabKanjiRepository().create(input)` - Link vocabulary to kanji
  - `useVocabKanjiRepository().deleteById(id)` - Unlink vocabulary from kanji
  - `useVocabKanjiRepository().getByParentId(vocabId)` - Get kanji for vocabulary (not needed here)

- **Join query for display**: Need to join vocab_kanji table with vocabulary table to get vocabulary details
  - Legacy uses `getByKanjiIdWithVocab()` from legacy repository
  - **Decision**: Create this method in vocab-kanji-queries.ts as `getByKanjiIdWithVocabulary()`
  - Returns array of `{ vocabKanji, vocabulary }` objects
  - Single SQL query with JOIN - efficient for display

**Alternatives considered**:

1. **Multiple queries** (get links, then get vocabularies) - Rejected: Less efficient, multiple database hits
2. **Modify existing getByKanjiId** - Rejected: Breaks single responsibility, query vs join operations
3. **Add to vocabulary-queries** - Rejected: Belongs in vocab-kanji-queries (operates on junction table)

**Implementation**:

- Add `getByKanjiIdWithVocabulary(kanjiId)` to src/api/vocabulary/vocab-kanji-repository.ts
- SQL: `SELECT vk.*, v.* FROM vocab_kanji vk JOIN vocabulary v ON vk.vocab_id = v.id WHERE vk.kanji_id = ? ORDER BY v.word`
- Returns `VocabKanjiWithVocabulary[]` type (new type in vocabulary-types.ts)
- Covered by existing vocab-kanji-repository.test.ts

---

### Research Task 7: Test Coverage Strategy

**Question**: What test coverage is required for this feature?

**Decision**: Match coverage strategy from Meanings/Readings sections

**Unit/Component Tests** (colocated .test.ts files):

- KanjiDetailSectionVocabulary.test.ts: Dialog toggle, props pass-through
- KanjiDetailDialogVocabulary.test.ts: Search toggle, vocabulary list display, event emissions
- KanjiDetailVocabularyDisplay.test.ts: Empty state, vocabulary list rendering, link clicks
- KanjiDetailVocabularyItem.test.ts: Display formatting, remove button conditional, event emissions
- KanjiDetailVocabularySearch.test.ts: Filtering, selection, create event
- KanjiDetailQuickCreateVocabulary.test.ts: Form validation, submission, cancel
- use-kanji-detail-vocabulary-handlers.test.ts: Link/unlink/create logic, error handling, toast notifications
- kanji-detail-vocabulary-quick-create-schema.test.ts: Validation rules

**E2E Tests** (e2e/kanji-detail.test.ts):

- Add new test group "Vocabulary section"
- Test: View vocabulary list with links
- Test: Link existing vocabulary
- Test: Quick-create and link vocabulary
- Test: Unlink vocabulary (destructive mode)
- Test: Search filtering and exclusion
- Test: Mobile responsive layout (375px viewport)

**Target Coverage**:

- Composables/utilities: 80%+
- Components: 70%+
- E2E: All CRUD paths + happy/sad paths

**Alternatives considered**:

1. **Lower coverage targets** - Rejected: Constitution requires these minimums
2. **Skip E2E for mobile** - Rejected: Mobile responsiveness is critical requirement
3. **Integration tests instead of unit** - Rejected: Unit tests run faster, easier to debug

**Implementation**:

- Use existing test helpers from `test/helpers/kanji-test-helpers.ts` for kanji data
- Create `test/helpers/vocabulary-test-helpers.ts` for vocabulary factories
- Mock toast composable in component tests (already pattern in other tests)
- Use Testing Library queries (`getByRole`, `getByLabelText`) for accessibility
- E2E tests use `data-testid` attributes for reliable selection
- All E2E tests complete in <1s (no `waitForTimeout`, use `waitFor` with state checks)

---

## Summary

All research questions resolved with concrete decisions:

1. ✅ **Dialog pattern**: Single edit dialog with embedded search/list
2. ✅ **Search component**: Custom KanjiDetailVocabularySearch (not reusing SharedEntitySearch)
3. ✅ **Quick-create**: Modal dialog from search "Create New"
4. ✅ **Destructive mode**: Remove buttons conditional, confirmation always required
5. ✅ **Mobile responsive**: Patterns from existing dialogs, tested at 320px+
6. ✅ **API layer**: All methods exist except new join query `getByKanjiIdWithVocabulary()`
7. ✅ **Test coverage**: 80% composables, 70% components, full E2E for CRUD

No NEEDS CLARIFICATION markers remaining. Ready for Phase 1 (Data Model & Contracts).
