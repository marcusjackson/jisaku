# Component Hierarchy Breakdown Plan

**Summary:** This document provides a detailed breakdown plan for restructuring each module's component hierarchy. It identifies specific files to split, proposes new component structures, and estimates the line count reductions.

---

## Table of Contents

1. [Kanji Module Restructuring](#1-kanji-module-restructuring) (Lines 20-120)
2. [Component Module Restructuring](#2-component-module-restructuring) (Lines 125-200)
3. [Settings Module Restructuring](#3-settings-module-restructuring) (Lines 205-260)
4. [Vocabulary Module Restructuring](#4-vocabulary-module-restructuring) (Lines 265-300)
5. [List Modules Overview](#5-list-modules-overview) (Lines 305-350)

---

## 1. Kanji Module Restructuring

### Current Structure (Problematic)

```
KanjiRootDetail.vue (1237 lines) ← 60+ handlers
├── KanjiSectionDetail.vue (540 lines) ← Pass-through
│   ├── KanjiDetailHeader.vue
│   ├── KanjiDetailBasicInfo.vue
│   ├── KanjiDetailComponents.vue
│   ├── KanjiDetailReadings.vue (530 lines)
│   ├── KanjiDetailMeanings.vue (1195 lines) ← Monolithic
│   ├── KanjiDetailClassifications.vue (626 lines)
│   ├── KanjiDetailStrokeOrder.vue
│   ├── KanjiDetailNotesEtymology.vue
│   ├── KanjiDetailNotesSemantic.vue
│   ├── KanjiDetailNotesEducation.vue
│   ├── KanjiDetailNotesPersonal.vue
│   └── KanjiDetailVocabulary.vue
```

### Proposed Structure

```
KanjiRootDetail.vue (~200 lines)
├── KanjiSectionHeader.vue (~100 lines)
│   └── KanjiHeaderEditDialog.vue (existing)
│
├── KanjiSectionBasicInfo.vue (~150 lines)
│   ├── KanjiBasicInfoView.vue (new, ~80 lines)
│   └── KanjiBasicInfoEdit.vue (new, ~100 lines)
│
├── KanjiSectionComponents.vue (~150 lines)
│   ├── KanjiComponentsList.vue (new, ~80 lines)
│   └── KanjiComponentsSearch.vue (new, ~100 lines)
│
├── KanjiSectionReadings.vue (~180 lines)
│   ├── KanjiReadingsViewMode.vue (existing, keep)
│   ├── KanjiReadingsEditMode.vue (existing, keep)
│   ├── KanjiOnReadingItem.vue (new, ~60 lines)
│   └── KanjiKunReadingItem.vue (new, ~70 lines)
│
├── KanjiSectionMeanings.vue (~200 lines)
│   ├── KanjiMeaningsViewMode.vue (existing, keep)
│   ├── KanjiMeaningsEditMode.vue (new, ~150 lines)
│   ├── KanjiMeaningItem.vue (new, ~80 lines)
│   └── KanjiReadingGroupItem.vue (new, ~100 lines)
│
├── KanjiSectionClassifications.vue (~150 lines)
│   ├── KanjiClassificationsList.vue (new, ~80 lines)
│   └── KanjiClassificationItem.vue (new, ~60 lines)
│
├── KanjiSectionStrokeOrder.vue (~100 lines)
│
├── KanjiSectionNotes.vue (~150 lines)
│   └── KanjiNoteEditor.vue (shared, ~80 lines)
│
└── KanjiSectionVocabulary.vue (~150 lines)
    └── KanjiVocabularyItem.vue (new, ~60 lines)
```

### Key Changes

1. **Rename "Detail" → "Section"** for intermediate components
2. **Extract handlers to composables** — Create `use-kanji-detail-handlers.ts`
3. **Split monolithic sections** — Meanings, Readings, Classifications
4. **Create reusable item components** — For lists and edit modes

### Estimated Line Reductions

| Current File                   | Lines | Target        | Reduction   |
| ------------------------------ | ----- | ------------- | ----------- |
| KanjiRootDetail.vue            | 1237  | 200           | -1037 (84%) |
| KanjiDetailMeanings.vue        | 1195  | 200 (Section) | -995 (83%)  |
| KanjiSectionDetail.vue         | 540   | Removed       | -540 (100%) |
| KanjiDetailClassifications.vue | 626   | 150           | -476 (76%)  |
| KanjiDetailReadings.vue        | 530   | 180           | -350 (66%)  |

---

## 2. Component Module Restructuring

### Current Structure (Problematic)

```
ComponentRootDetail.vue (757 lines)
├── ComponentSectionDetail.vue (493 lines)
│   ├── ComponentDetailHeader.vue
│   ├── ComponentDetailBasicInfo.vue (434 lines)
│   ├── ComponentDetailDescription.vue
│   ├── ComponentDetailForms.vue (585 lines)
│   ├── ComponentDetailGroupings.vue (750 lines) ← Complex
│   └── ComponentDetailKanjiList.vue (523 lines)
```

### Proposed Structure

```
ComponentRootDetail.vue (~200 lines)
├── ComponentSectionHeader.vue (~100 lines)
│
├── ComponentSectionBasicInfo.vue (~150 lines)
│   ├── ComponentBasicInfoView.vue (new, ~80 lines)
│   └── ComponentBasicInfoEdit.vue (new, ~100 lines)
│
├── ComponentSectionDescription.vue (~100 lines)
│
├── ComponentSectionForms.vue (~180 lines)
│   ├── ComponentFormsList.vue (new, ~100 lines)
│   ├── ComponentFormItem.vue (new, ~80 lines)
│   └── ComponentFormDialog.vue (new, ~100 lines)
│
├── ComponentSectionGroupings.vue (~200 lines)
│   ├── ComponentGroupingsList.vue (new, ~120 lines)
│   ├── ComponentGroupingItem.vue (new, ~100 lines)
│   └── ComponentGroupingMemberList.vue (new, ~100 lines)
│
└── ComponentSectionKanjiList.vue (~180 lines)
    ├── ComponentKanjiListView.vue (new, ~100 lines)
    └── ComponentKanjiItem.vue (new, ~60 lines)
```

### Key Changes

1. **Extract Groupings complexity** — Most complex section, needs 3 sub-components
2. **Create Form dialog component** — Reusable for add/edit
3. **Split BasicInfo** — View and edit modes separated

### Estimated Line Reductions

| Current File                 | Lines | Target | Reduction  |
| ---------------------------- | ----- | ------ | ---------- |
| ComponentRootDetail.vue      | 757   | 200    | -557 (74%) |
| ComponentDetailGroupings.vue | 750   | 200    | -550 (73%) |
| ComponentDetailForms.vue     | 585   | 180    | -405 (69%) |
| ComponentDetailKanjiList.vue | 523   | 180    | -343 (66%) |

---

## 3. Settings Module Restructuring

### Current Structure (Problematic)

```
SettingsRoot.vue
├── SettingsSectionAppearance.vue
├── SettingsSectionDatabase.vue
├── SettingsSectionDevTools.vue
├── SettingsSectionClassificationTypes.vue (643 lines) ← Full CRUD inline
└── SettingsSectionPositionTypes.vue (624 lines) ← Full CRUD inline
```

### Proposed Structure

```
SettingsRoot.vue (~150 lines)
├── SettingsSectionAppearance.vue (keep as-is)
├── SettingsSectionDatabase.vue (keep as-is)
├── SettingsSectionDevTools.vue (keep as-is)
│
├── SettingsSectionClassificationTypes.vue (~180 lines)
│   ├── ClassificationTypeList.vue (new, ~100 lines)
│   ├── ClassificationTypeItem.vue (new, ~80 lines)
│   └── ClassificationTypeDialog.vue (new, ~120 lines)
│
└── SettingsSectionPositionTypes.vue (~180 lines)
    ├── PositionTypeList.vue (new, ~100 lines)
    ├── PositionTypeItem.vue (new, ~80 lines)
    └── PositionTypeDialog.vue (new, ~120 lines)
```

### Key Changes

1. **Extract dialog logic** — Shared patterns for CRUD dialogs
2. **Create reusable item components** — For list rendering
3. **Consider shared pattern** — Both types follow same structure

### Potential Shared Component

```typescript
// Consider creating:
// shared/components/SharedTypeManager.vue
// - Generic CRUD for reference types (classifications, positions)
// - Reduces duplication between the two sections
```

---

## 4. Vocabulary Module Restructuring

### Current Structure (Acceptable)

```
VocabularyRootDetail.vue (~300 lines)
├── VocabularySectionDetail.vue (~200 lines)
│   ├── VocabularyDetailHeader.vue
│   ├── VocabularyDetailBasicInfo.vue
│   └── VocabularyDetailKanjiBreakdown.vue
```

### Proposed Structure

```
VocabularyRootDetail.vue (~200 lines)
├── VocabularySectionHeader.vue (~100 lines)
├── VocabularySectionBasicInfo.vue (~150 lines)
└── VocabularySectionKanjiBreakdown.vue (~150 lines)
    └── VocabularyKanjiBreakdownCard.vue (existing, keep)
```

### Status

Vocabulary module is relatively clean. Main changes:

1. Rename "Detail" → "Section"
2. Move some handlers to composable
3. No major splitting required

---

## 5. List Modules Overview

### Kanji List Module

```
KanjiListRoot.vue (~150 lines)
├── KanjiListSectionFilters.vue (~200 lines)
└── KanjiListSectionResults.vue (~150 lines)
    └── KanjiListCard.vue (~80 lines)
```

Status: Relatively clean, minor refactoring needed.

### Component List Module

```
ComponentListRoot.vue (~150 lines)
├── ComponentListSectionFilters.vue (~200 lines)
└── ComponentListSectionResults.vue (~150 lines)
    └── ComponentListCard.vue (~80 lines)
```

Status: Similar structure to Kanji List, consistent patterns.

### Vocabulary List Module

```
VocabularyListRoot.vue (~150 lines)
├── VocabularySectionFilters.vue (460 lines) ← Needs splitting
└── VocabularyListSectionResults.vue (~150 lines)
```

**Vocabulary filters section** needs splitting — extract filter groups into sub-components.

---

## Component Tree Visualization

### Kanji Module (Proposed)

```
                    KanjiRootDetail
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
SectionHeader    SectionBasicInfo    SectionReadings
    │                     │                     │
HeaderEditDialog    ┌─────┴─────┐         ┌─────┴─────┐
                BasicInfoView BasicInfoEdit  ViewMode  EditMode
                                                       │
                                                 ┌─────┴─────┐
                                            OnReadingItem KunReadingItem
```

---

## Cross-References

- **Previous**: [Session 1: Current Architecture Assessment](../session-1-architecture/1-current-architecture-assessment.md)
- **Next**: [2-file-size-refactoring-strategy.md](./2-file-size-refactoring-strategy.md)
- **Implementation**: [Session 3: Implementation Sequencing](../session-3-testing-ui-sequencing/3-implementation-sequencing.md)
