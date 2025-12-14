# Phase 4.5 Task: Component Detail Page Refactor

Refactor the component detail page from mega-form editing to section-based viewing with inline editing. Also split `components` module into `component` (detail) and `component-list` modules.

## Goals

1. **Module split**: Separate component list and component detail into distinct modules
2. **View-first design**: Detail page displays all information in organized sections
3. **Section-based editing**: Each section can be edited independently
4. **No mega-form**: Remove separate `/components/:id/edit` page entirely
5. **SharedSection usage**: All sections use `SharedSection` for consistent UI

## Module Reorganization

### Current Structure

```
src/modules/components/
├── component-form-schema.ts
├── component-occurrence-edit-schema.ts
├── components/
│   ├── ComponentDetailHeader.vue
│   ├── ComponentDetailInfo.vue
│   ├── ComponentDetailKanjiList.vue
│   ├── ComponentFormFields.vue
│   ├── ComponentListCard.vue
│   ├── ComponentListRoot.vue
│   ├── ComponentListSectionFilters.vue
│   ├── ComponentListSectionGrid.vue
│   ├── ComponentOccurrenceEditDialog.vue
│   ├── ComponentRootDetail.vue
│   ├── ComponentRootForm.vue
│   ├── ComponentSectionDetail.vue
│   └── ComponentSectionForm.vue
└── composables/
    ├── use-component-filters.ts
    ├── use-component-form.ts
    ├── use-component-occurrence-repository.ts
    ├── use-component-repository.ts
    └── use-position-type-repository.ts
```

### Target Structure

```
src/modules/component/           # Detail page module (NEW)
├── component-form-schema.ts     # Keep for quick-create validation
├── components/
│   ├── ComponentRootDetail.vue
│   ├── ComponentSectionDetail.vue
│   ├── ComponentDetailHeader.vue
│   ├── ComponentDetailBasicInfo.vue      # NEW
│   ├── ComponentDetailDescription.vue    # NEW
│   ├── ComponentDetailOccurrences.vue    # Renamed from KanjiList
│   ├── ComponentHeaderEditDialog.vue     # NEW
│   └── [tests for each]
└── composables/
    ├── use-component-repository.ts
    ├── use-component-occurrence-repository.ts
    └── use-position-type-repository.ts

src/modules/component-list/      # List page module (NEW)
├── components/
│   ├── ComponentListRoot.vue
│   ├── ComponentListSectionFilters.vue
│   ├── ComponentListSectionGrid.vue
│   ├── ComponentListCard.vue
│   └── [tests for each]
└── composables/
    └── use-component-filters.ts
```

### Files to Delete (from old `components` module)

- `ComponentRootForm.vue` + test
- `ComponentSectionForm.vue` + test
- `ComponentFormFields.vue` + test
- `component-occurrence-edit-schema.ts` + test (inline editing, no dialog needed)
- `ComponentOccurrenceEditDialog.vue` + test (inline editing replaces this)
- Entire `src/modules/components/` directory after migration

### Page Files Update

| File                      | Change                       |
| ------------------------- | ---------------------------- |
| `ComponentDetailPage.vue` | Update import path           |
| `ComponentEditPage.vue`   | **Delete**                   |
| `ComponentListPage.vue`   | Update import path           |
| `ComponentNewPage.vue`    | Update import path, simplify |

## Target Page Structure

```
┌─────────────────────────────────────────────┐
│ [← Back to Component List]                  │
├─────────────────────────────────────────────┤
│ HEADER                                      │
│ 日                              [Edit]      │
│ 太陽、日                                    │
│ 🔍 (search_keywords indicator)              │
├─────────────────────────────────────────────┤
│ SharedSection: Basic Information         ▸  │
│ SharedSection: Description               ▸  │
│ SharedSection: Appears in Kanji (47)     ▾  │
├─────────────────────────────────────────────┤
│ [Delete]                                    │
│ [← Back to Component List]                  │
└─────────────────────────────────────────────┘

▸ = not collapsible    ▾ = collapsible
```

### Section Specifications

