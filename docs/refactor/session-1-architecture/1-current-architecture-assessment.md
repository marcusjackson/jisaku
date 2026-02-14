# Current Architecture Assessment

**Summary:** This document analyzes the current Root/Section/UI component hierarchy across all modules, identifying where the documented patterns have broken down and why. Understanding these deviations is critical for planning the refactor.

---

## Table of Contents

1. [Expected vs Actual Hierarchy](#1-expected-vs-actual-hierarchy) (Lines 20-80)
2. [Module-by-Module Analysis](#2-module-by-module-analysis) (Lines 85-180)
3. [Root Cause Analysis](#3-root-cause-analysis) (Lines 185-230)
4. [Impact on Maintainability](#4-impact-on-maintainability) (Lines 235-270)
5. [Recommendations](#5-recommendations) (Lines 275-300)

---

## 1. Expected vs Actual Hierarchy

### Documented Pattern

Per `.github/instructions/components.instructions.md`, the expected hierarchy is:

```
Root Component (1 per feature)
├── Section Components (N per Root)
│   └── UI Components (N per Section)
└── Error/Loading States
```

**Root**: Page orchestration, data fetching, error boundaries (~100-200 lines)
**Section**: Layout, grouping, coordination (~100-250 lines)
**UI**: Presentational, props in/events out (~50-150 lines)

### Actual Pattern Found

```
Root Component (over-sized, doing Section work)
├── Section Component (1 monolithic component)
│   └── "Detail" Components (doing Section+UI work)
└── Many handlers duplicated at Root level
```

**Problem**: Root components contain 60+ event handlers, all state management, and coordinate directly with too many UI components through a pass-through Section.

### File Size Violations

| File                         | Lines | Expected Max |
| ---------------------------- | ----- | ------------ |
| KanjiRootDetail.vue          | 1237  | 200-300      |
| KanjiDetailMeanings.vue      | 1195  | 150-250      |
| ComponentRootDetail.vue      | 757   | 200-300      |
| KanjiSectionDetail.vue       | 540   | 200-300      |
| ComponentDetailGroupings.vue | 750   | 150-250      |

The KanjiRootDetail alone has **1237 lines** — 4-6x the recommended maximum.

---

## 2. Module-by-Module Analysis

### Kanji Module

**Current Structure:**

```
KanjiRootDetail.vue (1237 lines) — PROBLEM: Too many handlers
├── KanjiSectionDetail.vue (540 lines) — Pass-through props/events
│   ├── KanjiDetailHeader.vue
│   ├── KanjiDetailBasicInfo.vue
│   ├── KanjiDetailComponents.vue
│   ├── KanjiDetailReadings.vue (530 lines)
│   ├── KanjiDetailMeanings.vue (1195 lines) — PROBLEM: Monolithic
│   ├── KanjiDetailClassifications.vue (626 lines)
│   ├── KanjiDetailStrokeOrder.vue
│   ├── KanjiDetailNotes*.vue (4 files)
│   └── KanjiDetailVocabulary.vue
```

**Issues:**

1. Root has 60+ handler methods for all child operations
2. Section is a pure pass-through (~50 events forwarded)
3. "Detail" components are actually Section-sized (meanings: 1195 lines)
4. No clear UI component layer

### Component Module

**Current Structure:**

```
ComponentRootDetail.vue (757 lines) — Doing too much
├── ComponentSectionDetail.vue (493 lines) — Pass-through
│   ├── ComponentDetailHeader.vue
│   ├── ComponentDetailBasicInfo.vue (434 lines)
│   ├── ComponentDetailForms.vue (585 lines)
│   ├── ComponentDetailGroupings.vue (750 lines) — PROBLEM
│   ├── ComponentDetailKanjiList.vue (523 lines)
│   └── ComponentDetailDescription.vue
```

**Issues:**

1. Same pattern as Kanji — monolithic Root
2. "Detail" components are actually Section+UI hybrid
3. Groupings component has complex nested state management

### Settings Module

**Current Structure:**

```
SettingsRoot.vue
├── SettingsSectionAppearance.vue
├── SettingsSectionDatabase.vue
├── SettingsSectionDevTools.vue
├── SettingsSectionClassificationTypes.vue (643 lines) — PROBLEM
└── SettingsSectionPositionTypes.vue (624 lines) — PROBLEM
```

**Issues:**

1. Section components contain full CRUD implementations
2. Classification/Position types have entire dialog systems inline
3. No shared patterns for settings CRUD operations

### Vocabulary Module

**Current Structure:**

```
VocabularyRootDetail.vue
├── VocabularySectionDetail.vue
│   ├── VocabularyDetailHeader.vue
│   ├── VocabularyDetailBasicInfo.vue
│   └── VocabularyDetailKanjiBreakdown.vue
```

**Status:** Cleaner than Kanji/Component but follows same Root-heavy pattern.

---

## 3. Root Cause Analysis

### Why Did Hierarchy Break Down?

**1. Incremental Feature Growth**

- Started with simple CRUD
- Added readings, meanings, classifications incrementally
- Each addition went to Root handlers instead of new Section components

**2. Event Forwarding Pain**

- Vue's explicit event system requires re-emitting at each level
- Developers added handlers to Root to avoid multi-level forwarding
- Result: Root became a "god component"

**3. Unclear Section Boundaries**

- "KanjiDetailMeanings" sounds like a UI component
- Actually contains: view mode, edit mode, dialogs, reordering, grouping
- Should be "KanjiSectionMeanings" with child UI components

**4. No Enforcement Mechanism**

- No ESLint rules for file size
- No CI checks for component complexity
- Easy to add "just one more handler"

### Pattern: Handler Proliferation

```typescript
// KanjiRootDetail.vue — 60+ handlers like these:
async function handleUpdateMeaning(id, text, info) { ... }
async function handleRemoveMeaning(id) { ... }
async function handleReorderMeanings(ids) { ... }
async function handleAddReadingGroup() { ... }
async function handleUpdateReadingGroup(id, text) { ... }
// ... 55 more handlers
```

Each sub-feature (readings, meanings, classifications) adds 10-15 handlers to Root.

---

## 4. Impact on Maintainability

### AI Agent Inefficiency

- Large files exceed optimal context window size
- AI must read 1200+ lines to understand one component
- Changes require understanding entire file dependency graph
- Refactoring suggestions rarely made due to scope

### Developer Pain Points

1. **Merge Conflicts**: Multiple features touch same large files
2. **Cognitive Load**: Understanding KanjiRootDetail requires reading all 1237 lines
3. **Testing Difficulty**: Testing Root means mocking all child interactions
4. **Code Review**: Hard to review changes in 1000+ line files

### Performance Impact

- Large SFCs take longer to compile
- HMR slower on large files
- Bundle splitting less effective

---

## 5. Recommendations

### Immediate Actions

1. **Rename "Detail" → "Section"** where appropriate
2. **Extract handlers to domain composables**
3. **Split monolithic sections into true UI components**

### Target Architecture

```
KanjiRootDetail.vue (~200 lines)
├── KanjiSectionHeader.vue
├── KanjiSectionBasicInfo.vue
├── KanjiSectionReadings.vue
│   ├── KanjiReadingsViewMode.vue (existing)
│   ├── KanjiReadingsEditMode.vue (existing)
│   └── KanjiOnReadingItem.vue (new)
├── KanjiSectionMeanings.vue
│   ├── KanjiMeaningsViewMode.vue (existing)
│   ├── KanjiMeaningsEditForm.vue (new)
│   └── KanjiMeaningItem.vue (new)
└── KanjiSectionClassifications.vue
```

### File Size Targets

| Component Type | Target Lines | Max Lines |
| -------------- | ------------ | --------- |
| Root           | 150-200      | 300       |
| Section        | 150-250      | 350       |
| UI             | 50-150       | 200       |
| Composable     | 100-200      | 300       |

---

## Cross-References

- **Next**: [2-repository-pattern-analysis.md](./2-repository-pattern-analysis.md) — How repository composables contribute to Root bloat
- **Related**: [Session 2: Component Hierarchy Breakdown Plan](../session-2-components/1-component-hierarchy-breakdown-plan.md)
- **Implementation**: [Session 3: Implementation Sequencing](../session-3-testing-ui-sequencing/3-implementation-sequencing.md)
