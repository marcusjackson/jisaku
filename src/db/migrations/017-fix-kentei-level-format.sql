-- Migration 017: Normalize kanji kentei level format
-- Converts full display labels (e.g., '10級') to type-safe keys (e.g., '10')
-- This ensures consistency between legacy and refactored code

PRAGMA foreign_keys = OFF;

UPDATE kanjis 
SET kanji_kentei_level = CASE kanji_kentei_level
  WHEN '10級' THEN '10'
  WHEN '9級' THEN '9'
  WHEN '8級' THEN '8'
  WHEN '7級' THEN '7'
  WHEN '6級' THEN '6'
  WHEN '5級' THEN '5'
  WHEN '4級' THEN '4'
  WHEN '3級' THEN '3'
  WHEN '準2級' THEN 'pre2'
  WHEN '2級' THEN '2'
  WHEN '準1級' THEN 'pre1'
  WHEN '1級' THEN '1'
  ELSE kanji_kentei_level
END
WHERE kanji_kentei_level IS NOT NULL;

PRAGMA foreign_keys = ON;
PRAGMA user_version = 17;
