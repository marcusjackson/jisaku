-- Initial Database Schema
-- Version: 1
-- 
-- This migration creates the core tables for the kanji dictionary.

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Set schema version
PRAGMA user_version = 1;

-- =============================================================================
-- Radicals Table
-- =============================================================================
-- Kangxi radicals used for kanji classification.

CREATE TABLE IF NOT EXISTS radicals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL,
    stroke_count INTEGER NOT NULL CHECK (stroke_count > 0),
    number INTEGER NOT NULL UNIQUE CHECK (number >= 1 AND number <= 214),
    meaning TEXT,
    japanese_name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_radicals_character ON radicals(character);
CREATE INDEX IF NOT EXISTS idx_radicals_number ON radicals(number);

-- =============================================================================
-- Kanjis Table
-- =============================================================================
-- The primary table storing kanji entries.

CREATE TABLE IF NOT EXISTS kanjis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL UNIQUE,
    stroke_count INTEGER NOT NULL CHECK (stroke_count > 0 AND stroke_count <= 64),
    radical_id INTEGER,
    jlpt_level TEXT CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
    joyo_level TEXT CHECK (joyo_level IN (
        'elementary1', 'elementary2', 'elementary3',
        'elementary4', 'elementary5', 'elementary6',
        'secondary'
    )),
    stroke_diagram_image BLOB,
    stroke_gif_image BLOB,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (radical_id) REFERENCES radicals(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_kanjis_character ON kanjis(character);
CREATE INDEX IF NOT EXISTS idx_kanjis_stroke_count ON kanjis(stroke_count);
CREATE INDEX IF NOT EXISTS idx_kanjis_jlpt_level ON kanjis(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_kanjis_joyo_level ON kanjis(joyo_level);

-- =============================================================================
-- Components Table
-- =============================================================================
-- Building blocks of kanji (radicals and sub-components).

CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL,
    stroke_count INTEGER NOT NULL CHECK (stroke_count > 0),
    source_kanji_id INTEGER,
    description_short TEXT,
    japanese_name TEXT,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (source_kanji_id) REFERENCES kanjis(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_components_character ON components(character);
CREATE INDEX IF NOT EXISTS idx_components_source_kanji_id ON components(source_kanji_id);

-- =============================================================================
-- Kanji Components Junction Table
-- =============================================================================
-- Links kanji to their components (many-to-many relationship).

CREATE TABLE IF NOT EXISTS kanji_components (
    kanji_id INTEGER NOT NULL,
    component_id INTEGER NOT NULL,
    position INTEGER,
    PRIMARY KEY (kanji_id, component_id),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE,
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kanji_components_kanji_id ON kanji_components(kanji_id);
CREATE INDEX IF NOT EXISTS idx_kanji_components_component_id ON kanji_components(component_id);

-- =============================================================================
-- Triggers for updated_at
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS update_kanjis_updated_at
    AFTER UPDATE ON kanjis
    FOR EACH ROW
BEGIN
    UPDATE kanjis SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_components_updated_at
    AFTER UPDATE ON components
    FOR EACH ROW
BEGIN
    UPDATE components SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_radicals_updated_at
    AFTER UPDATE ON radicals
    FOR EACH ROW
BEGIN
    UPDATE radicals SET updated_at = datetime('now') WHERE id = OLD.id;
END;
