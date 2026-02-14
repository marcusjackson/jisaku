# Tasks: Kanji Detail Vocabulary Section Refactor

**Input**: Design documents from `/specs/001-kanji-detail-vocab/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Feature**: Refactor Kanji Detail Vocabulary section with dialog-based editing, replicate all legacy functionality, implement required APIs, and ensure test coverage

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: API layer extension and type definitions needed across all user stories

- [x] T001 Add VocabKanjiWithVocabulary type to src/api/vocabulary/vocabulary-types.ts
- [x] T002 [P] Implement getByKanjiIdWithVocabulary() method in src/api/vocabulary/vocab-kanji-repository.ts
- [x] T003 [P] Add unit test for getByKanjiIdWithVocabulary() in src/api/vocabulary/vocab-kanji-repository.test.ts
- [x] T004 Add QuickCreateVocabularyData and VocabularyListItem types to src/modules/kanji-detail/kanji-detail-types.ts
- [x] T005 [P] Add unit test for new types in src/modules/kanji-detail/kanji-detail-types.test.ts
- [x] T006 Create vocabulary test helpers in test/helpers/vocabulary-test-helpers.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core handlers and validation that MUST be complete before ANY user story UI can be implemented

**⚠️ CRITICAL**: No user story component work can begin until this phase is complete

- [x] T007 Create kanji-detail-vocabulary-quick-create-schema.ts in src/modules/kanji-detail/schemas/
- [x] T008 [P] Add unit test for quick-create schema in src/modules/kanji-detail/schemas/kanji-detail-vocabulary-quick-create-schema.test.ts
- [x] T009 Create use-kanji-detail-vocabulary-handlers.ts composable in src/modules/kanji-detail/composables/
- [x] T010 [P] Add unit test for handlers composable in src/modules/kanji-detail/composables/use-kanji-detail-vocabulary-handlers.test.ts

**Checkpoint**: Foundation ready - user story component implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Vocabulary Using Kanji (Priority: P1) 🎯 MVP

**Goal**: Display vocabulary list in view mode with word, kana, short meaning, and navigation links

**Independent Test**: Navigate to kanji detail page with linked vocabulary, verify list displays with clickable links to vocabulary detail pages

### Implementation for User Story 1

- [x] T011 [P] [US1] Create KanjiDetailVocabularyItem.vue component in src/modules/kanji-detail/components/
- [x] T012 [P] [US1] Add unit test for KanjiDetailVocabularyItem in src/modules/kanji-detail/components/KanjiDetailVocabularyItem.test.ts
- [x] T013 [US1] Create KanjiDetailVocabularyDisplay.vue component in src/modules/kanji-detail/components/
- [x] T014 [P] [US1] Add unit test for KanjiDetailVocabularyDisplay in src/modules/kanji-detail/components/KanjiDetailVocabularyDisplay.test.ts
- [x] T015 [US1] Create KanjiDetailSectionVocabulary.vue component in src/modules/kanji-detail/components/
- [x] T016 [P] [US1] Add unit test for KanjiDetailSectionVocabulary in src/modules/kanji-detail/components/KanjiDetailSectionVocabulary.test.ts
- [x] T017 [US1] Integrate KanjiDetailSectionVocabulary into KanjiDetailRoot.vue in src/modules/kanji-detail/components/
- [x] T018 [P] [US1] Update KanjiDetailRoot.test.ts to cover vocabulary section integration
- [x] T019 [P] [US1] Add E2E test for viewing vocabulary list in e2e/kanji-detail.test.ts

**Checkpoint**: User Story 1 complete - Users can view vocabulary list with navigation links

---

## Phase 4: User Story 2 - Link Existing Vocabulary to Kanji (Priority: P2)

**Goal**: Enable users to search and link existing vocabulary through edit dialog

**Independent Test**: Open edit dialog, search for vocabulary not currently linked, select it, verify it's linked and appears in list

### Implementation for User Story 2

- [x] T020 [P] [US2] Create KanjiDetailVocabularySearch.vue component in src/modules/kanji-detail/components/
- [x] T021 [P] [US2] Add unit test for KanjiDetailVocabularySearch in src/modules/kanji-detail/components/KanjiDetailVocabularySearch.test.ts
- [x] T022 [US2] Create KanjiDetailDialogVocabulary.vue component in src/modules/kanji-detail/components/
- [x] T023 [P] [US2] Add unit test for KanjiDetailDialogVocabulary in src/modules/kanji-detail/components/KanjiDetailDialogVocabulary.test.ts
- [x] T024 [US2] Wire up dialog open/close in KanjiDetailSectionVocabulary.vue
- [x] T025 [US2] Wire up link handler in KanjiDetailRoot.vue using use-kanji-detail-vocabulary-handlers
- [x] T026 [P] [US2] Update unit tests to cover dialog integration
- [x] T027 [P] [US2] Add E2E test for linking existing vocabulary in e2e/kanji-detail.test.ts

**Checkpoint**: User Story 2 complete - Users can search and link existing vocabulary

---

## Phase 5: User Story 3 - Quick Create and Link New Vocabulary (Priority: P3)

**Goal**: Enable users to create new vocabulary and link it in one workflow via quick-create dialog

**Independent Test**: Search for non-existent vocabulary, click "Create New", fill form, verify vocabulary created and linked

### Implementation for User Story 3

- [x] T028 [P] [US3] Create KanjiDetailQuickCreateVocabulary.vue component in src/modules/kanji-detail/components/
- [x] T029 [P] [US3] Add unit test for KanjiDetailQuickCreateVocabulary in src/modules/kanji-detail/components/KanjiDetailQuickCreateVocabulary.test.ts
- [x] T030 [US3] Integrate quick-create dialog into KanjiDetailDialogVocabulary.vue
- [x] T031 [US3] Wire up create handler in KanjiDetailRoot.vue using use-kanji-detail-vocabulary-handlers
- [x] T032 [P] [US3] Update KanjiDetailDialogVocabulary.test.ts to cover quick-create integration (12/14 tests passing, 2 vee-validate timing edge cases remain)
- [x] T033 [P] [US3] Add E2E test for quick-create workflow in e2e/kanji-detail.test.ts

**Checkpoint**: User Story 3 complete - Users can quick-create and link vocabulary

---

## Phase 6: User Story 4 - Unlink Vocabulary from Kanji (Priority: P2)

**Goal**: Enable users to remove vocabulary links when destructive mode is enabled, with confirmation

**Independent Test**: Enable destructive mode, open edit dialog, click remove on vocabulary, confirm, verify link removed

### Implementation for User Story 4

- [x] T034 [US4] Add destructiveMode prop and remove button logic to KanjiDetailVocabularyItem.vue
- [x] T035 [P] [US4] Update KanjiDetailVocabularyItem.test.ts to cover destructive mode rendering
- [x] T036 [US4] Add SharedConfirmDialog integration to KanjiDetailDialogVocabulary.vue
- [x] T037 [US4] Wire up unlink handler in KanjiDetailRoot.vue using use-kanji-detail-vocabulary-handlers
- [x] T038 [P] [US4] Update KanjiDetailDialogVocabulary.test.ts to cover confirmation flow
- [x] T039 [P] [US4] Add E2E test for unlink with destructive mode in e2e/kanji-detail.test.ts

**Checkpoint**: User Story 4 complete - Users can safely unlink vocabulary with confirmation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Mobile responsiveness, accessibility, and final quality improvements

- [ ] T040 [P] Verify all components use design token CSS variables (no hardcoded values)
- [ ] T041 [P] Add ARIA labels to all icon-only buttons in vocabulary components
- [ ] T042 [P] Test keyboard navigation through all dialogs (Tab, Enter, Escape)
- [ ] T043 Add E2E test for mobile responsive layout (375px viewport) in e2e/kanji-detail.test.ts
- [ ] T044 Verify all files are under size limits: make lint
- [ ] T045 Run full test suite and verify all passing: pnpm ci:full
- [ ] T046 Manual testing via Playwright MCP (all vocabulary CRUD workflows)
- [ ] T047 Update src/modules/kanji-detail/index.ts to export: KanjiDetailSectionVocabulary, KanjiDetailDialogVocabulary, KanjiDetailVocabularyDisplay, KanjiDetailVocabularyItem, KanjiDetailVocabularySearch, KanjiDetailQuickCreateVocabulary
- [ ] T048 [P] Code cleanup: remove console.log statements, organize imports
- [ ] T049 Verify destructive mode integration matches other sections
- [ ] T050 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order: US1 (P1) → US2 (P2) → US4 (P2) → US3 (P3)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
  - **Delivers MVP**: View vocabulary list with links
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 components
  - Adds search and link functionality to existing section
  - Can proceed in parallel with US3/US4 if needed
- **User Story 3 (P3)**: Can start after US2 (needs search component)
  - Adds quick-create dialog to search workflow
  - Lower priority - implement after P1/P2 stories
- **User Story 4 (P2)**: Can start after US1 (needs item component)
  - Adds remove button and confirmation to existing components
  - Can proceed in parallel with US2/US3 if needed

### Within Each User Story

- Components before integration
- Unit tests can be written in parallel with components (TDD approach)
- E2E tests should be written after component integration
- Each story should be independently testable before moving to next

### Parallel Opportunities

**Setup Phase (Phase 1)**:

- T003 and T005 and T006 can run in parallel with their respective implementation tasks

**Foundational Phase (Phase 2)**:

- T008 can run in parallel with T007
- T010 can run in parallel with T009

**User Story 1 (Phase 3)**:

- T012 can run in parallel with T011 (TDD)
- T014 can run in parallel with T013 (TDD)
- T016 can run in parallel with T015 (TDD)
- T018 and T019 can run in parallel after T017 completes

**User Story 2 (Phase 4)**:

- T021 can run in parallel with T020 (TDD)
- T023 can run in parallel with T022 (TDD)
- T026 and T027 can run in parallel after T025 completes

**User Story 3 (Phase 5)**:

- T029 can run in parallel with T028 (TDD)
- T032 and T033 can run in parallel after T031 completes

**User Story 4 (Phase 6)**:

- T035 can run in parallel with T034 (TDD)
- T038 and T039 can run in parallel after T037 completes

**Polish Phase (Phase 7)**:

- T040, T041, T042, T048 can all run in parallel

**Cross-Story Parallelization**:

- If team has multiple developers, US1 and US4 can proceed in parallel after Phase 2
- US2 can start while US1 E2E tests are being written
- US3 can start once T022 (search component) from US2 is complete

---

## Parallel Example: User Story 1

```bash
# Launch all parallelizable tasks for User Story 1 together:

