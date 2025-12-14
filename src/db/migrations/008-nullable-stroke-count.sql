-- Migration 008: Make stroke_count nullable in kanjis table
-- Safer approach: Add new column, migrate data, rename columns
-- This avoids dropping the entire table which is risky

-- Add new nullable column
ALTER TABLE kanjis ADD COLUMN stroke_count_new INTEGER DEFAULT NULL;

-- Copy existing data to new column (only non-null values)
UPDATE kanjis SET stroke_count_new = stroke_count WHERE stroke_count IS NOT NULL;

-- Drop indexes that reference stroke_count BEFORE column operations to avoid reference errors
DROP INDEX IF EXISTS idx_kanjis_stroke_count;
DROP INDEX IF EXISTS idx_kanjis_radical_order;

-- Rename old column to preserve it temporarily (in case of rollback)
ALTER TABLE kanjis RENAME COLUMN stroke_count TO stroke_count_old;

-- Rename new column to take the place of the old one
ALTER TABLE kanjis RENAME COLUMN stroke_count_new TO stroke_count;

-- Recreate the indexes on the new column
CREATE INDEX idx_kanjis_stroke_count ON kanjis(stroke_count);
CREATE INDEX idx_kanjis_radical_order ON kanjis(
    radical_stroke_count,
    (stroke_count - COALESCE(radical_stroke_count, 0)),
    stroke_count
);

-- Drop the old column
ALTER TABLE kanjis DROP COLUMN stroke_count_old;

-- Set schema version
PRAGMA user_version = 8;
