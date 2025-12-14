# Phase 4.5 Task: Kanji Detail Page Refactor

Refactor the kanji detail page from mega-form editing to section-based viewing with inline editing per section.

## Goal

Transform the kanji detail page to match V1 vision:

- **View-first design**: Detail page displays all information in organized sections
- **Section-based editing**: Each section can be edited independently
- **No mega-form**: Remove separate `/kanji/:id/edit` page entirely
- **SharedSection usage**: All sections use `SharedSection` for consistent UI

## Current State Analysis

### Files to Modify/Delete

| File                          | Action      | Notes                                              |
| ----------------------------- | ----------- | -------------------------------------------------- |
| `KanjiRootDetail.vue`         | **Modify**  | Add section edit handlers, remove form navigation  |
| `KanjiSectionDetail.vue`      | **Rewrite** | Use SharedSection for all content areas            |
| `KanjiDetailHeader.vue`       | **Modify**  | Add Edit button → opens header edit dialog         |
| `KanjiDetailBadges.vue`       | **Delete**  | Merge into new BasicInfo section                   |
| `KanjiDetailNotes.vue`        | **Rewrite** | Split into 4 collapsible sections with inline edit |
| `KanjiDetailComponents.vue`   | **Modify**  | Minor updates, already supports add/remove         |
| `KanjiDetailStrokeImages.vue` | **Modify**  | Add inline edit capability                         |
| `KanjiRootFormEdit.vue`       | **Delete**  | No longer needed                                   |
| `KanjiSectionForm.vue`        | **Delete**  | No longer needed for edit                          |
| `KanjiFormFields.vue`         | **Partial** | Keep for New page only, simplify                   |
| `KanjiEditPage.vue`           | **Delete**  | No longer needed                                   |

### Current Problems

1. **Mega-form pattern**: All editing happens on separate `/edit` page
2. **No SharedSection usage**: Detail page uses custom sections
3. **Mixed responsibilities**: Badges, header, and notes are separate but should follow consistent section pattern
4. **No inline editing**: Must navigate away to edit anything

## Target Structure

### Page Flow

```
┌─────────────────────────────────────────────┐
│ [← Back to Kanji List]                      │
├─────────────────────────────────────────────┤
│ HEADER                                      │
│ 明                              [Edit]      │
│ 明るい                                      │
│ 🔍 (search_keywords indicator)              │
├─────────────────────────────────────────────┤
│ SharedSection: Basic Information         ▸  │
│ SharedSection: Components                ▸  │
│ SharedSection: Stroke Order              ▾  │
│ SharedSection: Etymology Notes           ▾  │
│ SharedSection: Semantic Analysis         ▾  │
│ SharedSection: Education & Mnemonics     ▾  │
│ SharedSection: Personal Notes            ▾  │
├─────────────────────────────────────────────┤
│ [Delete]                                    │
│ [← Back to Kanji List]                      │
└─────────────────────────────────────────────┘

▸ = not collapsible    ▾ = collapsible
```

### Section Specifications

| Section               | Collapsible | Edit Mode | Content                                   |
| --------------------- | ----------- | --------- | ----------------------------------------- |
| Header                | No          | Dialog    | Character, short_meaning, search_keywords |
| Basic Information     | No          | Inline    | Stroke count, JLPT, Joyo, Kentei, radical |
| Components            | No          | Dialog    | Linked components with position/radical   |
| Stroke Order          | Yes         | Inline    | Diagram + GIF images                      |
| Etymology Notes       | Yes         | Inline    | BaseInlineTextarea                        |
| Semantic Analysis     | Yes         | Inline    | BaseInlineTextarea                        |
| Education & Mnemonics | Yes         | Inline    | BaseInlineTextarea                        |
| Personal Notes        | Yes         | Inline    | BaseInlineTextarea                        |

## New Files to Create

### Components

| File                            | Type | Purpose                                               |
| ------------------------------- | ---- | ----------------------------------------------------- |
| `KanjiDetailBasicInfo.vue`      | UI   | Basic info with inline edit (stroke, levels, radical) |
| `KanjiDetailStrokeOrder.vue`    | UI   | Rename from StrokeImages, add inline edit             |
| `KanjiDetailNotesEtymology.vue` | UI   | Single note section with inline edit                  |
| `KanjiDetailNotesSemantic.vue`  | UI   | Single note section with inline edit                  |
| `KanjiDetailNotesEducation.vue` | UI   | Single note section with inline edit                  |
| `KanjiDetailNotesPersonal.vue`  | UI   | Single note section with inline edit                  |
| `KanjiHeaderEditDialog.vue`     | UI   | Dialog for editing header fields                      |

### Tests

Each new/modified component needs colocated `.test.ts` file.

## Implementation Details

### Header Edit Pattern

Header displays: character, short_meaning, search_keywords indicator.
Edit button opens `KanjiHeaderEditDialog` with form for these 3 fields.

