# Post-MVP Implementation Plan

## Overview

This document outlines the implementation plan for Jisaku's post-MVP features, focusing on three core pillars: enhanced component system, readings analysis, and vocabulary system.

---

## Phase 1: Component System Overhaul (PRIORITY)

### Goals

- Support optional component forms (e.g., 水 vs ζ°΅)
- Enable per-occurrence analysis for each component appearance in kanji
- Allow manual groupings for pattern analysis
- Track position metadata (hen, tsukuri, etc.)
- Distinguish radical occurrences from non-radical occurrences

### Database Changes (Migration 003)

#### Enhanced Kanjis Table

**Split cultural notes:**

- Drop `notes_cultural`
- Add `notes_semantic` (modern usage, compounds, semantic patterns)
- Add `notes_education_mnemonics` (Japanese education, native mnemonics)
- Migrate existing `notes_cultural` → `notes_semantic`

**Add sorting/ordering fields:**

- `identifier` (INTEGER, nullable) - custom user numbering
- `radical_stroke_count` (INTEGER, nullable) - for 部首索引 sorting
- Restore `radical_id` (FK to components) - fast radical lookup

**Indexes:**

- `idx_kanjis_identifier`
- `idx_kanjis_radical_order` on `(radical_stroke_count, stroke_count - radical_stroke_count, stroke_count)`

#### Reference Tables (Prepopulated)

**classification_types**

- Purpose: Define kanji classification types
- Fields: `type_name`, `name_japanese`, `name_english`, `description`, `description_short`
- Prepopulated: pictograph, ideograph, compound_ideograph, phono_semantic
- User can add/edit/delete custom types

**position_types**

- Purpose: Define component position types
- Fields: `position_name`, `name_japanese`, `name_english`, `description`, `description_short`
- Prepopulated: hen, tsukuri, kanmuri, ashi, tare, nyou, kamae, other
- User can add/edit/delete custom types

#### New Tables

**component_forms** (optional - create only when helpful)

- Links to: `components`
- Purpose: Represent different visual forms of same semantic component
- Key fields:
  - `component_id` (FK to components)
  - `form_character` (e.g., "ζ°΅")
  - `form_name` (e.g., "sanzui", "three-stroke variant")
  - `description` (form-specific explanation)
  - `is_primary` (one primary form per component)

**component_occurrences** (replaces `kanji_components`)

