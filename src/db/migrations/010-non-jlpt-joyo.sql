-- Migration 010: Add non-jlpt and non-joyo enum values to check constraints
-- Safer column-level approach: Add new columns, migrate data, rename columns
-- This follows the pattern from migrations 008 and 009

-- Add new jlpt_level column with updated check constraint
ALTER TABLE kanjis ADD COLUMN jlpt_level_new TEXT CHECK (jlpt_level_new IN ('N5', 'N4', 'N3', 'N2', 'N1', 'non-jlpt'));

-- Copy existing data to new column
UPDATE kanjis SET jlpt_level_new = jlpt_level WHERE jlpt_level IS NOT NULL;

-- Drop index that references jlpt_level before column operations
DROP INDEX IF EXISTS idx_kanjis_jlpt_level;

-- Rename old column to preserve it temporarily
ALTER TABLE kanjis RENAME COLUMN jlpt_level TO jlpt_level_old;

-- Rename new column to take the place of the old one
ALTER TABLE kanjis RENAME COLUMN jlpt_level_new TO jlpt_level;

-- Recreate index on new column
CREATE INDEX idx_kanjis_jlpt_level ON kanjis(jlpt_level);

-- Drop the old column
ALTER TABLE kanjis DROP COLUMN jlpt_level_old;

-- Add new joyo_level column with updated check constraint
ALTER TABLE kanjis ADD COLUMN joyo_level_new TEXT CHECK (joyo_level_new IN ('elementary1', 'elementary2', 'elementary3', 'elementary4', 'elementary5', 'elementary6', 'secondary', 'non-joyo'));

-- Copy existing data to new column
UPDATE kanjis SET joyo_level_new = joyo_level WHERE joyo_level IS NOT NULL;

-- Drop index that references joyo_level before column operations
DROP INDEX IF EXISTS idx_kanjis_joyo_level;

-- Rename old column to preserve it temporarily
ALTER TABLE kanjis RENAME COLUMN joyo_level TO joyo_level_old;

-- Rename new column to take the place of the old one
ALTER TABLE kanjis RENAME COLUMN joyo_level_new TO joyo_level;

-- Recreate index on new column
CREATE INDEX idx_kanjis_joyo_level ON kanjis(joyo_level);

-- Drop the old column
ALTER TABLE kanjis DROP COLUMN joyo_level_old;

-- Set schema version
PRAGMA user_version = 10;
