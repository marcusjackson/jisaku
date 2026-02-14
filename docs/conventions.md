# Conventions

Coding conventions, naming rules, and best practices for this codebase.

---

## File Naming

### Vue Components

| Type     | Pattern                           | Example                    |
| -------- | --------------------------------- | -------------------------- |
| Root     | `[Module]Root[Descriptor].vue`    | `KanjiRootDetail.vue`      |
| Section  | `[Module]Section[Descriptor].vue` | `KanjiSectionMeanings.vue` |
| UI       | `[Module][Descriptor].vue`        | `KanjiCard.vue`            |
| UI (sub) | `[Parent][Descriptor].vue`        | `KanjiMeaningItem.vue`     |
| Base     | `Base[Name].vue`                  | `BaseButton.vue`           |
| Shared   | `Shared[Name].vue`                | `SharedHeader.vue`         |
| Page     | `[Module][Purpose]Page.vue`       | `KanjiDetailPage.vue`      |

### TypeScript Files

| Type       | Pattern                     | Example                   |
| ---------- | --------------------------- | ------------------------- |
| Composable | `use-[module]-[purpose].ts` | `use-kanji-repository.ts` |
| Types      | `[module]-types.ts`         | `kanji-types.ts`          |
| Schema     | `[module]-[form]-schema.ts` | `kanji-form-schema.ts`    |
| Test       | `[filename].test.ts`        | `KanjiForm.test.ts`       |

**Important**: Never use bare `types.ts` — always include module prefix.

### Directories

- Use **kebab-case** for all directory names

---

## File Size Limits

| File Type  | Target Lines | Max Lines |
| ---------- | ------------ | --------- |
| Root       | 150-200      | 200       |
| Section    | 150-250      | 250       |
| UI         | 80-150       | 150       |
| Composable | 100-200      | 200       |
| Types      | 150-300      | 300       |

**When exceeding limits:**

- Root → Extract handlers to composable
- Section → Split into ViewMode/EditMode
- Composable → Split into queries/mutations

---

## SFC Structure

```vue
<script setup lang="ts">
// 1. Vue imports
import { ref, computed } from 'vue'

// 2. Third-party imports
import { useForm } from 'vee-validate'

// 3. Base imports
import BaseButton from '@/base/components/BaseButton.vue'

// 4. Shared imports
import { useDatabase } from '@/shared/composables/use-database'

// 5. Module imports (relative)
import KanjiCard from './KanjiCard.vue'

// 6. Type imports
import type { Kanji } from '../kanji-types'

// Props
const props = defineProps<{ kanji: Kanji }>()

// Emits
const emit = defineEmits<{ save: [kanji: Kanji] }>()

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
  <!-- Template -->
</template>

<style scoped>
/* Scoped styles using CSS variables */
</style>
```

---

## TypeScript

### Type vs Interface

```typescript
// Interface for objects
interface Kanji {
  id: number
  character: string
}

// Type for unions
type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
```

### Type Imports

```typescript
import type { Kanji } from '../kanji-types'
```

### Avoid `any`

Use `unknown` instead, then narrow with type guards.

---

## Props and Emits

**Simple components (≤4 props):**

```typescript
const props = defineProps<{
  kanji: Kanji
  isEditable?: boolean
}>()
```

**Complex components (>4 props):**

```typescript
interface Props {
  kanjiList: Kanji[]
  filters: KanjiFilters
  isLoading: boolean
}
const props = defineProps<Props>()
```

**Emits:**

```typescript
const emit = defineEmits<{
  save: [kanji: Kanji]
  delete: [id: number]
}>()
```

---

## CSS

### Always Use CSS Variables

```css
/* ✅ Correct */
.card {
  padding: var(--spacing-md);
  background: var(--color-surface);
}

/* ❌ Wrong */
.card {
  padding: 16px;
  background: #ffffff;
}
```

### Always Use Scoped Styles

```vue
<style scoped>
.kanji-card {
  /* ... */
}
</style>
```

---

## Composables

### Naming

- File: `use-[module]-[purpose].ts`
- Function: `use[Module][Purpose]()`

### Return Objects, Not Arrays

```typescript
// ✅ Correct
return { kanji, isLoading, error }

// ❌ Wrong
return [kanji, isLoading, error]
```

---

## Error Handling

| Type            | Treatment                  |
| --------------- | -------------------------- |
| Form validation | Inline errors below fields |
| DB operations   | Toast notification         |
| Not found       | Empty state on page        |

---

## Git Commits

Follow Conventional Commits:

```
<type>(<scope>): <subject>
```

**Types:** feat, fix, docs, style, refactor, test, chore, perf

**Scopes:** kanji, component, vocabulary, settings, base, shared, db

See `.github/instructions/commit.instructions.md` for full guidelines.

---

## Code Quality Checklist

- [ ] TypeScript strict — no `any`, all types explicit
- [ ] CSS uses design token variables
- [ ] Components follow Root/Section/UI hierarchy
- [ ] File under size limit for its type
- [ ] Tests colocated with source files
- [ ] Loading and error states handled
- [ ] Keyboard accessible
- [ ] No console.log statements

---

## Related Documentation

- [Architecture](./architecture.md) — System design, component patterns
- [Testing](./testing.md) — Testing strategy
- [Design Tokens](./design-tokens.md) — CSS variables
