# Repository Pattern Analysis

**Summary:** This document analyzes the current repository composable patterns, identifying inconsistencies, bloat, and opportunities to restructure into a clean API layer. Repositories are a major contributor to Root component complexity.

---

## Table of Contents

1. [Current Repository Landscape](#1-current-repository-landscape) (Lines 20-70)
2. [Pattern Inconsistencies](#2-pattern-inconsistencies) (Lines 75-140)
3. [Field-Level Update Analysis](#3-field-level-update-analysis) (Lines 145-200)
4. [Error Handling Patterns](#4-error-handling-patterns) (Lines 205-240)
5. [State Management Issues](#5-state-management-issues) (Lines 245-290)
6. [Recommendations](#6-recommendations) (Lines 295-350)

---

## 1. Current Repository Landscape

### Repository Files

All repositories live in `src/shared/composables/`:

| Repository                             | Lines | Entity Type             |
| -------------------------------------- | ----- | ----------------------- |
| use-kanji-repository.ts                | 656   | Kanji                   |
| use-classification-repository.ts       | 576   | Classifications + Types |
| use-meaning-repository.ts              | 560   | Meanings + Groups       |
| use-component-repository.ts            | ~350  | Components              |
| use-component-occurrence-repository.ts | ~400  | Occurrences             |
| use-component-form-repository.ts       | ~200  | Forms                   |
| use-component-grouping-repository.ts   | ~350  | Groupings               |
| use-reading-repository.ts              | ~350  | On/Kun Readings         |
| use-vocabulary-repository.ts           | ~200  | Vocabulary              |
| use-vocab-kanji-repository.ts          | ~150  | Vocab-Kanji links       |
| use-radical-repository.ts              | ~100  | Radicals (alias)        |
| use-position-type-repository.ts        | ~200  | Position types          |

**Total**: ~4,000 lines of repository code in `shared/composables/`.

### Location Problem

Repositories are in `shared/composables/` alongside unrelated composables:

- `use-database.ts` — Infrastructure (correct location)
- `use-toast.ts` — UI utility (correct location)
- `use-theme.ts` — UI utility (correct location)
- `use-kanji-repository.ts` — Data access (wrong location)

Data access code should be in a dedicated `api/` folder.

---

## 2. Pattern Inconsistencies

### Return Type Variations

```typescript
// use-kanji-repository.ts — Returns interface
export function useKanjiRepository(): UseKanjiRepository { ... }

// use-meaning-repository.ts — Returns inline object
export function useMeaningRepository() {
  return { getMeaningsByKanjiId, createMeaning, ... }
}

// use-classification-repository.ts — Mixed (interface + extra methods)
export function useClassificationRepository(): UseClassificationRepository { ... }
```

Some repositories define explicit interfaces, others use inferred types.

### Naming Inconsistencies

```typescript
// Some use "get" prefix
getById(id: number)
getAll()
getByKanjiId(kanjiId: number)

// Some use "find" prefix (legacy)
findById(id: number)  // Not used consistently

// Some use entity-specific names
getMeaningsByKanjiId()      // Redundant — it's in MeaningRepository
getOnReadingsByKanjiId()    // Redundant
```

### CRUD Operation Names

| Operation | Kanji       | Component   | Meaning                  | Classification                  |
| --------- | ----------- | ----------- | ------------------------ | ------------------------------- |
| Create    | `create()`  | `create()`  | `createMeaning()`        | `createClassification()`        |
| Read One  | `getById()` | `getById()` | N/A                      | N/A                             |
| Read Many | `getAll()`  | `getAll()`  | `getMeaningsByKanjiId()` | `getClassificationsByKanjiId()` |
| Update    | `update()`  | `update()`  | `updateMeaning()`        | `updateClassification()`        |
| Delete    | `remove()`  | `remove()`  | `removeMeaning()`        | `removeClassification()`        |

Child entity repos (meanings, readings) prefix with entity name unnecessarily.

---

## 3. Field-Level Update Analysis

### Current State in Kanji Repository

```typescript
// use-kanji-repository.ts has 11 field-level update methods:
updateHeaderFields(id, character, shortMeaning, searchKeywords)
updateStrokeCount(id, strokeCount)
updateJlptLevel(id, level)
updateJoyoLevel(id, level)
updateKenteiLevel(id, level)
updateRadicalId(id, radicalId)
updateNotesEtymology(id, notes)
updateNotesSemantic(id, notes)
updateNotesEducation(id, notes)
updateNotesPersonal(id, notes)
updateStrokeImages(id, diagram, gif)
```

These are good for inline editing but add significant code volume.

### Missing Field-Level Updates

| Repository | Missing Updates                                     |
| ---------- | --------------------------------------------------- |
| Component  | `updateDescription()`, `updateKangxiNumber()`       |
| Vocabulary | `updateKana()`, `updateShortMeaning()`              |
| Meanings   | `updateMeaningText()` (only bulk `updateMeaning()`) |

### Pattern: Update Method Explosion

Each field-level update follows this pattern (30-40 lines each):

```typescript
function updateNotesEtymology(id: number, notes: string | null): Kanji {
  run(
    `UPDATE kanjis 
     SET notes_etymology = ?, updated_at = datetime('now') 
     WHERE id = ?`,
    [notes, id]
  )
  const updated = getById(id)
  if (!updated) {
    throw new Error(`Kanji with id ${id} not found after update`)
  }
  return updated
}
```

With 11 field updates × 35 lines = **385 lines** just for field updates in Kanji repository.

---

## 4. Error Handling Patterns

### Inconsistent Approaches

```typescript
// Pattern 1: Throw on not found
function getById(id: number): Kanji | null {
  // Returns null if not found — caller handles
}

// Pattern 2: Throw after update
function updateStrokeCount(id: number, strokeCount: number): Kanji {
  run(...)
  const updated = getById(id)
  if (!updated) {
    throw new Error(`Kanji with id ${id} not found after update`)
  }
  return updated
}

// Pattern 3: Silent failure (problematic)
function remove(id: number): void {
  run('DELETE FROM kanjis WHERE id = ?', [id])
  // No check if deletion succeeded
}
```

### Missing Error Context

Errors lack context about what operation failed:

```typescript
// Current
throw new Error(`Kanji with id ${id} not found after update`)

// Better
throw new Error(`Failed to update kanji stroke count: kanji ${id} not found`)
```

---

## 5. State Management Issues

### No Caching

Every call executes fresh SQL:

```typescript
// Every getById() hits the database
const kanji1 = getById(1) // SQL query
const kanji2 = getById(1) // Another SQL query (same data)
```

For inline editing workflows, this causes repeated queries.

### No Optimistic Updates

Root components manually manage local state:

```typescript
// KanjiRootDetail.vue
async function handleUpdateStrokeCount(value: number) {
  kanji.value = updateStrokeCount(kanji.value.id, value) // DB update
  await persist() // IndexedDB sync
  success('Updated') // Toast
}
```

This pattern is duplicated 60+ times in Root components.

### Persistence Coupling

Every update requires explicit `persist()` call:

```typescript
await persist() // Syncs SQLite → IndexedDB
```

This should be automatic or batched, not manually called after every operation.

---

## 6. Recommendations

### Create Dedicated API Layer

```
src/
├── api/                          # NEW: Data access layer
│   ├── repositories/
│   │   ├── kanji-repository.ts
│   │   ├── component-repository.ts
│   │   ├── meaning-repository.ts
│   │   └── ...
│   ├── types/                    # API-specific types
│   │   └── repository-types.ts
│   └── index.ts                  # Public API exports
├── shared/
│   └── composables/              # Keep only UI composables
│       ├── use-database.ts       # Infrastructure
│       ├── use-toast.ts          # UI
│       └── use-theme.ts          # UI
```

### Standardize Repository Interface

```typescript
// api/types/repository-types.ts
export interface Repository<T, CreateInput, UpdateInput> {
  getById(id: number): T | null
  getAll(): T[]
  create(input: CreateInput): T
  update(id: number, input: UpdateInput): T
  remove(id: number): void
}

// With field-level updates as optional extension
export interface FieldUpdatable<T> {
  updateField<K extends keyof T>(id: number, field: K, value: T[K]): T
}
```

### Implement Generic Field Update

```typescript
// Instead of 11 specific methods:
function updateField<K extends keyof Kanji>(
  id: number,
  field: K,
  value: Kanji[K]
): Kanji {
  const dbField = camelToSnake(field)
  run(
    `UPDATE kanjis SET ${dbField} = ?, updated_at = datetime('now') WHERE id = ?`,
    [value, id]
  )
  return getById(id)!
}

// Usage:
kanjiRepo.updateField(1, 'strokeCount', 5)
kanjiRepo.updateField(1, 'jlptLevel', 'N3')
```

### Add Auto-Persistence

```typescript
// Wrap repository with auto-persist
function withAutoPersist<T>(repo: T): T {
  return new Proxy(repo, {
    get(target, prop) {
      const method = target[prop]
      if (typeof method === 'function' && isMutatingMethod(prop)) {
        return async (...args) => {
          const result = method.apply(target, args)
          await persist()
          return result
        }
      }
      return method
    }
  })
}
```

---

## Checklist for Refactor

- [ ] Create `src/api/` directory structure
- [ ] Move repositories from `shared/composables/` to `api/repositories/`
- [ ] Define standard `Repository<T>` interface
- [ ] Implement generic `updateField()` method
- [ ] Standardize method naming (`get*`, `create`, `update`, `remove`)
- [ ] Add consistent error handling with context
- [ ] Implement auto-persistence wrapper
- [ ] Update imports across all modules

---

## Cross-References

- **Previous**: [1-current-architecture-assessment.md](./1-current-architecture-assessment.md)
- **Next**: [3-api-layer-restructuring-plan.md](./3-api-layer-restructuring-plan.md)
- **Related**: [Session 2: Composable Restructuring Guidelines](../session-2-components/4-composable-restructuring-guidelines.md)
