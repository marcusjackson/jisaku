-- Meanings System Migration
-- Version: 12
--
-- This migration adds:
-- 1. kanji_meanings table for core meanings
-- 2. kanji_meaning_reading_groups table for optional reading groupings
-- 3. kanji_meaning_group_members junction table for meaning-group assignments
--
-- Design: Three-table architecture with separation of concerns
-- - Meanings exist independently of groupings
-- - Groupings are optional (ungrouped is default)
-- - Empty groups are auto-deleted on save

-- =============================================================================
-- KANJI_MEANINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS kanji_meanings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    meaning_text TEXT NOT NULL,
    additional_info TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kanji_meanings_kanji ON kanji_meanings(kanji_id);

-- Trigger for kanji_meanings updated_at
CREATE TRIGGER IF NOT EXISTS update_kanji_meanings_updated_at
    AFTER UPDATE ON kanji_meanings
    FOR EACH ROW
BEGIN
    UPDATE kanji_meanings SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- KANJI_MEANING_READING_GROUPS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS kanji_meaning_reading_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    reading_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_meaning_reading_groups_kanji ON kanji_meaning_reading_groups(kanji_id);

-- Trigger for kanji_meaning_reading_groups updated_at
CREATE TRIGGER IF NOT EXISTS update_kanji_meaning_reading_groups_updated_at
    AFTER UPDATE ON kanji_meaning_reading_groups
    FOR EACH ROW
BEGIN
    UPDATE kanji_meaning_reading_groups SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- KANJI_MEANING_GROUP_MEMBERS TABLE (Junction)
-- =============================================================================

CREATE TABLE IF NOT EXISTS kanji_meaning_group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reading_group_id INTEGER NOT NULL,
    meaning_id INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (reading_group_id) REFERENCES kanji_meaning_reading_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (meaning_id) REFERENCES kanji_meanings(id) ON DELETE CASCADE,
    UNIQUE(reading_group_id, meaning_id)
);

CREATE INDEX IF NOT EXISTS idx_meaning_group_members_group ON kanji_meaning_group_members(reading_group_id);
CREATE INDEX IF NOT EXISTS idx_meaning_group_members_meaning ON kanji_meaning_group_members(meaning_id);

-- Trigger for kanji_meaning_group_members updated_at
CREATE TRIGGER IF NOT EXISTS update_kanji_meaning_group_members_updated_at
    AFTER UPDATE ON kanji_meaning_group_members
    FOR EACH ROW
BEGIN
    UPDATE kanji_meaning_group_members SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- FINALIZE
-- =============================================================================

PRAGMA user_version = 12;
