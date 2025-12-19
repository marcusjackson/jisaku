-- Classifications System Migration
-- Version: 13
--
-- This migration:
-- 1. Adds display_order column to kanji_classifications (for arrow reordering)
-- 2. Removes is_primary and notes columns (display_order=1 is primary, use etymology_notes)
-- 3. Adds 仮借字 (phonetic_loan) to classification_types

-- =============================================================================
-- STEP 1: Add display_order column
-- =============================================================================
ALTER TABLE kanji_classifications ADD COLUMN display_order INTEGER DEFAULT 0;

-- Migrate existing is_primary data to display_order
-- If is_primary = 1, set display_order = 0 (first)
-- If is_primary = 0, set display_order = 1 (second)
UPDATE kanji_classifications SET display_order = CASE WHEN is_primary = 1 THEN 0 ELSE 1 END;

-- =============================================================================
-- STEP 2: Add 仮借字 (phonetic_loan) to classification_types if not exists
-- =============================================================================
INSERT OR IGNORE INTO classification_types (type_name, name_japanese, name_english, description, description_short, display_order) VALUES
('phonetic_loan', '仮借字', 'Phonetic Loan', 'Borrowed character for sound alone, original meaning ignored', 'Borrowed for sound', 5);

-- Set schema version
PRAGMA user_version = 13;
