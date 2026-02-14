# Database Schema Reference

Complete database schema for Jisaku.

---

## Kanji Tables

### `kanjis`

Primary table storing kanji entries.

| Column                      | Type    | Constraints             | Description                 |
| --------------------------- | ------- | ----------------------- | --------------------------- |
| `id`                        | INTEGER | PRIMARY KEY             | Unique identifier           |
| `character`                 | TEXT    | NOT NULL, UNIQUE        | The kanji character         |
| `stroke_count`              | INTEGER | nullable, 1-64          | Number of strokes           |
| `short_meaning`             | TEXT    | nullable                | Brief one-line meaning      |
| `search_keywords`           | TEXT    | nullable                | Additional searchable terms |
| `radical_id`                | INTEGER | FK to components        | Reference to radical        |
| `jlpt_level`                | TEXT    | N5-N1                   | JLPT classification         |
| `joyo_level`                | TEXT    | elementary1-6/secondary | Joyo grade                  |
| `kanji_kentei_level`        | TEXT    | nullable                | Kanji Kentei level          |
| `stroke_diagram_image`      | BLOB    | nullable                | Static stroke order diagram |
| `stroke_gif_image`          | BLOB    | nullable                | Animated stroke order       |
| `notes_etymology`           | TEXT    | nullable                | Historical origins          |
| `notes_semantic`            | TEXT    | nullable                | Modern usage, compounds     |
| `notes_education_mnemonics` | TEXT    | nullable                | Japanese education notes    |
| `notes_personal`            | TEXT    | nullable                | Personal observations       |
| `identifier`                | INTEGER | nullable                | Custom user numbering       |
| `radical_stroke_count`      | INTEGER | nullable                | For 部首索引 ordering       |
| `created_at`                | TEXT    | DEFAULT now()           | Creation timestamp          |
| `updated_at`                | TEXT    | DEFAULT now()           | Last update timestamp       |

### `classification_types`

Reference table for kanji classification types.

| Column              | Type    | Constraints      | Description       |
| ------------------- | ------- | ---------------- | ----------------- |
| `id`                | INTEGER | PRIMARY KEY      | Unique identifier |
| `type_name`         | TEXT    | NOT NULL, UNIQUE | Identifier        |
| `name_japanese`     | TEXT    | nullable         | Japanese name     |
| `name_english`      | TEXT    | nullable         | English name      |
| `description`       | TEXT    | nullable         | Full description  |
| `description_short` | TEXT    | nullable         | Short description |
| `display_order`     | INTEGER | DEFAULT 0        | Display order     |

**Values:** pictograph (象形文字), ideograph (指事文字), compound_ideograph (会意文字), phono_semantic (形声文字), phonetic_loan (仮借字)

### `kanji_classifications`

Links kanji to classification types.

| Column                   | Type    | Constraints            | Description           |
| ------------------------ | ------- | ---------------------- | --------------------- |
| `id`                     | INTEGER | PRIMARY KEY            | Unique identifier     |
| `kanji_id`               | INTEGER | NOT NULL, FK to kanjis | Parent kanji          |
| `classification_type_id` | INTEGER | NOT NULL, FK to types  | Classification type   |
| `display_order`          | INTEGER | DEFAULT 0              | Order (first=primary) |

### `on_readings` / `kun_readings`

Readings tables (similar structure).

| Column          | Type    | Constraints  | Description                   |
| --------------- | ------- | ------------ | ----------------------------- |
| `id`            | INTEGER | PRIMARY KEY  | Unique identifier             |
| `kanji_id`      | INTEGER | NOT NULL, FK | Parent kanji                  |
| `reading`       | TEXT    | NOT NULL     | Reading text                  |
| `reading_level` | TEXT    | DEFAULT '小' | Grade: '小', '中', '高', '外' |
| `display_order` | INTEGER | DEFAULT 0    | Order (first=primary)         |
| `okurigana`     | TEXT    | nullable     | (kun only) Trailing kana      |

### `kanji_meanings`

Meanings table with optional reading groupings.

| Column            | Type    | Constraints  | Description           |
| ----------------- | ------- | ------------ | --------------------- |
| `id`              | INTEGER | PRIMARY KEY  | Unique identifier     |
| `kanji_id`        | INTEGER | NOT NULL, FK | Parent kanji          |
| `meaning_text`    | TEXT    | NOT NULL     | Japanese meaning text |
| `additional_info` | TEXT    | nullable     | Synonyms, examples    |
| `display_order`   | INTEGER | DEFAULT 0    | Order by frequency    |

---

## Component Tables

### `components`

Building blocks of kanji.

| Column                  | Type    | Constraints  | Description                  |
| ----------------------- | ------- | ------------ | ---------------------------- |
| `id`                    | INTEGER | PRIMARY KEY  | Unique identifier            |
| `character`             | TEXT    | NOT NULL     | Component character          |
| `stroke_count`          | INTEGER | nullable     | Stroke count                 |
| `short_meaning`         | TEXT    | nullable     | Brief meaning                |
| `search_keywords`       | TEXT    | nullable     | Searchable terms             |
| `source_kanji_id`       | INTEGER | FK to kanjis | If component is also a kanji |
| `description`           | TEXT    | nullable     | General description          |
| `can_be_radical`        | BOOLEAN | DEFAULT 0    | Can function as radical?     |
| `kangxi_number`         | INTEGER | 1-214        | Kangxi radical number        |
| `kangxi_meaning`        | TEXT    | nullable     | Kangxi radical meaning       |
| `radical_name_japanese` | TEXT    | nullable     | Japanese radical name        |

