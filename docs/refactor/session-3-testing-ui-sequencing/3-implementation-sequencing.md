# Implementation Sequencing

**Summary:** This document provides a recommended order for implementing the refactoring, with per-module checklists, dependency analysis, and validation steps.

---

## Table of Contents

1. [Implementation Phases](#1-implementation-phases) (Lines 20-70)
2. [Phase Details](#2-phase-details) (Lines 75-180)
3. [Module Dependencies](#3-module-dependencies) (Lines 185-230)
4. [Per-Module Checklists](#4-per-module-checklists) (Lines 235-320)
5. [Git Strategy](#5-git-strategy) (Lines 325-370)

---

## 1. Implementation Phases

### Overview Timeline

| Phase                | Duration | Focus                              |
| -------------------- | -------- | ---------------------------------- |
| 0. Setup             | 1 day    | ESLint, API structure, branch      |
| 1. Infrastructure    | 2-3 days | API layer, base repositories       |
| 2. Kanji Module      | 3-4 days | Largest module, establish patterns |
| 3. Component Module  | 2-3 days | Apply Kanji patterns               |
| 4. Settings Module   | 1-2 days | Simpler, standalone                |
| 5. Vocabulary Module | 1 day    | Smallest module                    |
| 6. List Modules      | 2 days   | All three list modules             |
| 7. Testing & Polish  | 2-3 days | E2E fixes, UI consistency          |

**Total Estimated: 2-3 weeks**

### Phase Dependencies

```
Phase 0: Setup
    ↓
Phase 1: Infrastructure (API layer)
    ↓
Phase 2: Kanji ──┬──▶ Phase 3: Component
                 │
                 └──▶ Phase 4: Settings
                         ↓
                 Phase 5: Vocabulary
                         ↓
                 Phase 6: List Modules
                         ↓
                 Phase 7: Testing & Polish
```

### Parallel Workstreams

Some work can happen in parallel:

- API layer migration + UI refactoring
- Different modules (after patterns established)
- Unit tests + E2E test fixes

---

## 2. Phase Details

### Phase 0: Setup (Day 1)

**Tasks:**

1. Create refactor branch
2. Add ESLint file size rules (warn mode)
3. Create `src/api/` directory structure
4. Add data-testid attributes to SharedSection

**Validation:**

- [ ] Branch created from main
- [ ] `pnpm lint` passes with new rules (warnings OK)
- [ ] `src/api/` directory exists

### Phase 1: Infrastructure (Days 2-4)

**Tasks:**

1. Create `api/types.ts` with base interfaces
2. Implement `api/base-repository.ts`
3. Create `api/persistence.ts` utilities
4. Migrate `use-kanji-repository.ts` → `api/kanji/`
5. Update Kanji module imports
6. Run full test suite

**Validation:**

- [ ] Kanji CRUD works via new API layer
- [ ] All existing tests pass
- [ ] Repository pattern established

### Phase 2: Kanji Module (Days 5-8)

**Priority Order:**

1. KanjiRootDetail.vue → extract handlers to composables
2. KanjiDetailMeanings.vue → split into view/edit components
3. KanjiDetailClassifications.vue → apply list pattern
4. KanjiDetailReadings.vue → apply list pattern
5. KanjiSectionDetail.vue → remove pass-through, rename
6. Update/fix E2E tests

**Sub-tasks for KanjiRootDetail:**

- [ ] Create `use-kanji-detail-state.ts`
- [ ] Create `use-kanji-detail-handlers.ts` (or split by feature)
- [ ] Reduce Root to ~200 lines
- [ ] Update template to use new composables

**Sub-tasks for KanjiDetailMeanings:**

- [ ] Rename to `KanjiSectionMeanings.vue`
- [ ] Extract `KanjiMeaningsEditMode.vue`
- [ ] Extract `KanjiMeaningItem.vue`
- [ ] Extract `KanjiReadingGroupItem.vue`
- [ ] Each file < 250 lines

### Phase 3: Component Module (Days 9-11)

**Priority Order:**

1. ComponentRootDetail.vue → extract handlers
2. ComponentDetailGroupings.vue → split into components
3. ComponentDetailForms.vue → apply dialog pattern
4. ComponentDetailKanjiList.vue → apply list pattern
5. Update/fix E2E tests

### Phase 4: Settings Module (Days 12-13)

**Priority Order:**

1. SettingsSectionClassificationTypes.vue → extract list/dialog
2. SettingsSectionPositionTypes.vue → apply same pattern
3. Consider shared `TypeManager` component
4. Update/fix E2E tests

### Phase 5: Vocabulary Module (Day 14)

**Tasks:**

1. Rename "Detail" → "Section" components
2. Extract any handler logic
3. Ensure consistent patterns
4. Update E2E tests

### Phase 6: List Modules (Days 15-16)

**Tasks:**

1. KanjiListRoot → verify patterns
2. ComponentListRoot → verify patterns
3. VocabularyListRoot → split filters section
4. Add data-testid attributes
5. Update E2E tests

### Phase 7: Testing & Polish (Days 17-19)

**Tasks:**

1. Fix all flaky E2E tests
2. Add missing data-testid attributes
3. UI consistency audit per checklist
4. Switch ESLint rules to error mode
5. Final full test run
6. Documentation updates

---

## 3. Module Dependencies

### Import Dependencies

```
shared/
├── composables/use-database.ts ← All repositories depend on this
└── types/database-types.ts ← All modules depend on this

api/
├── kanji/ ← kanji module depends on this
├── component/ ← component module depends on this
├── meaning/ ← kanji module depends on this
└── ...

modules/
├── kanji/ ← Independent
├── component/ ← Independent
├── vocabulary/ ← Depends on kanji (for breakdown)
├── kanji-list/ ← Depends on kanji API
├── component-list/ ← Depends on component API
├── vocabulary-list/ ← Depends on vocabulary API
└── settings/ ← Independent (manages reference types)
```

### Refactoring Order Rationale

1. **Kanji first** — Largest, most complex, establishes patterns
2. **Component second** — Similar patterns, validates approach
3. **Settings third** — Standalone, lower risk
4. **Vocabulary fourth** — Depends on kanji, simpler
5. **List modules last** — Depend on detail modules

---

## 4. Per-Module Checklists

### Kanji Module Checklist

**Root Component:**

- [ ] Create `use-kanji-detail-state.ts`
- [ ] Create `use-kanji-detail-handlers.ts`
- [ ] Reduce KanjiRootDetail.vue to ~200 lines
- [ ] Remove KanjiSectionDetail.vue (pass-through)

**Meanings Section:**

- [ ] Rename to KanjiSectionMeanings.vue
- [ ] Create KanjiMeaningsEditMode.vue (~200 lines)
- [ ] Create KanjiMeaningItem.vue (~80 lines)
- [ ] Create KanjiReadingGroupItem.vue (~100 lines)
- [ ] Section orchestrator < 200 lines

**Classifications Section:**

- [ ] Rename to KanjiSectionClassifications.vue
- [ ] Create KanjiClassificationItem.vue
- [ ] Section < 200 lines

**Readings Section:**

- [ ] Rename to KanjiSectionReadings.vue
- [ ] Keep existing ViewMode/EditMode
- [ ] Section < 200 lines

**Testing:**

- [ ] Unit tests for new composables
- [ ] Update E2E tests with data-testid
- [ ] All tests pass

### Component Module Checklist

**Root Component:**

- [ ] Create `use-component-detail-state.ts`
- [ ] Create `use-component-detail-handlers.ts`
- [ ] Reduce ComponentRootDetail.vue to ~200 lines

**Groupings Section:**

- [ ] Rename to ComponentSectionGroupings.vue
- [ ] Create ComponentGroupingItem.vue
- [ ] Create ComponentGroupingMemberList.vue
- [ ] Section < 200 lines

**Forms Section:**

- [ ] Rename to ComponentSectionForms.vue
- [ ] Create ComponentFormItem.vue
- [ ] Create ComponentFormDialog.vue
- [ ] Section < 200 lines

**Testing:**

- [ ] Update E2E tests
- [ ] All tests pass

### Settings Module Checklist

- [ ] Extract ClassificationTypeList.vue
- [ ] Extract ClassificationTypeItem.vue
- [ ] Extract ClassificationTypeDialog.vue
- [ ] Apply same pattern to PositionTypes
- [ ] Each file < 300 lines
- [ ] Tests pass

### Validation After Each Module

- [ ] `pnpm lint` passes
- [ ] `pnpm type-check` passes
- [ ] `pnpm test` passes
- [ ] `pnpm test:e2e` passes
- [ ] No file > 450 lines
- [ ] Patterns consistent with Kanji module

---

## 5. Git Strategy

### Branch Structure

```
main
 └── refactor/complete-frontend-rewrite
      ├── refactor/phase-0-setup
      ├── refactor/phase-1-api-layer
      ├── refactor/phase-2-kanji
      ├── refactor/phase-3-component
      └── ...
```

### Commit Strategy

```bash
# Phase branch example
git checkout -b refactor/phase-2-kanji refactor/complete-frontend-rewrite

# Atomic commits for each extraction
git commit -m "refactor(kanji): extract detail state to composable"
git commit -m "refactor(kanji): extract meaning handlers to composable"
git commit -m "refactor(kanji): split KanjiDetailMeanings into sections"
git commit -m "test(kanji): update E2E tests for refactored components"
```

### Merge Criteria

Before merging each phase branch:

- [ ] All tests pass (`pnpm ci:full`)
- [ ] No lint errors
- [ ] No type errors
- [ ] Manual verification in browser
- [ ] PR reviewed (if team)

### Final Merge

```bash
# After all phases complete
git checkout main
git merge refactor/complete-frontend-rewrite --no-ff -m "refactor: complete frontend restructuring"
```

---

## Risk Mitigation

### High-Risk Areas

1. **KanjiRootDetail extraction** — Highest complexity
   - Mitigation: Extract in small, tested increments
2. **API layer migration** — Breaks all modules temporarily
   - Mitigation: Migrate one repository at a time, test each

3. **E2E test updates** — May reveal undocumented behavior
   - Mitigation: Fix tests immediately as components change

### Rollback Plan

- Each phase is a separate branch
- Can revert to any phase branch if issues arise
- Full rollback: delete refactor branch, continue on main

---

## Cross-References

- **Previous**: [2-ui-ux-consistency-guidelines.md](./2-ui-ux-consistency-guidelines.md)
- **Next**: [4-ai-agent-workflow-recommendations.md](./4-ai-agent-workflow-recommendations.md)
- **Related**: [Session 1: API Layer Restructuring Plan](../session-1-architecture/3-api-layer-restructuring-plan.md)
