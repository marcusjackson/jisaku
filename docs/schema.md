# Jisaku Database Schema Reference

## Schema Version: 3+

This document describes the complete database schema for Jisaku, including all tables planned across phases 1-6.

---

## Table of Contents

1. [Kanji Tables](#kanji-tables)
2. [Component Tables](#component-tables)
3. [Vocabulary Tables](#vocabulary-tables)
4. [Relationships Overview](#relationships-overview)
5. [Common Query Patterns](#common-query-patterns)

---

## Kanji Tables

### `kanjis`

The primary table storing kanji entries.

| Column                      | Type    | Constraints             | Description                                |
| --------------------------- | ------- | ----------------------- | ------------------------------------------ |
| `id`                        | INTEGER | PRIMARY KEY             | Unique identifier                          |
| `character`                 | TEXT    | NOT NULL, UNIQUE        | The kanji character                        |
| `stroke_count`              | INTEGER | nullable, 1-64          | Number of strokes                          |
| `short_meaning`             | TEXT    | nullable                | Brief one-line meaning                     |
| `search_keywords`           | TEXT    | nullable                | Additional searchable terms                |
| `radical_id`                | INTEGER | FK to `components`      | Direct reference to radical (fast lookup)  |
| `jlpt_level`                | TEXT    | N5/N4/N3/N2/N1          | JLPT classification                        |
| `joyo_level`                | TEXT    | elementary1-6/secondary | Joyo grade level                           |
| `kanji_kentei_level`        | TEXT    | nullable                | Kanji Kentei level (10級-1級)              |
| `stroke_diagram_image`      | BLOB    | nullable                | Static stroke order diagram                |
| `stroke_gif_image`          | BLOB    | nullable                | Animated stroke order                      |
| `notes_etymology`           | TEXT    | nullable                | Historical origins notes                   |
| `notes_semantic`            | TEXT    | nullable                | Modern usage, compounds, semantic patterns |
| `notes_education_mnemonics` | TEXT    | nullable                | Japanese education, native mnemonics       |
| `notes_personal`            | TEXT    | nullable                | Personal observations                      |
| `identifier`                | INTEGER | nullable                | Custom user numbering                      |
| `radical_stroke_count`      | INTEGER | nullable                | Stroke count of radical (for 部首索引)     |
| `created_at`                | TEXT    | DEFAULT now()           | Creation timestamp                         |
| `updated_at`                | TEXT    | DEFAULT now()           | Last update timestamp                      |

**Indexes:**

- `idx_kanjis_character` on `character`
- `idx_kanjis_stroke_count` on `stroke_count`
- `idx_kanjis_jlpt` on `jlpt_level`
- `idx_kanjis_joyo` on `joyo_level`
- `idx_kanjis_radical_id` on `radical_id`
- `idx_kanjis_identifier` on `identifier`
- `idx_kanjis_radical_order` on `(radical_stroke_count, stroke_count - radical_stroke_count, stroke_count)`

### `classification_types`

Reference table defining kanji classification types (prepopulated, user can add/edit).

| Column              | Type    | Constraints      | Description                       |
| ------------------- | ------- | ---------------- | --------------------------------- |
| `id`                | INTEGER | PRIMARY KEY      | Unique identifier                 |
| `type_name`         | TEXT    | NOT NULL, UNIQUE | Identifier (e.g., "pictograph")   |
| `name_japanese`     | TEXT    | nullable         | Japanese name (e.g., "象形文字")  |
| `name_english`      | TEXT    | nullable         | English name (e.g., "Pictograph") |
| `description`       | TEXT    | nullable         | Full description                  |
| `description_short` | TEXT    | nullable         | Short description                 |
| `display_order`     | INTEGER | DEFAULT 0        | Display order                     |
| `created_at`        | TEXT    | DEFAULT now()    | Creation timestamp                |
| `updated_at`        | TEXT    | DEFAULT now()    | Last update timestamp             |

**Prepopulated values:**

- `pictograph` (象形文字): Pictures of physical objects
- `ideograph` (指事文字): Abstract concepts shown graphically
- `compound_ideograph` (会意文字): Combining meanings of components
- `phono_semantic` (形声文字): Meaning component + sound component
- `phonetic_loan` (仮借字): Borrowed character for sound alone

### `kanji_classifications`

Links kanji to their classification types.

| Column                   | Type    | Constraints                            | Description             |
| ------------------------ | ------- | -------------------------------------- | ----------------------- |
| `id`                     | INTEGER | PRIMARY KEY                            | Unique identifier       |
| `kanji_id`               | INTEGER | NOT NULL, FK to `kanjis`               | Parent kanji            |
| `classification_type_id` | INTEGER | NOT NULL, FK to `classification_types` | Classification type     |
| `display_order`          | INTEGER | DEFAULT 0                              | Order (first = primary) |
| `created_at`             | TEXT    | DEFAULT now()                          | Creation timestamp      |
| `updated_at`             | TEXT    | DEFAULT now()                          | Last update timestamp   |

**Index:** `idx_kanji_classifications_kanji` on `kanji_id`

**Note:** Primary classification is the first one (display_order=1). Classification analysis notes go in `kanjis.notes_etymology` field instead of per-classification notes.

### `on_readings`

On-yomi readings for kanji (multiple per kanji allowed).

| Column          | Type    | Constraints              | Description                         |
| --------------- | ------- | ------------------------ | ----------------------------------- |
| `id`            | INTEGER | PRIMARY KEY              | Unique identifier                   |
| `kanji_id`      | INTEGER | NOT NULL, FK to `kanjis` | Parent kanji                        |
| `reading`       | TEXT    | NOT NULL                 | On reading (katakana)               |
| `reading_level` | TEXT    | NOT NULL, DEFAULT '小'   | Grade level: '小', '中', '高', '外' |
| `display_order` | INTEGER | DEFAULT 0                | Display order (first = primary)     |

**Index:** `idx_on_readings_kanji` on `kanji_id`

**Note:** First reading (display_order=1) is the primary reading. No separate is_primary field.

### `kun_readings`

Kun-yomi readings for kanji (multiple per kanji allowed).

| Column          | Type    | Constraints              | Description                            |
| --------------- | ------- | ------------------------ | -------------------------------------- |
| `id`            | INTEGER | PRIMARY KEY              | Unique identifier                      |
| `kanji_id`      | INTEGER | NOT NULL, FK to `kanjis` | Parent kanji                           |
| `reading`       | TEXT    | NOT NULL                 | Kun reading (hiragana)                 |
| `okurigana`     | TEXT    | nullable                 | Trailing kana (e.g., "い" from "青い") |
| `reading_level` | TEXT    | NOT NULL, DEFAULT '小'   | Grade level: '小', '中', '高', '外'    |
| `display_order` | INTEGER | DEFAULT 0                | Display order (first = primary)        |

**Index:** `idx_kun_readings_kanji` on `kanji_id`

**Note:** First reading (display_order=1) is the primary reading. No separate is_primary field.

### `kanji_meanings`

Core meanings table. Meanings can optionally be grouped by reading.

| Column            | Type    | Constraints              | Description                        |
| ----------------- | ------- | ------------------------ | ---------------------------------- |
| `id`              | INTEGER | PRIMARY KEY              | Unique identifier                  |
| `kanji_id`        | INTEGER | NOT NULL, FK to `kanjis` | Parent kanji                       |
| `meaning_text`    | TEXT    | NOT NULL                 | Japanese meaning text              |
| `additional_info` | TEXT    | nullable                 | Synonyms, antonyms, examples       |
| `display_order`   | INTEGER | DEFAULT 0                | Order by frequency (common → rare) |

**Index:** `idx_kanji_meanings_kanji` on `kanji_id`

**Usage:**

- Order by `display_order` - most common meanings first
- Always Japanese meanings
- `additional_info` field for flexible related information
- Meanings can be grouped by reading via `kanji_meaning_reading_groups` table (optional)

### `kanji_meaning_reading_groups`

Optional reading groupings for meanings. Most kanji don't need this.

| Column          | Type    | Constraints              | Description                  |
| --------------- | ------- | ------------------------ | ---------------------------- |
| `id`            | INTEGER | PRIMARY KEY              | Unique identifier            |
| `kanji_id`      | INTEGER | NOT NULL, FK to `kanjis` | Parent kanji                 |
| `reading_text`  | TEXT    | NOT NULL                 | Reading label (e.g., "メイ") |
| `display_order` | INTEGER | DEFAULT 0                | Order of reading groups      |

**Index:** `idx_meaning_reading_groups_kanji` on `kanji_id`

**Note:** `reading_text` is free-form text input, not a foreign key to readings tables.

### `kanji_meaning_group_members`

Junction table assigning meanings to reading groups.

| Column             | Type    | Constraints                      | Description        |
| ------------------ | ------- | -------------------------------- | ------------------ |
| `id`               | INTEGER | PRIMARY KEY                      | Unique identifier  |
| `reading_group_id` | INTEGER | NOT NULL, FK to `reading_groups` | Reading group      |
| `meaning_id`       | INTEGER | NOT NULL, FK to `kanji_meanings` | Meaning            |
| `display_order`    | INTEGER | DEFAULT 0                        | Order within group |

**Indexes:**

- `idx_meaning_group_members_group` on `reading_group_id`
- `idx_meaning_group_members_meaning` on `meaning_id`

**Note:** Each meaning can only belong to one reading group. Unassigned meanings display separately.

---

## Component Tables

### `components`

Building blocks of kanji (radicals and sub-components).

| Column                  | Type    | Constraints     | Description                              |
| ----------------------- | ------- | --------------- | ---------------------------------------- |
| `id`                    | INTEGER | PRIMARY KEY     | Unique identifier                        |
| `character`             | TEXT    | NOT NULL        | Component character                      |
| `stroke_count`          | INTEGER | nullable        | Stroke count                             |
| `short_meaning`         | TEXT    | nullable        | Brief 1-3 word meaning                   |
| `search_keywords`       | TEXT    | nullable        | Additional searchable terms              |
| `source_kanji_id`       | INTEGER | FK to `kanjis`  | If component is also a kanji             |
| `description`           | TEXT    | nullable        | General description (all forms)          |
| `can_be_radical`        | BOOLEAN | DEFAULT 0       | Can this function as radical?            |
| `kangxi_number`         | INTEGER | 1-214, nullable | Kangxi radical number (reference)        |
| `kangxi_meaning`        | TEXT    | nullable        | Kangxi radical meaning                   |
| `radical_name_japanese` | TEXT    | nullable        | Japanese radical name (e.g., "さんずい") |
| `created_at`            | TEXT    | DEFAULT now()   | Creation timestamp                       |
| `updated_at`            | TEXT    | DEFAULT now()   | Last update timestamp                    |

**Indexes:**

- `idx_components_character` on `character`
- `idx_components_can_be_radical` on `can_be_radical`
- `idx_components_kangxi_number` on `kangxi_number`
- `idx_components_source_kanji_id` on `source_kanji_id`

### `component_forms`

Different visual forms of the same semantic component (OPTIONAL - create only when helpful).

| Column           | Type    | Constraints                  | Description                    |
| ---------------- | ------- | ---------------------------- | ------------------------------ |
| `id`             | INTEGER | PRIMARY KEY                  | Unique identifier              |
| `component_id`   | INTEGER | NOT NULL, FK to `components` | Parent component               |
| `form_character` | TEXT    | NOT NULL                     | Visual shape (e.g., "氵")      |
| `form_name`      | TEXT    | nullable                     | Form name (e.g., "sanzui")     |
| `description`    | TEXT    | nullable                     | Description of this form       |
| `is_primary`     | BOOLEAN | DEFAULT 0                    | One primary form per component |
| `stroke_count`   | INTEGER | nullable                     | Stroke count for this form     |
| `created_at`     | TEXT    | DEFAULT now()                | Creation timestamp             |
| `updated_at`     | TEXT    | DEFAULT now()                | Last update timestamp          |

**Index:** `idx_component_forms_component_id` on `component_id`

**Examples:**

- Component 水: Form 1 (水, standard), Form 2 (氵, sanzui)
- Component 人: Form 1 (人, standard), Form 2 (亻, ninben)

### `position_types`

Reference table defining component position types (prepopulated, user can add/edit).

| Column              | Type    | Constraints      | Description                      |
| ------------------- | ------- | ---------------- | -------------------------------- |
| `id`                | INTEGER | PRIMARY KEY      | Unique identifier                |
| `position_name`     | TEXT    | NOT NULL, UNIQUE | Identifier (e.g., "hen")         |
| `name_japanese`     | TEXT    | nullable         | Japanese name (e.g., "偏")       |
| `name_english`      | TEXT    | nullable         | English name (e.g., "Left side") |
| `description`       | TEXT    | nullable         | Full description                 |
| `description_short` | TEXT    | nullable         | Short description                |
| `display_order`     | INTEGER | DEFAULT 0        | Display order                    |
| `created_at`        | TEXT    | DEFAULT now()    | Creation timestamp               |
| `updated_at`        | TEXT    | DEFAULT now()    | Last update timestamp            |

**Prepopulated values:**

- `hen` (偏): Left side
- `tsukuri` (旁): Right side
- `kanmuri` (冠): Crown/Top
- `ashi` (脚): Legs/Bottom
- `tare` (垂): Hanging (top-left enclosure)
- `nyou` (繞): Enclosure (bottom-left)
- `kamae` (構): Enclosure (full)
- `other` (その他): Does not fit standard positions

### `component_occurrences`

Each row = one appearance of a component in a kanji.

| Column              | Type    | Constraints                  | Description                                     |
| ------------------- | ------- | ---------------------------- | ----------------------------------------------- |
| `id`                | INTEGER | PRIMARY KEY                  | Unique identifier                               |
| `kanji_id`          | INTEGER | NOT NULL, FK to `kanjis`     | Kanji containing this component                 |
| `component_id`      | INTEGER | NOT NULL, FK to `components` | The component                                   |
| `component_form_id` | INTEGER | FK to `component_forms`      | Specific form (if using forms)                  |
| `position_type_id`  | INTEGER | FK to `position_types`       | Position type (hen, tsukuri, etc.)              |
| `is_radical`        | BOOLEAN | DEFAULT 0                    | Is this occurrence the radical?                 |
| `analysis_notes`    | TEXT    | nullable                     | **User's analysis of THIS specific occurrence** |
| `created_at`        | TEXT    | DEFAULT now()                | Creation timestamp                              |
| `updated_at`        | TEXT    | DEFAULT now()                | Last update timestamp                           |

**Indexes:**

- `idx_occurrences_kanji` on `kanji_id`
- `idx_occurrences_component` on `component_id`
- `idx_occurrences_form` on `component_form_id`
- `idx_occurrences_position` on `position_type_id`
- `idx_occurrences_is_radical` on `is_radical`

**Position Types Explained:**

For detailed position type definitions, see [`position_types`](#position_types) table.

Examples by position:

- `hen` (偏): 泳 — 氵 on left side
- `tsukuri` (旁): 朝 — 月 on right side
- `kanmuri` (冠): 家 — 宀 on top
- `ashi` (脚): 熱 — 灬 on bottom
- `tare` (垂): 店 — 广 top-left enclosure
- `nyou` (繞): 道 — 辶 bottom-left enclosure
- `kamae` (構): 国 — 囗 full enclosure
- `other`: Doesn't fit standard positions

### `component_groupings`

User-created groups for manual pattern analysis.

| Column              | Type    | Constraints                  | Description                                 |
| ------------------- | ------- | ---------------------------- | ------------------------------------------- |
| `id`                | INTEGER | PRIMARY KEY                  | Unique identifier                           |
| `component_id`      | INTEGER | NOT NULL, FK to `components` | Which component                             |
| `component_form_id` | INTEGER | FK to `component_forms`      | Optional: constrain to one form             |
| `name`              | TEXT    | NOT NULL                     | Grouping name (e.g., "Left-side positions") |
| `analysis_notes`    | TEXT    | nullable                     | **User's insights about this grouping**     |
| `display_order`     | INTEGER | DEFAULT 0                    | Display order                               |
| `created_at`        | TEXT    | DEFAULT now()                | Creation timestamp                          |
| `updated_at`        | TEXT    | DEFAULT now()                | Last update timestamp                       |

**Indexes:**

- `idx_groupings_component` on `component_id`
- `idx_groupings_form` on `component_form_id`

**Notes:**

- `component_form_id` nullable = group can span multiple forms
- `component_form_id` set = group constrained to one form

### `component_grouping_members`

Junction table linking occurrences to groupings (many-to-many).

| Column          | Type    | Constraints                                            | Description        |
| --------------- | ------- | ------------------------------------------------------ | ------------------ |
| `grouping_id`   | INTEGER | PRIMARY KEY (composite), FK to `component_groupings`   | The grouping       |
| `occurrence_id` | INTEGER | PRIMARY KEY (composite), FK to `component_occurrences` | The occurrence     |
| `display_order` | INTEGER | DEFAULT 0                                              | Order within group |

**Indexes:**

- `idx_grouping_members_grouping` on `grouping_id`
- `idx_grouping_members_occurrence` on `occurrence_id`

**Important:** One occurrence can be in multiple groups.

### `component_reading_contributions` (Not Implemented)

Phonetic component contribution tracking is not currently implemented. Users can document phonetic analysis in `component_occurrences.analysis_notes` instead. May be added in a future version if needed.

---

## Vocabulary Tables

### `vocabulary`

Vocabulary entries.

| Column            | Type    | Constraints      | Description                  |
| ----------------- | ------- | ---------------- | ---------------------------- |
| `id`              | INTEGER | PRIMARY KEY      | Unique identifier            |
| `word`            | TEXT    | NOT NULL, UNIQUE | The word (e.g., "水泳")      |
| `kana`            | TEXT    | nullable         | Reading (e.g., "すいえい")   |
| `short_meaning`   | TEXT    | nullable         | Brief one-line meaning       |
| `search_keywords` | TEXT    | nullable         | Additional searchable terms  |
| `jlpt_level`      | TEXT    | nullable         | N5/N4/N3/N2/N1/non-jlpt      |
| `is_common`       | BOOLEAN | DEFAULT 0        | User's common word flag      |
| `description`     | TEXT    | nullable         | General notes about the word |
| `created_at`      | TEXT    | DEFAULT now()    | Creation timestamp           |
| `updated_at`      | TEXT    | DEFAULT now()    | Last update timestamp        |

**Index:** `idx_vocabulary_word` on `word`

**Notes:**

- `kana` is nullable for flexibility
- `jlpt_level` includes "non-jlpt" option for non-JLPT vocabulary

### `vocab_kanji`

Links vocabulary to constituent kanji with analysis.

| Column           | Type    | Constraints                  | Description                                        |
| ---------------- | ------- | ---------------------------- | -------------------------------------------------- |
| `id`             | INTEGER | PRIMARY KEY                  | Unique identifier                                  |
| `vocab_id`       | INTEGER | NOT NULL, FK to `vocabulary` | The vocabulary                                     |
| `kanji_id`       | INTEGER | NOT NULL, FK to `kanjis`     | The kanji                                          |
| `analysis_notes` | TEXT    | nullable                     | **User's analysis of how kanji functions in word** |
| `display_order`  | INTEGER | DEFAULT 0                    | Order in word                                      |
| `created_at`     | TEXT    | DEFAULT now()                | Creation timestamp                                 |
| `updated_at`     | TEXT    | DEFAULT now()                | Last update timestamp                              |

**Indexes:**

- `idx_vocab_kanji_vocab` on `vocab_id`
- `idx_vocab_kanji_kanji` on `kanji_id`
- `UNIQUE(vocab_id, kanji_id)`

**Notes:**

- Analysis of how each kanji functions in the word can be documented in `analysis_notes`

---

## Relationships Overview

```
kanjis
├── has one radical (radical_id → components)
├── has many component_occurrences
├── has many kanji_classifications
├── has many on_readings
├── has many kun_readings
└── appears in many vocab_kanji

components
├── may have source_kanji (source_kanji_id → kanjis)
├── has many component_forms (optional)
├── has many component_occurrences
└── has many component_groupings

component_occurrences
├── belongs to kanji
├── belongs to component
├── may belong to component_form
└── may be in many component_grouping_members

vocabulary
├── has many vocab_kanji
└── has many vocab_meanings

vocab_kanji
├── belongs to vocabulary
├── belongs to kanji
└── has many vocab_kanji_readings
```

---

## Common Query Patterns

### Get kanji's radical (fast)

```sql
SELECT c.* FROM components c
JOIN kanjis k ON k.radical_id = c.id
WHERE k.id = ?;
```

### Get radical's detailed occurrence info

```sql
SELECT co.* FROM component_occurrences co
WHERE co.kanji_id = ? AND co.is_radical = 1;
```

### Find all kanji using component X as radical

```sql
SELECT k.* FROM kanjis k
WHERE k.radical_id = ?;
```

### Find all kanji where component X appears (radical or not)

```sql
SELECT DISTINCT k.* FROM kanjis k
JOIN component_occurrences co ON co.kanji_id = k.id
WHERE co.component_id = ?;
```

### Get all occurrences of a component form

```sql
SELECT k.character, co.position, co.is_radical, co.analysis_notes
FROM component_occurrences co
JOIN kanjis k ON k.id = co.kanji_id
WHERE co.component_form_id = ?
ORDER BY k.character;
```

### Get all groupings for a component

```sql
SELECT cg.*, COUNT(cgm.occurrence_id) as member_count
FROM component_groupings cg
LEFT JOIN component_grouping_members cgm ON cgm.grouping_id = cg.id
WHERE cg.component_id = ?
GROUP BY cg.id
ORDER BY cg.display_order;
```

### Get occurrences in a grouping

```sql
SELECT k.character, co.position, co.analysis_notes
FROM component_grouping_members cgm
JOIN component_occurrences co ON co.id = cgm.occurrence_id
JOIN kanjis k ON k.id = co.kanji_id
WHERE cgm.grouping_id = ?
ORDER BY cgm.display_order;
```

### Get all vocab containing a kanji

```sql
SELECT v.word, v.reading_hiragana, vk.analysis_notes
FROM vocab_kanji vk
JOIN vocabulary v ON v.id = vk.vocab_id
WHERE vk.kanji_id = ?
ORDER BY v.is_common DESC, v.frequency_rank ASC;
```

### Find components that can be radicals but never are

```sql
SELECT c.* FROM components c
WHERE c.can_be_radical = 1
AND c.id NOT IN (
    SELECT radical_id FROM kanjis WHERE radical_id IS NOT NULL
);
```

### Find components with multiple forms

```sql
SELECT c.character, COUNT(cf.id) as form_count
FROM components c
JOIN component_forms cf ON cf.component_id = c.id
GROUP BY c.id
HAVING form_count > 1;
```

---

## Migration History

1. **001-initial.sql**: Initial schema - kanjis, components, kanji_components
2. **002-note-categories.sql**: Split notes into etymology/semantic/education_mnemonics/personal
3. **003-component-overhaul.sql**: Component forms, per-occurrence analysis, groupings, position_types reference table
4. **004-add-kentei-level.sql**: Added kanji_kentei_level to kanjis table
5. **005-short-meaning.sql**: Added short_meaning to kanjis and components
6. **006-component-search-keywords.sql**: Added search_keywords to components
7. **007-kanji-search-keywords.sql**: Added search_keywords to kanjis
8. **008-nullable-stroke-count.sql**: Made stroke_count nullable on kanjis
9. **009-component-nullable-stroke-count.sql**: Made stroke_count nullable on components
10. **010-non-jlpt-joyo.sql**: Added non-jlpt option to jlpt_level constraint
11. **011-readings.sql**: on_readings and kun_readings tables
12. **012-meanings.sql**: kanji_meanings, kanji_meaning_reading_groups, kanji_meaning_group_members tables
13. **013-classifications-system.sql**: classification_types and kanji_classifications tables
14. **014-component-forms.sql**: component_forms table (visual variants)
15. **015-component-groupings.sql**: component_groupings and component_grouping_members tables
16. **016-vocabulary-system.sql**: vocabulary and vocab_kanji tables

---

## Notes for Developers

- All `analysis_notes` fields are user-entered and core to app value proposition
- **Forms are optional** — don't force users to create them; create only when needed
- **Groupings are flexible** — one occurrence can be in multiple groups simultaneously
- **Reference tables are user-extensible** — classification_types and position_types prepopulated but users can add custom values
- `radical_id` on kanjis + `is_radical` on occurrences work together:
  - `radical_id` provides fast lookup of a kanji's radical
  - `is_radical` on component_occurrences marks which occurrence is the radical
- **Manual curation only** — no auto-population, no bulk imports (by design)
- All timestamps in ISO 8601 format via SQLite `datetime('now')`
- Uses `PRAGMA foreign_keys = ON` for referential integrity
