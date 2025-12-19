-- Migration 006: Add search_keywords field to components and migrate japanese_name
-- Date: 2025-12-10
-- Description: Adds search_keywords TEXT column to components table,
--              copies japanese_name data to search_keywords, then drops japanese_name column.
--              short_meaning provides primary display text, search_keywords adds additional search terms.

-- Add search_keywords column to components table
ALTER TABLE components ADD COLUMN search_keywords TEXT;

-- Copy japanese_name to search_keywords where not null
UPDATE components
SET search_keywords = japanese_name
WHERE japanese_name IS NOT NULL;

-- Drop japanese_name column (no longer needed)
-- Note: SQLite doesn't support DROP COLUMN directly in older versions,
-- but modern SQLite (3.35.0+) does support it
ALTER TABLE components DROP COLUMN japanese_name;

-- Update schema version
PRAGMA user_version = 6;