# Terminal 1: Implement VocabularyItem component
vim src/modules/kanji-detail/components/KanjiDetailVocabularyItem.vue

# Terminal 2: Write VocabularyItem test (TDD - write test first, watch it fail)
vim src/modules/kanji-detail/components/KanjiDetailVocabularyItem.test.ts

# After T011-T012 complete:

# Terminal 1: Implement VocabularyDisplay component
vim src/modules/kanji-detail/components/KanjiDetailVocabularyDisplay.vue

# Terminal 2: Write VocabularyDisplay test
vim src/modules/kanji-detail/components/KanjiDetailVocabularyDisplay.test.ts

# After T013-T014 complete:

# Terminal 1: Implement Section component
vim src/modules/kanji-detail/components/KanjiDetailSectionVocabulary.vue

# Terminal 2: Write Section test
vim src/modules/kanji-detail/components/KanjiDetailSectionVocabulary.test.ts

# After T015-T016 complete:

# Terminal 1: Integrate with Root
vim src/modules/kanji-detail/components/KanjiDetailRoot.vue

# Terminal 2: Update Root tests
vim src/modules/kanji-detail/components/KanjiDetailRoot.test.ts

# Terminal 3: Write E2E test
vim e2e/kanji-detail.test.ts
```

---

## Implementation Strategy

### MVP First (Recommended)

Implement User Story 1 (P1) completely before starting other stories:

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (User Story 1) - Delivers viewable vocabulary list
4. Test thoroughly with Playwright MCP
5. Proceed to US2, US4, then US3

This gives you a working, testable feature increment after ~6-8 hours of work.

### Parallel Development (If Team Size Allows)

With 2+ developers after Phase 2 completion:

**Developer 1**: US1 (View) → US2 (Link) → US3 (Quick-create)
**Developer 2**: US4 (Unlink) in parallel with US1, integrate when ready

### Test-Driven Development (TDD)

For each component:

1. Write unit test first (watching it fail)
2. Implement component to make test pass
3. Refactor while keeping tests green
4. Write E2E test after integration

This approach catches issues early and ensures high coverage.

---

## Verification Commands

### Run tests for specific files only (faster during development)

```bash
# Unit test for specific component
make test-file FILE=src/modules/kanji-detail/components/KanjiDetailVocabularyItem.test.ts

