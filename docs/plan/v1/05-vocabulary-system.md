# V1 Vocabulary System

Vocabulary as an equal peer to kanji and components. Full kanji breakdown analysis happens on the vocab page.

---

## Core Principle

**Vocab page owns kanji analysis.** When analyzing "how is 明 read in 明日?", that happens on the vocab page—not the kanji page.

| Page       | Can Do                          | Cannot Do                   |
| ---------- | ------------------------------- | --------------------------- |
| Kanji page | View/add/remove vocab links     | Edit kanji reading analysis |
| Vocab page | Full kanji breakdown + analysis | N/A                         |

---

## Data Model

### vocabulary

| Field           | Type    | Notes                                  |
| --------------- | ------- | -------------------------------------- |
| id              | INTEGER | Primary key                            |
| word            | TEXT    | The word (e.g., 明日)                  |
| primary_reading | TEXT    | Main reading (e.g., あした)            |
| short_meaning   | TEXT    | Display meaning (翌日)                 |
| search_keywords | TEXT    | Additional search terms                |
| meaning_full    | TEXT    | Full meaning paragraph                 |
| jlpt_level      | INTEGER | 1-5 (N1-N5), NULL if not applicable    |
| frequency_rank  | INTEGER | Frequency ranking, NULL if not tracked |
| is_common       | BOOLEAN | Common word flag                       |
| notes           | TEXT    | Usage notes, context, examples         |
| created_at      | TEXT    | Timestamp                              |
| updated_at      | TEXT    | Timestamp                              |

### vocab_kanji (Junction with Analysis)

| Field           | Type    | Notes                                         |
| --------------- | ------- | --------------------------------------------- |
| id              | INTEGER | Primary key                                   |
| vocab_id        | INTEGER | Foreign key to vocabulary                     |
| kanji_id        | INTEGER | Foreign key to kanjis                         |
| reading_in_word | TEXT    | Portion of reading from this kanji (あ, した) |
| on_reading_id   | INTEGER | Foreign key to on_readings (optional)         |
| kun_reading_id  | INTEGER | Foreign key to kun_readings (optional)        |
| is_irregular    | BOOLEAN | Reading doesn't match standard readings       |
| analysis_notes  | TEXT    | Role/function of this kanji in this word      |
| display_order   | INTEGER | Order in word (0-indexed)                     |

---

## Vocabulary Page Structure

### Section Order

1. Header (word, reading, search_keywords)
2. Basic Information (primary_reading, JLPT, frequency, common)
3. Meanings (full meaning text)
4. Kanji Breakdown (constituent kanji with reading analysis)
5. Usage Notes (context, examples, nuance)

### Header

```
┌─────────────────────────────────────────────┐
│ [← Back to Vocabulary List]                 │
├─────────────────────────────────────────────┤
│ HEADER                                      │
│ 明日                            [Edit]      │
│ あした                                      │
│ 🔍 (search_keywords indicator)              │
└─────────────────────────────────────────────┘
```

**Editing:** Header Edit button opens form for word, primary_reading, short_meaning, search_keywords.

### Basic Information

```
Basic Information                           [Edit]
─────────────────────────────────────────────────
Primary Reading: あした
JLPT Level: N5
Frequency Rank: 247
Common: Yes
```

**Edit:** Inline editing for all fields.

### Meanings

```
Meanings                                    [Edit]
─────────────────────────────────────────────────
The day after today. Also read as あす (formal)
or みょうにち (literary). Used in everyday
conversation for "tomorrow."
```

**Not collapsible.** This is core content. Full meaning text can be multi-paragraph, but it should always be visible.

**Edit:** Inline with BaseInlineTextarea (auto-grow).

### Kanji Breakdown

```
Kanji Breakdown                   [+ Add] [▼ Collapse]
─────────────────────────────────────────────────
┌─────────────────────────────────────────────┐
│ 明  8画  明るい                       [→][✕]│
│ Reading: [あ_____]                          │
│ Type: [Kun: あ.かり ▼]                      │
│ ☐ Irregular                                 │
│ Notes: [Meaning "next" from brightness at   │
│        dawn, common in time words____]      │
├─────────────────────────────────────────────┤
│ 日  4画  太陽、日                     [→][✕]│
│ Reading: [した____]                         │
│ Type: [—None (irregular)— ▼]                │
│ ☑ Irregular                                 │
│ Notes: [Special compound reading, doesn't   │
│        match standard on/kun readings___]   │
└─────────────────────────────────────────────┘
```

**Collapsible:** Yes (can have multiple kanji with detailed analysis).

**Inline editing:** All fields editable directly:

- **Reading in word**: Text input
- **Reading type**: Dropdown (see below)
- **Irregular checkbox**: Toggle immediately
- **Notes**: Textarea, save on blur (debounced)

### Usage Notes

