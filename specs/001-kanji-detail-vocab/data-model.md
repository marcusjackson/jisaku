# Data Model: Kanji Detail Vocabulary Section

**Feature**: 001-kanji-detail-vocab  
**Date**: 2026-01-10  
**Status**: Complete

## Entities

### Vocabulary

**Description**: A vocabulary entry (word/phrase) in the user's database

**Fields**:

- `id` (number, primary key): Unique identifier
- `word` (string, required): The vocabulary word/phrase (e.g., "食べる", "本")
- `kana` (string, nullable): Reading in hiragana/katakana (e.g., "たべる", "ほん")
- `shortMeaning` (string, nullable): Brief English meaning (e.g., "to eat", "book")
- `jlptLevel` (1-5 or null): JLPT level if applicable
- `isCommon` (boolean): Whether vocabulary is commonly used
- `searchKeywords` (string, nullable): Additional search terms
- `createdAt` (datetime): Timestamp of creation
- `updatedAt` (datetime): Timestamp of last modification

**Validation Rules**:

- `word` must not be empty
- `word` max length: 100 characters
- `kana` max length: 200 characters
- `shortMeaning` max length: 500 characters
- `jlptLevel` must be 1-5 or null

**Relationships**:

- One vocabulary can contain multiple kanji (many-to-many via VocabKanji)
- One vocabulary can have multiple kanji readings/meanings (not modeled in this feature)

**State Transitions**: N/A (CRUD entity, no workflow states)

---

### Kanji

**Description**: A Japanese kanji character being viewed

**Fields**:

- `id` (number, primary key): Unique identifier
- `character` (string, required): The kanji character (e.g., "食", "本")
- `strokeCount` (number, nullable): Number of strokes
- `radical` (string, nullable): Kanji radical
- `createdAt` (datetime): Timestamp of creation
- `updatedAt` (datetime): Timestamp of last modification

**Note**: Full kanji entity has many more fields (meanings, readings, classifications), but this feature only needs id and character for display/linking.

**Relationships**:

- One kanji appears in multiple vocabulary entries (many-to-many via VocabKanji)

**State Transitions**: N/A (viewing only, no modifications to kanji entity)

---

### VocabKanji (Junction Entity)

**Description**: Links vocabulary entries to the kanji they contain

**Fields**:

- `id` (number, primary key): Unique identifier for the link
- `vocabId` (number, foreign key): References vocabulary.id
- `kanjiId` (number, foreign key): References kanji.id
- `analysisNotes` (string, nullable): Optional notes about the kanji's role in vocabulary
- `displayOrder` (number): Order of kanji appearance in vocabulary word
- `createdAt` (datetime): Timestamp of link creation
- `updatedAt` (datetime): Timestamp of last modification

**Validation Rules**:

- `vocabId` must reference existing vocabulary
- `kanjiId` must reference existing kanji
- Unique constraint on (vocabId, kanjiId) - no duplicate links
- `displayOrder` must be non-negative

**Relationships**:

- Many-to-one with Vocabulary (one link → one vocabulary)
- Many-to-one with Kanji (one link → one kanji)

**State Transitions**:

- Created: When user links vocabulary to kanji
- Deleted: When user unlinks vocabulary from kanji (destructive mode only)

---

### VocabKanjiWithVocabulary (Derived Type)

**Description**: Join result combining VocabKanji link with full Vocabulary details

**Fields**:

- `vocabKanji` (VocabKanji): The junction table record
- `vocabulary` (Vocabulary): The full vocabulary entity

**Usage**: Returned by `getByKanjiIdWithVocabulary()` API method for efficient display

**Validation Rules**: N/A (read-only derived type)

**Note**: This is not a database entity, but a TypeScript type for the joined query result.

---

## Data Flow Diagrams

### View Vocabulary Flow

```
User views kanji detail page
  ↓
KanjiDetailRoot loads kanji (id from route)
  ↓
KanjiDetailRoot calls getByKanjiIdWithVocabulary(kanji.id)
  ↓
API returns VocabKanjiWithVocabulary[]
  ↓
KanjiDetailRoot passes vocabulary array to KanjiDetailSectionVocabulary
  ↓
KanjiDetailSectionVocabulary passes to KanjiDetailVocabularyDisplay
  ↓
KanjiDetailVocabularyDisplay renders list with KanjiDetailVocabularyItem
  ↓
User sees: [word (kana) - meaning] for each vocabulary
```

