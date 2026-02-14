# Quickstart: Kanji Detail Vocabulary Section

**Feature**: 001-kanji-detail-vocab  
**Prerequisites**: Node.js 18+, pnpm 8+, existing jstudy repository cloned  
**Estimated Time**: 15-20 hours (development + testing)

## Overview

This guide walks through implementing the Kanji Detail Vocabulary section refactor step-by-step, following the established patterns from Readings and Meanings sections.

---

## Phase 1: Setup & API Layer (2 hours)

### Step 1.1: Update API Layer

Add the new join query method to vocabulary repository:

```bash
# Edit src/api/vocabulary/vocab-kanji-repository.ts
# Add getByKanjiIdWithVocabulary() method
```

**Implementation**:

1. Add `VocabKanjiWithVocabulary` type to `vocabulary-types.ts`
2. Implement `getByKanjiIdWithVocabulary(kanjiId)` in `VocabKanjiRepositoryImpl` class
3. Add unit test in `vocab-kanji-repository.test.ts`

**Verification**:

```bash
make test-file FILE=src/api/vocabulary/vocab-kanji-repository.test.ts
```

### Step 1.2: Create Module Types

Add vocabulary-specific types to kanji-detail module:

```bash
# Edit src/modules/kanji-detail/kanji-detail-types.ts
```

**Add**:

```typescript
export interface QuickCreateVocabularyData {
  word: string
  kana?: string
  shortMeaning?: string
}

export interface VocabularyListItem {
  linkId: number
  vocabularyId: number
  word: string
  kana: string | null
  shortMeaning: string | null
}
```

**Verification**:

```bash
make test-file FILE=src/modules/kanji-detail/kanji-detail-types.test.ts
```

---

## Phase 2: Schemas & Validation (1 hour)

### Step 2.1: Create Validation Schema

```bash
# Create src/modules/kanji-detail/schemas/kanji-detail-vocabulary-quick-create-schema.ts
```

**Implementation**:

```typescript
import { z } from 'zod'

export const kanjiDetailVocabularyQuickCreateSchema = z.object({
  word: z.string().min(1, 'Word is required').max(100, 'Word too long'),
  kana: z.string().max(200).optional(),
  shortMeaning: z.string().max(500).optional()
})

export type KanjiDetailVocabularyQuickCreateSchema = z.infer<
  typeof kanjiDetailVocabularyQuickCreateSchema
>
```

**Test**:

```bash
# Create src/modules/kanji-detail/schemas/kanji-detail-vocabulary-quick-create-schema.test.ts
```

**Verification**:

```bash
make test-file FILE=src/modules/kanji-detail/schemas/kanji-detail-vocabulary-quick-create-schema.test.ts
```

---

## Phase 3: Handlers Composable (2-3 hours)

### Step 3.1: Create Handlers Composable

```bash
# Create src/modules/kanji-detail/composables/use-kanji-detail-vocabulary-handlers.ts
```

**Implementation outline**:

1. Accept `kanjiId: Ref<number | null>` parameter
2. Use `useVocabularyRepository()` for vocabulary operations
3. Use `useVocabKanjiRepository()` for junction table operations
4. Use `useToast()` for success/error messages
5. Return handlers: `handleLinkVocabulary`, `handleCreateVocabulary`, `handleUnlinkVocabulary`, `refreshVocabularyList`
6. Return reactive state: `vocabularyList`, `isLoading`

**Key methods**:

- `handleLinkVocabulary(vocabularyId)`: Validate not duplicate, create link, refresh, toast
- `handleCreateVocabulary(data)`: Create vocabulary, create link, refresh, toast
- `handleUnlinkVocabulary(linkId)`: Delete link, refresh, toast
- `refreshVocabularyList()`: Call `getByKanjiIdWithVocabulary()`, map to VocabularyListItem[]

**Test**:

```bash
# Create src/modules/kanji-detail/composables/use-kanji-detail-vocabulary-handlers.test.ts
```

**Verification**:

```bash
make test-file FILE=src/modules/kanji-detail/composables/use-kanji-detail-vocabulary-handlers.test.ts
```

---

## Phase 4: Display Components (3-4 hours)

### Step 4.1: Vocabulary Item Component

