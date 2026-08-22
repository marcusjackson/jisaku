-- Migration 019: Drop unused notes_cultural column
-- The notes_cultural column was added in migration 002 but is never referenced
-- in TypeScript types, queries, or mutations. Removing to reduce schema noise.

ALTER TABLE kanjis DROP COLUMN notes_cultural;

PRAGMA user_version = 19;