### Link Existing Vocabulary Flow

```
User clicks "Edit" button
  ↓
KanjiDetailDialogVocabulary opens with current vocabulary list
  ↓
User clicks "Add Vocabulary" button
  ↓
KanjiDetailVocabularySearch becomes visible
  ↓
KanjiDetailVocabularySearch loads all vocabulary via getAll()
  ↓
KanjiDetailVocabularySearch filters out already-linked vocabulary IDs
  ↓
User types search term
  ↓
Search filters vocabulary by word/kana/meaning (client-side)
  ↓
User selects vocabulary from results
  ↓
Search emits 'select' event with vocabulary.id
  ↓
KanjiDetailDialogVocabulary emits 'link' event
  ↓
use-kanji-detail-vocabulary-handlers.handleLink() called
  ↓
Handler validates: vocabulary not already linked
  ↓
Handler calls vocabKanjiRepository.create({ vocabId, kanjiId })
  ↓
Handler refreshes vocabulary list via getByKanjiIdWithVocabulary()
  ↓
Handler shows success toast
  ↓
UI updates with new vocabulary in list
```

### Quick-Create and Link Flow

```
User searches for vocabulary (not found)
  ↓
User clicks "Create New" in search results
  ↓
KanjiDetailVocabularySearch emits 'create' event with search term
  ↓
KanjiDetailDialogVocabulary opens KanjiDetailQuickCreateVocabulary
  ↓
Quick-create form pre-fills 'word' field with search term
  ↓
User enters kana and shortMeaning (optional)
  ↓
User submits form
  ↓
vee-validate validates via kanji-detail-vocabulary-quick-create-schema
  ↓
KanjiDetailQuickCreateVocabulary emits 'create' event with form data
  ↓
use-kanji-detail-vocabulary-handlers.handleCreate() called
  ↓
Handler calls vocabularyRepository.create({ word, kana, shortMeaning })
  ↓
API returns new vocabulary with id
  ↓
Handler calls vocabKanjiRepository.create({ vocabId: newVocab.id, kanjiId })
  ↓
Handler refreshes vocabulary list via getByKanjiIdWithVocabulary()
  ↓
Handler shows success toast "Vocabulary created and linked"
  ↓
Quick-create dialog closes, edit dialog shows new vocabulary
```

### Unlink Vocabulary Flow

```
User enables destructive mode (global setting)
  ↓
User opens edit dialog
  ↓
KanjiDetailVocabularyItem shows remove button (v-if="destructiveMode")
  ↓
User clicks remove button on vocabulary item
  ↓
KanjiDetailVocabularyItem emits 'remove' event with vocabKanji.id
  ↓
KanjiDetailDialogVocabulary shows SharedConfirmDialog
  ↓
Confirm dialog shows: "Remove link to vocabulary [word]?"
  ↓
User confirms
  ↓
Dialog emits 'unlink' event with vocabKanji.id
  ↓
use-kanji-detail-vocabulary-handlers.handleUnlink() called
  ↓
Handler calls vocabKanjiRepository.deleteById(vocabKanji.id)
  ↓
Handler refreshes vocabulary list via getByKanjiIdWithVocabulary()
  ↓
Handler shows success toast "Vocabulary unlinked"
  ↓
UI updates, removed vocabulary no longer in list
```

---

## Database Schema (Existing)

```sql
-- Vocabulary table (already exists)
CREATE TABLE vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  kana TEXT,
  short_meaning TEXT,
  jlpt_level INTEGER CHECK(jlpt_level BETWEEN 1 AND 5),
  is_common INTEGER DEFAULT 0,
  search_keywords TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Kanji table (already exists)
CREATE TABLE kanji (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character TEXT UNIQUE NOT NULL,
  stroke_count INTEGER,
  radical TEXT,
  -- ... many more fields (meanings, readings, etc.)
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- VocabKanji junction table (already exists)
CREATE TABLE vocab_kanji (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vocab_id INTEGER NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  kanji_id INTEGER NOT NULL REFERENCES kanji(id) ON DELETE CASCADE,
  analysis_notes TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vocab_id, kanji_id)
);

-- Indexes (already exist)
CREATE INDEX idx_vocab_kanji_vocab_id ON vocab_kanji(vocab_id);
CREATE INDEX idx_vocab_kanji_kanji_id ON vocab_kanji(kanji_id);
```

