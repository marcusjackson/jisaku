---
applyTo: '**/*.ts,**/*.vue'
---

# TypeScript Instructions

General TypeScript conventions for this project.

## Strict Mode

TypeScript strict mode is enabled. All code must be fully typed.

## Type vs Interface

- Use `interface` for object shapes
- Use `type` for unions, primitives, and utility types

```typescript
// ✅ Interface for objects
interface Kanji {
  id: number
  character: string
  strokeCount: number
}

// ✅ Type for unions
type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

// ✅ Type for utility types
type KanjiWithComponents = Kanji & { components: Component[] }
```

## Type Imports

Use `import type` for type-only imports:

```typescript
import { ref, computed } from 'vue'
import type { Kanji, Component } from '../kanji-types'
```

## Type File Organization

| Location | Naming              | Content                                     |
| -------- | ------------------- | ------------------------------------------- |
| Module   | `[module]-types.ts` | Module-specific types                       |
| Base     | N/A                 | Base rarely needs types (generic utilities) |
| Shared   | `[domain]-types.ts` | App-specific shared types                   |

**Never use bare `types.ts`** — always prefix with module or domain name.

```
modules/kanji/kanji-types.ts
modules/kanji-list/kanji-list-types.ts
shared/types/database-types.ts
shared/types/common-types.ts
```

**Note**: `base/` typically doesn't have a `types/` folder since base utilities are generic and self-contained. If a base utility needs types, define them in the same file.

## Common Type Patterns

### Entity Types

```typescript
// kanji-types.ts
export interface Kanji {
  id: number
  character: string
  strokeCount: number
  radicalId: number | null
  jlptLevel: JlptLevel | null
  joyoLevel: JoyoLevel | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

export type JoyoLevel =
  | 'elementary1'
  | 'elementary2'
  | 'elementary3'
  | 'elementary4'
  | 'elementary5'
  | 'elementary6'
  | 'secondary'
```

### Input Types

```typescript
// For create operations - omit auto-generated fields
export interface CreateKanjiInput {
  character: string
  strokeCount: number
  radicalId?: number | null
  jlptLevel?: JlptLevel | null
  joyoLevel?: JoyoLevel | null
  notes?: string | null
}

// For update operations - all fields optional except id
export interface UpdateKanjiInput {
  character?: string
  strokeCount?: number
  radicalId?: number | null
  jlptLevel?: JlptLevel | null
  joyoLevel?: JoyoLevel | null
  notes?: string | null
}
```

### Filter Types

```typescript
export interface KanjiSearchFilters {
  character?: string
  strokeCountMin?: number
  strokeCountMax?: number
  jlptLevels?: JlptLevel[]
  joyoLevels?: JoyoLevel[]
  componentId?: number
  radicalId?: number
}
```

## Avoid `any`

Use `unknown` instead of `any` when type is truly unknown:

```typescript
// ✅ Correct
function parseJson(text: string): unknown {
  return JSON.parse(text)
}

// Then narrow the type
const data = parseJson(text)
if (isKanji(data)) {
  // data is now typed as Kanji
}

// ❌ Avoid
function parseJson(text: string): any {
  return JSON.parse(text)
}
```

## Type Guards

```typescript
function isKanji(value: unknown): value is Kanji {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'character' in value &&
    'strokeCount' in value
  )
}
```

## Generics

Use generics for reusable utility types:

```typescript
// Repository result type
interface QueryResult<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

// Usage
function useKanjiDetail(id: number): QueryResult<Kanji> {
  // ...
}
```

## Const Assertions

Use `as const` for literal types:

```typescript
export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
export type JlptLevel = (typeof JLPT_LEVELS)[number]

export const JOYO_LEVELS = [
  'elementary1',
  'elementary2',
  'elementary3',
  'elementary4',
  'elementary5',
  'elementary6',
  'secondary'
] as const
export type JoyoLevel = (typeof JOYO_LEVELS)[number]
```

## Non-null Assertion

Avoid `!` non-null assertion. Use proper null checks:

```typescript
// ❌ Avoid
const kanji = findById(id)!

// ✅ Better - handle null case
const kanji = findById(id)
if (!kanji) {
  throw new Error(`Kanji ${id} not found`)
}
// kanji is now non-null
```

## Vue Component Types

```typescript
// Props
const props = defineProps<{
  kanji: Kanji
  isEditable?: boolean
}>()

// Emits
const emit = defineEmits<{
  save: [kanji: Kanji]
  delete: [id: number]
}>()

// Refs
const inputRef = ref<HTMLInputElement | null>(null)

// Computed with explicit return type (when needed)
const displayText = computed<string>(() => {
  return props.kanji.character
})
```

## SQL Query Result Typing

When working with sql.js:

```typescript
interface SqlRow {
  [column: string]: unknown
}

function mapRowToKanji(row: SqlRow): Kanji {
  return {
    id: row.id as number,
    character: row.character as string,
    strokeCount: row.stroke_count as number,
    radicalId: row.radical_id as number | null
    // ...
  }
}
```
