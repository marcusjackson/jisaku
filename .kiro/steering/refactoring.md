# Refactoring Strategy

**Context:** Major UI rewrite in progress to address technical debt, file size violations, and architectural inconsistencies. Legacy code frozen in `src/legacy/` — new UI built from scratch following documented patterns.

## Approach: Fresh Rewrite, Not Incremental

**Dual-codebase strategy** — old and new UIs coexist during transition:

- **Legacy frozen** in `src/legacy/` — reference only, no modifications
- **New UI** in `src/` — built from scratch following new patterns
- **Shared database** — both UIs use same SQLite persistence layer
- **Incremental releases** — ship new modules as completed
- **Clean removal** — delete legacy once migration complete

**Why fresh rewrite:** Too many architectural issues to fix incrementally. Clean start allows proper patterns from day one.

## Core Refactoring Principles

### File Size Enforcement

Components and composables must respect strict line limits (ESLint enforced):

- Root: 200 lines max
- Section: 250 lines max
- UI: 200 lines max
- Composable: 200 lines max
- Repository: 250 lines max

**When approaching limits:**

- Root → Extract handlers to `use-[module]-handlers.ts` composable
- Section → Split into ViewMode/EditMode components
- Composable → Split into queries/mutations files
- Repository → Split into main + internals files

### Component Hierarchy

Three-tier architecture with clear boundaries:

1. **Root** — Data fetching, event coordination, page orchestration
2. **Section** — Layout, mode management (view/edit), section-level state
3. **UI** — Pure presentation, props in / events out, no business logic

**Data flow:** Page → Root → Section → UI (downward props, upward events)

### Repository Pattern

Centralized API layer in `src/api/` — no SQL in components:

```
src/api/
├── kanji/           # Kanji + readings + meanings
├── component/       # Components + forms + occurrences
├── vocabulary/      # Vocabulary + kanji links
└── settings/        # App configuration
```

**Pattern:** Each domain has queries (read) + mutations (write) separation when needed.

## Decomposition Patterns

### Handler Extraction (Root → Composable)

**When:** Root has 15+ handler methods  
**How:** Extract to `use-[module]-handlers.ts`

```typescript
// composables/use-kanji-handlers.ts
export function useKanjiHandlers(kanjiId: Ref<number>) {
  const repo = useKanjiRepository()

  async function updateMeaning(id: number, text: string) {
    const meaning = repo.updateMeaning(id, { text })
    await persist()
    return meaning
  }

  return { updateMeaning, addReading, removeClassification }
}
```

### Mode Splitting (Section → ViewMode/EditMode)

**When:** Section manages distinct view/edit states (200+ lines)  
**How:** Extract to separate components

```
BEFORE: KanjiSectionMeanings.vue (400 lines)
AFTER:
├── KanjiSectionMeanings.vue (100 lines) - orchestrator
├── KanjiMeaningsViewMode.vue (150 lines) - display
└── KanjiMeaningsEditMode.vue (150 lines) - editing
```

### Repository Splitting (Composable → Queries/Mutations)

**When:** Repository exceeds 200 lines  
**How:** Split into focused files

```
api/kanji/
├── kanji-queries.ts      # Read operations
├── kanji-mutations.ts    # Write operations
└── kanji-types.ts        # Type definitions
```

## Testing Requirements

### E2E Test Patterns

- **Selectors:** Use `data-testid` attributes (never CSS selectors)
- **Naming:** `{entity}-{section}-{element}` (e.g., `kanji-detail-headline`)
- **Waiting:** Use state-based waits (`toBeVisible`), never `waitForTimeout`
- **Navigation:** Verify with `waitForURL()` after navigation actions
- **Accessibility:** Prefer `getByRole()` for standard elements

### Unit Test Requirements

- **Colocated:** Test files live next to source (`Component.vue` + `Component.test.ts`)
- **Schema testing:** All zod schemas need validation tests
- **Coverage:** No strict requirement but test critical paths

## Form Validation Pattern

**vee-validate + zod** for all forms:

```typescript
// schemas/kanji-create-schema.ts
import { z } from 'zod'

export const kanjiCreateSchema = z.object({
  character: singleCharacterSchema,
  shortMeaning: optionalString(100)
})

export type KanjiCreateData = z.infer<typeof kanjiCreateSchema>
```

**In components:**

```vue
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { kanjiCreateSchema } from '../schemas/kanji-create-schema'

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(kanjiCreateSchema)
})

const { value: character, errorMessage } = useField<string>('character')
</script>
```

## Implementation Sequence

**Phase order** (established patterns before complexity):

1. **Infrastructure** — API layer, base repositories, shared components
2. **Kanji module** — Largest/most complex, establishes patterns
3. **Component module** — Apply patterns learned from kanji
4. **Settings module** — Simpler, good validation practice
5. **Vocabulary module** — Smallest, follows established patterns
6. **List modules** — All list views (kanji-list, component-list, vocab-list)
7. **Polish & testing** — E2E reliability, UI consistency

**Each module checklist:**

- [ ] Repository in `src/api/[domain]/`
- [ ] Root component under 200 lines
- [ ] Sections under 250 lines (split if needed)
- [ ] All forms use zod schemas
- [ ] E2E tests use `data-testid` selectors
- [ ] Unit tests colocated
- [ ] No ESLint file size violations

## Migration Status Tracking

**Documentation:** See `docs/refactor/` for detailed patterns
**Checklist:** Use `docs/refactor/CHECKLIST.md` for every new component
**Legacy tests:** E2E tests in `e2e/legacy/` — will be rewritten for new UI

**Current status markers:**

- ✅ Complete — Module fully migrated, tests passing
- 🚧 In progress — Active development
- ⏸️ Paused — Partially complete, resumed later
- ⏳ Not started — Legacy still in use

## Key Anti-Patterns to Avoid

**From legacy codebase issues:**

- ❌ SQL queries scattered in components
- ❌ Monolithic 500+ line components
- ❌ 30+ handler methods in single file
- ❌ Nested state management in sections
- ❌ CSS selector-based E2E tests
- ❌ Arbitrary `waitForTimeout()` in tests
- ❌ Forms without schema validation
- ❌ Missing `data-testid` attributes

**Enforce via:**

- ESLint file size rules (automated)
- Code review against CHECKLIST.md
- Test reliability metrics (E2E flakiness)

---

_created: 2026-01-10_  
_reference: docs/refactor/ for detailed patterns_
