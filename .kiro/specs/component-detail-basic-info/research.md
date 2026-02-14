# Research & Design Decisions

---

**Feature**: `component-detail-basic-info`
**Discovery Scope**: Extension (refactoring existing feature to new architecture)
**Key Findings**:

- Component repository already supports partial updates via `update()` method
- Existing kanji detail dialog patterns provide a clear template to follow
- Source kanji selection requires kanji repository integration (already available)

## Research Log

### Existing Legacy Component Analysis

- **Context**: Understand what the legacy `ComponentDetailBasicInfo.vue` implements
- **Sources Consulted**: [ComponentDetailBasicInfo.vue](../../../src/legacy/modules/component/components/ComponentDetailBasicInfo.vue)
- **Findings**:
  - 435 lines with inline view/edit mode toggle
  - General Attributes: stroke count (1-64), source kanji (combobox with kanji options), can-be-radical (checkbox)
  - Radical Attributes (conditional when canBeRadical=true): Kangxi number (1-214), Kangxi meaning (text), radical name Japanese (text)
  - Uses `__none__` sentinel value for "None" option in source kanji combobox
  - Emits individual field updates via `update` event with field name and value
- **Implications**: Need to replicate all 6 editable fields with same validation rules; dialog approach will consolidate the inline editing

### Refactored Section Patterns

- **Context**: Identify established patterns from other refactored sections
- **Sources Consulted**:
  - [KanjiDetailSectionBasicInfo.vue](../../../src/modules/kanji-detail/components/KanjiDetailSectionBasicInfo.vue)
  - [KanjiDetailDialogBasicInfo.vue](../../../src/modules/kanji-detail/components/KanjiDetailDialogBasicInfo.vue)
  - [ComponentDetailSectionHeadline.vue](../../../src/modules/component-detail/components/ComponentDetailSectionHeadline.vue)
- **Findings**:
  - Section uses `SharedSection` with title and `#actions` slot for Edit button
  - Dialog handles form state with `watch` on `open` prop to reset values
  - Form fields use `v-model` with local refs, validation on submit
  - Cancel resets form, Save emits structured data object
  - Consistent CSS class naming: `{component-name}-{element}`
  - Data-testid pattern: `{section-name}-{element}`
- **Implications**: Follow the same Section + Dialog pattern; emit single save event with all changed fields

### Component API Analysis

- **Context**: Verify component repository supports required operations
- **Sources Consulted**:
  - [component-repository.ts](../../../src/api/component/component-repository.ts)
  - [component-mutations.ts](../../../src/api/component/component-mutations.ts)
  - [component-types.ts](../../../src/api/component/component-types.ts)
- **Findings**:
  - `update(id, input)` accepts `UpdateComponentInput` (partial of all fields)
  - All required fields already mapped: `strokeCount`, `sourceKanjiId`, `canBeRadical`, `kangxiNumber`, `kangxiMeaning`, `radicalNameJapanese`
  - `updateField()` available for single-field updates
  - Kanji lookup requires separate `kanji-repository` integration for source kanji options
- **Implications**: API layer is complete; no new repository methods needed

### Kanji Repository for Source Kanji

- **Context**: Need to load kanji options for source kanji selection
- **Sources Consulted**: [kanji-repository.ts](../../../src/api/kanji/kanji-repository.ts)
- **Findings**:
  - `getAll()` returns all kanji sorted by id DESC
  - `getById(id)` retrieves single kanji for display
  - Kanji entity has `id`, `character`, `shortMeaning` - sufficient for combobox display
- **Implications**: Root component needs to fetch all kanji for source kanji combobox options

## Architecture Pattern Evaluation

| Option                      | Description                                      | Strengths                                                    | Risks / Limitations                                                 | Notes                                     |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------- |
| Section + Dialog (Selected) | Separate view section and edit dialog components | Clear separation of concerns, consistent with other sections | Requires passing kanji options through props                        | Matches established kanji-detail patterns |
| Inline Editing              | Keep legacy inline view/edit toggle              | Familiar UX from legacy                                      | Large component, harder to maintain, inconsistent with new sections | Rejected per requirements                 |

## Design Decisions

### Decision: Dialog-Based Editing Pattern

- **Context**: Legacy uses inline editing; requirements specify dialog-based approach
- **Alternatives Considered**:
  1. Inline editing (legacy approach) — familiar but inconsistent with refactored sections
  2. Dialog editing — matches kanji detail and headline patterns
- **Selected Approach**: Dialog editing with Section + Dialog component split
- **Rationale**: Consistency with other refactored sections; cleaner component boundaries
- **Trade-offs**: Extra component file, but better maintainability and testability
- **Follow-up**: None required

### Decision: Source Kanji Loading in Root

- **Context**: Need kanji list for source kanji combobox
- **Alternatives Considered**:
  1. Load in dialog — simpler props, but loads on every dialog open
  2. Load in section — cached, but section shouldn't own data fetching
  3. Load in root — consistent with data loading pattern
- **Selected Approach**: Load all kanji in Root component, pass to Section as prop
- **Rationale**: Root owns data fetching; Section is presentation-focused
- **Trade-offs**: Additional prop drilling but maintains hierarchy
- **Follow-up**: Consider memoization if kanji list is large

### Decision: Single Save Event with All Fields

- **Context**: Legacy emits individual field updates; dialog approach batches changes
- **Alternatives Considered**:
  1. Individual field events — simpler change detection, more network calls
  2. Batch save event — single update call, simpler handler
- **Selected Approach**: Emit single save event with `BasicInfoSaveData` containing all editable fields
- **Rationale**: Matches dialog pattern in kanji detail; reduces handler complexity
- **Trade-offs**: Updates all fields even if only one changed (acceptable for SQLite)
- **Follow-up**: None required

## Risks & Mitigations

- **Risk**: Large kanji list could slow dialog rendering — Mitigate with virtualized combobox or lazy loading if needed (defer optimization)
- **Risk**: Conditional radical fields could cause form state issues — Mitigate by clearing radical values when `canBeRadical` toggled off
- **Risk**: Source kanji link navigation in view mode — Ensure RouterLink points to correct new route (not legacy route)

## References

- [SharedSection Component](../../../src/shared/components/SharedSection.vue) — Layout pattern
- [BaseDialog Component](../../../src/base/components/BaseDialog.vue) — Dialog behavior
- [BaseCombobox Component](../../../src/base/components/BaseCombobox.vue) — Combobox for source kanji
- [Project Conventions](../../../docs/conventions.md) — Naming and structure rules
