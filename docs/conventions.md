# Conventions

This document defines the coding conventions, naming rules, and best practices for this codebase.

---

## File Naming

### Vue Components

| Type                      | Pattern                           | Example                                          | Location   |
| ------------------------- | --------------------------------- | ------------------------------------------------ | ---------- |
| Root (single)             | `[Module]Root.vue`                | `KanjiListRoot.vue`                              | `modules/` |
| Root (multiple)           | `[Module]Root[Descriptor].vue`    | `KanjiRootDetail.vue`, `KanjiRootForm.vue`       | `modules/` |
| Section                   | `[Module]Section[Descriptor].vue` | `KanjiSectionDetail.vue`, `KanjiSectionForm.vue` | `modules/` |
| UI                        | `[Module][Descriptor].vue`        | `KanjiCard.vue`, `KanjiForm.vue`                 | `modules/` |
| UI (tightly coupled)      | `[Parent][Descriptor].vue`        | `KanjiFormFieldStrokeCount.vue`                  | `modules/` |
| Base (Reka UI primitives) | `Base[Name].vue`                  | `BaseButton.vue`, `BaseInput.vue`                | `base/`    |
| Shared (app-specific)     | `Shared[Name].vue`                | `SharedHeader.vue`, `SharedPageContainer.vue`    | `shared/`  |
| Page                      | `[Module][Purpose]Page.vue`       | `KanjiDetailPage.vue`, `KanjiListPage.vue`       | `pages/`   |

### TypeScript Files

| Type                 | Pattern                     | Example                      | Location   |
| -------------------- | --------------------------- | ---------------------------- | ---------- |
| Composables (module) | `use-[module]-[purpose].ts` | `use-kanji-repository.ts`    | `modules/` |
| Composables (base)   | `use-[purpose].ts`          | `use-local-storage.ts`       | `base/`    |
| Composables (shared) | `use-[purpose].ts`          | `use-database.ts`            | `shared/`  |
| Types (module)       | `[module]-types.ts`         | `kanji-types.ts`             | `modules/` |
| Types (shared)       | `[domain]-types.ts`         | `database-types.ts`          | `shared/`  |
| Validation schemas   | `[module]-[form]-schema.ts` | `kanji-form-schema.ts`       | `modules/` |
| Utils (base)         | `[purpose].ts`              | `format-date.ts`, `clamp.ts` | `base/`    |
| Utils (shared)       | `[purpose].ts`              | `kanji-formatters.ts`        | `shared/`  |
| Constants            | `[module]-constants.ts`     | `kanji-constants.ts`         | varies     |
| Tests                | `[filename].test.ts`        | `KanjiForm.test.ts`          | colocated  |

**Important**: Never use bare `types.ts` — always include the module or domain prefix to ensure unique filenames across the project.

### Directories

- Use **kebab-case** for all directory names
- Module directories match the feature name: `kanji/`, `kanji-list/`, `components/`

---

## Vue Single File Components

### Script Setup

Always use `<script setup lang="ts">`:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Kanji } from '../kanji-types'

const props = defineProps<{
  kanji: Kanji
}>()

const emit = defineEmits<{
  edit: []
  delete: [id: number]
}>()

const isExpanded = ref(false)
</script>
```

### Template

```vue
<template>
  <div class="kanji-card">
    <span class="kanji-character">{{ kanji.character }}</span>
  </div>
