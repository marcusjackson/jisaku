-- Migration 007: Add search_keywords field to kanjis table
--
-- Description: Adds search_keywords TEXT column to kanjis table for additional search terms.
--              Per V1 plan: short_meaning for primary display, search_keywords for additional terms.
--              This ensures all entities (kanji, components, vocabulary) have consistent search capabilities.

-- Add search_keywords column to kanjis table
ALTER TABLE kanjis ADD COLUMN search_keywords TEXT;
