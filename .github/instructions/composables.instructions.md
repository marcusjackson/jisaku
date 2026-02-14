---
applyTo: '**/composables/**/*.ts,**/use-*.ts'
---

# Composable Instructions

Guidelines for creating and modifying composables.

## File Size Limits

| Type       | Target Lines | Max Lines |
| ---------- | ------------ | --------- |
| Repository | 200-250      | **250**   |
| Handlers   | 100-150      | **150**   |
| State      | 80-120       | **120**   |
| Form       | 80-150       | **150**   |

## Naming

- File: `use-[module]-[purpose].ts` (kebab-case)
- Function: `use[Module][Purpose]` (camelCase)

| Purpose         | Example                        |
| --------------- | ------------------------------ |
| Repository      | `use-kanji-repository.ts`      |
| Detail state    | `use-kanji-detail-state.ts`    |
| Detail handlers | `use-kanji-detail-handlers.ts` |
| Form            | `use-kanji-form.ts`            |

## File Location

| Type            | Location                            |
| --------------- | ----------------------------------- |
| Module-specific | `src/modules/[module]/composables/` |
| Base (generic)  | `src/base/composables/`             |
| Shared (app)    | `src/shared/composables/`           |

**Decision:** Does it reference kanji, database, or app concepts?

- No → `base/`
- Yes → `shared/` or module

## Repository Pattern

```typescript
// use-kanji-repository.ts (~200-250 lines)
export function useKanjiRepository() {
  const db = useDatabase()

  return {
    // Read operations
    findById: (id: number): Kanji | null => {
      /* ... */
    },
    findAll: (): Kanji[] => {
      /* ... */
    },
    search: (filters: Filters): Kanji[] => {
      /* ... */
    },

    // Write operations
    create: (input: CreateKanjiInput): Kanji => {
      /* ... */
    },
    update: (id: number, input: UpdateKanjiInput): Kanji => {
      /* ... */
    },
    remove: (id: number): void => {
      /* ... */
    },

    // Field-level updates (for inline editing)
    updateShortMeaning: (id: number, value: string): void => {
      /* ... */
    },
    updateStrokeCount: (id: number, value: number): void => {
      /* ... */
    }
  }
}
```

## Handler Extraction Pattern

When Root component has too many handlers, extract:

```typescript
// use-kanji-detail-handlers.ts (~100-150 lines)
export function useKanjiDetailHandlers(
  kanji: Ref<Kanji | null>,
  repo: ReturnType<typeof useKanjiRepository>
) {
  const handleUpdateMeaning = async (id: number, text: string) => {
    await repo.updateMeaning(id, text)
    // Update local state
  }

  const handleDeleteMeaning = async (id: number) => {
    await repo.deleteMeaning(id)
    // Update local state
  }

  return {
    handleUpdateMeaning,
    handleDeleteMeaning
    // ... other handlers
  }
}
```

## State Extraction Pattern

When Root has complex state, extract:

```typescript
// use-kanji-detail-state.ts (~80-120 lines)
export function useKanjiDetailState(kanjiId: Ref<number>) {
  const kanji = ref<Kanji | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const editingSection = ref<string | null>(null)

  // Load logic
  const load = async () => {
    /* ... */
  }

  return {
    kanji,
    isLoading,
    error,
    editingSection,
    load
  }
}
```

## Splitting Large Composables

When repository exceeds ~250 lines:

```
Before: use-kanji-repository.ts (400 lines)
After:
├── use-kanji-repository.ts (150 lines) - delegates
├── use-kanji-queries.ts (120 lines) - read ops
└── use-kanji-mutations.ts (130 lines) - write ops
```

## Return Pattern

Always return objects, never arrays:

```typescript
// ✅ Correct
return { kanji, isLoading, error }

// ❌ Wrong
return [kanji, isLoading, error]
```

## Form Composables

```typescript
// use-kanji-form.ts
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

export function useKanjiForm(initialValues?: Partial<KanjiFormData>) {
  const { handleSubmit, errors, values, resetForm, setFieldValue } = useForm({
    validationSchema: toTypedSchema(kanjiFormSchema),
    initialValues: { character: '', ...initialValues }
  })

  return { handleSubmit, errors, values, resetForm, setFieldValue }
}
```

## Type Safety

- All parameters must be typed
- All return values must be typed
- Use `import type` for type-only imports

```typescript
import type { Kanji, CreateKanjiInput } from '../kanji-types'

export function useKanjiRepository() {
  const create = (input: CreateKanjiInput): Kanji => {
    /* ... */
  }
  return { create }
}
```

## Testing

Tests colocated with composables:

```
composables/
├── use-kanji-repository.ts
├── use-kanji-repository.test.ts
```

## Quick Reference

**Before creating/editing a composable:**

1. Check current line count
2. If approaching limit, plan split first
3. Repository: queries/mutations
4. Root handlers: state/handlers

**File size targets:**

- Repository: 200-250 lines (250 max)
- Handlers: 100-150 lines (150 max)
- State: 80-120 lines (120 max)
