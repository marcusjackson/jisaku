# API Layer Restructuring Plan

**Summary:** This document provides a detailed plan for extracting repository logic from `shared/composables/` into a dedicated `api/` layer with consistent patterns, proper error handling, and auto-persistence.

---

## Table of Contents

1. [Target Structure](#1-target-structure) (Lines 20-70)
2. [Repository Interface Standards](#2-repository-interface-standards) (Lines 75-150)
3. [Implementation Patterns](#3-implementation-patterns) (Lines 155-230)
4. [Error Handling Strategy](#4-error-handling-strategy) (Lines 235-280)
5. [Persistence Management](#5-persistence-management) (Lines 285-320)
6. [Migration Path](#6-migration-path) (Lines 325-370)

---

## 1. Target Structure

### Directory Layout

```
src/
├── api/
│   ├── index.ts                    # Public API exports
│   ├── types.ts                    # Shared API types
│   ├── base-repository.ts          # Abstract base class
│   ├── persistence.ts              # Auto-persist utilities
│   │
│   ├── kanji/                      # Kanji + readings + meanings
│   │   ├── index.ts
│   │   ├── kanji-repository.ts     # Main kanji CRUD (~200 lines)
│   │   ├── kanji-repository-internals.ts  # Row mapping, filters (~150 lines)
│   │   ├── kanji-types.ts          # Kanji entity types
│   │   ├── on-reading-repository.ts
│   │   ├── kun-reading-repository.ts
│   │   ├── meaning-repository.ts
│   │   └── kanji-classification-repository.ts  # Junction table
│   │
│   ├── component/                  # Components + forms + occurrences
│   │   ├── index.ts
│   │   ├── component-repository.ts
│   │   ├── component-types.ts
│   │   ├── occurrence-repository.ts
│   │   ├── form-repository.ts
│   │   └── grouping-repository.ts
│   │
│   ├── vocabulary/                 # Vocabulary + vocab-kanji links
│   │   ├── index.ts
│   │   ├── vocabulary-repository.ts
│   │   ├── vocabulary-types.ts
│   │   └── vocab-kanji-repository.ts
│   │
│   ├── classification/             # Classification types (kanji etymology)
│   │   ├── index.ts
│   │   ├── classification-type-repository.ts
│   │   └── classification-types.ts
│   │
│   └── position/                   # Position types (component placement)
│       ├── index.ts
│       ├── position-type-repository.ts
│       └── position-types.ts
```

**Note:** Readings and meanings are grouped under `kanji/` since they are tightly coupled child entities. Classification and position types are separated as they serve different domains.

### File Size Targets

| File Type                 | Target Lines | Max Lines |
| ------------------------- | ------------ | --------- |
| Repository (main entity)  | 150-200      | 250       |
| Repository internals      | 100-150      | 200       |
| Repository (child entity) | 80-120       | 150       |
| Types file                | 50-100       | 150       |
| Index file                | 10-30        | 50        |

---

## 2. Repository Interface Standards

### Base Repository Interface

```typescript
// api/types.ts
export interface Repository<
  T,
  CreateInput,
  UpdateInput = Partial<CreateInput>
> {
  /** Get entity by ID, returns null if not found */
  getById(id: number): T | null

  /** Get all entities */
  getAll(): T[]

  /** Create new entity */
  create(input: CreateInput): T

  /** Update entity by ID */
  update(id: number, input: UpdateInput): T

  /** Delete entity by ID */
  remove(id: number): void
}

/** Extension for entities with display ordering */
export interface Orderable {
  reorder(ids: number[]): void
}

/** Extension for child entities */
export interface ChildRepository<
  T,
  CreateInput,
  UpdateInput
> extends Repository<T, CreateInput, UpdateInput> {
  /** Get all by parent ID */
  getByParentId(parentId: number): T[]
}
```

### Field Update Interface

```typescript
// api/types.ts
export interface FieldUpdatable<T> {
  /** Generic field update method */
  updateField<K extends UpdatableField<T>>(id: number, field: K, value: T[K]): T
}

/** Fields that can be updated (excludes id, timestamps) */
type UpdatableField<T> = Exclude<keyof T, 'id' | 'createdAt' | 'updatedAt'>
```

### Standard Method Signatures

```typescript
// Consistent naming across all repositories:
interface KanjiRepository extends Repository<
  Kanji,
  CreateKanjiInput,
  UpdateKanjiInput
> {
  // Base methods from Repository interface
  getById(id: number): Kanji | null
  getAll(): Kanji[]
  create(input: CreateKanjiInput): Kanji
  update(id: number, input: UpdateKanjiInput): Kanji
  remove(id: number): void

  // Extended queries (entity-specific)
  getByCharacter(character: string): Kanji | null
  search(filters: KanjiFilters): Kanji[]

  // Field updates (use updateField for simple cases)
  updateField<K extends keyof Kanji>(
    id: number,
    field: K,
    value: Kanji[K]
  ): Kanji
}
```

---

## 3. Implementation Patterns

### Base Repository Class

```typescript
// api/base-repository.ts
import { useDatabase } from '@/shared/composables/use-database'

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected db = useDatabase()
  protected abstract tableName: string
  protected abstract mapRow(row: Record<string, unknown>): T

  getById(id: number): T | null {
    const result = this.db.exec(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    )
    return this.resultToEntity(result)
  }

  getAll(): T[] {
    const result = this.db.exec(
      `SELECT * FROM ${this.tableName} ORDER BY id DESC`
    )
    return this.resultToList(result)
  }

  remove(id: number): void {
    this.db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id])
  }

  protected resultToEntity(result: QueryResult): T | null {
    if (!result[0]?.values[0]) return null
    return this.mapRow(this.rowToObject(result[0]))
  }

  protected resultToList(result: QueryResult): T[] {
    if (!result[0]) return []
    return result[0].values.map((row) =>
      this.mapRow(
        this.rowToObject({ columns: result[0].columns, values: [row] })
      )
    )
  }

  protected rowToObject(result: {
    columns: string[]
    values: unknown[][]
  }): Record<string, unknown> {
    const obj: Record<string, unknown> = {}
    result.columns.forEach((col, i) => {
      obj[col] = result.values[0]?.[i]
    })
    return obj
  }
}
```

### Concrete Repository Example

```typescript
// api/kanji/kanji-repository.ts
import { BaseRepository } from '../base-repository'
import type { Kanji, CreateKanjiInput, UpdateKanjiInput } from './kanji-types'

class KanjiRepositoryImpl extends BaseRepository<Kanji, CreateKanjiInput, UpdateKanjiInput> {
  protected tableName = 'kanjis'

  protected mapRow(row: Record<string, unknown>): Kanji {
    return {
      id: row.id as number,
      character: row.character as string,
      strokeCount: row.stroke_count as number | null,
      shortMeaning: row.short_meaning as string | null,
      // ... map all fields
    }
  }

  create(input: CreateKanjiInput): Kanji {
    this.db.run(
      `INSERT INTO kanjis (character, stroke_count, short_meaning, ...)
       VALUES (?, ?, ?, ...)`,
      [input.character, input.strokeCount ?? null, input.shortMeaning ?? null, ...]
    )
    const id = this.db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] as number
    return this.getById(id)!
  }

  update(id: number, input: UpdateKanjiInput): Kanji {
    const sets: string[] = []
    const values: unknown[] = []

    if (input.character !== undefined) {
      sets.push('character = ?')
      values.push(input.character)
    }
    // ... handle other fields

    sets.push('updated_at = datetime("now")')
    values.push(id)

    this.db.run(
      `UPDATE kanjis SET ${sets.join(', ')} WHERE id = ?`,
      values
    )
    return this.getById(id)!
  }

  // Generic field update
  updateField<K extends keyof Kanji>(id: number, field: K, value: Kanji[K]): Kanji {
    const dbField = this.camelToSnake(String(field))
    this.db.run(
      `UPDATE kanjis SET ${dbField} = ?, updated_at = datetime("now") WHERE id = ?`,
      [value, id]
    )
    return this.getById(id)!
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  }
}

// Export singleton factory
export function useKanjiRepository() {
  return new KanjiRepositoryImpl()
}
```

---

## 4. Error Handling Strategy

### Custom Error Classes

```typescript
// api/types.ts
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly entity: string,
    public readonly operation: string,
    public readonly id?: number
  ) {
    super(message)
    this.name = 'RepositoryError'
  }
}

export class EntityNotFoundError extends RepositoryError {
  constructor(entity: string, id: number) {
    super(`${entity} with id ${id} not found`, entity, 'read', id)
    this.name = 'EntityNotFoundError'
  }
}

export class CreateError extends RepositoryError {
  constructor(entity: string, cause?: Error) {
    super(
      `Failed to create ${entity}: ${cause?.message ?? 'unknown error'}`,
      entity,
      'create'
    )
    this.name = 'CreateError'
  }
}
```

### Error Handling in Repositories

```typescript
// Consistent error handling
update(id: number, input: UpdateKanjiInput): Kanji {
  const existing = this.getById(id)
  if (!existing) {
    throw new EntityNotFoundError('kanji', id)
  }

  try {
    // ... update logic
    const updated = this.getById(id)
    if (!updated) {
      throw new RepositoryError('Entity disappeared after update', 'kanji', 'update', id)
    }
    return updated
  } catch (error) {
    if (error instanceof RepositoryError) throw error
    throw new RepositoryError(
      `Failed to update kanji: ${error instanceof Error ? error.message : 'unknown'}`,
      'kanji',
      'update',
      id
    )
  }
}
```

---

## 5. Persistence Management

### Auto-Persist Decorator

```typescript
// api/persistence.ts
import { useDatabase } from '@/shared/composables/use-database'

const { persist } = useDatabase()

export function withAutoPersist<T extends object>(repository: T): T {
  const mutatingMethods = [
    'create',
    'update',
    'remove',
    'updateField',
    'reorder'
  ]

  return new Proxy(repository, {
    get(target, prop: string) {
      const value = Reflect.get(target, prop)

      if (
        typeof value === 'function' &&
        mutatingMethods.some((m) => prop.startsWith(m))
      ) {
        return async function (...args: unknown[]) {
          const result = value.apply(target, args)
          await persist()
          return result
        }
      }

      return value
    }
  })
}
```

### Usage in Components

```typescript
// Component no longer needs manual persist()
const kanjiRepo = withAutoPersist(useKanjiRepository())

// Auto-persists after update
await kanjiRepo.updateField(kanji.id, 'strokeCount', 5)
// No need for: await persist()
```

---

## 6. Migration Path

### Phase 1: Create Infrastructure (Day 1)

1. Create `src/api/` directory structure
2. Implement `base-repository.ts`
3. Define standard types in `api/types.ts`
4. Implement `persistence.ts` utilities

### Phase 2: Migrate Main Entities (Days 2-3)

1. Migrate `use-kanji-repository.ts` → `api/kanji/`
2. Migrate `use-component-repository.ts` → `api/component/`
3. Migrate `use-vocabulary-repository.ts` → `api/vocabulary/`
4. Update imports in Root components

### Phase 3: Migrate Child Entities (Days 4-5)

1. Migrate reading repositories → `api/reading/`
2. Migrate meaning repositories → `api/meaning/`
3. Migrate occurrence/form/grouping → `api/component/`
4. Update imports in Section components

### Phase 4: Cleanup (Day 6)

1. Remove old repository files from `shared/composables/`
2. Update all remaining imports
3. Run full test suite
4. Update documentation

### Checklist

- [ ] Create `api/` directory structure
- [ ] Implement `BaseRepository` class
- [ ] Define error classes
- [ ] Implement auto-persist wrapper
- [ ] Migrate kanji repository
- [ ] Migrate component repository
- [ ] Migrate vocabulary repository
- [ ] Migrate all child entity repositories
- [ ] Remove old files from `shared/composables/`
- [ ] Update all imports
- [ ] Verify all tests pass

---

## Cross-References

- **Previous**: [2-repository-pattern-analysis.md](./2-repository-pattern-analysis.md)
- **Next**: [4-eslint-rules-requirements.md](./4-eslint-rules-requirements.md)
- **Related**: [Session 2: Composable Restructuring Guidelines](../session-2-components/4-composable-restructuring-guidelines.md)
