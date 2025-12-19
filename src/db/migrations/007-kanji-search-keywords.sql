-- Migration 007: Add search_keywords field to kanjis table
--
-- Description: Adds search_keywords TEXT column to kanjis table for additional search terms.
--              short_meaning provides primary display text, search_keywords adds additional search terms.
--              This ensures all entities (kanji, components, vocabulary) have consistent search capabilities.

-- Add search_keywords column to kanjis table
ALTER TABLE kanjis ADD COLUMN search_keywords TEXT;
