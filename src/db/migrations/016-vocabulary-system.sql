-- Migration 016: Vocabulary System
-- Adds vocabulary and vocab_kanji tables for vocabulary management with kanji breakdown

-- vocabulary table
CREATE TABLE IF NOT EXISTS vocabulary (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  word            TEXT NOT NULL UNIQUE,
  kana            TEXT,
  short_meaning   TEXT,
  search_keywords TEXT,
  jlpt_level      TEXT CHECK(jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1', 'non-jlpt') OR jlpt_level IS NULL),
  is_common       INTEGER DEFAULT 0 CHECK(is_common IN (0, 1)),
  description     TEXT,
  created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON vocabulary(word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_jlpt ON vocabulary(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_is_common ON vocabulary(is_common);

-- vocab_kanji junction table
CREATE TABLE IF NOT EXISTS vocab_kanji (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  vocab_id       INTEGER NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  kanji_id       INTEGER NOT NULL REFERENCES kanjis(id) ON DELETE CASCADE,
  analysis_notes TEXT,
  display_order  INTEGER DEFAULT 0,
  created_at     TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at     TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vocab_id, kanji_id)
);

CREATE INDEX IF NOT EXISTS idx_vocab_kanji_vocab ON vocab_kanji(vocab_id);
CREATE INDEX IF NOT EXISTS idx_vocab_kanji_kanji ON vocab_kanji(kanji_id);
CREATE INDEX IF NOT EXISTS idx_vocab_kanji_order ON vocab_kanji(vocab_id, display_order);

-- Set schema version
PRAGMA user_version = 16;
