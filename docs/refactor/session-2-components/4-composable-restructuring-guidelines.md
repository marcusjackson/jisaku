# Composable Restructuring Guidelines

**Summary:** This document provides guidelines for extracting logic from components into composables, organizing composable code, and testing patterns. Composables are key to reducing component size.

---

## Table of Contents

1. [When to Extract to Composable](#1-when-to-extract-to-composable) (Lines 20-60)
2. [Composable Organization](#2-composable-organization) (Lines 65-130)
3. [State Management Composables](#3-state-management-composables) (Lines 135-200)
4. [Handler Composables](#4-handler-composables) (Lines 205-270)
5. [Testing Composables](#5-testing-composables) (Lines 275-330)

---

## 1. When to Extract to Composable

### Extract When

| Signal                              | Extraction Type          |
| ----------------------------------- | ------------------------ |
| 20+ handler methods                 | Handler composable       |
| 10+ reactive state variables        | State composable         |
| Complex derived state (5+ computed) | State composable         |
| Reusable across components          | Utility composable       |
| Async loading logic                 | Data fetching composable |

### Keep Inline When

- < 5 handler methods
- Simple local state (isEditing, isExpanded)
- Single-use computed properties
- Direct event forwarding

### Decision Flowchart

```
Has 20+ handlers? ──Yes──▶ Extract handler composable
       │
       No
       │
       ▼
Has 10+ state refs? ──Yes──▶ Extract state composable
       │
       No
       │
       ▼
Reused elsewhere? ──Yes──▶ Extract utility composable
       │
       No
       │
       ▼
Keep inline
```

---

## 2. Composable Organization

### File Structure

```
src/modules/kanji/
├── components/
│   ├── KanjiRootDetail.vue
│   └── KanjiSectionMeanings.vue
├── composables/
│   ├── use-kanji-detail-state.ts      # State for detail page
│   ├── use-kanji-detail-handlers.ts   # Handlers for detail page
│   ├── use-kanji-form.ts              # Form logic (existing)
│   └── use-kanji-filters.ts           # List filtering logic
└── kanji-types.ts
```

### Naming Conventions

| Purpose       | Naming                            | Example                        |
| ------------- | --------------------------------- | ------------------------------ |
| Page state    | `use-[module]-[page]-state.ts`    | `use-kanji-detail-state.ts`    |
| Page handlers | `use-[module]-[page]-handlers.ts` | `use-kanji-detail-handlers.ts` |
| Feature logic | `use-[module]-[feature].ts`       | `use-kanji-filters.ts`         |
| Form logic    | `use-[module]-form.ts`            | `use-kanji-form.ts`            |

### Composable Size Limits

| Type               | Target Lines | Max Lines |
| ------------------ | ------------ | --------- |
| State composable   | 100-150      | 200       |
| Handler composable | 150-200      | 250       |
| Utility composable | 50-100       | 150       |

### Return Pattern

Always return named object, never array:

```typescript
// ✅ Correct
return {
  kanji,
  meanings,
  isLoading,
  error,
  loadKanji
}

// ❌ Wrong
return [kanji, meanings, isLoading, error, loadKanji]
```

---

## 3. State Management Composables

### Purpose

Manage reactive state for a specific page or feature.

### Template

```typescript
// composables/use-kanji-detail-state.ts
import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useKanjiRepository } from '@/api/kanji'
import type { Kanji, KanjiMeaning, OnReading, KunReading } from '@/api/kanji'

export interface KanjiDetailState {
  kanji: Ref<Kanji | null>
  meanings: Ref<KanjiMeaning[]>
  onReadings: Ref<OnReading[]>
  kunReadings: Ref<KunReading[]>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}

export function useKanjiDetailState(kanjiId: Ref<number>): KanjiDetailState {
  const kanjiRepo = useKanjiRepository()

  // State
  const kanji = ref<Kanji | null>(null)
  const meanings = ref<KanjiMeaning[]>([])
  const onReadings = ref<OnReading[]>([])
  const kunReadings = ref<KunReading[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // Load function
  async function loadKanji() {
    if (Number.isNaN(kanjiId.value)) {
      error.value = new Error('Invalid kanji ID')
      return
    }

    isLoading.value = true
    error.value = null

    try {
      kanji.value = kanjiRepo.getById(kanjiId.value)
      if (!kanji.value) {
        error.value = new Error('Kanji not found')
        return
      }

      // Load related data
      meanings.value = meaningRepo.getByKanjiId(kanjiId.value)
      onReadings.value = readingRepo.getOnReadingsByKanjiId(kanjiId.value)
      kunReadings.value = readingRepo.getKunReadingsByKanjiId(kanjiId.value)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      isLoading.value = false
    }
  }

  // Auto-load on ID change
  watch(kanjiId, loadKanji, { immediate: true })

  return {
    kanji,
    meanings,
    onReadings,
    kunReadings,
    isLoading,
    error
  }
}
```

---

## 4. Handler Composables

### Purpose

Group related handler methods that modify state.

### Template

```typescript
// composables/use-kanji-meaning-handlers.ts
import { useToast } from '@/shared/composables/use-toast'
import { useMeaningRepository } from '@/api/meaning'
import { useDatabase } from '@/shared/composables/use-database'
import type { Ref } from 'vue'
import type { KanjiMeaning } from '@/api/meaning'

export interface MeaningHandlers {
  addMeaning: (text: string, info: string | null) => Promise<void>
  updateMeaning: (
    id: number,
    text: string,
    info: string | null
  ) => Promise<void>
  removeMeaning: (id: number) => Promise<void>
  reorderMeanings: (ids: number[]) => Promise<void>
}

export function useMeaningHandlers(
  kanjiId: Ref<number>,
  meanings: Ref<KanjiMeaning[]>
): MeaningHandlers {
  const { success, error: showError } = useToast()
  const { persist } = useDatabase()
  const meaningRepo = useMeaningRepository()

  async function addMeaning(text: string, info: string | null) {
    try {
      const newMeaning = meaningRepo.create({
        kanjiId: kanjiId.value,
        meaningText: text,
        additionalInfo: info
      })
      meanings.value = [...meanings.value, newMeaning]
      await persist()
      success('Meaning added')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add meaning')
    }
  }

  async function updateMeaning(id: number, text: string, info: string | null) {
    try {
      const updated = meaningRepo.update(id, {
        meaningText: text,
        additionalInfo: info
      })
      meanings.value = meanings.value.map((m) => (m.id === id ? updated : m))
      await persist()
      success('Meaning updated')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update meaning')
    }
  }

  async function removeMeaning(id: number) {
    try {
      meaningRepo.remove(id)
      meanings.value = meanings.value.filter((m) => m.id !== id)
      await persist()
      success('Meaning deleted')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete meaning')
    }
  }

  async function reorderMeanings(ids: number[]) {
    try {
      meaningRepo.reorder(kanjiId.value, ids)
      meanings.value = ids.map((id) => meanings.value.find((m) => m.id === id)!)
      await persist()
      success('Meanings reordered')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reorder')
    }
  }

  return {
    addMeaning,
    updateMeaning,
    removeMeaning,
    reorderMeanings
  }
}
```

### Combining Multiple Handler Composables

```typescript
// composables/use-kanji-detail-handlers.ts
import { useMeaningHandlers } from './use-meaning-handlers'
import { useReadingHandlers } from './use-reading-handlers'
import { useClassificationHandlers } from './use-classification-handlers'
import type { KanjiDetailState } from './use-kanji-detail-state'

export function useKanjiDetailHandlers(
  kanjiId: Ref<number>,
  state: KanjiDetailState
) {
  return {
    meanings: useMeaningHandlers(kanjiId, state.meanings),
    readings: useReadingHandlers(kanjiId, state.onReadings, state.kunReadings),
    classifications: useClassificationHandlers(kanjiId, state.classifications)
  }
}

// Usage in component:
const handlers = useKanjiDetailHandlers(kanjiId, state)
// handlers.meanings.addMeaning(...)
// handlers.readings.addOnReading(...)
```

---

## 5. Testing Composables

### Test Structure

```typescript
// composables/use-kanji-detail-state.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useKanjiDetailState } from './use-kanji-detail-state'

// Mock dependencies
vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    getById: vi.fn()
  })
}))

describe('useKanjiDetailState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads kanji on initialization', async () => {
    const kanjiId = ref(1)
    const { kanji, isLoading, error } = useKanjiDetailState(kanjiId)

    // Initial state
    expect(isLoading.value).toBe(true)

    // After load
    await nextTick()
    expect(isLoading.value).toBe(false)
    expect(kanji.value).toBeDefined()
    expect(error.value).toBeNull()
  })

  it('handles not found error', async () => {
    // Mock returns null
    vi.mocked(useKanjiRepository().getById).mockReturnValue(null)

    const kanjiId = ref(999)
    const { error } = useKanjiDetailState(kanjiId)

    await nextTick()
    expect(error.value?.message).toBe('Kanji not found')
  })

  it('reloads when ID changes', async () => {
    const kanjiId = ref(1)
    useKanjiDetailState(kanjiId)

    kanjiId.value = 2
    await nextTick()

    expect(useKanjiRepository().getById).toHaveBeenCalledWith(2)
  })
})
```

### Handler Composable Tests

```typescript
// composables/use-meaning-handlers.test.ts
import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useMeaningHandlers } from './use-meaning-handlers'

describe('useMeaningHandlers', () => {
  it('adds meaning to state', async () => {
    const kanjiId = ref(1)
    const meanings = ref([])

    const { addMeaning } = useMeaningHandlers(kanjiId, meanings)

    await addMeaning('test meaning', null)

    expect(meanings.value).toHaveLength(1)
    expect(meanings.value[0].meaningText).toBe('test meaning')
  })

  it('shows error toast on failure', async () => {
    // Mock repository to throw
    vi.mocked(useMeaningRepository().create).mockImplementation(() => {
      throw new Error('DB error')
    })

    const { addMeaning } = useMeaningHandlers(ref(1), ref([]))

    await addMeaning('test', null)

    expect(useToast().error).toHaveBeenCalledWith('DB error')
  })
})
```

---

## Checklist

### Before Creating Composable

- [ ] Identify extraction type (state vs handlers)
- [ ] List all related functions to extract
- [ ] Define return interface
- [ ] Plan test coverage

### After Creating Composable

- [ ] File < 250 lines
- [ ] Returns named object
- [ ] Explicit TypeScript types
- [ ] Unit tests written
- [ ] Used in component (import verified)
- [ ] Old code removed from component

---

## Cross-References

- **Previous**: [3-section-decomposition-patterns.md](./3-section-decomposition-patterns.md)
- **Related**: [Session 1: Repository Pattern Analysis](../session-1-architecture/2-repository-pattern-analysis.md)
- **Related**: [Session 3: Testing Guidelines](../session-3-testing-ui-sequencing/1-e2e-test-reliability-improvements.md)
