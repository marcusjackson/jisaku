# Project Structure

## Organization Philosophy

**Modular, feature-first architecture** with strict boundaries:

- Features organized as self-contained modules
- Centralized API layer (repositories) — modules never access database directly
- Base code (generic, project-agnostic) vs Shared code (app-specific)
- Three-tier component hierarchy with enforced file size limits
- Colocated tests alongside source files

## Directory Patterns

### Feature Modules (`/src/modules/`)

**Location**: `/src/modules/[feature]/`  
**Purpose**: Self-contained feature domains (kanji, component, vocabulary, settings)  
**Structure**:

```
modules/kanji-detail/
├── components/        # Vue components (Root/Section/UI)
├── composables/       # use-*.ts (repositories, handlers)
├── schemas/           # Zod validation schemas
├── utils/             # Constants, helpers, formatters
├── kanji-detail-types.ts  # Type definitions
└── index.ts           # Public exports
```

**Rule**: Flat by default. Only create subfolders when 25+ files AND clear conceptual grouping exists.

### API Layer (`/src/api/`)

**Location**: `/src/api/[domain]/`  
**Purpose**: Centralized database access via repository pattern  
**Example**:

```typescript
// api/kanji/kanji-queries.ts
export function findById(db: Database, id: number): Kanji | null {
  /* SQL */
}

// api/kanji/kanji-mutations.ts
export function create(db: Database, data: CreateKanjiInput): Kanji {
  /* SQL */
}
```

**Rule**: Modules call repositories. Components never write SQL.

### Base Code (`/src/base/`)

**Location**: `/src/base/[category]/`  
**Purpose**: Generic, project-agnostic code (works in ANY Vue project)  
**Examples**: BaseButton, BaseModal, useLocalStorage, useDebounce  
**Test**: "Could I copy-paste this into a different Vue app?" → Yes = base

### Shared Code (`/src/shared/`)

**Location**: `/src/shared/[category]/`  
**Purpose**: App-specific code shared across modules  
**Examples**: SharedHeader, useDatabase, kanji formatters, common types  
**Test**: "Does this reference kanji/database/app concepts?" → Yes = shared

### Pages (`/src/pages/`)

**Location**: `/src/pages/`  
**Purpose**: Thin route entry points (80-100 lines max)  
**Pattern**: Import Root component, render with route params

```vue
<!-- KanjiDetailPage.vue -->
<script setup lang="ts">
import KanjiRootDetail from '@/modules/kanji-detail/components/KanjiRootDetail.vue'
const route = useRoute()
</script>
<template>
  <KanjiRootDetail :kanji-id="Number(route.params.id)" />
</template>
```

### Database Layer (`/src/db/`)

**Location**: `/src/db/`  
**Purpose**: Database initialization, migrations, IndexedDB persistence  
**Key files**: `init.ts`, `migrations/`, `indexeddb.ts`, `lifecycle.ts`

## Naming Conventions

- **Files**: kebab-case for directories, PascalCase for Vue components
- **Components**: `[Module]Root[Descriptor].vue`, `[Module]Section[Descriptor].vue`, `[Module][Descriptor].vue`
- **Composables**: `use-[module]-[purpose].ts`
- **Types**: `[module]-types.ts` (never bare `types.ts`)
- **Tests**: `[filename].test.ts` (colocated with source)

## Import Organization

```typescript
// Mandatory order (ESLint enforced):
import { ref } from 'vue' // 1. Vue/framework
import { useForm } from 'vee-validate' // 2. Third-party
import BaseButton from '@/base/components/BaseButton.vue' // 3. Base
import { findById } from '@/api/kanji/kanji-queries' // 4. API
import { useDatabase } from '@/shared/composables/use-database' // 5. Shared
import KanjiCard from './KanjiCard.vue' // 6. Module (relative)
import type { Kanji } from '../kanji-types' // 7. Types
```

**Path Aliases**:

- `@/` → `src/`
- `@test/` → `test/`

## Component Hierarchy

Three tiers with strict responsibilities and size limits:

| Tier    | Purpose                   | Max Lines | Pattern                           |
| ------- | ------------------------- | --------- | --------------------------------- |
| Root    | Orchestration, data fetch | 200       | `[Module]Root[Descriptor].vue`    |
| Section | Layout, mode management   | 250       | `[Module]Section[Descriptor].vue` |
| UI      | Presentation              | 200       | `[Module][Descriptor].vue`        |

**Decomposition patterns** (when approaching limits):

- Root → Extract handlers to `use-[module]-handlers.ts` composable
- Section → Split into ViewMode/EditMode components
- Composable → Split into queries/mutations files

## Code Organization Principles

**Module isolation** — Features don't import from each other. Shared code goes in `shared/` or `base/`.

**Repository pattern** — All database access flows through `api/` layer. Prevents SQL duplication and couples data logic.

**Base vs Shared test** — Generic = base, app-specific = shared. Clear boundary prevents mixing.

**Flat folders** — No premature organization. Only create subfolders when files exceed 25 AND grouping aids navigation.

**Colocated tests** — `Component.vue` + `Component.test.ts` side-by-side. Easier maintenance.

**File size enforcement** — ESLint rules prevent files from growing unbounded. Forces healthy decomposition patterns.

---

_created: 2026-01-10_