```
Usage Notes                                 [Edit] [▼ Collapse]
─────────────────────────────────────────────────
One of the most common words for "tomorrow."
The reading あした is everyday usage; あす is
more formal and often used in news/writing.
みょうにち is literary.

Example sentences:
- 明日、学校に行きます。(Tomorrow, I will go to school.)
- あした会いましょう。(Let's meet tomorrow.)
```

**Collapsible:** Yes (can contain lengthy text with examples).

**Edit:** Inline with BaseInlineTextarea.

---

## Kanji Breakdown Inline Editing

Each kanji card in breakdown is directly editable. This is the **ownership page** for analyzing how kanji function in this word.

### Reading in Word

Text input for the portion of the reading that comes from this kanji.

Example: In 明日 (あした):

- 明 → "あ"
- 日 → "した"

### Reading Type Dropdown

Shows the kanji's actual readings from the database, plus "None (irregular)" option:

```
┌─────────────────────────────────────────┐
│ —None (irregular)—                      │
│ ─────────────────                       │
│ On-yomi:                                │
│   メイ                                  │
│   ミョウ                                │
│   ミン                                  │
│ ─────────────────                       │
│ Kun-yomi:                               │
│   あ.かり                               │
│   あ.かるい                             │
│   あき.らか                             │
└─────────────────────────────────────────┘
```

**Behavior:**

- If user selects an on-yomi, `on_reading_id` is set
- If user selects a kun-yomi, `kun_reading_id` is set
- If user selects "None (irregular)", both IDs are NULL and `is_irregular=true`

**Data fetch:** Readings loaded from kanji's on_readings and kun_readings tables.

### Irregular Checkbox

Manual override. Sometimes a reading matches a standard reading but functions irregularly in context. User can mark as irregular for study purposes.

### Analysis Notes

Free-form text explaining the kanji's role in this word:

- Why this reading?
- Meaning contribution?
- Historical/etymological notes?
- Learning tips?

---

## Auto-Detection

When creating vocabulary, auto-detect kanji in word:

```typescript
function detectKanjiInWord(word: string): string[] {
  // Detect kanji characters (Unicode ranges for CJK Unified Ideographs)
  return [...word].filter((char) => {
    const code = char.charCodeAt(0)
    return (
      (code >= 0x4e00 && code <= 0x9faf) || // CJK Unified Ideographs
      (code >= 0x3400 && code <= 0x4dbf)
    ) // CJK Extension A
  })
}

// Examples:
// 明日 → ['明', '日']
// 食べる → ['食']
// ひらがな → []
```

**On vocabulary creation:**

1. Detect kanji in word
2. Search database for matching kanji characters
3. Create `vocab_kanji` entries with defaults:
   - reading_in_word: NULL (user fills in)
   - on_reading_id: NULL
   - kun_reading_id: NULL
   - is_irregular: false
   - analysis_notes: NULL
   - display_order: order in word (0-indexed)

**User completes breakdown** on vocab detail page after creation.

---

## Kanji Page: Vocabulary Section

On the kanji page, the Vocabulary section shows **basic info only**. Full breakdown analysis happens on the vocab page.

### Display

```
Vocabulary                                 [Edit]
─────────────────────────────────────────────────
Words using 明:

┌─────────────────────────────────────────────┐
│ 明日  (あした)  翌日                   [→] │
├─────────────────────────────────────────────┤
│ 明るい  (あかるい)  明るい             [→] │
├─────────────────────────────────────────────┤
│ 説明  (せつめい)  説明                 [→] │
├─────────────────────────────────────────────┤
│ 証明  (しょうめい)  証明               [→] │
└─────────────────────────────────────────────┘

ⓘ Click → to view full vocabulary details.
```

**Not collapsible** (typically limited count per kanji).

**Display fields:**

- Word
- Primary reading (in parentheses)
- Short meaning
- View button (navigate to vocab page)

### Edit Mode

```
Vocabulary                      [Save] [Cancel]
─────────────────────────────────────────────────
┌─────────────────────────────────────────────┐
│ 明日  (あした)  翌日                   [✕] │
├─────────────────────────────────────────────┤
│ 明るい  (あかるい)  明るい             [✕] │
└─────────────────────────────────────────────┘
[+ Add Vocabulary]
```

**Key behaviors:**

- **View mode:** No remove option (safety)
- **Edit mode:** Remove button (with confirmation)
- **No inline editing** of reading analysis (owned by vocab page)

### Adding Vocabulary (Kanji Page)

1. Click "+ Add Vocabulary"
2. SharedEntitySearch dialog
3. Search existing or create new
4. If creating new and word contains this kanji:
   - Vocab created
   - Kanji auto-detected and linked
   - Navigate to vocab page for breakdown editing
5. If linking existing:
   - Link created if kanji is in word
   - Warning if kanji not in word: "This word does not contain 明. Link anyway?"