```bash
# Create src/modules/kanji-detail/components/KanjiDetailVocabularyItem.vue
```

**Props**: `vocabulary: VocabularyListItem`, `destructiveMode: boolean`, `showLink: boolean`
**Emits**: `remove: [linkId]`
**Template**: Word (kana) - meaning, remove button if destructive mode
**Styling**: Flex row, responsive wrapping

**Test**:

```bash
# Create src/modules/kanji-detail/components/KanjiDetailVocabularyItem.test.ts
```

**Verification**:

```bash
make test-file FILE=src/modules/kanji-detail/components/KanjiDetailVocabularyItem.test.ts
```

### Step 4.2: Vocabulary Display Component

```bash
# Create src/modules/kanji-detail/components/KanjiDetailVocabularyDisplay.vue
```

**Props**: `vocabularyList: VocabularyListItem[]`, `destructiveMode: boolean`
**Emits**: `remove: [linkId]`
**Template**: Empty state or list of KanjiDetailVocabularyItem with RouterLink wrappers
**Styling**: Vertical list layout, gap spacing

**Test**:

```bash
# Create src/modules/kanji-detail/components/KanjiDetailVocabularyDisplay.test.ts
```

**Verification**:

```bash
make test-file FILE=src/modules/kanji-detail/components/KanjiDetailVocabularyDisplay.test.ts
```

---

## Phase 5: Search & Quick-Create (4-5 hours)

### Step 5.1: Vocabulary Search Component

```bash
# Create src/modules/kanji-detail/components/KanjiDetailVocabularySearch.vue
```

**Props**: `allVocabulary: Vocabulary[]`, `excludeIds: number[]`, `initialSearchTerm: string`
**Emits**: `select: [vocabularyId]`, `create: [searchTerm]`
**Features**:

- Text input with autocomplete
- Client-side filtering (word, kana, meaning)
- Exclude already-linked vocabulary
- "Create New" option when no results
- Keyboard navigation (arrow keys, enter, escape)

**Test**:

```bash
# Create src/modules/kanji-detail/components/KanjiDetailVocabularySearch.test.ts
```

**Verification**:

```bash
make test-file FILE=src/modules/kanji-detail/components/KanjiDetailVocabularySearch.test.ts
```

### Step 5.2: Quick-Create Component

```bash
# Create src/modules/kanji-detail/components/KanjiDetailQuickCreateVocabulary.vue
```

**Props**: `open: boolean`, `initialWord: string`
**Emits**: `create: [QuickCreateVocabularyData]`, `update:open: [boolean]`
**Features**:

- Reka UI Dialog wrapper
- vee-validate form with zod schema
- Fields: word (required, pre-filled), kana (optional), shortMeaning (optional)
- Submit/Cancel buttons
- Inline validation errors

**Test**:

```bash
# Create src/modules/kanji-detail/components/KanjiDetailQuickCreateVocabulary.test.ts
```

**Verification**:

```bash
make test-file FILE=src/modules/kanji-detail/components/KanjiDetailQuickCreateVocabulary.test.ts
```

---

## Phase 6: Edit Dialog (3-4 hours)

### Step 6.1: Edit Dialog Component

```bash
# Create src/modules/kanji-detail/components/KanjiDetailDialogVocabulary.vue
```

**Props**: `open: boolean`, `vocabularyList: VocabularyListItem[]`, `destructiveMode: boolean`, `kanjiId: number`
**Emits**: `update:open: [boolean]`, `link: [vocabularyId]`, `unlink: [linkId]`, `create: [QuickCreateVocabularyData]`
**Features**:

- Reka UI Dialog wrapper
- Current vocabulary list display with remove buttons (if destructive mode)
- "Add Vocabulary" toggle button
- KanjiDetailVocabularySearch (conditional rendering)
- KanjiDetailQuickCreateVocabulary (conditional rendering)
- SharedConfirmDialog for unlink confirmation
- Close button / Cancel button

**State management**:

- `showSearch: Ref<boolean>` - toggle search visibility
- `showQuickCreate: Ref<boolean>` - toggle quick-create dialog
- `showConfirmDialog: Ref<boolean>` - toggle unlink confirmation
- `removingLinkId: Ref<number | null>` - track which link is being removed
- `quickCreateSearchTerm: Ref<string>` - pass search term to quick-create

