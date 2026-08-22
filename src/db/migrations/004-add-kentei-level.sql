-- NOTE: This file is not imported by the migration runner.
-- The logic for this migration is inlined as TypeScript in migrations/index.ts.
-- Kept for reference only. DO NOT edit expecting it to take effect.
-- Add Kanji Kentei Level Support
-- Version: 4
--
-- This migration adds the kanji_kentei_level field to the kanjis table.
-- The Kanji Kentei (日本漢字能力検定) is a standardized kanji proficiency test
-- with 12 levels from 10級 (easiest) to 1級 (most difficult).

PRAGMA foreign_keys = OFF;

-- Add kanji_kentei_level column to kanjis table
ALTER TABLE kanjis ADD COLUMN kanji_kentei_level TEXT;

-- Create index for filtering by kentei level
CREATE INDEX IF NOT EXISTS idx_kanjis_kentei_level ON kanjis(kanji_kentei_level);

PRAGMA foreign_keys = ON;
