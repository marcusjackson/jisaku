---
applyTo: '**/*'
---

# General Instructions

Project-wide guidelines for the Jisaku Kanji Dictionary App.

## Tech Stack

- Vue 3 (Composition API, `<script setup>`)
- TypeScript (strict mode)
- SQLite via sql.js (browser-based)
- Reka UI (headless components)
- vee-validate + zod (forms/validation)
- Vitest + Testing Library + Playwright (testing)

## Project Structure

```
src/
├── api/               # API layer (repositories, data access)
├── modules/           # Feature modules (kanji, component, vocabulary, settings)
├── base/              # Generic, project-agnostic (works in ANY project)
├── shared/            # App-specific shared code
├── pages/             # Route entry points (thin wrappers)
├── db/                # Database layer
├── styles/            # Global styles, design tokens
└── legacy/            # Legacy code (frozen during refactoring)
```

**Note:** `src/legacy/` contains the old UI. ESLint ignores it by default.
New code should NOT import from `@/legacy/` — work in the new structure.

## File Size Limits (CRITICAL)

| File Type  | Target Lines | Max Lines | Enforced  |
| ---------- | ------------ | --------- | --------- |
| Test       | N/A          | **600**   | ✅ ESLint |
| Types      | 200-250      | **300**   | ✅ ESLint |
| Section    | 200-250      | **250**   | ✅ ESLint |
| Root       | 200-250      | **250**   | ✅ ESLint |
| Composable | 150-200      | **200**   | ✅ ESLint |
| Repository | 200-250      | **250**   | ✅ ESLint |
| UI         | 100-200      | **200**   | ✅ ESLint |
| Page       | 80-100       | **100**   | ✅ ESLint |

**IMPORTANT: How limits are calculated**

- Limits **exclude comments and blank lines** (`skipBlankLines: true, skipComments: true`)
- This means the `wc -l` command will NOT give you accurate line counts
- ESLint counts only actual code lines - write good comments freely!
- **Do NOT manually count lines** - let ESLint enforce the limits automatically
- If you get a file length error, focus on reducing actual code, not comments

To check if a file is within limits, run `pnpm lint` - it will report violations.

**When approaching limits:**

- Root components → Extract handlers to composable
- Section components → Split into ViewMode/EditMode
- Large composables → Split into queries/mutations
- Large repositories → Split into queries/mutations

See `docs/refactor/` for detailed patterns.

## Folder Structure

**Do NOT create subfolders** (like `components/filters/`) unless:

- The folder has 25+ files (not counting colocated test files)
- And there's a clear conceptual grouping that aids navigation

Module folders should be flat by default:

```
modules/kanji-list/
├── components/        # All components here, no subfolders
├── composables/       # All composables here
├── kanji-list-types.ts
└── index.ts
```

**Exception:** Modules with supporting files (schemas, constants, utils) should organize them:

```
modules/kanji-detail/
├── components/        # Vue components
├── composables/       # Composables (use-*.ts)
├── schemas/           # Validation schemas (zod)
├── utils/             # Constants, helpers, utilities
├── kanji-detail-types.ts  # Main type definitions
└── index.ts
```

## Base vs Shared

**`base/`** — Generic code that works in ANY Vue project
**`shared/`** — App-specific code shared across modules

**Decision:** Could this be copy-pasted into a different project?

- Yes → `base/`
- No → `shared/`

## Import Order

1. Vue/framework imports
2. Third-party libraries
3. Base imports (`@/base/...`)
4. API imports (`@/api/...`)
5. Shared imports (`@/shared/...`)
6. Module imports (relative `./` or `../`)
7. Type imports (`import type`)

## File Naming

| Type           | Pattern              |
| -------------- | -------------------- |
| Vue components | `PascalCase.vue`     |
| TypeScript     | `kebab-case.ts`      |
| Composables    | `use-[name].ts`      |
| Types          | `[module]-types.ts`  |
| Tests          | `[filename].test.ts` |

## CSS Variables

**Always** use CSS variables. **Never** hardcode values.

```css
/* ✅ Correct */
.element {
  color: var(--color-text-primary);
  padding: var(--spacing-md);
}

/* ❌ Wrong */
.element {
  color: #333;
  padding: 16px;
}
```

## Component Hierarchy

| Tier    | Purpose                   | Max Lines |
| ------- | ------------------------- | --------- |
| Root    | Data fetch, orchestration | 250       |
| Section | Layout, modes             | 250       |
| UI      | Presentation              | 200       |

## Error Handling

| Type            | Treatment                  |
| --------------- | -------------------------- |
| Form validation | Inline errors below fields |
| DB operations   | Toast notification         |
| Not found       | Empty state on page        |

## Before Submitting Code

- [ ] File under size limit for its type
- [ ] TypeScript strict — no `any`
- [ ] CSS uses design tokens
- [ ] Components follow hierarchy
- [ ] Tests colocated
- [ ] Loading/error states handled
- [ ] Keyboard accessible
- [ ] No console.log

## Key Documentation

- `docs/architecture.md` — System design, patterns
- `docs/conventions.md` — Naming, standards
- `docs/schema.md` — Database tables
- `docs/testing.md` — Testing strategy
- `docs/refactor/` — File size patterns, decomposition guides
