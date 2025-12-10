# Architecture

This document describes the architectural structure, component patterns, and data flow for the Kanji Dictionary Curation App.

---

## Overview

The app follows a **modular architecture** with clear boundaries between features. Each module is self-contained with its own components, composables, and types.

**Key principles:**

- **Offline-first** — All data lives locally in SQLite via sql.js
- **Module isolation** — Features don't directly import from each other
- **Base code in `base/`** — Generic, project-agnostic utilities and components
- **Shared code in `shared/`** — App-specific code shared across modules
- **Repository pattern** — Database access abstracted through composables

---

## Project Structure

```
src/
├── modules/                    # Feature modules
│   ├── kanji/                  # Kanji CRUD (detail, new, edit)
│   │   ├── components/
│   │   ├── composables/
│   │   └── kanji-types.ts
│   ├── kanji-list/             # Kanji browsing and search
│   │   ├── components/
│   │   ├── composables/
│   │   └── kanji-list-types.ts
│   ├── components/             # Component management (the kanji building blocks)
│   │   ├── components/
│   │   ├── composables/
│   │   └── component-types.ts
│   ├── vocabulary/             # Vocabulary and words (planned)
│   │   ├── components/
│   │   ├── composables/
│   │   └── vocabulary-types.ts
│   └── settings/               # App settings, DB export/import
│       ├── components/
│       ├── composables/
│       └── settings-types.ts
│
├── base/                       # Generic, reusable across ANY project
│   ├── components/             # BaseButton, BaseInput, BaseModal (Reka UI wrappers)
│   ├── composables/            # useLocalStorage, useMediaQuery, useDebounce
│   └── utils/                  # Generic formatters, validators, helpers
│
├── shared/                     # App-specific, shared across modules
│   ├── components/             # SharedHeader, SharedSidebar, SharedPageContainer
│   ├── composables/            # useDatabase, useNotification, useAppState
│   ├── types/                  # Database types, common app types
│   ├── utils/                  # Kanji formatters, DB helpers
│   ├── validation/             # Common zod schemas for this app
│   └── constants/              # App-wide constants
│
├── pages/                      # Route entry points
│   ├── KanjiListPage.vue
│   ├── KanjiDetailPage.vue
│   ├── KanjiNewPage.vue
│   ├── KanjiEditPage.vue
│   ├── ComponentListPage.vue
│   ├── ComponentDetailPage.vue
│   ├── VocabularyListPage.vue  # Planned
│   └── SettingsPage.vue
│
├── router/                     # Vue Router configuration
│   └── index.ts
│
├── assets/                     # Static assets (icons, etc.)
├── styles/                     # Global styles
│   ├── tokens.css              # Design tokens (CSS variables)
│   └── base.css                # Base/reset styles
│
├── App.vue                     # Root component
└── main.ts                     # App entry point
```

---

## Module Structure

Each module follows a consistent internal structure:

```
modules/kanji/
├── components/
│   ├── KanjiRootDetail.vue         # Root: detail page orchestration
│   ├── KanjiRootForm.vue           # Root: new/edit page orchestration
│   ├── KanjiSectionDetail.vue      # Section: detail display
│   ├── KanjiSectionForm.vue        # Section: form wrapper
│   ├── KanjiCard.vue               # UI: displays kanji info
│   ├── KanjiForm.vue               # UI: the actual form
│   ├── KanjiFormFieldStrokeCount.vue  # UI: tightly coupled to KanjiForm
│   └── KanjiComponentsSelector.vue    # UI: component linking widget
├── composables/
│   ├── use-kanji-repository.ts     # Database operations
│   ├── use-kanji-form.ts           # Form state and validation
│   └── use-kanji-detail.ts         # Detail page data loading
├── kanji-types.ts                  # Module-specific types
└── kanji-form-schema.ts            # Zod validation schema
```

---

## Component Hierarchy

Components follow a three-tier hierarchy:

### Root Components

