# V1 Vocabulary System

Vocab is an equal peer to kanji and components. Full kanji breakdown analysis happens on the vocab page.

---

## Core Principle

**Vocab page owns kanji analysis.** When analyzing "how is 明 read in 明日?", that happens on the vocab page—not the kanji page.

| Page       | Can Do                               | Cannot Do                   |
| ---------- | ------------------------------------ | --------------------------- |
| Kanji page | View/add/remove vocab links          | Edit kanji reading analysis |
| Vocab page | Full kanji breakdown, inline editing | N/A                         |

---

## Data Model

### vocabulary

```sql
CREATE TABLE vocabulary (
  id INTEGER PRIMARY KEY,
  word TEXT NOT NULL,
  primary_reading TEXT NOT NULL,
  short_meaning TEXT,
  meaning_full TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### vocab_kanji (Junction with Analysis)

```sql
CREATE TABLE vocab_kanji (
  id INTEGER PRIMARY KEY,
  vocab_id INTEGER NOT NULL REFERENCES vocabulary(id),
  kanji_id INTEGER NOT NULL REFERENCES kanjis(id),
  reading_in_word TEXT,           -- portion of reading from this kanji
  on_reading_id INTEGER REFERENCES on_readings(id),
  kun_reading_id INTEGER REFERENCES kun_readings(id),
  is_irregular BOOLEAN DEFAULT 0, -- reading doesn't match standard
  analysis_notes TEXT,
  display_order INTEGER DEFAULT 0
);
```

---

## Vocab List Page

```
Vocabulary                              [+ New]
─────────────────────────────────────────────────
🔍 [tomorrow______]

┌─────────────────────────────────────────────┐
│ 明日 (あした)                               │
│ tomorrow                                    │
│ Uses: 明・日                                │
├─────────────────────────────────────────────┤
│ 日本語 (にほんご)                           │
│ Japanese language                           │
│ Uses: 日・本・語                            │
├─────────────────────────────────────────────┤
│ 食べる (たべる)                             │
│ to eat                                      │
│ Uses: 食                                    │
└─────────────────────────────────────────────┘
```

Search by word, reading, or meaning.

---

## Vocab Detail Page

### Sections

| Section         | Collapsible? | Notes                                       |
| --------------- | ------------ | ------------------------------------------- |
| Basic Info      | No           | Word, reading, short meaning                |
| Meanings        | No           | Short + full meaning                        |
| Kanji Breakdown | Yes          | Can have multiple kanji, each with analysis |
| Notes           | Yes          | Lengthy text                                |

### Display

```
← Back to Vocab List
─────────────────────────────────────────────────
明日
あした
tomorrow                                   [Edit]
─────────────────────────────────────────────────
▼ Meanings                                 [Edit]
  Short: tomorrow
  Full: The day after today. Also read as あす
        (formal) or みょうにち (literary).
─────────────────────────────────────────────────
▼ Kanji Breakdown                         [+ Add]
┌─────────────────────────────────────────────┐
│ 明 (bright, clear)                   [→][✕]│
│ Reading: [あ_____]                          │
│ Type: [Kun: あ.かり ▼]                      │
│ ☐ Irregular                                 │
│ Notes: [Meaning "next" comes from_____]     │
├─────────────────────────────────────────────┤
│ 日 (sun, day)                        [→][✕]│
│ Reading: [した____]                         │
│ Type: [—None— ▼]                            │
│ ☑ Irregular                                 │
│ Notes: [Doesn't match standard readings]    │
└─────────────────────────────────────────────┘
                                      [▲ Collapse]
─────────────────────────────────────────────────
▼ Notes                                    [Edit]
  One of the most common words for "tomorrow".
  The reading あした is everyday; あす is formal...
─────────────────────────────────────────────────
← Back to Vocab List
```

---

## Kanji Breakdown Inline Editing

Each kanji card in breakdown is directly editable:

- **Reading in word**: Text input for the portion from this kanji
- **Reading type**: Dropdown with kanji's actual readings + "None (irregular)"
- **Irregular checkbox**: Mark if doesn't match standard reading
- **Notes**: Analysis of kanji's role

Changes save on blur/change (debounced).

### Reading Type Dropdown

Shows the kanji's actual readings from database:

```
┌─────────────────────────────────────────┐
│ —None (irregular)—                      │
│ ─────────────────                       │
│ On-yomi:                                │
│   メイ                                  │
│   ミョウ                                │
│ ─────────────────                       │
│ Kun-yomi:                               │
│   あ.かり                               │
│   あ.かるい                             │
│   あき.らか                             │
└─────────────────────────────────────────┘
```

---

## Kanji Page: Vocabulary Section

Basic linking only. **Not collapsible** (usually limited count).

```
Vocabulary                                 [Edit]
─────────────────────────────────────────────────
Words using 明:

[明日] (あした) tomorrow                   [→]
[明るい] (あかるい) bright                 [→]
[説明] (せつめい) explanation              [→]
[証明] (しょうめい) proof                  [→]

ⓘ Click → to view full vocab details.
```

Edit mode allows add/remove with confirmation.

---

## Quick-Create Vocab

From kanji page:

```
┌─────────────────────────────────────────────┐
│ Quick Create Vocabulary                     │
├─────────────────────────────────────────────┤
│ Word:    [明日_______]                      │
│ Reading: [あした_____]                      │
│ Meaning: [tomorrow___]                      │
│                                             │
│ ⓘ The kanji 明 will be automatically       │
│   linked. Analyze reading on vocab page.   │
│                                             │
│                  [Cancel] [Create & View]   │
└─────────────────────────────────────────────┘
```

After creation:

1. Vocab created
2. Kanji auto-linked (detected from word)
3. Navigate to vocab page for breakdown editing

---

## Auto-Detection

When creating vocab, auto-detect kanji in word:

```typescript
function detectKanjiInWord(word: string): string[] {
  return [...word].filter((char) => isKanji(char))
}

// 明日 → ['明', '日']
// 食べる → ['食']
```

Create vocab_kanji entries for each detected kanji (if exists in database).