```vue
<!-- KanjiDetailHeader.vue -->
<template>
  <header>
    <span class="character">{{ kanji.character }}</span>
    <span class="meaning">{{ kanji.shortMeaning }}</span>
    <SharedSearchKeywordsIndicator :search-keywords="kanji.searchKeywords" />
    <BaseButton @click="emit('edit')">Edit</BaseButton>
  </header>
</template>
```

### Basic Information Inline Edit

Toggle edit mode within section. Save on blur/Enter, cancel on Escape.

Fields:

- Stroke count (number input)
- JLPT level (select)
- Joyo level (select)
- Kentei level (select)
- Radical (combobox → component search)

### Notes Sections Pattern

Each note type is its own collapsible section with `BaseInlineTextarea`:

```vue
<SharedSection title="Etymology Notes" collapsible>
  <BaseInlineTextarea
    :model-value="kanji.notesEtymology"
    placeholder="Add etymology notes..."
    @update:model-value="handleUpdate('notesEtymology', $event)"
  />
</SharedSection>
```

### Data Flow

```
KanjiRootDetail (Root)
├── Fetches kanji data
├── Provides update handlers for each section
└── KanjiSectionDetail (Section)
    ├── KanjiDetailHeader + KanjiHeaderEditDialog
    ├── SharedSection: Basic Information
    │   └── KanjiDetailBasicInfo
    ├── SharedSection: Components
    │   └── KanjiDetailComponents (existing, minor updates)
    ├── SharedSection: Stroke Order (collapsible)
    │   └── KanjiDetailStrokeOrder
    ├── SharedSection: Etymology Notes (collapsible)
    │   └── KanjiDetailNotesEtymology
    ├── SharedSection: Semantic Analysis (collapsible)
    │   └── KanjiDetailNotesSemantic
    ├── SharedSection: Education & Mnemonics (collapsible)
    │   └── KanjiDetailNotesEducation
    └── SharedSection: Personal Notes (collapsible)
        └── KanjiDetailNotesPersonal
```

## Composable Updates

### use-kanji-repository.ts

Add field-level update methods:

```typescript
interface KanjiRepository {
  // Existing
  getById(id: number): Kanji | null
  update(id: number, input: UpdateKanjiInput): Kanji

  // New: field-level updates
  updateStrokeCount(id: number, strokeCount: number): void
  updateJlptLevel(id: number, level: string | null): void
  updateJoyoLevel(id: number, level: string | null): void
  updateKenteiLevel(id: number, level: string | null): void
  updateRadicalId(id: number, radicalId: number | null): void
  updateNotesEtymology(id: number, notes: string | null): void
  updateNotesSemantic(id: number, notes: string | null): void
  updateNotesEducation(id: number, notes: string | null): void
  updateNotesPersonal(id: number, notes: string | null): void
  updateStrokeImages(
    id: number,
    diagram: Uint8Array | null,
    gif: Uint8Array | null
  ): void
  updateHeaderFields(
    id: number,
    character: string,
    shortMeaning: string | null,
    searchKeywords: string | null
  ): void
}
```

## Router Updates

Remove edit route:

```typescript
// Remove this route:
// { path: '/kanji/:id/edit', name: 'kanji-edit', component: KanjiEditPage }
```

## E2E Test Updates

### kanji-crud.test.ts - Complete Rewrite

Test flow changes from:

```
Create → View → Navigate to Edit → Modify → Save → View → Delete
```

To:

```
Create → View → Edit Header (dialog) → View → Edit Section (inline) → View → Delete
```

Key test scenarios:

1. Create kanji via New page → lands on detail
2. Edit header via dialog → verify updates
3. Edit basic info inline → verify updates
4. Edit notes inline → verify updates
5. Add/remove components → verify updates
6. Delete kanji → verify redirect

## Migration Checklist

- [ ] Create new UI components
- [ ] Write tests for new components
- [ ] Update KanjiRootDetail with edit handlers
- [ ] Rewrite KanjiSectionDetail with SharedSection
- [ ] Update composable with field-level updates
- [ ] Delete deprecated files
- [ ] Update router
- [ ] Rewrite E2E tests
- [ ] Run all tests
- [ ] Visual verification

## Files Summary

### Delete (6 files)

- `KanjiRootFormEdit.vue` + test
- `KanjiSectionForm.vue` + test
- `KanjiDetailBadges.vue` + test
- `KanjiEditPage.vue`

### Create (9 files)

- `KanjiDetailBasicInfo.vue` + test
- `KanjiDetailStrokeOrder.vue` + test
- `KanjiDetailNotesEtymology.vue` + test
- `KanjiDetailNotesSemantic.vue` + test
- `KanjiDetailNotesEducation.vue` + test
- `KanjiDetailNotesPersonal.vue` + test
- `KanjiHeaderEditDialog.vue` + test

### Modify (5 files)

- `KanjiRootDetail.vue` + test
- `KanjiSectionDetail.vue` + test
- `KanjiDetailHeader.vue` + test
- `KanjiDetailComponents.vue` (minor)
- `use-kanji-repository.ts` + test

### Keep Unchanged (2 files)

- `KanjiRootFormNew.vue` (New page stays as full form)
- `KanjiFormFields.vue` (Used by New page)
