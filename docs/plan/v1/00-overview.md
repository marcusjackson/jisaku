# V1 Feature Plan - Overview

Personal, offline-first PWA for researching and documenting kanji. This document covers V1 features beyond the MVP foundation.

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

## Entity Ownership Model

Each feature is **owned** by one entity page. Other pages may link to it but cannot edit the deep analysis.

| Feature               | Owned By       | Linked From    | What Links Show           |
| --------------------- | -------------- | -------------- | ------------------------- |
| Kanji readings        | Kanji page     | —              | —                         |
| Kanji meanings        | Kanji page     | —              | —                         |
| Kanji classifications | Kanji page     | —              | —                         |
| Component occurrences | Component page | Kanji page     | Basic info, position      |
| Occurrence analysis   | Component page | —              | —                         |
| Component forms       | Component page | —              | —                         |
| Vocab kanji breakdown | Vocab page     | Kanji page     | Linked list with readings |
| Kanji in vocab        | Vocab page     | Component page | Where component appears   |

**Implication:** When you want to analyze "how 日 functions across all kanji", you go to the 日 component page, not to each individual kanji.

---

## Cross-Cutting Concerns

### Display and Search Fields

All three entities have two text fields for multilingual flexibility:

- **`short_meaning TEXT`**: Visible label in cards/lists/headers. User chooses language (Japanese, English, etc.)
- **`search_keywords TEXT`**: Additional search terms. Automatically included in searches via SQL concatenation

Example: Display might be "明るい" while search_keywords adds "bright, light, illumination" for English queries.

**Editing Location:** Both fields edited via header Edit button, not in separate Display & Search section.

**Implementation Status:**

- ✅ Kanji: Both fields implemented
- ✅ Components: Both fields implemented
- ⬜ Vocabulary: Planned

### No Cross-Module Imports

Modules cannot import from each other. Use `shared/` for multi-module code:

```typescript
// ❌ WRONG
import { KanjiCard } from '@/modules/kanji/components/KanjiCard.vue'
// in modules/components/...

// ✅ CORRECT
import { SharedCardSubEntity } from '@/shared/components/SharedCardSubEntity.vue'
```

### Navigation & State Preservation

- Detail pages: Back button at **top AND bottom**
- Filter state preserved when returning to list pages (via URL query params)
- Browser back vs explicit back button both work correctly

See `02-ui-patterns.md` for details.

---

## Information Hierarchy

All entity pages follow a consistent top-to-bottom information flow:

1. **Identity & Core Attributes** — Who/what this entity is (header + basic info)
2. **Linguistic Data** — Readings, meanings, phonetics (kanji, vocab)
3. **Structural Analysis** — Components, breakdowns, forms
4. **Relationships** — Links to other entities
5. **Reference Materials** — Images, diagrams, examples
6. **User Notes & Analysis** — Personal observations, research notes

This order is applied consistently across kanji, component, and vocabulary pages. See `01-page-organization.md` for specific section orders.

---

## V1 vs MVP

### MVP (Shipped)

- Basic CRUD for kanji and components
- List/search pages with filters
- Component linking with position metadata
- Notes fields (etymology, semantic, education, personal)
- SQLite database via sql.js
- Offline-first PWA

### V1 (This Plan)

- Readings system (on/kun with primary/common flags)
- Meanings system (ordered, with related kanji, tied to readings)
- Classifications system (pictograph, ideograph, etc.)
- Component forms (visual variants like 氵 vs 水)
- Component groupings (user-defined pattern analysis)
- Vocabulary system (word management with kanji breakdown)
- Unified entity page organization with SharedSection components
- Enhanced search (short_meaning + search_keywords)
- Improved navigation and safety patterns

---

## Design Decisions

### Header Editing Pattern

**Decision:** Character, short_meaning, and search_keywords are edited via the header Edit button, which opens a form. These fields are NOT in a separate "Display & Search" section.

**Rationale:** These are identity-level attributes that define what the entity is. Keeping them in the header emphasizes their importance and avoids duplicate editing surfaces.

**Applies to:** All entities (Kanji, Component, Vocabulary)

### Radical Linking on Kanji

**Decision:** Radical can be set via Basic Information section on the kanji page. Setting a radical automatically creates a component occurrence with `is_radical=true`.

**Rationale:** Provides a convenient shortcut while maintaining the component-occurrence relationship model. Users don't need to separately add the component and then mark it as radical.

**Applies to:** Kanji page only

### Classification Badge Display

**Decision:** Classification badge displays in Basic Information section only (header remains clean). On list cards, classification badge is shown; JLPT and Joyo grades are hidden in favor of the classification badge. Kentei level remains visible on list cards.

**Rationale:** Keeps header minimal while promoting the most useful classification info in lists. Classification is more specific and educational than generic level indicators.

**Applies to:** Kanji entity

### Notes Section Organization

**Decision:** Four separate note sections: Etymology, Semantic Analysis, Education & Mnemonics, Personal Notes. Order follows research workflow (origins → modern usage → teaching → personal).

**Rationale:** Clear categorization makes note-taking intentional and helps organize research by purpose.

**Applies to:** Kanji page; other entities have simpler note structures

### Collapsible Section Usage

**Decision:** Collapsible is reserved for sections that can become lengthy:

- Occurrence lists (component page)
- Notes/analysis fields (all entities)
- Kanji breakdown (vocab page)
- Stroke order diagrams (kanji page)

Basic info, readings, and short lists are NOT collapsible.

**Rationale:** Don't hide important information by default. Collapsible is a tool for managing vertical space when content is long, not a universal pattern.

**Applies to:** All entities

---

## Document Index

| Document                  | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| `00-overview.md`          | This file - philosophy, ownership, decisions  |
| `01-page-organization.md` | Unified page structure for all three entities |
| `02-ui-patterns.md`       | Editing patterns, collapsible, safety, nav    |
| `03-kanji-system.md`      | Readings, meanings, classifications           |
| `04-component-system.md`  | Occurrences, forms, groupings                 |
| `05-vocabulary-system.md` | Vocab structure, kanji breakdown              |
| `06-base-components.md`   | UI component requirements                     |

---

## Quick Reference: Edit Locations

| What                       | Where to Edit             | Edit Mode |
| -------------------------- | ------------------------- | --------- |
| Character/word             | Header Edit button        | Form      |
| Short meaning              | Header Edit button        | Form      |
| Search keywords            | Header Edit button        | Form      |
| Basic info (strokes, etc.) | Basic Information section | Inline    |
| Readings (kanji)           | Readings section          | Inline    |
| Meanings (kanji)           | Meanings section          | Inline+   |
| Components (on kanji)      | Components section        | Dialog    |
| Occurrences (on component) | Appears in Kanji section  | Inline    |
| Kanji breakdown (on vocab) | Kanji Breakdown section   | Inline    |
| Notes                      | Respective note section   | Inline    |
| Stroke diagrams            | Stroke Order section      | Inline    |
| Forms (component)          | Forms section             | Dialog    |
| Groupings (component)      | Groupings section         | Dialog    |

---

## Implementation Phases

V1 features will be implemented in phases:

- **Phase 4.5:** Refactor existing pages to use SharedSection components
- **Phase 5:** Readings system (kanji)
- **Phase 6:** Meanings system and classifications (kanji)
- **Phase 7:** Component forms and groupings
- **Phase 8:** Vocabulary system

Task queue and detailed implementation guidance are tracked separately.
