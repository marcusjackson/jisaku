-- Note Categories Migration
-- Version: 2
--
-- Splits single notes column into three separate note categories:
-- - notes_etymology: Historical origins and character evolution
-- - notes_cultural: Cultural significance and usage patterns
-- - notes_personal: Personal observations and mnemonics

-- Set schema version
PRAGMA user_version = 2;

-- Add new note category columns
ALTER TABLE kanjis ADD COLUMN notes_etymology TEXT;
ALTER TABLE kanjis ADD COLUMN notes_cultural TEXT;
ALTER TABLE kanjis ADD COLUMN notes_personal TEXT;

-- Migrate existing notes to personal notes
UPDATE kanjis SET notes_personal = notes WHERE notes IS NOT NULL;

-- Drop old notes column
-- Note: SQLite doesn't support DROP COLUMN directly in older versions,
-- but sql.js uses a recent SQLite version that does support it.
ALTER TABLE kanjis DROP COLUMN notes;