---

## Quick-Create Vocabulary

From kanji page:

```
┌─────────────────────────────────────────────┐
│ Quick Create Vocabulary                     │
├─────────────────────────────────────────────┤
│ Word:    [明日_______]                      │
│ Reading: [あした_____]                      │
│ Display: [翌日_______]                      │
│                                             │
│ ⓘ The kanji 明 will be automatically       │
│   detected. Add full meaning and reading   │
│   analysis on vocabulary page.             │
│                                             │
│                  [Cancel] [Create & View]   │
└─────────────────────────────────────────────┘
```

**After creation:**

1. Vocab created
2. Kanji auto-detected (明, 日) and linked
3. **Navigate to vocab page** for breakdown editing

---

## Vocabulary List Page

```
Vocabulary                              [+ New]
─────────────────────────────────────────────────
🔍 [tomorrow______]

Filters: [JLPT ▼] [☑ Common only]

┌─────────────────────────────────────────────┐
│ 明日 (あした)                               │
│ 翌日                                        │
│ Uses: 明・日                                │
├─────────────────────────────────────────────┤
│ 日本語 (にほんご)                           │
│ 日本の言語                                  │
│ Uses: 日・本・語                            │
├─────────────────────────────────────────────┤
│ 食べる (たべる)                             │
│ 食事する                                    │
│ Uses: 食                                    │
└─────────────────────────────────────────────┘
```

**Search:** Word, reading, or short_meaning/search_keywords.

**Filters:**

- JLPT level dropdown (N5, N4, N3, N2, N1, None)
- Common only checkbox

---

## Integration Points

### With Kanji

Vocabulary section on kanji page shows words using this kanji. Clicking a word navigates to vocab page where the kanji breakdown analysis lives.

**Reverse flow:** On vocab page, clicking a kanji in the breakdown navigates to that kanji's detail page.

### With Components

Not directly linked. Components appear in vocab indirectly through kanji (kanji → components, vocab → kanji → components).

**Future enhancement:** Component occurrence patterns could reference vocabulary examples ("This component appears in words like...").

---

## Validation

### Vocabulary Table

| Field           | Validation                                 |
| --------------- | ------------------------------------------ |
| word            | Required, max 50 characters                |
| primary_reading | Required, hiragana only, max 50 characters |
| short_meaning   | Max 100 characters                         |
| search_keywords | Max 500 characters                         |
| meaning_full    | Max 2000 characters                        |
| jlpt_level      | 1-5 or NULL                                |
| frequency_rank  | Positive integer or NULL                   |
| is_common       | Boolean (default false)                    |

### Vocab Kanji Breakdown

| Field           | Validation                          |
| --------------- | ----------------------------------- |
| reading_in_word | Max 20 characters                   |
| on_reading_id   | Must exist in on_readings, or NULL  |
| kun_reading_id  | Must exist in kun_readings, or NULL |
| is_irregular    | Boolean (default false)             |
| analysis_notes  | Max 1000 characters                 |

**Business rules:**

- If on_reading_id is set, kun_reading_id must be NULL (and vice versa)
- If is_irregular=true, typically both reading IDs are NULL (but not enforced)

---

## Quick Reference: Vocab Section Order

1. Header (word, reading, search_keywords)
2. Basic Information (primary_reading, JLPT, frequency, common)
3. Meanings (full meaning text)
4. **Kanji Breakdown** (constituent kanji with reading analysis, collapsible)
5. **Usage Notes** (context, examples, collapsible)

Sections 4-5 are new in V1 (bolded above).

---

## Implementation Notes

### Reading Type Dropdown

Must dynamically load readings from the kanji's on_readings and kun_readings tables. Cache per kanji to avoid repeated queries.

```typescript
// Cache readings by kanji_id
const kanjiReadingsCache = new Map<
  number,
  {
    onReadings: OnReading[]
    kunReadings: KunReading[]
  }
>()

async function getReadingsForKanji(kanjiId: number) {
  if (!kanjiReadingsCache.has(kanjiId)) {
    const [on, kun] = await Promise.all([
      getOnReadings(kanjiId),
      getKunReadings(kanjiId)
    ])
    kanjiReadingsCache.set(kanjiId, { onReadings: on, kunReadings: kun })
  }
  return kanjiReadingsCache.get(kanjiId)!
}
```

### Auto-Detection Limitations

Auto-detection only finds kanji **already in the database**. If a vocab word contains a kanji not yet documented, the link won't be created automatically. User can add the kanji manually later.

**Future enhancement:** Show warning: "Word contains kanji not in database: 漢. Add this kanji?"

### Breakdown Order

`display_order` field ensures kanji breakdown displays in the same order as they appear in the word.

Example: 明日

- 明: display_order = 0
- 日: display_order = 1

**Important:** When auto-detecting, set display_order based on position in word string.
