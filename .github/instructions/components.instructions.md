---
applyTo: '**/*.vue'
---

# Vue Component Instructions

Guidelines for creating and modifying Vue components in this project.

## Component Hierarchy

This project uses a three-tier component hierarchy:

### Root Components

- **Purpose**: Page-level orchestration, data fetching, error boundaries
- **Naming**: `[Module]Root.vue` or `[Module]Root[Descriptor].vue`
- **Location**: `src/modules/[module]/components/`
- **Responsibilities**:
  - Call repository composables to fetch data
  - Handle loading and error states
  - Pass data down to Section components
  - Coordinate page-level actions

### Section Components

- **Purpose**: Logical groupings, layout, coordination between UI components
- **Naming**: `[Module]Section[Descriptor].vue`
- **Responsibilities**:
  - Arrange UI components
  - Handle section-specific logic
  - Emit events up to Root

### UI Components

- **Purpose**: Presentational, reusable, focused on single concern
- **Naming**: `[Module][Descriptor].vue`
- **Responsibilities**:
  - Display data passed via props
  - Emit events for user interactions
  - No direct data fetching

## Naming Conventions

| Type                  | Pattern                           | Example                           | Location                       |
| --------------------- | --------------------------------- | --------------------------------- | ------------------------------ |
| Root (single)         | `[Module]Root.vue`                | `KanjiListRoot.vue`               | `modules/[module]/components/` |
| Root (multiple)       | `[Module]Root[Descriptor].vue`    | `KanjiRootDetail.vue`             | `modules/[module]/components/` |
| Section               | `[Module]Section[Descriptor].vue` | `KanjiSectionDetail.vue`          | `modules/[module]/components/` |
| UI                    | `[Module][Descriptor].vue`        | `KanjiCard.vue`, `KanjiForm.vue`  | `modules/[module]/components/` |
| UI (tightly coupled)  | `[Parent][Descriptor].vue`        | `KanjiFormFieldStrokeCount.vue`   | `modules/[module]/components/` |
| Base (primitives)     | `Base[Name].vue`                  | `BaseButton.vue`, `BaseInput.vue` | `base/components/`             |
| Shared (app-specific) | `Shared[Name].vue`                | `SharedHeader.vue`                | `shared/components/`           |
| Page                  | `[Module][Purpose]Page.vue`       | `KanjiDetailPage.vue`             | `pages/`                       |

## Base vs Shared Components

**Base components** (`base/components/`):

- Generic UI primitives that work in ANY project
- Built on Reka UI with styling
- Examples: `BaseButton`, `BaseInput`, `BaseModal`, `BaseSelect`

**Shared components** (`shared/components/`):

- App-specific components used across modules
- Reference app layout, navigation, or app concepts
- Examples: `SharedHeader`, `SharedSidebar`, `SharedPageContainer`

**Decision**: Ask "Would this work in a completely different Vue project?"

- Yes → `base/components/`
- No → `shared/components/`

## SFC Structure

Always use this order:

```vue
<script setup lang="ts">
// 1. Vue/framework imports
import { ref, computed } from 'vue'

// 2. Third-party imports
import { useForm } from 'vee-validate'

// 3. Base imports (generic, project-agnostic)
import BaseButton from '@/base/components/BaseButton.vue'

// 4. Shared imports (app-specific)
import { useDatabase } from '@/shared/composables/use-database'

// 5. Module imports (relative path)
import KanjiCard from './KanjiCard.vue'

// 6. Type imports
import type { Kanji } from '../kanji-types'

// Props
const props = defineProps<{
  kanji: Kanji
  isEditable?: boolean
}>()

// Emits
const emit = defineEmits<{
  save: [kanji: Kanji]
  cancel: []
}>()

// Composables
const { findById } = useKanjiRepository()

// Reactive state
const isExpanded = ref(false)

// Computed
const displayName = computed(() => props.kanji.character)

// Methods
function handleSave() {
  emit('save', props.kanji)
}
</script>

<template>
  <!-- Template content -->
</template>

<style scoped>
/* Scoped styles using CSS variables */
</style>
```

## Props and Emits

Use TypeScript generics with `defineProps` and `defineEmits`.

### Props Definition Style

Choose the style based on component complexity:

**Simple UI components (≤ 4 props)** — use inline type:

```typescript
// UI components with few props - inline is clean and readable
const props = defineProps<{
  kanji: Kanji
  isEditable?: boolean
}>()

// With defaults
const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
  }>(),
  {
    size: 'md',
    disabled: false
  }
)
```

**Root/Section components OR > 4 props** — use separate interface:

```typescript
// Root/Section components or complex UIs - separate interface
interface Props {
  kanjiList: Kanji[]
  filters: KanjiFilters
  isLoading: boolean
  error: Error | null
  onRetry?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null
})
```

**Benefits of separate interface:**

- Named type shows in IDE tooltips
- Can export for test factories
- Easier to refactor and document
- Clearer separation of concerns

### Emits Definition

```typescript
// Typed emits
const emit = defineEmits<{
  save: [kanji: Kanji]
  delete: [id: number]
  cancel: []
}>()
```

## Styling Rules

1. Always use `<style scoped>`
2. Always use CSS variables from design tokens
3. Never hardcode colors, spacing, or font sizes

```vue
<style scoped>
/* ✅ Correct */
.card {
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

/* ❌ Wrong - hardcoded values */
.card {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
}
</style>
```

## Loading and Error States

Root components must handle loading and error states:

```vue
<template>
  <div
    v-if="isLoading"
    class="loading-container"
  >
    <BaseSpinner />
  </div>
  <div
    v-else-if="error"
    class="error-container"
  >
    <p>{{ error.message }}</p>
  </div>
  <KanjiSectionDetail
    v-else
    :kanji="kanji"
  />
</template>
```

## Accessibility Requirements

- All interactive elements must be keyboard accessible
- Use semantic HTML elements
- Add ARIA labels to icon-only buttons
- Ensure focus styles are visible

```vue
<template>
  <button
    type="button"
    aria-label="Delete kanji"
    @click="handleDelete"
  >
    <IconTrash />
  </button>
</template>
```
