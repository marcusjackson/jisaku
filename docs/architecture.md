# Architecture

System design, component patterns, and data flow for Jisaku.

---

## ⚠️ Refactoring Status

The codebase is being restructured. During the transition:

- **New code** goes in `src/` (modules, pages, api, base, shared)
- **Legacy code** lives in `src/legacy/` (frozen, not actively developed)
- **New E2E tests** go in `e2e/`
- **Legacy E2E tests** are in `e2e/legacy/`

ESLint and coverage exclude legacy by default. Use `pnpm lint:legacy` for opt-in legacy checks.

---

## Overview

The app follows a **modular architecture** with clear boundaries between features.

**Key principles:**

- **Offline-first** — All data lives locally in SQLite via sql.js
- **Module isolation** — Features don't directly import from each other
- **API layer in `api/`** — Centralized repository pattern for database access
- **Base code in `base/`** — Generic, project-agnostic utilities
- **Shared code in `shared/`** — App-specific code shared across modules

---

## Project Structure

```
src/
├── api/                        # API layer - centralized data access
│   ├── types.ts                # Repository interfaces, error classes
│   ├── base-repository.ts      # Abstract base class
│   ├── persistence.ts          # Auto-persist utilities
│   ├── kanji/                   # Kanji repositories
│   ├── component/               # Component repositories
│   ├── vocabulary/              # Vocabulary repositories
│   ├── reading/                 # Reading repositories
│   ├── meaning/                 # Meaning repositories
│   └── settings/                # Settings repositories
├── modules/                    # Feature modules
│   ├── kanji/                  # Kanji CRUD
│   ├── kanji-list/             # Kanji browsing/search
│   ├── component/              # Component CRUD
│   ├── component-list/         # Component browsing/search
│   ├── vocabulary/             # Vocabulary CRUD
│   ├── vocabulary-list/        # Vocabulary browsing/search
│   └── settings/               # App settings, DB export/import
├── base/                       # Generic (works in ANY project)
│   ├── components/             # BaseButton, BaseInput, BaseModal
│   ├── composables/            # useLocalStorage, useDebounce
│   └── utils/                  # Generic formatters, helpers
├── shared/                     # App-specific shared code
│   ├── components/             # SharedHeader, SharedPageContainer
│   ├── composables/            # useDatabase, useNotification
│   ├── types/                  # Database types, common types
│   ├── utils/                  # Kanji formatters, DB helpers
│   └── validation/             # Common zod schemas
├── pages/                      # Route entry points (thin wrappers)
├── router/                     # Vue Router configuration (dual routing)
├── db/                         # Database layer
│   ├── migrations/             # SQL migration files
│   ├── indexeddb.ts            # IndexedDB persistence
│   ├── lifecycle.ts            # Browser lifecycle handlers
│   └── init.ts                 # Database initialization
├── styles/                     # Global styles, design tokens
└── legacy/                     # Legacy code (frozen during refactoring)
    ├── modules/                # Legacy feature modules
    ├── pages/                  # Legacy pages
    ├── base/                   # Legacy base components
    ├── shared/                 # Legacy shared code
    └── styles/                 # Legacy styles
```

---

## Component Hierarchy

Components follow a **three-tier hierarchy** with strict file size limits:

| Tier    | Purpose                        | Max Lines | Naming Pattern                    |
| ------- | ------------------------------ | --------- | --------------------------------- |
| Root    | Page orchestration, data fetch | 200       | `[Module]Root[Descriptor].vue`    |
| Section | Layout, mode management        | 250       | `[Module]Section[Descriptor].vue` |
| UI      | Presentation, single concern   | 150       | `[Module][Descriptor].vue`        |

### Root Components

- **One Root per page** (not multiple)
- Call repositories to fetch data
- Handle loading/error states
- Coordinate page-level actions
- **Extract handlers to composables** when exceeding limits

