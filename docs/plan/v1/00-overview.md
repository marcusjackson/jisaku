# V1 Feature Plan - Overview

Personal, offline-first PWA for researching and documenting kanji. This plan covers V1 features beyond the MVP foundation.

---

## Core Philosophy: Three Equal Entities

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   KANJI     │◄───►│  COMPONENT  │◄───►│ VOCABULARY  │
│             │     │             │     │             │
│ Readings    │     │ Occurrences │     │ Kanji       │
│ Meanings    │     │ Forms       │     │ Breakdown   │
│ Components  │     │ Groupings   │     │ Readings    │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Key Principle:** Each entity has its own detail page for in-depth work. Cross-linking provides basic info only, with navigation to the linked entity's page for full analysis.

---

## Implementation Progress

### Completed (T0-T2)

| Task | Description                                       |
| ---- | ------------------------------------------------- |
| T0.1 | BaseCheckbox rewritten with Reka UI               |
| T0.2 | BaseSwitch component created                      |
| T1.1 | Migration 005: short_meaning on kanjis/components |
| T1.2 | Kanji types and repository updated                |
| T1.3 | Component types and repository updated            |
| T1.4 | short_meaning added to Kanji form                 |
| T1.5 | short_meaning added to Component form             |
| T1.6 | BaseCombobox enhanced (searchKeys, displayFn)     |
| T1.7 | Entity display cards show short_meaning           |
| T2.1 | Unified Components section (no radical split)     |
| T2.2 | Component Occurrence Edit Dialog (deprecated)     |
| T2.3 | Occurrence editing moved to component page        |
| T2.4 | Kanji page components section simplified          |

### In Progress (T3+)

See `06-task-queue.md` for remaining tasks.

---

## Entity Page Ownership

| Data                  | Owned By       | Other Pages Show             |
| --------------------- | -------------- | ---------------------------- |
| Kanji readings        | Kanji page     | N/A                          |
| Kanji meanings        | Kanji page     | N/A                          |
| Kanji classifications | Kanji page     | N/A                          |
| Component occurrences | Component page | Kanji page: basic info only  |
| Occurrence analysis   | Component page | N/A                          |
| Vocab kanji breakdown | Vocab page     | Kanji page: linked list only |

---

## Cross-Cutting Concerns

### No Cross-Module Imports

Modules cannot import from each other. Use `shared/` for multi-module code:

```typescript
// ❌ WRONG
import { KanjiCard } from '@/modules/kanji/components/KanjiCard.vue'
// in modules/components/...

// ✅ CORRECT
import { SharedKanjiCard } from '@/shared/components/SharedKanjiCard.vue'
```

### Short Meaning Field

All three entities have `short_meaning TEXT`:

- **Search**: Find entities by meaning in comboboxes
- **Display**: Show in cards/lists
- **Quick reference**: See meaning when linking

### Navigation & State

- Detail pages: Back button at top AND bottom
- Filter state preserved when returning to list pages
- See `01-ui-patterns.md` for details

---

## Document Index

| Document                   | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `00-overview.md`           | This file - goals, progress, cross-cutting |
| `01-ui-patterns.md`        | Section editing, collapsible, safety, nav  |
| `02-component-system.md`   | Component page occurrence analysis         |
| `03-kanji-enhancements.md` | Readings, meanings, classifications        |
| `04-vocabulary.md`         | Vocab system with kanji breakdown          |
| `05-base-components.md`    | Reka UI integration, component audit       |
| `06-task-queue.md`         | Ordered implementation tasks               |