</template>
```

### Styles

Use scoped styles with CSS variables:

```vue
<style scoped>
.kanji-card {
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.kanji-character {
  font-size: var(--font-size-4xl);
  font-family: var(--font-family-kanji);
}
</style>
```

### Order in SFC

1. `<script setup lang="ts">`
2. `<template>`
3. `<style scoped>`

---

## TypeScript

### Strict Mode

TypeScript strict mode is enabled. All code must be fully typed.

### Type Imports

Use `import type` for type-only imports:

```typescript
import type { Kanji, KanjiSearchFilters } from '../kanji-types'
import { ref, computed } from 'vue'
```

### Prefer Interfaces for Objects

```typescript
// ✅ Good
interface Kanji {
  id: number
  character: string
  strokeCount: number
}

// ❌ Avoid for object shapes
type Kanji = {
  id: number
  character: string
  strokeCount: number
}
```

### Use Type for Unions/Primitives

```typescript
type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null
type JoyoLevel =
  | 'elementary1'
  | 'elementary2'
  | 'elementary3'
  | 'elementary4'
  | 'elementary5'
  | 'elementary6'
  | 'secondary'
  | null
```

### Avoid `any`

Use `unknown` instead of `any` when type is truly unknown:

```typescript
// ✅ Good
function parseJson(text: string): unknown {
  return JSON.parse(text)
}

// ❌ Avoid
function parseJson(text: string): any {
  return JSON.parse(text)
}
```

---

## Imports

### Order

1. Vue/framework imports
2. Third-party libraries
3. Base imports (absolute path with `@/base/`)
4. Shared imports (absolute path with `@/shared/`)
5. Module imports (relative path)
6. Types (grouped at end with `import type`)

```typescript
// Vue
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

// Third-party
import { useForm } from 'vee-validate'

// Base (generic, project-agnostic)
import BaseButton from '@/base/components/BaseButton.vue'
import { useLocalStorage } from '@/base/composables/use-local-storage'

// Shared (app-specific)
import SharedHeader from '@/shared/components/SharedHeader.vue'
import { useDatabase } from '@/shared/composables/use-database'

// Module (relative)
import KanjiCard from './KanjiCard.vue'
import { formatStrokeCount } from '../kanji-formatters'

// Types
import type { Kanji } from '../kanji-types'
```

### Path Aliases

- `@/` → `src/`
- `@/base/` for generic, project-agnostic code
- `@/shared/` for app-specific shared code
- Use relative paths within the same module

```typescript
// ✅ Base imports (generic)
import BaseButton from '@/base/components/BaseButton.vue'
import { useDebounce } from '@/base/composables/use-debounce'

// ✅ Shared imports (app-specific)
import { useDatabase } from '@/shared/composables/use-database'

// ✅ Within same module
import { useKanjiRepository } from '../composables/use-kanji-repository'
import KanjiCard from './KanjiCard.vue'
```

---

## Composables

### Naming

- Prefix with `use-`
- Use kebab-case: `use-kanji-repository.ts`
- Function name uses camelCase: `useKanjiRepository`

### Structure

```typescript
// use-kanji-repository.ts
import { useDatabase } from '@/shared/composables/use-database'
import type { Kanji, CreateKanjiInput } from '../kanji-types'

export function useKanjiRepository() {
  const db = useDatabase()

  const findById = (id: number): Kanji | null => {
    // implementation
  }

  const create = (input: CreateKanjiInput): Kanji => {
    // implementation
  }

  return {
    findById,
    create
    // ... other methods
  }
}
```

### Return Objects, Not Arrays

```typescript
// ✅ Good - named exports
return { kanji, isLoading, error, refetch }

// ❌ Avoid - positional returns
return [kanji, isLoading, error, refetch]
```

---

## Props and Emits

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

### Emits

Use `defineEmits` with TypeScript:

```typescript
const emit = defineEmits<{
  save: [kanji: Kanji]
  cancel: []
  delete: [id: number]
}>()
```

---

## CSS

### Use CSS Variables

All colors, spacing, typography, and other design tokens must use CSS variables:

```css
/* ✅ Good */
.card {
  padding: var(--spacing-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
}

/* ❌ Avoid hardcoded values */
.card {
  padding: 16px;
  background: #ffffff;
  color: #333333;
}
```

### Scoped Styles

Always use `<style scoped>` unless intentionally styling children:

```vue
<style scoped>
.my-component {
  /* styles only apply to this component */
}
</style>
```

### Class Naming

Use descriptive, component-scoped class names:

```css
/* ✅ Good */
.kanji-card {
}
.kanji-card-header {
}
.kanji-card-character {
}

/* ❌ Avoid generic names */
.card {
}
.header {
}
.text {
}
```

---

## Error Handling

### Forms

Display inline errors below fields:

```vue
<template>
  <div class="field">
    <BaseInput
      v-model="strokeCount"
      :error="errors.strokeCount"
    />
    <span
      v-if="errors.strokeCount"
      class="field-error"
    >
      {{ errors.strokeCount }}
    </span>
  </div>
</template>
```

### Database Operations

Use toast notifications for operation feedback:

```typescript
try {
  await kanjiRepo.delete(id)
  toast.success('Kanji deleted')
} catch (error) {
  toast.error('Failed to delete kanji')
}
```

### Loading States

Reserve space to prevent layout shift:

```vue
<template>
  <div class="page">
    <div
      v-if="isLoading"
      class="loading-container"
    >
      <BaseSpinner />
    </div>
    <KanjiSectionDetail
      v-else
      :kanji="kanji"
    />
  </div>
</template>
```

---

## Testing

### Colocated Tests

Place test files next to the code they test:

```
components/
├── KanjiForm.vue
├── KanjiForm.test.ts    # Test file alongside component
└── ...
```

### Test File Naming

```
[filename].test.ts
```

See [Testing Strategy](./testing.md) for detailed patterns.

---

## Git

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation only
- `style` — Formatting, no code change
- `refactor` — Code change that neither fixes nor adds
- `test` — Adding or updating tests
- `chore` — Tooling, dependencies, config

**Example:**

```
feat(kanji): add stroke count validation

Add zod schema validation for stroke count field.
Ensures value is positive integer between 1-64.

Closes #42
```

See [Commit Instructions](../.github/instructions/commits.md) for full guidelines.

---

## Documentation Structure

```
docs/
├── architecture.md         # System design and patterns
├── conventions.md          # Coding standards and guidelines
├── schema.md               # Database schema reference
├── testing.md              # Testing strategy and patterns
├── design-tokens.md        # CSS variables and theming
├── features.md             # Current features
├── future-ideas.md         # Potential enhancements
└── reference/              # External reference docs (Reka UI, etc.)
```

---

## Code Review Checklist

Before submitting a PR:

- [ ] All TypeScript types are explicit (no implicit `any`)
- [ ] CSS uses design token variables
- [ ] Components follow Root/Section/UI hierarchy
- [ ] Tests are colocated with code
- [ ] Commit messages follow conventional format
- [ ] No console.log statements
- [ ] Loading and error states handled