| Section           | Collapsible | Edit Mode | Content                                     |
| ----------------- | ----------- | --------- | ------------------------------------------- |
| Header            | No          | Dialog    | Character, short_meaning, search_keywords   |
| Basic Information | No          | Inline    | Stroke count, source_kanji, radical attrs   |
| Description       | No          | Inline    | BaseInlineTextarea                          |
| Appears in Kanji  | Yes         | Inline    | Occurrence list with position/radical/notes |

### Basic Information Subsections

**General Attributes** (always shown):

- Stroke count
- Source kanji (link to kanji if set)

**Radical Attributes** (conditional on `canBeRadical`):

- Can be radical (checkbox toggle)
- Kangxi number
- Kangxi meaning
- Radical name (Japanese)

## New Files to Create

### component/ module

| File                             | Type | Purpose                                   |
| -------------------------------- | ---- | ----------------------------------------- |
| `ComponentDetailBasicInfo.vue`   | UI   | General + radical attrs with inline edit  |
| `ComponentDetailDescription.vue` | UI   | Description with BaseInlineTextarea       |
| `ComponentDetailOccurrences.vue` | UI   | Kanji list with inline occurrence editing |
| `ComponentHeaderEditDialog.vue`  | UI   | Dialog for header fields                  |

### component-list/ module

Files moved from old `components/` with updated imports:

- `ComponentListRoot.vue`
- `ComponentListSectionFilters.vue`
- `ComponentListSectionGrid.vue`
- `ComponentListCard.vue`
- `use-component-filters.ts`

## Implementation Details

### Header Edit Dialog

Same pattern as kanji: character, short_meaning, search_keywords in dialog form.

### Basic Information Inline Edit

Two subsections with toggle:

```vue
<SharedSection title="Basic Information">
  <template #actions>
    <BaseButton v-if="!isEditing" @click="startEdit">Edit</BaseButton>
    <template v-else>
      <BaseButton @click="save">Save</BaseButton>
      <BaseButton @click="cancel">Cancel</BaseButton>
    </template>
  </template>
  
  <!-- View mode -->
  <div v-if="!isEditing">
    <dl>
      <dt>Stroke Count</dt><dd>{{ component.strokeCount }}</dd>
      <dt>Source Kanji</dt><dd>{{ sourceKanji?.character ?? '—' }}</dd>
    </dl>
    
    <div v-if="component.canBeRadical">
      <h4>Radical Attributes</h4>
      <dl>
        <dt>Kangxi Number</dt><dd>{{ component.kangxiNumber }}</dd>
        <!-- etc -->
      </dl>
    </div>
  </div>
  
  <!-- Edit mode -->
  <form v-else>
    <!-- inputs -->
  </form>
</SharedSection>
```

### Occurrence Inline Editing

The current `ComponentDetailKanjiList` already supports inline editing of:

- Position (select)
- Is Radical (checkbox)
- Analysis Notes (textarea)

Rename to `ComponentDetailOccurrences` and ensure it works with `SharedSection`:

```vue
<SharedSection title="Appears in Kanji" collapsible default-open>
  <template #actions>
    <BaseButton @click="toggleAdd">+ Add</BaseButton>
  </template>
  
  <ComponentDetailOccurrences
    :occurrences="occurrences"
    @update:position="handlePositionUpdate"
    @update:is-radical="handleRadicalUpdate"
    @update:analysis-notes="handleNotesUpdate"
    @add-kanji="handleAddKanji"
  />
</SharedSection>
```

### Description Section

Simple inline textarea:

```vue
<SharedSection title="Description">
  <BaseInlineTextarea
    :model-value="component.description"
    placeholder="Add description..."
    @update:model-value="handleDescriptionUpdate"
  />
</SharedSection>
```

## Composable Updates

### use-component-repository.ts

Add field-level update methods:

```typescript
interface ComponentRepository {
  // Existing
  getById(id: number): Component | null
  update(id: number, input: UpdateComponentInput): Component

  // New: field-level updates
  updateStrokeCount(id: number, strokeCount: number): void
  updateSourceKanjiId(id: number, sourceKanjiId: number | null): void
  updateDescription(id: number, description: string | null): void
  updateCanBeRadical(id: number, canBeRadical: boolean): void
  updateRadicalAttributes(id: number, attrs: RadicalAttrs): void
  updateHeaderFields(
    id: number,
    character: string,
    shortMeaning: string | null,
    searchKeywords: string | null
  ): void
}

interface RadicalAttrs {
  kangxiNumber: number | null
  kangxiMeaning: string | null
  radicalNameJapanese: string | null
}
```

