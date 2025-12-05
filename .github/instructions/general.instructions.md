---
applyTo: '**/*'
---

# General Instructions

Project-wide guidelines and conventions for the Kanji Dictionary Curation App.

## Project Overview

This is a personal, offline-first PWA for researching and documenting kanji. Built with:

- Vue 3 (Composition API, `<script setup>`)
- TypeScript (strict mode)
- SQLite via sql.js (browser-based)
- Reka UI (headless components)
- vee-validate + zod (forms/validation)
- Vitest + Testing Library + Playwright (testing)

## Project Structure

```
src/
├── modules/           # Feature modules
│   ├── kanji/         # Kanji CRUD
│   ├── kanji-list/    # List/search page
│   ├── components/    # Component management
│   └── settings/      # App settings
├── base/              # Generic, project-agnostic (works in ANY project)
│   ├── components/    # BaseButton, BaseInput, BaseModal
│   ├── composables/   # useLocalStorage, useDebounce
│   └── utils/         # formatDate, clamp, slugify
├── shared/            # App-specific shared code
│   ├── components/    # SharedHeader, SharedPageContainer
│   ├── composables/   # useDatabase, useNotification
│   ├── types/         # Database types, common types
│   ├── utils/         # Kanji formatters, DB helpers
│   └── validation/    # Common schemas
├── pages/             # Route entry points
├── router/            # Vue Router config
└── styles/            # Global styles, tokens
```

## Base vs Shared

**`base/`** — Generic code that works in ANY Vue project:

- UI primitives (BaseButton, BaseInput)
- Generic composables (useLocalStorage, useDebounce)
- Generic utilities (formatDate, clamp)

**`shared/`** — App-specific code shared across modules:

- App layout (SharedHeader)
- Database access (useDatabase)
- Kanji-related utilities
- App-specific types and schemas

**Decision rule**: Ask "Could this be copy-pasted into a different project?"

- Yes → `base/`
- No (references kanji, database, app concepts) → `shared/`

## Import Order

1. Vue/framework imports
2. Third-party libraries
3. Base imports (`@/base/...`)
4. Shared imports (`@/shared/...`)
5. Module imports (relative `./` or `../`)
6. Type imports (`import type`)

```typescript
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import BaseButton from '@/base/components/BaseButton.vue'
import { useDatabase } from '@/shared/composables/use-database'
import KanjiCard from './KanjiCard.vue'
import type { Kanji } from '../kanji-types'
```

## Path Aliases

- `@/` → `src/`
- Use `@/base/` for generic utilities and components
- Use `@/shared/` for app-specific shared code
- Use relative paths within the same module

## File Naming Summary

| Type           | Pattern                     |
| -------------- | --------------------------- |
| Vue components | `PascalCase.vue`            |
| TypeScript     | `kebab-case.ts`             |
| Composables    | `use-[name].ts`             |
| Types          | `[module]-types.ts`         |
| Schemas        | `[module]-[form]-schema.ts` |
| Tests          | `[filename].test.ts`        |

## CSS Variables

All styling must use CSS variables. Never hardcode colors, spacing, or font sizes.

See `docs/design-tokens.md` for available tokens.

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

- **Root**: Data fetching, error handling, page orchestration
- **Section**: Layout, grouping, coordination
- **UI**: Presentational, props in, events out

## Error Handling

| Type            | Treatment                  |
| --------------- | -------------------------- |
| Form validation | Inline errors below fields |
| DB operations   | Toast notification         |
| Not found       | Empty/error state on page  |

## Loading States

- Reserve space to prevent layout shift
- Use centered spinner for page loads
- Disable buttons during operations

## Key Documentation

- `docs/architecture.md` — Module structure, patterns
- `docs/conventions.md` — Naming, coding standards
- `docs/schema.md` — Database schema
- `docs/testing.md` — Testing strategy
- `docs/design-tokens.md` — CSS variables

## Documentation Lifecycle

After MVP ships:

- Move `docs/plan/mvp-features.md` → `docs/features.md`
- Delete `docs/plan/` folder
- Delete `docs/reference/` folder

## Git Conventions

- Follow Conventional Commits
- One logical change per commit
- Reference GitHub Issues when applicable

See `.github/instructions/commits.md` for details.

## Before Submitting Code

- [ ] TypeScript strict — no `any`, all types explicit
- [ ] CSS uses design token variables
- [ ] Components follow Root/Section/UI hierarchy
- [ ] Tests colocated with source files
- [ ] Loading and error states handled
- [ ] Keyboard accessible
- [ ] No console.log statements
