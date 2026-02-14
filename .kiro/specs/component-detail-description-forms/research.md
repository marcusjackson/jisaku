# Research & Design Decisions

---

## Summary

- **Feature**: `component-detail-description-forms`
- **Discovery Scope**: Extension (extending existing component detail refactoring)
- **Key Findings**:
  - Component form repository already exists with full CRUD + reorder API
  - Component `description` field already exists in entity and update API
  - SharedSection with collapsible + actions slot pattern is established in KanjiSectionStrokeOrder
  - No BaseInlineTextarea in new base components — must adapt KanjiDetailNotesTextarea pattern

## Research Log

### Existing API Coverage

- **Context**: Verify if description and form APIs are already implemented
- **Sources Consulted**:
  - [component-repository.ts](src/api/component/component-repository.ts)
  - [component-form-repository.ts](src/api/component/component-form-repository.ts)
  - [component-types.ts](src/api/component/component-types.ts)
- **Findings**:
  - `ComponentRepository.update(id, input)` supports `description` field ✓
  - `ComponentRepository.updateField(id, 'description', value)` for single field updates ✓
  - `ComponentFormRepository` has full CRUD: `create()`, `update()`, `remove()` ✓
  - `ComponentFormRepository.reorder(ids)` for reordering ✓
  - `ComponentFormRepository.getByParentId(componentId)` returns ordered list ✓
- **Implications**: No new API work needed — all methods exist

### SharedSection Actions Slot Visibility Pattern

- **Context**: How to conditionally show Add Form button only when section is expanded
- **Sources Consulted**:
  - [SharedSection.vue](src/shared/components/SharedSection.vue#L63-L70)
  - [KanjiSectionStrokeOrder.vue](src/modules/kanji-detail/components/KanjiSectionStrokeOrder.vue#L62-L72)
- **Findings**:
  - SharedSection exposes `isOpen` as scoped slot prop in actions: `<slot :is-open="isOpen" name="actions" />`
  - KanjiSectionStrokeOrder uses `v-if="!isEditMode && isOpen"` to conditionally render Edit button
  - Pattern: Destructure `isOpen` in template slot and use for v-if
- **Implications**: Follow same pattern for Add Form button

### Inline Textarea Component Pattern

- **Context**: Legacy uses BaseInlineTextarea but new base lacks it
- **Sources Consulted**:
  - [KanjiDetailNotesTextarea.vue](src/modules/kanji-detail/components/KanjiDetailNotesTextarea.vue)
  - Legacy ComponentDetailDescription.vue
- **Findings**:
  - KanjiDetailNotesTextarea provides view/edit mode toggle with save/cancel
  - Emits `save` event with final value (string | null)
  - Simpler than legacy BaseInlineTextarea (blur-based saving)
  - For description, use simpler save-on-blur pattern similar to legacy
- **Implications**: Create ComponentDetailDescriptionTextarea adapting KanjiDetailNotesTextarea pattern

### Component Detail Root Structure

- **Context**: How to integrate new sections into existing Root
- **Sources Consulted**: [ComponentDetailRoot.vue](src/modules/component-detail/components/ComponentDetailRoot.vue)
- **Findings**:
  - Root currently has: Headline, BasicInfo, Actions sections
  - Uses `useComponentRepository()` for component data
  - `isDestructiveMode` state already managed at Root level
  - Pattern: Add sections after BasicInfo, before Actions
  - Uses `useToast()` for notifications
- **Implications**:
  - Need to load forms data in Root via `useComponentFormRepository()`
  - Pass `isDestructiveMode` to Forms section
  - Add handlers for description update and form CRUD

## Architecture Pattern Evaluation

| Option              | Description                                 | Strengths                              | Risks / Limitations       | Notes                  |
| ------------------- | ------------------------------------------- | -------------------------------------- | ------------------------- | ---------------------- |
| Inline in Root      | Add all form handlers directly in Root      | Simple, minimal files                  | Root may exceed 250 lines | Not recommended        |
| Handler Composable  | Extract to use-component-detail-handlers.ts | Matches kanji-detail pattern, testable | Additional file           | Recommended for growth |
| Minimal Integration | Add only essential handlers, keep Root lean | Fast to implement                      | May need refactor later   | Acceptable for now     |

## Design Decisions

### Decision: Section Naming Convention

- **Context**: Consistent naming across sections
- **Alternatives Considered**:
  1. ComponentDetailSectionDescription / ComponentDetailSectionForms
  2. ComponentSectionDescription / ComponentSectionForms
- **Selected Approach**: `ComponentDetailSectionDescription` and `ComponentDetailSectionForms`
- **Rationale**: Matches existing `ComponentDetailSectionBasicInfo` naming pattern
- **Trade-offs**: Longer names but consistent with module conventions

### Decision: Forms State Management

- **Context**: Where to store forms array and manage CRUD
- **Alternatives Considered**:
  1. Load forms in Root, pass as prop to section
  2. Load forms in section component directly
- **Selected Approach**: Load in Root, pass as prop
- **Rationale**: Matches pattern for other child entities, keeps data fetching centralized
- **Trade-offs**: Root grows slightly but maintains single data source

### Decision: Description Save Trigger

- **Context**: When to save description changes
- **Alternatives Considered**:
  1. Save on blur (auto-save like legacy)
  2. Save on explicit button click (like notes sections)
- **Selected Approach**: Save on blur with debounce
- **Rationale**: Matches legacy behavior, better UX for single-field editing
- **Trade-offs**: No explicit cancel, but simpler interaction

### Decision: Dialog Forms vs Inline Editing for Forms

- **Context**: How to handle form variant add/edit
- **Alternatives Considered**:
  1. Inline editing in the list
  2. Dialog-based add/edit (legacy pattern)
- **Selected Approach**: Dialog-based (match legacy)
- **Rationale**: Multiple fields (character, name, strokes, notes) — dialog is cleaner
- **Trade-offs**: Extra click but better form organization

## Risks & Mitigations

- **Risk**: Root component exceeds 250 lines with forms handlers
  - **Mitigation**: Extract handlers to composable if approaching limit
- **Risk**: Form dialog validation inconsistency
  - **Mitigation**: Use zod schemas matching existing patterns
- **Risk**: E2E test selectors may conflict with legacy tests
  - **Mitigation**: Use distinct `data-testid` attributes for new components

## References

- [SharedSection.vue](src/shared/components/SharedSection.vue) — Collapsible section with actions slot
- [KanjiSectionStrokeOrder.vue](src/modules/kanji-detail/components/KanjiSectionStrokeOrder.vue) — Actions slot visibility pattern
- [ComponentDetailForms.vue (legacy)](src/legacy/modules/component/components/ComponentDetailForms.vue) — Full forms functionality reference
- [ComponentDetailDescription.vue (legacy)](src/legacy/modules/component/components/ComponentDetailDescription.vue) — Description editing reference
- [component-forms-groupings.test.ts](e2e/legacy/component-forms-groupings.test.ts) — E2E test patterns for forms
