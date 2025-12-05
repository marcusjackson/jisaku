---
applyTo: '**/composables/**/*.ts,**/use-*.ts'
---

# Composable Instructions

Guidelines for creating and modifying composables in this project.

## Naming

- File: `use-[module]-[purpose].ts` (kebab-case)
- Function: `use[Module][Purpose]` (camelCase)
- Examples:
  - `use-kanji-repository.ts` → `useKanjiRepository()`
  - `use-kanji-form.ts` → `useKanjiForm()`
  - `use-database.ts` → `useDatabase()`

## File Location

| Type                  | Location                            | Examples                                  |
| --------------------- | ----------------------------------- | ----------------------------------------- |
| Module-specific       | `src/modules/[module]/composables/` | `use-kanji-repository.ts`                 |
| Base (generic)        | `src/base/composables/`             | `use-local-storage.ts`, `use-debounce.ts` |
| Shared (app-specific) | `src/shared/composables/`           | `use-database.ts`, `use-notification.ts`  |

## Base vs Shared Composables

**Base composables** (`base/composables/`):

- Generic utilities that work in ANY project
- No app-specific dependencies
- Examples: `useLocalStorage`, `useMediaQuery`, `useDebounce`, `useClickOutside`

**Shared composables** (`shared/composables/`):

- App-specific logic shared across modules
- May depend on database, app state, or app concepts
- Examples: `useDatabase`, `useNotification`, `useAppState`

**Decision**: Ask "Does this reference kanji, database, or app-specific concepts?"

- No → `base/composables/`
- Yes → `shared/composables/`

## Structure

```typescript
// use-kanji-repository.ts
import { useDatabase } from '@/shared/composables/use-database'
import type { Kanji, CreateKanjiInput, UpdateKanjiInput } from '../kanji-types'

export function useKanjiRepository() {
  const db = useDatabase()

  const findById = (id: number): Kanji | null => {
    // implementation
  }

  const findByCharacter = (char: string): Kanji | null => {
    // implementation
  }

  const search = (filters: KanjiSearchFilters): Kanji[] => {
    // implementation
  }

  const create = (input: CreateKanjiInput): Kanji => {
    // implementation
  }

  const update = (id: number, input: UpdateKanjiInput): Kanji => {
    // implementation
  }

  const remove = (id: number): void => {
    // implementation
  }

  return {
    findById,
    findByCharacter,
    search,
    create,
    update,
    remove
  }
}
```

## Return Pattern

Always return an object with named properties, never an array:

```typescript
// ✅ Correct - named properties
return {
  kanji,
  isLoading,
  error,
  refetch
}

// ❌ Wrong - positional array
return [kanji, isLoading, error, refetch]
```

## Repository Composables

Each module should have a repository composable for database operations:

```typescript
// use-kanji-repository.ts
export function useKanjiRepository() {
  const db = useDatabase()

  return {
    findById: (id: number): Kanji | null => {
      /* ... */
    },
    findAll: (): Kanji[] => {
      /* ... */
    },
    search: (filters: KanjiSearchFilters): Kanji[] => {
      /* ... */
    },
    create: (input: CreateKanjiInput): Kanji => {
      /* ... */
    },
    update: (id: number, input: UpdateKanjiInput): Kanji => {
      /* ... */
    },
    remove: (id: number): void => {
      /* ... */
    }
  }
}
```

## Form Composables

For form handling, integrate with vee-validate:

```typescript
// use-kanji-form.ts
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { kanjiFormSchema } from '../kanji-form-schema'
import type { CreateKanjiInput } from '../kanji-types'

export function useKanjiForm(initialValues?: Partial<CreateKanjiInput>) {
  const { handleSubmit, errors, values, resetForm } = useForm({
    validationSchema: toTypedSchema(kanjiFormSchema),
    initialValues: {
      character: '',
      strokeCount: undefined,
      ...initialValues
    }
  })

  return {
    handleSubmit,
    errors,
    values,
    resetForm
  }
}
```

## Database Access

All database access goes through the shared `useDatabase` composable:

```typescript
// shared/composables/use-database.ts
export function useDatabase() {
  // Returns the sql.js database instance
  // Handles initialization, persistence to IndexedDB
}
```

Module repositories use this:

```typescript
export function useKanjiRepository() {
  const db = useDatabase()

  const findById = (id: number): Kanji | null => {
    const result = db.exec('SELECT * FROM kanjis WHERE id = ?', [id])
    return result[0]?.values[0] ? mapRowToKanji(result[0].values[0]) : null
  }

  // ...
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
    // TypeScript knows input shape and return type
  }
}
```

## Testing

Place tests alongside composables:

```
composables/
├── use-kanji-repository.ts
├── use-kanji-repository.test.ts
├── use-kanji-form.ts
└── use-kanji-form.test.ts
```

Test example:

```typescript
// use-kanji-repository.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useKanjiRepository } from './use-kanji-repository'
import { createTestDatabase } from '@/test/helpers/database'

describe('useKanjiRepository', () => {
  let repo: ReturnType<typeof useKanjiRepository>

  beforeEach(async () => {
    const db = await createTestDatabase()
    repo = useKanjiRepository(db)
  })

  it('creates a kanji', () => {
    const kanji = repo.create({
      character: '水',
      strokeCount: 4
    })

    expect(kanji.id).toBeDefined()
    expect(kanji.character).toBe('水')
  })
})
```
