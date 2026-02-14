# AI Agent Workflow Recommendations

**Summary:** This document provides recommendations for structuring code to enable effective AI agent collaboration, including file size guidelines, clear responsibility boundaries, and ESLint rules as guardrails.

---

## Table of Contents

1. [Context Window Considerations](#1-context-window-considerations) (Lines 18-75)
2. [Architectural Patterns for AI](#2-architectural-patterns-for-ai) (Lines 80-150)
3. [File Size Guidelines](#3-file-size-guidelines) (Lines 155-210)
4. [ESLint as Guardrails](#4-eslint-as-guardrails) (Lines 215-280)
5. [AI-Friendly Patterns](#5-ai-friendly-patterns) (Lines 285-350)

---

## 1. Context Window Considerations

### The Context Problem

AI agents have limited context windows (typically 8K-128K tokens). Large files create problems:

1. **Truncation**: File contents may be summarized or cut off
2. **Dilution**: Important context lost among boilerplate
3. **Hallucination**: Agent guesses at unseen code
4. **Inconsistency**: Partial understanding leads to conflicting changes

### Token Estimates

| File Lines  | Approx Tokens | Context Impact      |
| ----------- | ------------- | ------------------- |
| 100 lines   | ~400-600      | ✅ Fits easily      |
| 250 lines   | ~1,000-1,500  | ✅ Good target      |
| 450 lines   | ~1,800-2,500  | ⚠️ Maximum safe     |
| 1000+ lines | ~4,000-6,000  | ❌ Context pressure |

### Current Problem Files

```
KanjiRootDetail.vue       1237 lines  ~5,000 tokens
KanjiDetailMeanings.vue   1195 lines  ~4,800 tokens
ComponentRootDetail.vue    757 lines  ~3,000 tokens
```

These files consume significant context, leaving less room for:

- Related files (types, composables, tests)
- Documentation context
- Agent reasoning space

### Target State

```
KanjiRootDetail.vue        200 lines  ~800 tokens
KanjiSectionMeanings.vue   180 lines  ~720 tokens
use-kanji-detail-state.ts  150 lines  ~600 tokens
```

**Result**: Agent can hold 4-5 related files vs. 1-2 before.

---

## 2. Architectural Patterns for AI

### Single Responsibility Per File

AI agents work best when each file has one clear purpose:

```
❌ Hard to understand:
KanjiDetailMeanings.vue
├── Display meanings (view mode)
├── Edit meanings (edit mode)
├── Manage groupings
├── Reorder meanings
└── Handle all dialogs

✅ Easy to understand:
KanjiSectionMeanings.vue → Orchestrates modes
KanjiMeaningsViewMode.vue → Display only
KanjiMeaningsEditMode.vue → Edit only
KanjiMeaningItem.vue → Single meaning card
```

### Clear Component Boundaries

AI can reason about distinct layers:

```typescript
// Root: Data + orchestration (clear responsibility)
const { entity, isLoading, error } = useKanjiDetail(id)

// Section: Layout + coordination (clear boundary)
<KanjiSectionMeanings
  :kanji-id="entity.id"
  :meanings="entity.meanings"
/>

// UI: Presentation only (predictable behavior)
<KanjiMeaningCard
  :meaning="meaning"
  @edit="emit('edit', meaning.id)"
/>
```

### Explicit Dependencies

AI works better with explicit imports:

```typescript
// ✅ Clear dependencies
import { useKanjiDetailState } from './composables/use-kanji-detail-state'
import { useKanjiDetailHandlers } from './composables/use-kanji-detail-handlers'
import type { Kanji } from '@/shared/types/database-types'

// ❌ Hidden dependencies (scattered across file)
// AI must read 1000+ lines to understand data flow
```

### Composable Extraction Pattern

Extract logic so AI can understand intent:

```typescript
// use-kanji-detail-handlers.ts
// Name tells AI exactly what this does
export function useKanjiDetailHandlers(kanji: Ref<Kanji | null>) {
  // Focused: only handlers, not state management
  const handleUpdateShortMeaning = async (value: string) => { ... }
  const handleAddMeaning = async (meaningText: string) => { ... }

  return { handleUpdateShortMeaning, handleAddMeaning }
}
```

---

## 3. File Size Guidelines

### Recommended Limits

| Category           | Lines | Rationale                 |
| ------------------ | ----- | ------------------------- |
| Root Components    | ≤200  | Orchestration only        |
| Section Components | ≤250  | Mode management           |
| UI Components      | ≤150  | Presentation focus        |
| Composables        | ≤200  | Single concern            |
| Type Files         | ≤300  | Organized by domain       |
| Tests              | ≤400  | Test suites can be longer |

### When to Split

**Split immediately when:**

- File exceeds 450 lines
- More than 2-3 distinct responsibilities
- Multiple "modes" (view/edit/grouping)
- More than 10 handler methods

**Split proactively when:**

- Approaching 300 lines with growth expected
- Adding new feature to existing section
- Multiple developers editing same file

### Splitting Strategies

**For Components:**

```
Before: BigSection.vue (600 lines)
After:
├── BigSection.vue (150 lines) - orchestrator
├── BigSectionViewMode.vue (180 lines)
├── BigSectionEditMode.vue (200 lines)
└── BigSectionItem.vue (80 lines)
```

**For Composables:**

```
Before: use-big-repository.ts (500 lines)
After:
├── use-big-repository.ts (150 lines) - delegates
├── use-big-queries.ts (150 lines) - read operations
├── use-big-mutations.ts (200 lines) - write operations
```

---

## 4. ESLint as Guardrails

### File Size Rules

```javascript
// eslint.config.ts
{
  files: ['src/**/*.vue'],
  rules: {
    // Warn early, error late
    'max-lines': ['warn', { max: 300, skipBlankLines: true }],

    // Per-layer limits (with overrides)
    'max-lines': ['error', { max: 450 }], // Hard limit
  }
}
```

### AI-Friendly Rule Set

```javascript
// Rules that help AI understand code
{
  // Explicit imports
  'import/no-cycle': 'error',
  'import/no-default-export': 'off', // Vue uses defaults

  // Clear naming
  '@typescript-eslint/naming-convention': [
    'error',
    { selector: 'interface', prefix: ['I'], format: ['PascalCase'] }
  ],

  // Avoid magic
  'no-magic-numbers': ['warn', { ignore: [0, 1, -1] }],

  // Force type annotations AI can read
  '@typescript-eslint/explicit-function-return-type': 'warn',
}
```

### Custom Rule Ideas

```javascript
// Future: Custom ESLint rule for component responsibility
// 'vue/single-mode-component': 'warn'
// Flags components with multiple data-testid="*-mode" variants

// Future: Handler count limit
// 'vue/max-handlers': ['warn', { max: 15 }]
// Flags components with too many method handlers
```

---

## 5. AI-Friendly Patterns

### Naming Conventions

Names should communicate intent clearly:

```typescript
// ✅ AI understands purpose immediately
const handleSaveMeaning = async () => { ... }
const useKanjiDetailHandlers = () => { ... }
const KanjiSectionMeanings = { ... }

// ❌ AI must read implementation to understand
const doSave = async () => { ... }
const useKanjiStuff = () => { ... }
const MeaningsArea = { ... }
```

### File Naming Patterns

```
# Component naming tells AI the hierarchy level
KanjiRootDetail.vue      → Root level, data fetching
KanjiSectionMeanings.vue → Section level, orchestration
KanjiMeaningCard.vue     → UI level, presentation

# Composable naming tells AI the domain
use-kanji-detail-state.ts    → State for detail page
use-kanji-detail-handlers.ts → Handlers for detail page
use-kanji-repository.ts      → API/data access
```

### Comment Headers

Add headers AI can scan:

```typescript
/**
 * @file use-kanji-detail-handlers.ts
 * @description Handlers for KanjiRootDetail component
 * @depends use-kanji-repository, use-database
 * @exports handleAddMeaning, handleDeleteMeaning, ...
 */
```

### Type-Driven Development

AI works excellently with explicit types:

```typescript
// Types communicate intent
interface KanjiDetailState {
  kanji: Ref<Kanji | null>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  editingSection: Ref<string | null>
}

interface KanjiDetailHandlers {
  handleUpdateShortMeaning: (value: string) => Promise<void>
  handleAddMeaning: (text: string, isPrimary: boolean) => Promise<void>
  handleDeleteMeaning: (id: number) => Promise<void>
}

// AI can now generate implementations matching these contracts
```

### Test Colocation

Keep tests next to source for AI context:

```
kanji/
├── KanjiRootDetail.vue
├── KanjiRootDetail.test.ts    ← AI reads both together
├── composables/
│   ├── use-kanji-detail-state.ts
│   └── use-kanji-detail-state.test.ts  ← Tests alongside
```

### Data-TestID Strategy

Consistent test IDs help AI write tests:

```vue
<!-- Pattern: [module]-[component]-[element] -->
<SharedSection data-testid="kanji-meanings-section">
  <div data-testid="kanji-meanings-list">
    <div
      v-for="m in meanings"
      :key="m.id"
      :data-testid="`kanji-meaning-item-${m.id}`"
    >
```

AI can now confidently write:

```typescript
await page.getByTestId('kanji-meanings-section').click()
await expect(page.getByTestId('kanji-meaning-item-1')).toBeVisible()
```

---

## Summary: AI-First Refactoring Goals

1. **Files < 300 lines** — Fits comfortably in context
2. **Single responsibility** — Clear intent per file
3. **Explicit dependencies** — No hidden coupling
4. **Descriptive names** — Purpose evident from name
5. **Type contracts** — AI generates to interfaces
6. **ESLint guards** — Automated enforcement
7. **Colocated tests** — Context available together

### Quick Reference

| Pattern            | AI Benefit                  |
| ------------------ | --------------------------- |
| Small files        | Full context, no truncation |
| Root/Section/UI    | Clear reasoning boundaries  |
| Extracted handlers | Focused understanding       |
| Explicit types     | Contract-driven generation  |
| Data-testid        | Confident test writing      |
| Comment headers    | Fast file scanning          |

---

## Cross-References

- **Previous**: [3-implementation-sequencing.md](./3-implementation-sequencing.md)
- **Index**: [README.md](../README.md)
- **Related**: [Session 2: File Size Strategy](../session-2-component-restructuring/2-file-size-refactoring-strategy.md)