# E2E test for kanji detail
make e2e-file FILE=e2e/kanji-detail.test.ts

# Lint specific file
make lint-file FILE=src/modules/kanji-detail/components/KanjiDetailSectionVocabulary.vue

# Type check specific file
pnpm vue-tsc --noEmit src/modules/kanji-detail/components/KanjiDetailSectionVocabulary.vue
```

### Run all checks before marking complete

```bash
# Full test suite
pnpm ci:full

# Should output:
# ✓ All unit tests pass
# ✓ All E2E tests pass
# ✓ No lint errors
# ✓ No type errors
# ✓ All files under size limits
```

### Manual verification with Playwright MCP

```bash
# Start dev server
pnpm dev

# Use Playwright MCP to test:
# 1. Navigate to /kanji/:id page
# 2. Verify vocabulary section displays
# 3. Click Edit button
# 4. Test search functionality
# 5. Test link existing vocabulary
# 6. Test quick-create workflow
# 7. Enable destructive mode
# 8. Test unlink with confirmation
# 9. Test mobile responsive (resize to 375px)
```

---

## Task Summary

| Phase     | User Story   | Task Count | Parallelizable | Est. Hours |
| --------- | ------------ | ---------- | -------------- | ---------- |
| 1         | Setup        | 6          | 3              | 2h         |
| 2         | Foundational | 4          | 2              | 2-3h       |
| 3         | US1 (P1)     | 9          | 5              | 3-4h       |
| 4         | US2 (P2)     | 8          | 4              | 3-4h       |
| 5         | US3 (P3)     | 6          | 3              | 2-3h       |
| 6         | US4 (P2)     | 6          | 3              | 2-3h       |
| 7         | Polish       | 11         | 5              | 2-3h       |
| **Total** |              | **50**     | **25**         | **15-20h** |

**Parallel Opportunities**: 50% of tasks can run in parallel with proper coordination

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 = ~6-8 hours, delivers viewable vocabulary list

**Incremental Delivery**:

- After Phase 3: Users can view vocabulary (read-only) ✓
- After Phase 4: Users can link existing vocabulary ✓✓
- After Phase 6: Users can unlink vocabulary (destructive mode) ✓✓✓
- After Phase 5: Users can quick-create vocabulary ✓✓✓✓
- After Phase 7: Production-ready with full polish ✓✓✓✓✓

---

## Completion Checklist

Before marking this feature complete:

- [ ] All 50 tasks completed
- [ ] All unit tests passing (80%+ coverage for composables)
- [ ] All E2E tests passing (<1s execution each)
- [ ] No lint errors (pnpm lint)
- [ ] No type errors (pnpm type-check)
- [ ] All files under size limits
- [ ] Mobile responsive verified (375px viewport)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] ARIA labels on all buttons
- [ ] Destructive mode integration verified
- [ ] Manual testing via Playwright MCP completed
- [ ] Design tokens used (no hardcoded CSS values)
- [ ] Toast notifications working for all operations
- [ ] Error handling tested (duplicate links, missing data)
- [ ] Empty states display correctly
- [ ] Navigation links work (RouterLink to vocabulary detail)
- [ ] Quick-create pre-fills search term
- [ ] Search excludes already-linked vocabulary
- [ ] Confirmation dialog shows for unlink
- [ ] Remove buttons only show in destructive mode
- [ ] Performance targets met (<1s render, <500ms search)

**Final Verification**: Run `pnpm ci:full` and manual Playwright MCP testing before merge.