## Router Updates

```typescript
// Remove:
// { path: '/components/:id/edit', name: 'component-edit', component: ComponentEditPage }

// Keep:
{ path: '/components', name: 'component-list', component: ComponentListPage }
{ path: '/components/new', name: 'component-new', component: ComponentNewPage }
{ path: '/components/:id', name: 'component-detail', component: ComponentDetailPage }
```

## E2E Test Updates

### component-crud.test.ts - Complete Rewrite

Test flow changes:

```
Old: Create → View → Navigate to Edit → Modify → Save → View → Delete
New: Create → View → Edit Header (dialog) → Edit Section (inline) → Delete
```

### component-occurrence-edit.test.ts - Update

Already tests inline editing on component page, but verify it still works after refactor.

## Import Path Updates

All files importing from `@/modules/components/` need updates:

```typescript
// Old
import { useComponentRepository } from '@/modules/components/composables/use-component-repository'

// New (for detail-related imports)
import { useComponentRepository } from '@/modules/component/composables/use-component-repository'

// New (for list-related imports)
import { useComponentFilters } from '@/modules/component-list/composables/use-component-filters'
```

Files that need import updates:

- `KanjiRootDetail.vue`
- `KanjiDetailComponents.vue`
- `SharedQuickCreateComponent.vue` (if it uses repository)
- Any shared composables using component repository

## Migration Steps

1. **Create new module directories**
   - `src/modules/component/`
   - `src/modules/component-list/`

2. **Move list files** to `component-list/`
   - Update internal imports

3. **Move detail files** to `component/`
   - Update internal imports

4. **Create new detail components**
   - `ComponentDetailBasicInfo.vue`
   - `ComponentDetailDescription.vue`
   - `ComponentDetailOccurrences.vue`
   - `ComponentHeaderEditDialog.vue`

5. **Update composables** with field-level methods

6. **Update page files** with new import paths

7. **Delete deprecated files**
   - `ComponentRootForm.vue`
   - `ComponentSectionForm.vue`
   - `ComponentFormFields.vue`
   - `ComponentEditPage.vue`
   - Old `src/modules/components/` directory

8. **Update router**

9. **Update all external imports**

10. **Write/update tests**

11. **Rewrite E2E tests**

## Files Summary

### New Module: component/ (12 files)

Components:

- `ComponentRootDetail.vue` + test (moved + modified)
- `ComponentSectionDetail.vue` + test (rewritten)
- `ComponentDetailHeader.vue` + test (moved + modified)
- `ComponentDetailBasicInfo.vue` + test (new)
- `ComponentDetailDescription.vue` + test (new)
- `ComponentDetailOccurrences.vue` + test (renamed + modified)
- `ComponentHeaderEditDialog.vue` + test (new)

Composables:

- `use-component-repository.ts` + test (moved + modified)
- `use-component-occurrence-repository.ts` + test (moved)
- `use-position-type-repository.ts` + test (moved)

Schema:

- `component-form-schema.ts` + test (moved, for quick-create)

### New Module: component-list/ (6 files)

Components:

- `ComponentListRoot.vue` + test
- `ComponentListSectionFilters.vue` + test
- `ComponentListSectionGrid.vue` + test
- `ComponentListCard.vue` + test

Composables:

- `use-component-filters.ts` + test

### Delete (14 files)

- `src/modules/components/` (entire directory)
- `ComponentRootForm.vue` + test
- `ComponentSectionForm.vue` + test
- `ComponentFormFields.vue` + test
- `ComponentOccurrenceEditDialog.vue` + test
- `component-occurrence-edit-schema.ts` + test
- `ComponentEditPage.vue`

### Update (3 files)

- `ComponentDetailPage.vue` (import path)
- `ComponentListPage.vue` (import path)
- `ComponentNewPage.vue` (import path, keep using full form)