- **Purpose**: Page-level orchestration, data fetching, error boundaries
- **Naming**: `[Module]Root.vue` or `[Module]Root[Descriptor].vue`
- **Responsibilities**:
  - Call repository composables to fetch data
  - Handle loading and error states
  - Pass data down to Section components
  - Coordinate page-level actions

```vue
<!-- KanjiRootDetail.vue -->
<script setup lang="ts">
import { useKanjiRepository } from '../composables/use-kanji-repository'
import KanjiSectionDetail from './KanjiSectionDetail.vue'

const props = defineProps<{ kanjiId: number }>()
const { findById } = useKanjiRepository()
const { data: kanji, isLoading, error } = findById(props.kanjiId)
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <KanjiSectionDetail
    v-else
    :kanji="kanji"
  />
</template>
```

### Section Components

- **Purpose**: Logical groupings, layout, coordination between UI components
- **Naming**: `[Module]Section[Descriptor].vue`
- **Responsibilities**:
  - Arrange UI components
  - Handle section-specific logic
  - Emit events up to Root

```vue
<!-- KanjiSectionDetail.vue -->
<script setup lang="ts">
import type { Kanji } from '../kanji-types'
import KanjiCard from './KanjiCard.vue'
import KanjiComponentsList from './KanjiComponentsList.vue'

defineProps<{ kanji: Kanji }>()
</script>

<template>
  <div class="kanji-detail">
    <KanjiCard :kanji="kanji" />
    <KanjiComponentsList :components="kanji.components" />
  </div>
</template>
```

### UI Components

- **Purpose**: Presentational, reusable, focused on single concern
- **Naming**: `[Module][Descriptor].vue`
- **Responsibilities**:
  - Display data passed via props
  - Emit events for user interactions
  - No direct data fetching

```vue
<!-- KanjiCard.vue -->
<script setup lang="ts">
import type { Kanji } from '../kanji-types'

defineProps<{ kanji: Kanji }>()
defineEmits<{ edit: [] }>()
</script>

<template>
  <div class="kanji-card">
    <span class="kanji-character">{{ kanji.character }}</span>
    <span class="stroke-count">{{ kanji.strokeCount }} strokes</span>
  </div>
</template>
```

---

## Base vs Shared Code

This project distinguishes between **base** (generic) and **shared** (app-specific) code:

### Base (`src/base/`)

**Generic, project-agnostic code that could be used in ANY project.**

Ask: "Could this be copy-pasted into a completely different project and work?"

```
base/
├── components/           # Generic UI primitives
│   ├── BaseButton.vue
│   ├── BaseInput.vue
│   ├── BaseSelect.vue
│   ├── BaseModal.vue
│   ├── BaseToast.vue
│   └── BaseTable.vue
├── composables/          # Generic reactive utilities
│   ├── use-local-storage.ts
│   ├── use-media-query.ts
│   ├── use-debounce.ts
│   └── use-click-outside.ts
└── utils/                # Generic helper functions
    ├── format-date.ts
    ├── clamp.ts
    └── slugify.ts
```

**Examples of base code:**

- `BaseButton.vue` — A button component (works anywhere)
- `useLocalStorage()` — Reactive localStorage wrapper
- `formatDate()` — Date formatting utility
- `clamp()` — Number clamping utility

### Shared (`src/shared/`)

**App-specific code shared across multiple modules in THIS project.**

Ask: "Does this reference kanji, database, or app-specific concepts?"

```
shared/
├── components/           # App layout and navigation
│   ├── SharedHeader.vue
│   ├── SharedSidebar.vue
│   └── SharedPageContainer.vue
├── composables/          # App-specific shared logic
│   ├── use-database.ts
│   ├── use-notification.ts
│   └── use-app-state.ts
├── types/                # App-specific shared types
│   ├── database-types.ts
│   └── common-types.ts
├── utils/                # App-specific utilities
│   ├── kanji-formatters.ts
│   └── db-helpers.ts
├── validation/           # App-specific schemas
│   └── common-schemas.ts
└── constants/            # App-wide constants
    └── app-constants.ts
```