**Note**: All tables already exist in database. No schema migrations needed for this feature.

---

## API Query Examples

### Get vocabulary for kanji (with join)

```typescript
// New method to add to vocab-kanji-repository.ts
getByKanjiIdWithVocabulary(kanjiId: number): VocabKanjiWithVocabulary[] {
  const sql = `
    SELECT
      vk.id as vk_id,
      vk.vocab_id,
      vk.kanji_id,
      vk.analysis_notes,
      vk.display_order,
      vk.created_at as vk_created_at,
      vk.updated_at as vk_updated_at,
      v.id as v_id,
      v.word,
      v.kana,
      v.short_meaning,
      v.jlpt_level,
      v.is_common,
      v.created_at as v_created_at,
      v.updated_at as v_updated_at
    FROM vocab_kanji vk
    JOIN vocabulary v ON vk.vocab_id = v.id
    WHERE vk.kanji_id = ?
    ORDER BY v.word ASC
  `
  const result = this.exec(sql, [kanjiId])
  return result[0].values.map(row => ({
    vocabKanji: {
      id: row[0],
      vocabId: row[1],
      kanjiId: row[2],
      analysisNotes: row[3],
      displayOrder: row[4],
      createdAt: row[5],
      updatedAt: row[6]
    },
    vocabulary: {
      id: row[7],
      word: row[8],
      kana: row[9],
      shortMeaning: row[10],
      jlptLevel: row[11],
      isCommon: row[12] === 1,
      createdAt: row[13],
      updatedAt: row[14]
    }
  }))
}
```

### Create vocabulary-kanji link

```typescript
// Existing method in vocab-kanji-repository.ts
create(input: CreateVocabKanjiInput): VocabKanji {
  const sql = `
    INSERT INTO vocab_kanji (vocab_id, kanji_id, analysis_notes, display_order)
    VALUES (?, ?, ?, ?)
  `
  this.run(sql, [
    input.vocabId,
    input.kanjiId,
    input.analysisNotes ?? null,
    input.displayOrder ?? 0
  ])
  const id = this.getLastInsertId()
  return this.getById(id)!
}
```

### Delete vocabulary-kanji link

```typescript
// Existing method in vocab-kanji-repository.ts (via BaseRepository)
deleteById(id: number): void {
  const sql = `DELETE FROM vocab_kanji WHERE id = ?`
  this.run(sql, [id])
  schedulePersist()
}
```

---

## TypeScript Type Definitions

```typescript
// In src/api/vocabulary/vocabulary-types.ts

export interface Vocabulary {
  id: number
  word: string
  kana: string | null
  shortMeaning: string | null
  jlptLevel: VocabJlptLevel | null
  isCommon: boolean
  searchKeywords: string | null
  createdAt: string
  updatedAt: string
}

export interface VocabKanji {
  id: number
  vocabId: number
  kanjiId: number
  analysisNotes: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface VocabKanjiWithVocabulary {
  vocabKanji: VocabKanji
  vocabulary: Vocabulary
}

export interface CreateVocabularyInput {
  word: string
  kana?: string
  shortMeaning?: string
  jlptLevel?: VocabJlptLevel
  isCommon?: boolean
  searchKeywords?: string
}

export interface CreateVocabKanjiInput {
  vocabId: number
  kanjiId: number
  analysisNotes?: string
  displayOrder?: number
}

export type VocabJlptLevel = 1 | 2 | 3 | 4 | 5

// In src/modules/kanji-detail/kanji-detail-types.ts

export interface QuickCreateVocabularyData {
  word: string
  kana?: string
  shortMeaning?: string
}
```

---

## Summary

Data model leverages existing database schema with no migrations required. Key additions:

1. **VocabKanjiWithVocabulary type**: Joins vocab_kanji with vocabulary for efficient display
2. **getByKanjiIdWithVocabulary() method**: New API query for vocabulary list retrieval
3. **QuickCreateVocabularyData interface**: Form data type for quick-create workflow

All CRUD operations use existing repository methods. Data flows are straightforward with clear separation between view (read), link (create), quick-create (create vocabulary + create link), and unlink (delete).
