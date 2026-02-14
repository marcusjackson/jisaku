# Research & Design Decisions

## Summary

- **Feature**: `kanji-detail-notes`
- **Discovery Scope**: Extension (existing system refinement)
- **Key Findings**:
  - Existing note fields already exist in database schema and Kanji entity type
  - Legacy implementation uses `BaseInlineTextarea` for inline editing with save/cancel
  - `SharedSection` component provides collapsible functionality already
  - Repository already has `updateField` method for field-level updates
  - New requirement: character count display in collapsed header

## Research Log

### Existing Database Schema

- **Context**: Verify note fields exist in database and types
- **Sources Consulted**: `src/api/kanji/kanji-types.ts`, `src/db/migrations/`
- **Findings**:
  - Four note fields in `kanjis` table: `notes_etymology`, `notes_semantic`, `notes_education_mnemonics`, `notes_personal`
  - Fields are nullable TEXT columns
  - Already mapped to camelCase in Kanji interface: `notesEtymology`, `notesSemantic`, `notesEducationMnemonics`, `notesPersonal`
- **Implications**: No schema changes needed; repository already handles these fields

### Existing Repository API

- **Context**: Check if note update methods exist
- **Sources Consulted**: `src/api/kanji/kanji-repository.ts`
- **Findings**:
  - Repository has generic `updateField(id, field, value)` method via `FieldUpdatable` interface
  - Can update individual note fields without touching other data
  - Pattern: `kanjiRepo.updateField(id, 'notesEtymology', newValue)`
- **Implications**: No new repository methods needed; existing `updateField` covers all use cases

### Legacy Note Components

- **Context**: Understand existing inline editing behavior
- **Sources Consulted**: `src/legacy/modules/kanji/components/KanjiDetailNotes*.vue`, `BaseInlineTextarea.vue`
- **Findings**:
  - Each note type has dedicated thin component (~30 lines each)
  - All delegate to `BaseInlineTextarea` for inline editing
  - `BaseInlineTextarea` provides: click-to-edit, save/cancel buttons, display/edit modes
  - Notes are wrapped in collapsible `SharedSection` with `defaultOpen` based on content presence
- **Implications**: Similar pattern should be followed; may need to create or extend inline textarea component

### SharedSection Component Capabilities

- **Context**: Verify SharedSection supports required features
- **Sources Consulted**: `src/shared/components/SharedSection.vue`
- **Findings**:
  - Supports `collapsible` prop for expand/collapse
  - Has `title` prop for section header
  - Has `#actions` slot for buttons in header
  - Has `defaultOpen` prop for initial state
  - Uses Reka UI `Collapsible*` components
  - **Missing**: No slot/prop for additional header content (needed for character count)
- **Implications**: SharedSection needs minor enhancement to support character count badge

### Section Positioning Requirements

- **Context**: Determine layout order for note sections
- **Sources Consulted**: Requirements, Legacy `KanjiSectionDetail.vue`
- **Findings**:
  - Legacy order: Basic Info → Readings → Meanings → Vocabulary → Semantic → Components → Classifications → Stroke Order → Etymology → Education → Personal
  - New order requested: Meanings → Components → Vocabulary → Semantic → Stroke Order → Etymology → Education → Personal
  - Semantic Analysis is separated from other notes (positioned differently)
- **Implications**: Semantic Analysis should be its own Section component; other three notes can share similar structure but also be separate Sections

## Architecture Pattern Evaluation

| Option                   | Description                                                 | Strengths                                  | Risks / Limitations                        | Notes                                       |
| ------------------------ | ----------------------------------------------------------- | ------------------------------------------ | ------------------------------------------ | ------------------------------------------- |
| One Section Per Note     | Each note field gets its own KanjiSectionXxxNotes component | Simple, consistent, matches legacy pattern | More files but each small (~50-80 lines)   | **Selected** - aligns with file size limits |
| Combined Notes Section   | Group Etymology/Education/Personal into one section         | Fewer components                           | Section would be larger, harder to reorder | Not viable due to positioning requirements  |
| Generic Reusable Section | Single KanjiSectionNotes with config props                  | Maximum DRY                                | Over-abstraction, less clear               | Considered but rejected for simplicity      |

## Design Decisions

### Decision: Individual Section Components

- **Context**: How to organize four note field sections given positioning requirements
- **Alternatives Considered**:
  1. One Section per note type
  2. Combined section for Etymology/Education/Personal
  3. Generic parameterized section
- **Selected Approach**: Individual Section components for each note type
- **Rationale**:
  - Semantic Analysis positioned separately from other notes
  - Each section is small (~60-80 lines) well under 250 limit
  - Clear naming matches legacy pattern
  - Easy to reposition or modify independently
- **Trade-offs**: More files, but simpler maintenance
- **Follow-up**: None needed

### Decision: Shared UI Component for Inline Textarea

- **Context**: Note editing needs inline save/cancel behavior
- **Alternatives Considered**:
  1. Replicate logic in each Section
  2. Create `KanjiDetailNotesTextarea` UI component
  3. Create base `BaseInlineTextarea` component (like legacy)
- **Selected Approach**: Create `KanjiDetailNotesTextarea` UI component in kanji-detail module
- **Rationale**:
  - Encapsulates inline edit/save/cancel behavior
  - Reused by all four note Sections
  - Module-scoped (not base) since specific to kanji detail notes pattern
  - Keeps each Section component simple
- **Trade-offs**: Extra component but promotes consistency
- **Follow-up**: Component should handle character count calculation internally

### Decision: Character Count in SharedSection Header

- **Context**: Character count needs to appear in collapsed header
- **Alternatives Considered**:
  1. Add `#header-extra` slot to SharedSection
  2. Add `badge` prop to SharedSection
  3. Handle within note Section components directly
- **Selected Approach**: Add optional `#header-extra` slot to SharedSection
- **Rationale**:
  - Generic enhancement usable by other sections
  - Backward compatible (slot is optional)
  - Allows any content (badge, count, icon, etc.)
- **Trade-offs**: Small SharedSection modification needed
- **Follow-up**: Must update SharedSection.test.ts

### Decision: Handler in Root vs Composable

- **Context**: Where to put note save handlers
- **Alternatives Considered**:
  1. Add to existing `useKanjiDetailHandlers`
  2. Create new `useKanjiDetailNotesHandlers`
  3. Inline in Root component
- **Selected Approach**: Create dedicated `useKanjiDetailNotesHandlers` composable
- **Rationale**:
  - Keeps Root component small
  - Notes handlers are cohesive (all four note types)
  - Follows existing pattern (vocabulary handlers, meanings handlers)
  - Easy to test in isolation
- **Trade-offs**: Additional composable file
- **Follow-up**: Update Root to import and use handlers

## Risks & Mitigations

- **Risk 1**: SharedSection enhancement may affect existing usages
  - **Mitigation**: Slot is optional, no breaking changes to existing props
- **Risk 2**: File size limits for Section components
  - **Mitigation**: Each note Section is very small (~60 lines), well under 250 limit
- **Risk 3**: Character count display styling inconsistency
  - **Mitigation**: Use design tokens, create consistent badge/counter pattern

## References

- [Kanji Repository](src/api/kanji/kanji-repository.ts) — `updateField` method
- [SharedSection Component](src/shared/components/SharedSection.vue) — collapsible section
- [Legacy BaseInlineTextarea](src/legacy/base/components/BaseInlineTextarea.vue) — inline editing pattern
- [Legacy Note Components](src/legacy/modules/kanji/components/) — `KanjiDetailNotes*.vue` files
