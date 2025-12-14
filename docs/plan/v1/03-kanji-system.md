# V1 Kanji System

Readings, meanings, and classifications—all fully managed on the kanji page.

---

## Kanji-Specific Sections

Beyond basic info and components, kanji pages have linguistic and classification systems:

| Section               | Purpose                                         | Collapsible |
| --------------------- | ----------------------------------------------- | ----------- |
| Readings              | On-yomi and kun-yomi with metadata              | No          |
| Meanings              | Ordered meanings with related kanji             | No          |
| Classifications       | Character formation type (phono-semantic, etc.) | No          |
| Etymology Notes       | Historical origins, character development       | Yes         |
| Semantic Analysis     | Modern usage patterns, compound meanings        | Yes         |
| Education & Mnemonics | Japanese education methods, mnemonics           | Yes         |
| Personal Notes        | User's own observations and research            | Yes         |

**Note:** Classifications display in Basic Information section as a badge, not as a separate section. Notes sections are categorized for different research purposes.

---

## Readings System

### Data Model

**on_readings**

| Field         | Type    | Notes                            |
| ------------- | ------- | -------------------------------- |
| id            | INTEGER | Primary key                      |
| kanji_id      | INTEGER | Foreign key to kanjis            |
| reading       | TEXT    | Katakana only (メイ, ミョウ)     |
| is_primary    | BOOLEAN | Primary reading for this kanji   |
| is_common     | BOOLEAN | Commonly used reading            |
| notes         | TEXT    | Usage notes, example words       |
| display_order | INTEGER | Order for display (lowest first) |

**kun_readings**

| Field         | Type    | Notes                                |
| ------------- | ------- | ------------------------------------ |
| id            | INTEGER | Primary key                          |
| kanji_id      | INTEGER | Foreign key to kanjis                |
| reading       | TEXT    | Hiragana only (あ.かり)              |
| okurigana     | TEXT    | Hiragana after dot (ri from あ.かり) |
| is_primary    | BOOLEAN | Primary reading for this kanji       |
| is_common     | BOOLEAN | Commonly used reading                |
| notes         | TEXT    | Usage notes, example words           |
| display_order | INTEGER | Order for display (lowest first)     |

### Display

```
Readings                                    [Edit]
─────────────────────────────────────────────────
On-yomi:
  メイ ★ common
  ミョウ common
  ミン

Kun-yomi:
  あ.かり ★
  あ.かるい common
  あき.らか
```

**Markers:**

- ★ = Primary reading (only one per yomi type)
- "common" = Commonly used
- No marker = Less common or specialized

**Dot notation:** In kun-yomi, the dot (.) indicates where okurigana begins. Example: あ.かり → reading is "aka", okurigana is "ri".

### Edit Mode

Inline editing with add/remove/reorder:

```
Readings                          [Save] [Cancel]
─────────────────────────────────────────────────
On-yomi:                               [+ Add]
┌─────────────────────────────────────────────┐
│ ≡ [メイ______] ☑Primary ☑Common      [✕] │
│   Notes: [Most common reading_____]         │
├─────────────────────────────────────────────┤
│ ≡ [ミョウ____] ☐Primary ☑Common      [✕] │
│   Notes: [Used in 明日, 明朝_____]          │
└─────────────────────────────────────────────┘

Kun-yomi:                              [+ Add]
┌─────────────────────────────────────────────┐
│ ≡ Reading: [あか__] Okurigana: [り__]       │
│   ☑Primary ☑Common                    [✕] │
│   Notes: [_________________]                │
└─────────────────────────────────────────────┘
```

**Features:**

- Drag handle (≡) for reordering
- Separate inputs for reading and okurigana (kun-yomi only)
- Primary and common checkboxes
- Notes field per reading
- Remove button (with confirmation)

### Validation

| Rule                          | Message                                     |
| ----------------------------- | ------------------------------------------- |
| On-yomi must be katakana      | "On-yomi must use katakana characters"      |
| Kun-yomi must be hiragana     | "Kun-yomi must use hiragana characters"     |
| Okurigana must be hiragana    | "Okurigana must use hiragana characters"    |
| Max one primary per yomi type | "Only one primary reading allowed per type" |
| No duplicate readings         | "This reading already exists"               |

**Warning (not error):** If no primary reading is marked, show a warning but allow save.

### Usage in Other Features

**Meanings:** Meanings can be linked to specific readings (meaning applies when kanji is read a certain way).

**Vocabulary:** Vocabulary kanji breakdown links to specific readings to show which reading is used in that word.

---

## Meanings System

### Data Model

**kanji_meanings**