**Test**:

```bash
# Create src/modules/kanji-detail/components/KanjiDetailDialogVocabulary.test.ts
```

**Verification**:

```bash
make test-file FILE=src/modules/kanji-detail/components/KanjiDetailDialogVocabulary.test.ts
```

---

## Phase 7: Section Component (1-2 hours)

### Step 7.1: Section Component

```bash
# Create src/modules/kanji-detail/components/KanjiDetailSectionVocabulary.vue
```

**Props**: `vocabularyList: VocabularyListItem[]`, `destructiveMode: boolean`, `kanjiId: number`
**Emits**: `link`, `unlink`, `create` (forwarded from dialog)
**Template**:

- SharedSection wrapper with title "Vocabulary"
- Edit button in actions slot
- KanjiDetailVocabularyDisplay in default slot
- KanjiDetailDialogVocabulary (conditional)

**State**: `isDialogOpen: Ref<boolean>`

**Test**:

```bash
# Create src/modules/kanji-detail/components/KanjiDetailSectionVocabulary.test.ts
```

**Verification**:

```bash
make test-file FILE=src/modules/kanji-detail/components/KanjiDetailSectionVocabulary.test.ts
```

---

## Phase 8: Integration with Root (1-2 hours)

### Step 8.1: Update Root Component

```bash
# Edit src/modules/kanji-detail/components/KanjiDetailRoot.vue
```

**Changes**:

1. Import KanjiDetailSectionVocabulary
2. Import use-kanji-detail-vocabulary-handlers
3. Call handlers composable: `const { vocabularyList, handleLinkVocabulary, handleCreateVocabulary, handleUnlinkVocabulary, refreshVocabularyList } = useKanjiDetailVocabularyHandlers(kanjiId)`
4. Call `refreshVocabularyList()` in onMounted after loading kanji
5. Add `<KanjiDetailSectionVocabulary>` to template after other sections
6. Pass props and wire up event handlers

**Example**:

```vue
<KanjiDetailSectionVocabulary
  :vocabulary-list="vocabularyList"
  :destructive-mode="isDestructiveModeActive"
  :kanji-id="kanji.id"
  @link="handleLinkVocabulary"
  @unlink="handleUnlinkVocabulary"
  @create="handleCreateVocabulary"
/>
```

**Verification**:

```bash
make test-file FILE=src/modules/kanji-detail/components/KanjiDetailRoot.test.ts
make lint-file FILE=src/modules/kanji-detail/components/KanjiDetailRoot.vue
# Ensure file stays under 200 lines
```

### Step 8.2: Update Module Exports

```bash
# Edit src/modules/kanji-detail/index.ts
```

Add exports for new components/composables if needed (usually only Root is exported).

---

## Phase 9: E2E Tests (2-3 hours)

### Step 9.1: Add Vocabulary E2E Tests

```bash
# Edit e2e/kanji-detail.test.ts
```

**New test group**: "Vocabulary section"

**Tests**:

1. **View vocabulary list**: Navigate to kanji with vocabulary, verify list displays
2. **Link existing vocabulary**: Open dialog, search, select, verify linked
3. **Quick-create vocabulary**: Open dialog, search (no results), create new, verify created and linked
4. **Unlink vocabulary** (destructive mode): Enable destructive mode, open dialog, remove, confirm, verify unlinked
5. **Search filtering**: Verify search excludes already-linked vocabulary
6. **Mobile responsive**: Test at 375px viewport width

**Data setup**: Use test helpers to create kanji and vocabulary fixtures

**Verification**:

```bash
make e2e-file FILE=e2e/kanji-detail.test.ts
# Ensure all vocabulary tests pass in <1s each
```

---

## Phase 10: Test Helpers (1 hour)

### Step 10.1: Create Vocabulary Test Helpers

```bash
# Create test/helpers/vocabulary-test-helpers.ts
```

**Exports**:

```typescript
export function createTestVocabulary(
  overrides?: Partial<Vocabulary>
): Vocabulary
export function createTestVocabKanji(
  overrides?: Partial<VocabKanji>
): VocabKanji
export function createTestVocabularyList(count: number): Vocabulary[]
```