- Links to: `kanjis`, `components`, `component_forms` (optional), `position_types`
- Purpose: Each row = one appearance of component in a kanji
- Key fields:
  - `kanji_id`, `component_id` (required)
  - `component_form_id` (nullable - specify if using forms)
  - `position_type_id` (FK to position_types - instead of enum)
  - `is_radical` (boolean - marks if this occurrence is the radical)
  - `analysis_notes` (user's observations about THIS specific occurrence)

**component_groupings**

- Links to: `components`, `component_forms` (optional)
- Purpose: User-created groups for pattern analysis
- Key fields:
  - `component_id` (required - which component)
  - `component_form_id` (nullable - can group across forms or within one)
  - `name` (e.g., "Left-side positions")
  - `analysis_notes` (insights about this grouping)

**component_grouping_members** (junction)

- Links groupings to occurrences (many-to-many)
- One occurrence can be in multiple groups

#### Modified Tables

**components**

- Add fields:
  - `can_be_radical` (boolean)
  - `kangxi_number` (integer, nullable, 1-214)
  - `kangxi_meaning` (text, nullable - for reference)
  - `radical_name_japanese` (text, e.g., "さんずい")
- Rename: `description_short` → `description`

**kanjis**

- Restore from MVP: `radical_id` (FK to components)
- This provides fast "what is this kanji's radical?" lookup

#### Data Migration

- Migrate existing `kanji_components` data to `component_occurrences`
- Drop `kanji_components` table after migration

### UI Components to Build

#### 1. Component Detail Page Redesign

**Structure:**

```
Component: 水
├── General description (applies to all forms)
├── Component metadata (source kanji link, radical info)
├── Forms section (optional - tabs/pills)
│   ├── Form: 水 (standard)
│   │   ├── Form description
│   │   ├── Occurrences list (paginated: "Showing 10 of 47")
│   │   │   └── Each occurrence: kanji, position, radical flag, analysis notes
│   │   └── Groupings for this form
│   └── Form: ζ°΅ (sanzui)
│       └── [same structure]
└── Overall groupings (across forms)
```

**Features:**

- Inline editing of per-occurrence analysis notes
- Pagination for long occurrence lists ("Show More" button)
- Visual kanji grid (clickable)
- Position badges (hen, tsukuri, etc.)
- Radical indicator icon/badge

#### 2. Component Forms Management

**Create/Edit Form Dialog:**

- Form character input
- Form name (e.g., "sanzui")
- Description field
- Mark as primary checkbox
- Stroke count

#### 3. Manual Groupings UI

**Create Grouping:**

- Grouping name input
- Select component (if creating from component page, pre-filled)
- Optional: select specific form to constrain grouping
- Description/analysis field

**Add Occurrences to Grouping:**

- Option A: Combobox/dropdown to select kanji
- Option B: Visual grid of kanji to click/tap
- Display grouped occurrences as tags or kanji characters
- X button to remove from group

**Display Groupings:**

- Expandable sections
- "Members: 泳, 洋, 海... (12)" with expand to see all
- Edit/Delete grouping buttons

#### 4. Component List Page Enhancements

**New Filters:**

- "Can be radical" toggle
- "Never appears as radical" toggle
- "Always appears as radical" toggle
- Stroke count range

**New Sort Options:**

- By Japanese radical name (reading)
- By Kangxi number
- By number of occurrences

### Implementation Order

1. **Database Migration 003**
   - Write migration SQL
   - Test migration on seed data
   - Ensure data integrity (all existing kanji_components migrate correctly)

2. **Update Database Service Layer**
   - CRUD operations for component_forms
   - CRUD operations for component_occurrences
   - CRUD operations for component_groupings
   - Query helpers for common patterns

3. **Component Detail Page - Basic Structure**
   - Display general component info
   - Show forms (if any exist)
   - List occurrences under each form
   - Pagination for occurrences

4. **Per-Occurrence Analysis**
   - Inline editing of analysis_notes
   - Position dropdown/selector
   - Radical flag toggle
   - Link to kanji detail

5. **Forms Management**
   - Create/edit form dialog
   - Link form to component
   - Display forms on component page

6. **Manual Groupings**
   - Create grouping UI
   - Add occurrences to grouping
   - Display groupings
   - Edit/delete groupings

7. **Component List Filters**
   - Radical filters
   - Enhanced sort options

### Testing Considerations

- Test with component with many occurrences (水 appears in 100+ kanji)
- Test with component with multiple well-defined forms (人 → 人/亻)
- Test with component with fuzzy form boundaries (月/肉 ambiguity)
- Test grouping across forms
- Test occurrence in multiple groups simultaneously

### Open Questions to Resolve During Implementation

1. Should form creation be part of component creation flow, or always done separately?
2. How to handle bulk position assignment (e.g., "mark all these as 'hen'")?
3. Should there be quick-add grouping from occurrence list?
4. Maximum occurrences to show before pagination kicks in?

---

## Phase 2: Readings System

### Goals

- Support multiple on-yomi per kanji
- Support multiple kun-yomi per kanji
- Mark primary/common readings
- Enable reading-component contribution analysis
- Track which readings appear in which vocab

### Database Changes (Migration 004)

#### New Tables

**on_readings**

- Links to: `kanjis`
- Key fields:
  - `kanji_id` (FK)
  - `reading` (e.g., "スイ", "セイ")
  - `is_primary`, `is_common` (booleans)
  - `notes` (which vocab uses this, origin info)
  - `display_order`

**kun_readings**

- Links to: `kanjis`
- Key fields:
  - `kanji_id` (FK)
  - `reading` (e.g., "みず", "あお")
  - `okurigana` (e.g., "い" from "青い")
  - `is_primary`, `is_common` (booleans)
  - `notes`
  - `display_order`

**component_reading_contributions** (advanced)

- Links to: `component_occurrences`, `on_readings`, `kun_readings`
- Purpose: Track phonetic component analysis
- Key fields:
  - `component_occurrence_id` (FK)
  - `on_reading_id` (FK, nullable)
  - `kun_reading_id` (FK, nullable)
  - `contribution_type` (enum: provides_sound, influences_sound, no_contribution)
  - `analysis_notes`

### UI Components to Build

#### 1. Kanji Detail Page - Readings Section

- Display all on-yomi (primary marked)
- Display all kun-yomi with okurigana
- Add/edit/delete readings
- Reorder readings
- Mark primary reading

#### 2. Reading Input Components

- On-yomi input (katakana validation)
- Kun-yomi input (hiragana validation)
- Okurigana input (separate field)
- Primary/common checkboxes

#### 3. Component-Reading Analysis (Later Phase)

- On component detail page: "Provides these readings in N kanji"
- Link component occurrence to reading
- Analysis notes for contribution

### Implementation Order

1. Database Migration 004
2. Basic readings CRUD (on-yomi, kun-yomi)
3. Readings display on kanji detail page
4. Readings edit UI
5. (Later) Component reading contribution tracking

---

## Phase 3: Vocabulary System

### Goals

- Basic vocab entries with readings
- Link vocab to constituent kanji
- Analyze how kanji function in vocab
- Track which readings are used in which vocab
- Multiple meanings per vocab

### Database Changes (Migration 005)

#### New Tables

**vocabulary**

- Key fields:
  - `word` (e.g., "水泳")
  - `reading_hiragana` (e.g., "すいえい")
  - `jlpt_level` (nullable)
  - `frequency_rank` (nullable)
  - `is_common` (user's personal flag)
  - `description` (general notes)

**vocab_kanji** (junction with analysis)

- Links to: `vocabulary`, `kanjis`
- Key fields:
  - `vocab_id`, `kanji_id`
  - `kanji_role` (optional: meaning_bearer, sound_bearer, both, decorative)
  - `analysis_notes` (how this kanji functions in this word)
  - `display_order`

**vocab_kanji_readings** (advanced)

- Links to: `vocab_kanji`, `on_readings`, `kun_readings`
- Purpose: Track which reading is used
- Key fields:
  - `vocab_kanji_id` (FK)
  - `on_reading_id` (FK, nullable)
  - `kun_reading_id` (FK, nullable)
  - `analysis_notes`

**vocab_meanings**

- Links to: `vocabulary`
- Key fields:
  - `vocab_id` (FK)
  - `meaning` (translation/definition)
  - `language` (default 'en')
  - `display_order`

### UI Components to Build

#### 1. Vocabulary List Page

- Grid/list of vocab entries
- Search and filter
- JLPT level filter
- "Common" filter

#### 2. Vocabulary Detail Page

- Word and reading display
- Linked kanji (with analysis)
- Meanings list
- Link to kanji detail pages

#### 3. Vocabulary Create/Edit Form

- Word input
- Reading input (hiragana validation)
- JLPT level selector
- Common flag checkbox
- Description field
- Link kanji (with inline analysis)
- Add meanings

#### 4. Kanji Detail Page - Vocab Section

- "Appears in these vocab" section
- Display linked vocab
- Click to navigate to vocab detail

### Implementation Order

1. Database Migration 005
2. Basic vocab CRUD (start with: word, reading, description only)
3. Vocab list and detail pages
4. Link vocab to kanji (junction table)
5. Display vocab on kanji pages
6. Add meanings system
7. (Later) Vocab-kanji-reading tracking
8. (Later) kanji_role field (only if useful after usage)

### Simplified Phase 3A: Minimal Viable Vocab

Start with bare minimum:

- `vocabulary` table: word, reading, description only
- Vocab list page
- Vocab detail page
- Create/edit form

**Then iterate:**

- Add vocab-kanji linking
- Add meanings
- Add reading tracking
- Add role analysis

---

## Phase 4: Additional Kanji Metadata

### kanji_meanings Table (NEW - from legacy schema review)

- `kanji_id`, `meaning_text`, `language`, `display_order`, `reading_context`, `notes`
- Multiple meanings per kanji, ordered by frequency
- Language: 'ja' (Japanese) or 'en' (English)
- Optional: link to specific on_reading_id or kun_reading_id for reading-specific meanings
- UI: Ordered list on kanji detail, create/edit/reorder on kanji form

### kanji_meaning_related_kanji (NEW - 類/対 similar/opposite)

- Links meanings to related kanji (similar or opposite in meaning)
- `meaning_id`, `related_kanji_id`, `relationship_type` (similar/opposite)

### kanji_classifications Table

- `kanji_id`, `classification_type`, `is_primary`, `notes`
- Classification types: pictograph, ideograph, compound_ideograph, phono_semantic
- UI: Multi-select on kanji edit form

### kanji_kentei_level Field

- Add to `kanjis` table
- Dropdown selector (10級, 9級, etc.)
- Filter on list page

---

## Phase 5: Navigation & Polish

### Bottom Navigation

- Home (stats, highlights, recent entries)
- Kanji (list page)
- Components (list page)
- Vocab (list page)
- Settings

### Home Page Features

- Statistics dashboard (total kanji, components, vocab)
- Recent entries (last 10 edited)
- "Remember this" random highlights
- Progress tracking (optional: by JLPT level, joyo grade)

### Search Enhancements

- Global search across all content types
- Search within analysis notes
- Component occurrence search
- Full-text search

### Cross-Navigation

- Quick-add component from kanji page
- Bidirectional "see also" links
- Breadcrumb navigation
- "View as component" button on kanji pages (if kanji is also a component)

---

## General Implementation Principles

1. **Manual curation over automation** - No auto-generation, user adds everything
2. **Flexible over prescriptive** - Optional fields, optional forms, user-defined groupings
3. **Analysis-focused** - Every relationship has space for user notes
4. **Progressive disclosure** - Start simple, add complexity as needed
5. **Offline-first** - All features work without internet
6. **Portable data** - SQLite file, exportable, importable

---

## Migration Testing Checklist

Before deploying any migration:

- [ ] Export current database
- [ ] Run migration on copy
- [ ] Verify data integrity (counts match)
- [ ] Test queries work as expected
- [ ] Test rollback (if possible)
- [ ] Backup before applying to production
- [ ] Test on mobile PWA (IndexedDB persistence)

---

## Notes for AI Assistants Working on This Codebase

- User prefers Vue 3 Composition API with `<script setup>`
- TypeScript with full type safety
- Database: sql.js (SQLite in WebAssembly)
- UI: Reka UI headless components + custom base components
- Forms: vee-validate + zod schemas
- User is manually curating everything - no pre-populated data
- Analysis notes fields are core to the app's value proposition
- User values slow, deliberate data entry as part of learning process
