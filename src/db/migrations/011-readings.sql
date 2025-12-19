-- Readings System Migration
-- Version: 11
--
-- This migration adds:
-- 1. on_readings table for on-yomi readings
-- 2. kun_readings table for kun-yomi readings with okurigana support
--
-- Reading levels: '小' (elementary), '中' (junior high), '高' (high school), '外' (non-standard)

-- =============================================================================
-- ON_READINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS on_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    reading TEXT NOT NULL,
    reading_level TEXT NOT NULL DEFAULT '小' CHECK (reading_level IN ('小', '中', '高', '外')),
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_on_readings_kanji ON on_readings(kanji_id);
CREATE INDEX IF NOT EXISTS idx_on_readings_reading ON on_readings(reading);

-- Trigger for on_readings updated_at
CREATE TRIGGER IF NOT EXISTS update_on_readings_updated_at
    AFTER UPDATE ON on_readings
    FOR EACH ROW
BEGIN
    UPDATE on_readings SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- KUN_READINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS kun_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    reading TEXT NOT NULL,
    okurigana TEXT,
    reading_level TEXT NOT NULL DEFAULT '小' CHECK (reading_level IN ('小', '中', '高', '外')),
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kun_readings_kanji ON kun_readings(kanji_id);
CREATE INDEX IF NOT EXISTS idx_kun_readings_reading ON kun_readings(reading);

-- Trigger for kun_readings updated_at
CREATE TRIGGER IF NOT EXISTS update_kun_readings_updated_at
    AFTER UPDATE ON kun_readings
    FOR EACH ROW
BEGIN
    UPDATE kun_readings SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- FINALIZE
-- =============================================================================

PRAGMA user_version = 11;