**Examples of shared code:**

- `SharedHeader.vue` — App navigation header (kanji app specific)
- `useDatabase()` — SQLite/sql.js access (this app's data layer)
- `kanji-formatters.ts` — Format kanji data for display
- `database-types.ts` — TypeScript types for DB entities

### Decision Guide

| Question                                             | If Yes →  | If No →       |
| ---------------------------------------------------- | --------- | ------------- |
| Could this work in any Vue project?                  | `base/`   | `shared/`     |
| Does it reference kanji, radicals, components?       | `shared/` | Maybe `base/` |
| Does it use the database or app state?               | `shared/` | Maybe `base/` |
| Is it a generic UI primitive (button, input, modal)? | `base/`   | Depends       |
| Is it app layout/navigation?                         | `shared/` | Depends       |

### Import Patterns

```typescript
// Base imports (generic)
import BaseButton from '@/base/components/BaseButton.vue'
import { useLocalStorage } from '@/base/composables/use-local-storage'
import { formatDate } from '@/base/utils/format-date'

// Shared imports (app-specific)
import SharedHeader from '@/shared/components/SharedHeader.vue'
import { useDatabase } from '@/shared/composables/use-database'
import { formatKanjiReading } from '@/shared/utils/kanji-formatters'
```

---

## Data Flow

### Repository Pattern

Each module has a repository composable that abstracts database operations:

```typescript
// modules/kanji/composables/use-kanji-repository.ts
export function useKanjiRepository() {
  const db = useDatabase()

  return {
    findById: (id: number): Kanji | null => {
      /* SQL query */
    },
    findByCharacter: (char: string): Kanji | null => {
      /* SQL query */
    },
    search: (filters: KanjiSearchFilters): Kanji[] => {
      /* SQL query */
    },
    create: (data: CreateKanjiInput): Kanji => {
      /* SQL insert */
    },
    update: (id: number, data: UpdateKanjiInput): Kanji => {
      /* SQL update */
    },
    delete: (id: number): void => {
      /* SQL delete */
    }
  }
}
```

### Database Layer Structure

The database layer is split into focused modules for maintainability:

```
src/
├── db/                          # Database layer modules
│   ├── migrations/              # SQL migrations
│   │   ├── index.ts             # Migration runner
│   │   ├── 001-initial.sql      # Initial schema
│   │   ├── 002-note-categories.sql
│   │   ├── 003-component-overhaul.sql
│   │   └── 004-add-kentei-level.sql
│   ├── indexeddb.ts             # IndexedDB persistence layer
│   ├── lifecycle.ts             # Browser lifecycle event handlers
│   └── init.ts                  # Database initialization
│
├── shared/composables/
│   └── use-database.ts          # Thin wrapper composable
```

**Responsibilities:**

- **`src/db/init.ts`** — Initializes sql.js, loads/creates database, runs migrations
- **`src/db/migrations/index.ts`** — Runs SQL migration files in order
- **`src/db/indexeddb.ts`** — Saves/loads database to/from IndexedDB, handles debounced persistence
- **`src/db/lifecycle.ts`** — Attaches browser lifecycle listeners (visibilitychange, pagehide, beforeunload)
- **`src/shared/composables/use-database.ts`** — Exposes database instance and methods to the app

**Usage:**

```typescript
// In a repository composable
import { useDatabase } from '@/shared/composables/use-database'

export function useKanjiRepository() {
  const { database, exec, run, initialize } = useDatabase()

  const findById = (id: number): Kanji | null => {
    const result = exec('SELECT * FROM kanjis WHERE id = ?', [id])
    return result[0]?.values[0] ? mapToKanji(result[0].values[0]) : null
  }

  const create = (data: CreateKanjiInput): Kanji => {
    run('INSERT INTO kanjis (...) VALUES (?)', [data.character, ...])
    // Auto-persists to IndexedDB (debounced)
  }

  return { findById, create, /* ... */ }
}
```

### Data Flow Diagram

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐     ┌──────────┐
│    Page     │ ──► │     Root     │ ──► │   Repository   │ ──► │  SQLite  │
│ (route)     │     │  (fetches)   │     │  (composable)  │     │ (sql.js) │
└─────────────┘     └──────────────┘     └────────────────┘     └──────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Section    │
                    │  (arranges)  │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │      UI      │
                    │  (displays)  │
                    └──────────────┘
```

---

## Routing

Routes are defined manually in `src/router/index.ts`:

```typescript
const routes = [
  { path: '/', component: () => import('@/pages/KanjiListPage.vue') },
  { path: '/kanji/new', component: () => import('@/pages/KanjiNewPage.vue') },
  {
    path: '/kanji/:id',
    component: () => import('@/pages/KanjiDetailPage.vue')
  },
  {
    path: '/kanji/:id/edit',
    component: () => import('@/pages/KanjiEditPage.vue')
  },
  {
    path: '/components',
    component: () => import('@/pages/ComponentListPage.vue')
  },
  {
    path: '/components/:id',
    component: () => import('@/pages/ComponentDetailPage.vue')
  },
  { path: '/settings', component: () => import('@/pages/SettingsPage.vue') }
]
```

### Pages

Pages are thin wrappers that:

1. Extract route params
2. Import and render the appropriate Root component

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

## State Management

**No Pinia**. State is managed through:

1. **Component state** — `ref()` and `reactive()` within components
2. **Composables** — Shared logic encapsulated in composable functions
3. **SQLite** — Source of truth for all persistent data
4. **Minimal global state** — App settings via `provide/inject`

```typescript
// shared/composables/use-app-state.ts
const appSettings = reactive({
  theme: 'light'
})

export function useAppState() {
  return { appSettings }
}
```

---

## Error Handling

| Error Type                | UI Treatment               |
| ------------------------- | -------------------------- |
| Form validation errors    | Inline errors below fields |
| Database operation errors | Toast notification         |
| Not found (missing kanji) | Empty state on page        |
| Critical errors           | Toast + error boundary     |

---

## Loading States

**Principle**: Reserve space, prevent layout shift.

| Scenario          | Approach                                |
| ----------------- | --------------------------------------- |
| Page initial load | Centered spinner (no partial content)   |
| List loading      | Skeleton rows with fixed height         |
| Button action     | Disable button + spinner inside         |
| Form submit       | Disable form + spinner in submit button |

---

## PWA Architecture

The app is a fully installable Progressive Web App:

- **Service Worker** — Caches app shell and assets for offline use
- **Web App Manifest** — Enables "Add to Home Screen" and standalone mode
- **IndexedDB** — Persists SQLite database between sessions

Database is stored as a single binary blob in IndexedDB, loaded into sql.js on app start.

---

## Development Seed Data

Development seed data is organized by entity type for maintainability:

```
scripts/
├── seed-dev-data.ts           # Main orchestrator (53 lines)
└── seeds/                     # Entity-specific seed modules
    ├── kanji-seed.ts          # Kanji test data
    ├── component-seed.ts      # Component/radical test data
    └── radical-seed.ts        # Legacy radical table data
```

**Usage:**

```typescript
import { seedDevData, clearDevData } from '@/scripts/seed-dev-data'

// Seed all data
seedDevData(db)

// Or seed individually
import { seedKanji } from '@/scripts/seeds/kanji-seed'
import { seedComponents } from '@/scripts/seeds/component-seed'
seedKanji(db)
seedComponents(db)

// Clear all data
clearDevData(db)
```

Each seed module:

- Checks if data already exists before seeding
- Provides both seed and clear functions
- Exports seed data arrays for testing/reuse
- Handles dependencies (e.g., components need kanji to exist first)
