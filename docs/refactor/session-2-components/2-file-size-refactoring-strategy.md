# File Size Refactoring Strategy

**Summary:** This document provides a prioritized approach to reducing file sizes, with specific decomposition patterns and before/after examples for the largest files.

---

## Table of Contents

1. [Prioritization Matrix](#1-prioritization-matrix) (Lines 20-70)
2. [Decomposition Patterns](#2-decomposition-patterns) (Lines 75-140)
3. [Before/After Examples](#3-beforeafter-examples) (Lines 145-250)
4. [Extraction Guidelines](#4-extraction-guidelines) (Lines 255-300)

---

## 1. Prioritization Matrix

### Priority Calculation

Files are prioritized by: `Impact Score = Lines × Usage Frequency × Modification Rate`

### Priority 1: Critical (Immediate)

| File                         | Lines | Reason                                   |
| ---------------------------- | ----- | ---------------------------------------- |
| KanjiRootDetail.vue          | 1237  | Most complex, highest modification rate  |
| KanjiDetailMeanings.vue      | 1195  | Second largest, complex state management |
| ComponentRootDetail.vue      | 757   | Same pattern as KanjiRoot                |
| ComponentDetailGroupings.vue | 750   | Complex nested state                     |

### Priority 2: High (Week 1-2)

| File                                   | Lines | Reason                                     |
| -------------------------------------- | ----- | ------------------------------------------ |
| database-types.ts                      | 687   | Type definitions, affects all modules      |
| use-kanji-repository.ts                | 656   | Core data layer                            |
| SettingsSectionClassificationTypes.vue | 643   | Self-contained, good practice target       |
| KanjiDetailClassifications.vue         | 626   | Similar pattern to other Detail components |
| SettingsSectionPositionTypes.vue       | 624   | Same structure as ClassificationTypes      |

### Priority 3: Medium (Week 2-3)

| File                             | Lines | Reason                          |
| -------------------------------- | ----- | ------------------------------- |
| ComponentDetailForms.vue         | 585   | Follows groupings pattern       |
| use-classification-repository.ts | 576   | Repository cleanup              |
| use-meaning-repository.ts        | 560   | Repository cleanup              |
| KanjiSectionDetail.vue           | 540   | Pass-through, can be eliminated |
| KanjiDetailReadings.vue          | 530   | Follows meanings pattern        |

### Priority 4: Low (Week 3-4)

All remaining files between 400-530 lines.

---

## 2. Decomposition Patterns

### Pattern A: Handler Extraction

**When:** Component has 20+ handler methods
**How:** Extract to composable

```typescript
// Before: handlers in component
<script setup lang="ts">
async function handleAddMeaning() { ... }
async function handleUpdateMeaning() { ... }
async function handleRemoveMeaning() { ... }
// ... 15 more handlers
</script>

// After: handlers in composable
// composables/use-meaning-handlers.ts
export function useMeaningHandlers(kanjiId: Ref<number>) {
  const { persist } = useDatabase()
  const { success, error } = useToast()
  const meaningRepo = useMeaningRepository()

  async function addMeaning(text: string, info: string | null) {
    const meaning = meaningRepo.create({ kanjiId: kanjiId.value, text, info })
    await persist()
    success('Meaning added')
    return meaning
  }

  // ... other handlers

  return { addMeaning, updateMeaning, removeMeaning, ... }
}

// In component:
const { addMeaning, updateMeaning, ... } = useMeaningHandlers(kanjiId)
```

### Pattern B: View/Edit Split

**When:** Component has distinct view and edit modes
**How:** Extract to separate components

```typescript
// Before: single component with mode switching
<template>
  <div v-if="isEditing">
    <!-- 200 lines of edit mode template -->
  </div>
  <div v-else>
    <!-- 150 lines of view mode template -->
  </div>
</template>

// After: separate components
// KanjiMeaningsViewMode.vue (~150 lines)
// KanjiMeaningsEditMode.vue (~200 lines)
// KanjiSectionMeanings.vue (~100 lines - orchestration)
```

### Pattern C: List Item Extraction

**When:** v-for renders complex items
**How:** Extract item to component

```typescript
// Before: inline item rendering
<template>
  <div v-for="item in items" :key="item.id">
    <span>{{ item.name }}</span>
    <button @click="handleEdit(item)">Edit</button>
    <button @click="handleDelete(item.id)">Delete</button>
    <!-- 30+ lines per item -->
  </div>
</template>

// After: extracted item component
// MeaningItem.vue
<template>
  <div class="meaning-item">
    <span>{{ meaning.text }}</span>
    <button @click="$emit('edit')">Edit</button>
    <button @click="$emit('delete')">Delete</button>
  </div>
</template>

// Parent just maps
<MeaningItem
  v-for="meaning in meanings"
  :key="meaning.id"
  :meaning="meaning"
  @edit="handleEdit(meaning)"
  @delete="handleDelete(meaning.id)"
/>
```

### Pattern D: Dialog Extraction

**When:** Component has inline dialog definitions
**How:** Extract dialogs to separate files

```typescript
// Before: dialogs inline (50-100 lines each)
<template>
  <BaseDialog v-model:open="showEditDialog">
    <!-- 80 lines of dialog content -->
  </BaseDialog>
  <BaseDialog v-model:open="showDeleteDialog">
    <!-- 50 lines of dialog content -->
  </BaseDialog>
</template>

// After: separate dialog components
// MeaningEditDialog.vue (~80 lines)
// MeaningDeleteDialog.vue (~50 lines)
```

---

## 3. Before/After Examples

### Example 1: KanjiRootDetail.vue

**Before (1237 lines):**

```typescript
<script setup lang="ts">
// 120 lines: imports and setup
const kanji = ref<Kanji | null>(null)
const meanings = ref<KanjiMeaning[]>([])
// ... 20 more state declarations

// 800+ lines: handler methods
async function handleAddMeaning(...) { ... }
async function handleUpdateMeaning(...) { ... }
// ... 58 more handlers
</script>

<template>
  <KanjiSectionDetail
    :kanji="kanji"
    :meanings="meanings"
    @add-meaning="handleAddMeaning"
    @update-meaning="handleUpdateMeaning"
    <!-- 50+ event bindings -->
  />
</template>
```

**After (200 lines):**

```typescript
<script setup lang="ts">
// 30 lines: imports
import { useKanjiDetailState } from '../composables/use-kanji-detail-state'
import { useKanjiDetailHandlers } from '../composables/use-kanji-detail-handlers'

// 20 lines: setup
const route = useRoute()
const kanjiId = computed(() => Number(route.params.id))
const state = useKanjiDetailState(kanjiId)
const handlers = useKanjiDetailHandlers(kanjiId, state)
</script>

<template>
  <SharedPageContainer v-if="state.isLoading">
    <BaseSpinner />
  </SharedPageContainer>

  <SharedPageContainer v-else-if="state.error">
    <ErrorDisplay :error="state.error" />
  </SharedPageContainer>

  <template v-else>
    <KanjiSectionHeader
      :kanji="state.kanji"
      v-bind="handlers.header"
    />
    <KanjiSectionBasicInfo
      :kanji="state.kanji"
      v-bind="handlers.basicInfo"
    />
    <!-- Other sections with bound handlers -->
  </template>
</template>
```

### Example 2: KanjiDetailMeanings.vue

**Before (1195 lines):**

- View mode: 200 lines
- Edit mode: 400 lines
- Grouping mode: 300 lines
- Dialog templates: 200 lines
- Script logic: 300 lines

**After (200 lines as Section):**

```typescript
// KanjiSectionMeanings.vue (~200 lines)
<script setup lang="ts">
const isEditing = ref(false)
const isGroupingEnabled = computed(() => props.readingGroups.length > 0)
</script>

<template>
  <SharedSection title="Meanings">
    <template #actions>
      <BaseButton @click="isEditing = !isEditing">
        {{ isEditing ? 'Done' : 'Edit' }}
      </BaseButton>
    </template>

    <KanjiMeaningsViewMode
      v-if="!isEditing"
      :meanings="meanings"
      :reading-groups="readingGroups"
    />

    <KanjiMeaningsEditMode
      v-else
      :meanings="meanings"
      :reading-groups="readingGroups"
      @add="$emit('addMeaning', $event)"
      @update="$emit('updateMeaning', $event)"
      @remove="$emit('removeMeaning', $event)"
    />
  </SharedSection>
</template>
```

**Supporting components:**

- `KanjiMeaningsViewMode.vue` (~150 lines)
- `KanjiMeaningsEditMode.vue` (~200 lines)
- `KanjiMeaningItem.vue` (~80 lines)
- `KanjiReadingGroupItem.vue` (~100 lines)

---

## 4. Extraction Guidelines

### When to Extract

| Signal                | Action                              |
| --------------------- | ----------------------------------- |
| Component > 300 lines | Review for extraction opportunities |
| Component > 400 lines | Must extract something              |
| 20+ handlers          | Extract to composable               |
| v-for > 30 lines      | Extract item component              |
| Dialog > 50 lines     | Extract dialog component            |
| View/Edit modes       | Split into separate components      |

### What to Keep Together

- Props and emits definitions
- Computed properties derived from props
- Single-purpose utility functions (< 10 lines)
- Template bindings for extracted handlers

### Naming Conventions

| Extraction Type    | Naming Pattern                       |
| ------------------ | ------------------------------------ |
| Handler composable | `use-[entity]-[feature]-handlers.ts` |
| State composable   | `use-[entity]-[feature]-state.ts`    |
| View component     | `[Entity][Feature]ViewMode.vue`      |
| Edit component     | `[Entity][Feature]EditMode.vue`      |
| Item component     | `[Entity][Feature]Item.vue`          |
| Dialog component   | `[Entity][Feature]Dialog.vue`        |

---

## Checklist

### Per-File Checklist

- [ ] Identify current line count
- [ ] Determine applicable decomposition patterns
- [ ] Plan new file structure
- [ ] Extract handlers to composables
- [ ] Split view/edit modes
- [ ] Extract list items
- [ ] Extract dialogs
- [ ] Update imports
- [ ] Verify tests pass
- [ ] Verify file size < 350 lines

---

## Cross-References

- **Previous**: [1-component-hierarchy-breakdown-plan.md](./1-component-hierarchy-breakdown-plan.md)
- **Next**: [3-section-decomposition-patterns.md](./3-section-decomposition-patterns.md)
- **Related**: [Session 1: ESLint Rules Requirements](../session-1-architecture/4-eslint-rules-requirements.md)
