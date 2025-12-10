# V1 Task Queue

Ordered implementation tasks. T0-T2 complete, T3+ remaining.

---

## Legend

**Effort:** 🟢 Small (1-2h) | 🟡 Medium (2-4h) | 🔴 Large (4-8h)

**Status:** ⬜ Not started | 🔄 In progress | ✅ Complete

---

## Completed Tasks (T0-T2)

### Phase 0: Foundation ✅

| Task | Description               | Effort |
| ---- | ------------------------- | ------ |
| T0.1 | BaseCheckbox with Reka UI | 🟢     |
| T0.2 | BaseSwitch component      | 🟢     |

### Phase 1: Short Meaning Field ✅

| Task | Description                          | Effort |
| ---- | ------------------------------------ | ------ |
| T1.1 | Migration 005: short_meaning columns | 🟢     |
| T1.2 | Kanji types and repository           | 🟢     |
| T1.3 | Component types and repository       | 🟢     |
| T1.4 | Kanji form short_meaning field       | 🟢     |
| T1.5 | Component form short_meaning field   | 🟢     |
| T1.6 | BaseCombobox searchKeys/displayFn    | 🟡     |
| T1.7 | Entity display cards updated         | 🟡     |

### Phase 2: Component System Cleanup ✅

| Task | Description                          | Effort |
| ---- | ------------------------------------ | ------ |
| T2.1 | Unified components section           | 🟡     |
| T2.2 | Occurrence edit dialog (deprecated)  | 🟡     |
| T2.3 | Occurrence editing on component page | 🔴     |
| T2.4 | Simplified kanji components section  | 🟡     |

---

## Phase 3: Shared UI Components

### T3.1: SharedSection Component 🟢

**Create:** `src/shared/components/SharedSection.vue`

- Collapsible prop (default: false)
- Bottom collapse button when expanded
- Actions slot for right-side buttons
- Uses Reka UI Collapsible when collapsible=true

**Test:** Unit test for both collapsible and non-collapsible modes

### T3.2: SharedEntityCard Component 🟢

**Create:** `src/shared/components/SharedEntityCard.vue`

- Display character, short_meaning, badges
- View and Remove action buttons
- Remove button hidden in view mode

**Test:** Unit test for props and events

### T3.3: Quick-Create Components 🟡

**Create:**

- `SharedQuickCreateKanji.vue` (character, strokes, short_meaning)
- `SharedQuickCreateComponent.vue` (+ can_be_radical)
- `SharedQuickCreateVocab.vue` (word, reading, short_meaning)

**Test:** Unit tests for validation and submission

### T3.4: SharedEntitySearch Component 🟡

**Create:** `src/shared/components/SharedEntitySearch.vue`

- Search existing entities by character or meaning
- "Create New" option triggers quick-create
- Props: entityType, excludeIds

**Test:** Unit test for search and selection

---

## Phase 4: Navigation & Safety

### T4.1: Back Button at Top and Bottom 🟢

**Update:** All detail pages

- `KanjiDetailPage.vue`
- `ComponentDetailPage.vue`
- (Future) `VocabDetailPage.vue`

**Test:** E2E test for navigation

### T4.2: Filter State Persistence 🟡

**Update:** List pages to store filters in URL query params

- `KanjiListPage.vue` / kanji-list module
- `ComponentListPage.vue` / components module

**Implementation:** Use vue-router query params or composable

**Test:** E2E test for filter preservation

### T4.3: Destructive Action Safety 🟡

**Update:**

- Move delete buttons to "More" menu or secondary position
- Add multi-step confirmation for entity deletion
- Remove X buttons from view mode in components section

**Test:** E2E test for confirmation flows

---

## Phase 5: Readings System

### T5.1: Readings Repository 🟡

**Create:** `src/shared/composables/use-reading-repository.ts`

```typescript
interface UseReadingRepository {
  getOnReadings(kanjiId: number): OnReading[]
  getKunReadings(kanjiId: number): KunReading[]
  createOnReading(input: CreateOnReadingInput): OnReading
  updateOnReading(id: number, input: UpdateOnReadingInput): void
  deleteOnReading(id: number): void
  // Same for kun readings
}
```

**Test:** Unit tests for CRUD operations

### T5.2: Readings Validation Schema 🟢

**Create:** `src/shared/validation/reading-schema.ts`

- Katakana validation for on-yomi
- Hiragana validation for kun-yomi

**Test:** Unit tests for validation rules

### T5.3: Readings Section UI 🔴

**Create:**

- `KanjiSectionReadings.vue`
- `KanjiReadingCard.vue`

**Features:**

- Inline editing
- Add/remove readings
- Primary/common flags
- Reorder support

**Depends on:** T5.1, T5.2

---

## Phase 6: Meanings System

### T6.1: Meanings Repository 🟡

**Create:** `src/shared/composables/use-meaning-repository.ts`

**Test:** Unit tests for CRUD and related kanji

### T6.2: Meanings Section UI 🔴

**Create:**

- `KanjiSectionMeanings.vue`
- `KanjiMeaningCard.vue`
- `KanjiRelatedKanjiSelector.vue`

**Features:**

- Reorder by drag
- Link to specific readings
- Related kanji (similar/opposite)
- Notes per meaning

**Depends on:** T6.1, T5.1 (for reading links)

---

## Phase 7: Classifications

### T7.1: Classifications Repository 🟢

**Create:** `src/shared/composables/use-classification-repository.ts`

### T7.2: Classifications UI 🟡

**Create:**

- `KanjiSectionClassification.vue`
- `KanjiClassificationSelector.vue`

**Features:**

- Badge display in basic info
- Multi-select with primary marker
- Notes per classification

**Depends on:** T7.1

---

## Phase 8: Vocabulary System

### T8.1: Migration 006 - Vocabulary Tables 🟢

**Create:** `src/db/migrations/006-vocabulary.sql`

Tables: vocabulary, vocab_kanji

### T8.2: Vocabulary Types and Repository 🟡

**Create:**

- `src/modules/vocabulary/vocabulary-types.ts`
- `src/modules/vocabulary/composables/use-vocabulary-repository.ts`

**Depends on:** T8.1

### T8.3: Vocabulary List Page 🟡

**Create:**

- `VocabularyListPage.vue`
- `VocabListRoot.vue`
- `VocabListCard.vue`

**Depends on:** T8.2

### T8.4: Vocabulary Detail Page 🔴

**Create:**

- `VocabularyDetailPage.vue`
- `VocabRootDetail.vue`
- `VocabSectionBreakdown.vue`
- `VocabKanjiCard.vue`

**Features:**

- Inline kanji breakdown editing
- Reading type dropdown
- Irregular flag

**Depends on:** T8.2, T5.1 (for reading selection)

### T8.5: Kanji Page Vocab Section 🟡

**Update:** Kanji detail page to show linked vocabulary

**Depends on:** T8.2
