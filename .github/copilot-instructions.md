# GitHub Copilot Instructions

Project-specific instructions for GitHub Copilot Agent mode.

## Project Context

**Jisaku** is a personal, offline-first PWA for researching and documenting kanji.

### Tech Stack

- Vue 3 (Composition API, `<script setup>`)
- TypeScript (strict mode)
- Vite + PWA
- SQLite via sql.js (browser-based)
- Reka UI (headless accessible components)
- vee-validate + zod (forms/validation)
- Vitest (unit tests) + Playwright (E2E)

### Key Directories

```
src/
├── modules/           # Feature modules (kanji, component, vocabulary, settings)
├── base/              # Generic primitives (works in ANY Vue project)
├── shared/            # App-specific shared code
├── pages/             # Route entry points (thin wrappers)
└── db/                # Database setup and migrations
docs/                  # Project documentation
docs/refactor/         # Refactoring patterns and guidelines
.github/instructions/  # Mandatory coding standards
```

### Module Organization

Modules should be organized based on complexity:

**Simple modules** (few files):

```
modules/kanji-list/
├── components/
├── composables/
├── schemas/
├── kanji-list-types.ts
└── index.ts
```

**Complex modules** (with supporting files):

```
modules/kanji-detail/
├── components/        # Vue components
├── composables/       # Composables (use-*.ts)
├── schemas/           # Validation schemas (zod)
├── utils/             # Constants, helpers, utilities
├── kanji-detail-types.ts
└── index.ts
```

## File Size Limits (CRITICAL)

**All code must respect these limits (ESLint enforces these automatically):**

| File Type  | Target Lines | Max Lines |
| ---------- | ------------ | --------- |
| Test       | N/A          | **600**   |
| Types      | 200-250      | **300**   |
| Section    | 200-250      | **250**   |
| Root       | 200-250      | **250**   |
| Composable | 150-200      | **200**   |
| Repository | 200-250      | **250**   |
| UI         | 100-200      | **200**   |
| Page       | 80-100       | **100**   |

**IMPORTANT: How limits are calculated**

- Limits **exclude comments and blank lines** (`skipBlankLines: true, skipComments: true`)
- The `wc -l` command counts ALL lines and will NOT match ESLint's count
- ESLint only counts actual code lines - comments don't count against you
- **Never manually count lines** - let ESLint enforce limits automatically
- Run `pnpm lint` to check file sizes and see violations

**When approaching limits:**

- Root → Extract handlers to `use-[module]-detail-handlers.ts`
- Section → Split into ViewMode/EditMode components
- Composable → Split into queries/mutations files

See `docs/refactor/` for detailed patterns.

## Before Starting Any Task

1. **Read mandatory instruction files** in `.github/instructions/`
2. **Check file sizes** of files you'll modify
3. **Plan extraction** if files are approaching limits
4. **Review docs/refactor/** for decomposition patterns

## Mandatory Instruction Files

- `general.instructions.md` — Project structure, file size limits
- `components.instructions.md` — Component hierarchy, extraction patterns
- `composables.instructions.md` — Repository patterns, handler extraction
- `typescript.instructions.md` — Type safety patterns
- `testing.instructions.md` — Testing requirements
- `commit.instructions.md` — Commit message standards

## Project Documentation

- `docs/architecture.md` — System design, component patterns
- `docs/schema.md` — Database tables and relationships
- `docs/conventions.md` — Naming, coding standards
- `docs/testing.md` — Testing strategy
- `docs/refactor/` — **Refactoring patterns and implementation guides**

## Testing Requirements

### Before Marking Any Task Complete

1. **Check file sizes** — No file should exceed its max
2. **Run full checks** — `pnpm ci:full`
3. **Self-verify with Playwright MCP** — Test UI changes interactively
4. **All must pass** — Zero failures, zero lint/type errors

### Commands

```bash
pnpm ci:full           # All checks + tests
pnpm test              # Unit tests
pnpm test:e2e          # E2E tests
pnpm lint              # Lint check
pnpm type-check        # Type check
```

## Common Patterns

### Handler Extraction (Root too large)

```typescript
// BEFORE: All handlers in Root component
// AFTER: Extract to composable

// use-kanji-detail-handlers.ts
export function useKanjiDetailHandlers(kanji: Ref<Kanji | null>) {
  const handleUpdate = async (field: string, value: unknown) => {
    /* ... */
  }
  return { handleUpdate }
}

// In Root component
const { handleUpdate } = useKanjiDetailHandlers(kanji)
```

### Mode Splitting (Section too large)

```
BEFORE: KanjiDetailMeanings.vue (500 lines)
AFTER:
├── KanjiSectionMeanings.vue (150 lines) - orchestrator
├── KanjiMeaningsViewMode.vue (150 lines)
└── KanjiMeaningsEditMode.vue (200 lines)
```

### Repository Splitting (Composable too large)

```
BEFORE: use-kanji-repository.ts (400 lines)
AFTER:
├── use-kanji-repository.ts (100 lines) - delegates
├── use-kanji-queries.ts (150 lines)
└── use-kanji-mutations.ts (150 lines)
```

## Common Mistakes to Avoid

1. **File exceeds limit** — Always check line count before/after changes
2. **Missing handler extraction** — Root with 60+ handlers needs splitting
3. **Monolithic sections** — Sections with view/edit/grouping modes need splitting
4. **No field-level updates** — Repositories need individual field update methods
5. **Arbitrary waits in E2E** — Use `waitFor` state, not `waitForTimeout`

## Code Quality Checklist

- [ ] File under size limit for its type
- [ ] TypeScript strict — no `any`, explicit types
- [ ] CSS uses design token variables
- [ ] Components follow Root/Section/UI hierarchy
- [ ] Handlers extracted if Root approaches limit
- [ ] Modes split if Section approaches limit
- [ ] Tests colocated with source files
- [ ] Loading and error states handled
- [ ] Keyboard accessible
- [ ] No console.log statements
- [ ] Unit tests pass (`pnpm test`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] No lint errors (`pnpm lint`)
- [ ] No type errors (`pnpm type-check`)

## Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore, perf
Scopes: kanji, component, vocabulary, settings, base, shared, db
```

## Package Manager

**pnpm only** — Do not use `npm` or `yarn`.

## Refactoring Reference

For detailed patterns on file size management:

- `docs/refactor/README.md` — Index of all refactoring guides
- `docs/refactor/session-2-component-restructuring/` — Component decomposition
- `docs/refactor/session-1-architecture/` — Repository patterns
