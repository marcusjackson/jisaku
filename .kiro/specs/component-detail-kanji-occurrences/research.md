# Research Document

## Discovery Scope

**Feature Type**: Extension (adding a new section to existing component detail page)  
**Discovery Level**: Light

## Research Log

### Topic 1: Legacy Implementation Analysis

**Investigation**: Analyzed `src/legacy/modules/component/components/ComponentDetailKanjiList.vue` (524 lines)

**Key Findings**:

- Uses inline editing for all fields (position, form, radical, analysis notes)
- Reorder buttons (↑↓) on each item
- Integrates with `SharedEntitySearch` for adding kanji
- Supports quick-create kanji flow
- Delete button visibility controlled by `isDestructiveMode` prop
- Emits many granular events: `update:analysisNotes`, `update:position`, `update:isRadical`, `update:form`, `addKanji`, `createKanji`, `removeKanji`, `reorderOccurrences`

**Design Impact**: Need to convert inline editing to dialog-based pattern, consolidating multiple update events into a single edit flow

### Topic 2: Existing API Capabilities

**Investigation**: Reviewed `src/api/component/component-occurrence-repository.ts`

**Current Capabilities**:

- `getByComponentId(componentId)` - Returns basic occurrences
- `create(input)` - Creates occurrence
- `update(id, input)` - Updates position, form, radical, notes
- `remove(id)` - Deletes occurrence
- `reorder(ids)` - Reorders occurrences

**Missing Capability**:

- `getByComponentIdWithKanji` - Need joined query to get kanji and position data

**Legacy Reference**: `src/legacy/shared/composables/use-component-occurrence-repository.ts` has rich join methods including position data, but not with kanji entity

### Topic 3: Component Hierarchy Patterns

**Investigation**: Examined Forms section implementation

**Pattern Applied**:

```
ComponentDetailSectionForms (Section)
├── ComponentDetailFormItem (UI - list item)
├── ComponentDetailDialogForm (Dialog - add/edit)
└── SharedConfirmDialog (Dialog - delete confirmation)
```

**For Occurrences**:

```
ComponentDetailSectionOccurrences (Section)
├── ComponentDetailOccurrenceItem (UI - list item)
├── ComponentDetailDialogAddKanji (Dialog - search + add)
├── ComponentDetailDialogEditOccurrence (Dialog - edit metadata)
└── SharedConfirmDialog (Dialog - delete confirmation)
```

### Topic 4: Shared Components Availability

**Investigation**: Checked `src/shared/components/`

**Available**:

- `SharedSection.vue` - Collapsible section wrapper ✓
- `SharedConfirmDialog.vue` - Delete confirmations ✓
- `SharedQuickCreateComponent.vue` - Quick create (not kanji) ✓
- `SharedPositionBadge.vue` - Position display ✓

**Needs Migration/Creation**:

- `SharedEntitySearch` - Currently in legacy, needs to be migrated or created fresh
- `SharedQuickCreateKanji` - Currently in legacy, needs migration

### Topic 5: Type Definitions

**Investigation**: Reviewed existing types

**Existing in API**:

- `ComponentOccurrence` - Base occurrence type
- `CreateComponentOccurrenceInput`, `UpdateComponentOccurrenceInput`

**New Types Needed**:

- `OccurrenceWithKanji` - Occurrence joined with Kanji and PositionType
- `OccurrenceEditData` - Form data for edit dialog

### Topic 6: Radical Flag Synchronization

**Investigation**: Analyzed legacy `updateIsRadical` implementation

**Behavior**:

1. Only one occurrence per kanji can be marked as radical
2. Setting radical on occurrence A unsets it on any other occurrence for same kanji
3. `kanji.radical_id` is updated to match the component_id

**Design Impact**: The API already handles this correctly - the edit dialog just needs to update `isRadical` field

## Integration Risks

| Risk                                       | Likelihood | Impact | Mitigation                                       |
| ------------------------------------------ | ---------- | ------ | ------------------------------------------------ |
| SharedEntitySearch not in new codebase     | High       | Medium | Migrate from legacy or create simplified version |
| SharedQuickCreateKanji not in new codebase | High       | Medium | Migrate from legacy or simplify for this feature |
| File size limits                           | Medium     | Low    | Pre-plan component splits if approaching limits  |

## Decision Log

| Decision                             | Rationale                                                           |
| ------------------------------------ | ------------------------------------------------------------------- |
| Separate Add and Edit dialogs        | Add requires search, Edit requires form fields - different UX needs |
| Migrate entity search                | Existing component is well-tested; fresh implementation is risky    |
| Single edit dialog vs field-by-field | Dialog consolidates changes, better UX than inline editing          |