### `component_forms`

Visual variants of components (optional).

| Column           | Type    | Constraints  | Description               |
| ---------------- | ------- | ------------ | ------------------------- |
| `id`             | INTEGER | PRIMARY KEY  | Unique identifier         |
| `component_id`   | INTEGER | NOT NULL, FK | Parent component          |
| `form_character` | TEXT    | NOT NULL     | Visual shape (e.g., "氵") |
| `form_name`      | TEXT    | nullable     | Form name                 |
| `is_primary`     | BOOLEAN | DEFAULT 0    | Primary form?             |

### `position_types`

Reference table for component positions.

| Column          | Type    | Constraints      | Description       |
| --------------- | ------- | ---------------- | ----------------- |
| `id`            | INTEGER | PRIMARY KEY      | Unique identifier |
| `position_name` | TEXT    | NOT NULL, UNIQUE | Identifier        |
| `name_japanese` | TEXT    | nullable         | Japanese name     |
| `name_english`  | TEXT    | nullable         | English name      |

**Values:** hen (偏/left), tsukuri (旁/right), kanmuri (冠/top), ashi (脚/bottom), tare (垂), nyou (繞), kamae (構), other

### `component_occurrences`

Where components appear in kanji.

| Column              | Type    | Constraints     | Description                 |
| ------------------- | ------- | --------------- | --------------------------- |
| `id`                | INTEGER | PRIMARY KEY     | Unique identifier           |
| `kanji_id`          | INTEGER | NOT NULL, FK    | Kanji containing component  |
| `component_id`      | INTEGER | NOT NULL, FK    | The component               |
| `component_form_id` | INTEGER | FK to forms     | Specific form (if using)    |
| `position_type_id`  | INTEGER | FK to positions | Position type               |
| `is_radical`        | BOOLEAN | DEFAULT 0       | Is this the radical?        |
| `analysis_notes`    | TEXT    | nullable        | User analysis of occurrence |

### `component_groupings`

User-created pattern groups.

| Column              | Type    | Constraints  | Description           |
| ------------------- | ------- | ------------ | --------------------- |
| `id`                | INTEGER | PRIMARY KEY  | Unique identifier     |
| `component_id`      | INTEGER | NOT NULL, FK | Which component       |
| `component_form_id` | INTEGER | FK to forms  | Constrain to one form |
| `name`              | TEXT    | NOT NULL     | Grouping name         |
| `analysis_notes`    | TEXT    | nullable     | User insights         |

---

## Vocabulary Tables

### `vocabulary`

| Column            | Type    | Constraints      | Description       |
| ----------------- | ------- | ---------------- | ----------------- |
| `id`              | INTEGER | PRIMARY KEY      | Unique identifier |
| `word`            | TEXT    | NOT NULL, UNIQUE | The word          |
| `kana`            | TEXT    | nullable         | Reading           |
| `short_meaning`   | TEXT    | nullable         | Brief meaning     |
| `search_keywords` | TEXT    | nullable         | Searchable terms  |
| `jlpt_level`      | TEXT    | nullable         | N5-N1 or non-jlpt |
| `is_common`       | BOOLEAN | DEFAULT 0        | Common word flag  |
| `description`     | TEXT    | nullable         | Extended notes    |

### `vocab_kanji`

Links vocabulary to constituent kanji.

| Column           | Type    | Constraints  | Description                 |
| ---------------- | ------- | ------------ | --------------------------- |
| `id`             | INTEGER | PRIMARY KEY  | Unique identifier           |
| `vocab_id`       | INTEGER | NOT NULL, FK | The vocabulary              |
| `kanji_id`       | INTEGER | NOT NULL, FK | The kanji                   |
| `analysis_notes` | TEXT    | nullable     | How kanji functions in word |
| `display_order`  | INTEGER | DEFAULT 0    | Order in word               |

---

## Relationships Overview

```
kanjis
├── has one radical (radical_id → components)
├── has many component_occurrences
├── has many kanji_classifications
├── has many on_readings, kun_readings
├── has many kanji_meanings
└── appears in many vocab_kanji

components
├── may have source_kanji (→ kanjis)
├── has many component_forms (optional)
├── has many component_occurrences
└── has many component_groupings

vocabulary
├── has many vocab_kanji
```

---

## Common Queries

### Get kanji's radical

```sql
SELECT c.* FROM components c
JOIN kanjis k ON k.radical_id = c.id
WHERE k.id = ?;
```

### Find kanji using component

```sql
SELECT DISTINCT k.* FROM kanjis k
JOIN component_occurrences co ON co.kanji_id = k.id
WHERE co.component_id = ?;
```

### Get vocab containing kanji

```sql
SELECT v.* FROM vocabulary v
JOIN vocab_kanji vk ON vk.vocab_id = v.id
WHERE vk.kanji_id = ?;
```

---

## Notes for Developers

- All `analysis_notes` fields are user-entered and core to app value
- Forms are optional — create only when needed
- Groupings are flexible — one occurrence can be in multiple groups
- Reference tables (classification_types, position_types) are user-extensible
- `radical_id` + `is_radical` work together for fast/detailed radical lookup
- All timestamps in ISO 8601 format
- Uses `PRAGMA foreign_keys = ON`
