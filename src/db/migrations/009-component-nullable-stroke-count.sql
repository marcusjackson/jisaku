-- Migration 009: Make stroke_count nullable in components table
-- Same pattern as migration 008 for kanjis table

-- Add new nullable column
ALTER TABLE components ADD COLUMN stroke_count_new INTEGER DEFAULT NULL;

-- Copy existing data to new column (only non-null values)
UPDATE components SET stroke_count_new = stroke_count WHERE stroke_count IS NOT NULL;

-- Rename old column to preserve it temporarily (in case of rollback)
ALTER TABLE components RENAME COLUMN stroke_count TO stroke_count_old;

-- Rename new column to take the place of the old one
ALTER TABLE components RENAME COLUMN stroke_count_new TO stroke_count;

-- Drop the old column
ALTER TABLE components DROP COLUMN stroke_count_old;

-- Set schema version
PRAGMA user_version = 9;