**Verification**:

```bash
# Used by component tests, verify via test runs
make test
```

---

## Phase 11: Polish & Verification (2-3 hours)

### Step 11.1: Manual Testing with Playwright MCP

```bash
# Start dev server
pnpm dev

# Use Playwright MCP to:
# 1. Navigate to kanji detail page
# 2. Test vocabulary section in view mode
# 3. Open edit dialog
# 4. Test search functionality
# 5. Test link existing vocabulary
# 6. Test quick-create workflow
# 7. Test unlink with destructive mode
# 8. Test mobile responsive (resize browser)
```

### Step 11.2: Run Full Test Suite

```bash
# All tests
pnpm ci:full

# Should see:
# ✓ Unit tests pass
# ✓ E2E tests pass
# ✓ No lint errors
# ✓ No type errors
# ✓ All files under size limits
```

### Step 11.3: Verify File Sizes

```bash
make lint

# Check output for any max-lines violations
# All kanji-detail components should be under limits:
# - KanjiDetailSectionVocabulary: <250 lines
# - KanjiDetailDialogVocabulary: <200 lines
# - KanjiDetailVocabularyDisplay: <200 lines
# - KanjiDetailVocabularyItem: <200 lines
# - KanjiDetailVocabularySearch: <200 lines
# - KanjiDetailQuickCreateVocabulary: <200 lines
# - use-kanji-detail-vocabulary-handlers: <200 lines
```

---

## Common Issues & Solutions

### Issue: KanjiDetailRoot exceeds 200 lines

**Solution**: Handlers already extracted to composable. If still over:

1. Check for inline event handlers - move to composable
2. Check for computed properties - move to use-kanji-detail-state.ts
3. Verify imports are grouped and organized

### Issue: E2E tests timeout or flaky

**Solution**:

1. Remove `waitForTimeout()` - use `waitFor()` with state checks
2. Ensure data-testid on all interactive elements
3. Use `getByRole()` / `getByLabelText()` for semantic queries
4. Check that toast notifications don't block interactions

### Issue: Dialog not responsive on mobile

**Solution**:

1. Verify max-width: `min(90vw, 600px)`
2. Check input fields have `width: 100%`
3. Ensure no fixed pixel widths in dialog content
4. Test in E2E with mobile viewport

### Issue: Vocabulary search too slow

**Solution**:

1. Client-side filtering is sufficient for typical dataset (<10,000 vocabulary)
2. If needed, add memoization with `computed()` for filtered results
3. Consider debouncing search input (300ms delay)

---

## Performance Targets

- Vocabulary list render: <1s (typically <100ms)
- Search filtering: <500ms (typically <50ms for <10k items)
- Link operation: <100ms (database write)
- Create + link operation: <150ms (two database writes)
- E2E test execution: <1s per test

---

## Completion Checklist

- [ ] API layer updated with `getByKanjiIdWithVocabulary()`
- [ ] Validation schema created and tested
- [ ] Handlers composable implemented and tested
- [ ] All display components created and tested
- [ ] Search component created and tested
- [ ] Quick-create component created and tested
- [ ] Edit dialog created and tested
- [ ] Section component created and tested
- [ ] Root component updated (under 200 lines)
- [ ] E2E tests added and passing
- [ ] Test helpers created
- [ ] Manual testing via Playwright MCP completed
- [ ] All tests pass (`pnpm ci:full`)
- [ ] All files under size limits
- [ ] No lint or type errors
- [ ] Mobile responsive verified
- [ ] Destructive mode integration verified

---

## Next Steps

After implementation complete:

1. Create pull request with conventional commit message
2. Request code review focusing on:
   - File size compliance
   - Test coverage
   - Accessibility (keyboard nav, ARIA labels)
   - Mobile responsiveness
3. Address review feedback
4. Merge to main branch
5. Verify production build (`pnpm build`)
6. Update documentation if needed

---

**Estimated Total Time**: 15-20 hours

**Parallel Work Opportunities**:

- Display components (Phase 4) can be done in parallel with Search/Quick-Create (Phase 5)
- Tests can be written concurrently with implementation
- E2E tests can be written while components are being developed (TDD approach)