```vue
<!-- KanjiRootDetail.vue (~200 lines max) -->
<script setup lang="ts">
const { state, handlers } = useKanjiDetail(props.kanjiId)
</script>

<template>
  <SharedPageContainer
    :loading="state.isLoading"
    :error="state.error"
  >
    <KanjiSectionHeader
      :kanji="state.kanji"
      @edit="handlers.onEdit"
    />
    <KanjiSectionMeanings :kanji-id="state.kanji.id" />
    <KanjiSectionReadings :kanji-id="state.kanji.id" />
  </SharedPageContainer>
</template>
```

### Section Components

- Orchestrate UI components within a logical area
- Manage view/edit modes
- **Split by mode** when exceeding limits (ViewMode, EditMode)

### UI Components

- Purely presentational
- Props in, events out
- No direct data fetching

---

## Base vs Shared

| Question                                        | Answer      |
| ----------------------------------------------- | ----------- |
| Could this work in any Vue project?             | → `base/`   |
| Does it reference kanji, database, or app data? | → `shared/` |
| Is it a generic UI primitive?                   | → `base/`   |
| Is it app layout/navigation?                    | → `shared/` |

---

## Data Flow

### Repository Pattern

Each module has a repository composable for database operations:

```typescript
// modules/kanji/composables/use-kanji-repository.ts
export function useKanjiRepository() {
  const db = useDatabase()

  return {
    findById: (id: number): Kanji | null => {
      /* SQL */
    },
    create: (data: CreateKanjiInput): Kanji => {
      /* SQL */
    },
    update: (id: number, data: UpdateKanjiInput): Kanji => {
      /* SQL */
    },
    // Field-level updates for inline editing
    updateShortMeaning: (id: number, value: string): void => {
      /* SQL */
    },
    remove: (id: number): void => {
      /* SQL */
    }
  }
}
```

### Data Flow Diagram

```
Page → Root → Repository → SQLite
         ↓
      Section
         ↓
        UI
```

---

## State Management

**No Pinia**. State is managed through:

1. **Component state** — `ref()` and `reactive()` within components
2. **Composables** — Shared logic encapsulated in composable functions
3. **SQLite** — Source of truth for all persistent data

---

## Routing

Routes defined in `src/router/index.ts`. Pages are thin wrappers:

```vue
<!-- pages/KanjiDetailPage.vue -->
<script setup lang="ts">
import { useRoute } from 'vue-router'
import KanjiRootDetail from '@/modules/kanji/components/KanjiRootDetail.vue'

const route = useRoute()
const kanjiId = computed(() => Number(route.params.id))
</script>

<template>
  <KanjiRootDetail :kanji-id="kanjiId" />
</template>
```

---

## Error Handling

| Error Type         | UI Treatment               |
| ------------------ | -------------------------- |
| Form validation    | Inline errors below fields |
| Database operation | Toast notification         |
| Not found          | Empty state on page        |

---

## Loading States

| Scenario          | Approach                         |
| ----------------- | -------------------------------- |
| Page initial load | Centered spinner                 |
| List loading      | Skeleton rows                    |
| Button action     | Disable button + spinner inside  |
| Form submit       | Disable form + spinner in button |

---

## PWA Architecture

- **Service Worker** — Caches app shell for offline use
- **IndexedDB** — Persists SQLite database between sessions
- **Web App Manifest** — Enables "Add to Home Screen"

---

## File Size Enforcement

**Target:** 150-300 lines per file
**Maximum:** 450 lines (strict)

When a file exceeds limits:

1. **Root components** → Extract handlers to `use-[module]-detail-handlers.ts`
2. **Section components** → Split into ViewMode/EditMode sub-components
3. **Large composables** → Split into queries/mutations files

See `docs/refactor/` for detailed refactoring patterns.

---

## Related Documentation

- [Conventions](./conventions.md) — Naming, coding standards
- [Schema](./schema.md) — Database tables and relationships
- [Testing](./testing.md) — Testing strategy
- [Design Tokens](./design-tokens.md) — CSS variables
- [Refactoring Guide](./refactor/README.md) — File size patterns, component breakdown