| Field          | Type    | Notes                                   |
| -------------- | ------- | --------------------------------------- |
| id             | INTEGER | Primary key                             |
| kanji_id       | INTEGER | Foreign key to kanjis                   |
| meaning_text   | TEXT    | Japanese meaning text (sentence/phrase) |
| language       | TEXT    | 'ja' or 'en' (defaults to 'ja')         |
| on_reading_id  | INTEGER | Optional: meaning for specific on-yomi  |
| kun_reading_id | INTEGER | Optional: meaning for specific kun-yomi |
| display_order  | INTEGER | Order for display (lowest first)        |
| notes          | TEXT    | Usage examples, context, nuance         |

**kanji_meaning_related_kanji**

| Field             | Type    | Notes                               |
| ----------------- | ------- | ----------------------------------- |
| id                | INTEGER | Primary key                         |
| meaning_id        | INTEGER | Foreign key to kanji_meanings       |
| related_kanji_id  | INTEGER | Foreign key to kanjis (related one) |
| relationship_type | TEXT    | 'similar' or 'opposite'             |

### Design (Kanjipedia Style)

Meanings are ordered by frequency (most common first). Each meaning can include:

- Main meaning text (Japanese sentence/phrase)
- Related readings (which reading uses this meaning)
- Related kanji (類 = similar, 対 = opposite)
- Usage notes and examples

### Display

```
Meanings                                    [Edit]
─────────────────────────────────────────────────
1. あかるい。光がある。
   Related reading: メイ
   類: 亮、晃、昭  対: 暗
   Example: 明るい部屋

2. あきらか。はっきりしている。
   Related reading: メイ
   Example: 明白な事実

3. 夜があけること。よあけ。
   Related reading: あ.かり
   Example: 明ける

4. 次の。あくる。
   Related reading: ミョウ
   Example: 明日
```

**List itself is not collapsible.** Individual meaning notes can be expanded/collapsed if very lengthy (future enhancement).

### Edit Mode

Reorder by drag, edit inline or via dialog:

```
Meanings                          [Save] [Cancel]
─────────────────────────────────────────────────
Drag to reorder (most common first)    [+ Add]

┌─────────────────────────────────────────────┐
│ ≡ 1.                                        │
│ Meaning: [あかるい。光がある。_____]        │
│ Language: [日本語 ▼]                        │
│ Related reading: [—なし— ▼]                 │
│ Similar kanji: [亮][晃][昭] [+ Add]         │
│ Opposite kanji: [暗] [+ Add]                │
│ Notes: [Example: 明るい部屋____]            │
│                                    [✕]      │
├─────────────────────────────────────────────┤
│ ≡ 2.                                        │
│ Meaning: [あきらか。はっきりしている。____] │
│ ...                                         │
└─────────────────────────────────────────────┘
```

**Features:**

- Drag handle (≡) for reordering
- Language selector (Japanese/English)
- Reading dropdown (optional, links meaning to reading)
- Related kanji: separate lists for similar and opposite
- Notes field per meaning
- Remove button (with confirmation)

### Related Kanji Selector

When adding similar/opposite kanji:

1. Search existing kanji by character or short_meaning
2. Select from results → relationship created
3. "Create New" → quick-create dialog → navigate to new kanji

**Display:** Related kanji shown as clickable badges:

```vue
<div class="related-kanji">
  <span class="label">類:</span>
  <KanjiBadge character="亮" @click="navigate" />
  <KanjiBadge character="晃" @click="navigate" />
  <KanjiBadge character="昭" @click="navigate" />
</div>
```

### Validation

| Rule                        | Message                           |
| --------------------------- | --------------------------------- |
| Meaning text required       | "Meaning text is required"        |
| No duplicate meaning text   | "This meaning already exists"     |
| Reading must exist on kanji | "Selected reading does not exist" |

---

## Classifications System

### Data Model

**classification_types** (Prepopulated)

| ID  | Name               | Japanese | Description                                  |
| --- | ------------------ | -------- | -------------------------------------------- |
| 1   | pictograph         | 象形文字 | Pictorial representation of object           |
| 2   | ideograph          | 指事文字 | Abstract concepts via symbols                |
| 3   | compound_ideograph | 会意文字 | Combines meanings of components              |
| 4   | phono_semantic     | 形声文字 | Combines meaning component + sound component |

**kanji_classifications**

| Field                  | Type    | Notes                                 |
| ---------------------- | ------- | ------------------------------------- |
| id                     | INTEGER | Primary key                           |
| kanji_id               | INTEGER | Foreign key to kanjis                 |
| classification_type_id | INTEGER | Foreign key to classification_types   |
| is_primary             | BOOLEAN | Primary classification for this kanji |
| notes                  | TEXT    | Analysis, component breakdown         |

**Note:** Multiple classifications allowed (some kanji have disputed classifications), but only one can be primary.

### Display in Basic Information

Classification badge appears in Basic Information section:

```
Basic Information                           [Edit]
─────────────────────────────────────────────────
Stroke Count: 8
JLPT Level: N4
Joyo Grade: Elementary 2
Kentei Level: 9級
Classification: [形声文字] ⓘ
Radical: 日 (sun)
```

**Tooltip/popover on badge click:**

```
┌─────────────────────────────────┐
│ 形声文字 (Phono-semantic)       │
│ Combines meaning + sound        │
│ components.                     │
│                                 │
│ Notes: 日 provides meaning,     │
│ 月 provides sound (originally). │
└─────────────────────────────────┘
```

### Display on List Cards

Classification badge replaces JLPT/Joyo badges on list cards (once implemented):

```
┌─────────────────────────────────────────────┐
│ 明  8画  [形声]  9級                        │
│ 明るい                                      │
└─────────────────────────────────────────────┘
```

**Rationale:** Classification is more specific and educational than generic level indicators. Kentei remains visible as it's a recognized certification level.

### Edit Mode (Dialog)

```
┌─────────────────────────────────────────────┐
│ Edit Classification                         │
├─────────────────────────────────────────────┤
│ ☐ 象形文字 (Pictograph)                     │
│ ☐ 指事文字 (Ideograph)                      │
│ ☐ 会意文字 (Compound ideograph)             │
│ ☑ 形声文字 (Phono-semantic) ★ Primary       │
│                                             │
│ Notes:                                      │
│ [日 provides meaning (sun/day),             │
│  月 originally provided sound element.]     │
│                                             │
│                  [Cancel] [Save]            │
└─────────────────────────────────────────────┘
```

**Features:**

- Multi-select (rare, but some kanji have multiple valid classifications)
- Primary indicator (★)
- Notes field for component analysis

### Validation

| Rule                         | Message                                   |
| ---------------------------- | ----------------------------------------- |
| At least one must be checked | "At least one classification required"    |
| Only one can be primary      | "Only one primary classification allowed" |

---

## Notes Sections

Four separate collapsible sections, each with a specific purpose:

### Etymology Notes

**Purpose:** Historical origins, character development over time, oracle bone/bronze scripts.

**Example content:**

> Originally depicted the sun (日) and moon (月) together, symbolizing brightness. Later evolved to represent clarity and understanding.

### Semantic Analysis

**Purpose:** Modern usage patterns, how meanings relate, compound words, semantic shifts.

**Example content:**

> As a prefix, 明 often implies "next" (明日, 明年). In compounds with 白, emphasizes clarity (明白). The "brightness" meaning extends metaphorically to "clarity" and "understanding."

### Education & Mnemonics

**Purpose:** Japanese education methods, native mnemonics, grade-level teaching approaches.

**Example content:**

> 小学2年生 kanji. Taught with the mnemonic: "Sun and moon together make things bright." Often first encountered in 明るい (akarui, bright) and 明日 (ashita/asu, tomorrow).

### Personal Notes

**Purpose:** User's own observations, research notes, learning strategies, patterns noticed.

**Example content:**

> I notice this appears in many time-related words. Research connection between "bright" and "next/future." Check if there's a historical reason for the "tomorrow" reading.

### Implementation

All four sections use the same pattern:

```vue
<SharedSection title="Etymology Notes" collapsible>
  <BaseInlineTextarea
    v-model="kanji.etymology_notes"
    placeholder="Historical origins, character development..."
    @blur="saveNotes"
  />
</SharedSection>
```

**Features:**

- Collapsible (can contain lengthy text)
- Inline editing (BaseInlineTextarea with auto-grow)
- Auto-save on blur (debounced)
- Bottom collapse button when expanded

---

## Integration Points

### With Components

When a radical is set on a kanji via Basic Information:

1. Radical field dropdown shows available components where `can_be_radical=true`
2. On selection, a component occurrence is created with `is_radical=true`
3. Component appears in Components section automatically

**Reverse flow:** Removing the radical from Basic Information removes the component occurrence.

### With Vocabulary

Vocabulary section on kanji page shows words using this kanji. Clicking a word navigates to vocab page where the kanji breakdown analysis lives. See `05-vocabulary-system.md`.

### With Stroke Order

Stroke Order section comes after Vocabulary section. It's collapsible since diagrams take vertical space and aren't needed after initial learning.

---

## Quick Reference: Kanji Section Order

1. Header (character, short_meaning, search_keywords)
2. Basic Information (strokes, levels, classification, radical)
3. **Readings** (on-yomi, kun-yomi)
4. **Meanings** (ordered, with related kanji)
5. Components (linked components, basic info)
6. Vocabulary (words using this kanji)
7. Stroke Order (diagrams)
8. **Etymology Notes** (collapsible)
9. **Semantic Analysis** (collapsible)
10. **Education & Mnemonics** (collapsible)
11. **Personal Notes** (collapsible)

Sections 3-4 and 8-11 are new in V1 (bolded above).
