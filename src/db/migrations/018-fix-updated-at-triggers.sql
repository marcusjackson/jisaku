-- Migration 018: Fix missing updated_at triggers
--
-- Adds AFTER UPDATE triggers to tables created in migrations 014, 015, and 016
-- that were missing them. Without these triggers, updated_at never advances
-- after the initial INSERT, so timestamps are permanently stale.
--
-- Also documents known schema limitations (NOT NULL / AUTOINCREMENT cannot be
-- backfilled via ALTER in SQLite without a full table rebuild migration).

-- =============================================================================
-- component_forms (created in migration 014)
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS update_component_forms_updated_at
    AFTER UPDATE ON component_forms
    FOR EACH ROW
BEGIN
    UPDATE component_forms SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- component_groupings (created in migration 015)
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS update_component_groupings_updated_at
    AFTER UPDATE ON component_groupings
    FOR EACH ROW
BEGIN
    UPDATE component_groupings SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- component_grouping_members (created in migration 015)
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS update_component_grouping_members_updated_at
    AFTER UPDATE ON component_grouping_members
    FOR EACH ROW
BEGIN
    UPDATE component_grouping_members SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- vocabulary (created in migration 016)
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS update_vocabulary_updated_at
    AFTER UPDATE ON vocabulary
    FOR EACH ROW
BEGIN
    UPDATE vocabulary SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- vocab_kanji (created in migration 016)
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS update_vocab_kanji_updated_at
    AFTER UPDATE ON vocab_kanji
    FOR EACH ROW
BEGIN
    UPDATE vocab_kanji SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- Set schema version
PRAGMA user_version = 18;
