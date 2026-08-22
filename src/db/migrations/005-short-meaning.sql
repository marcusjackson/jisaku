-- NOTE: This file is not imported by the migration runner.
-- The logic for this migration is inlined as TypeScript in migrations/index.ts.
-- Kept for reference only. DO NOT edit expecting it to take effect.
-- Migration 005: Add short_meaning field to kanjis and components
-- Date: 2025-12-09
-- Description: Adds short_meaning TEXT column to both kanjis and components tables
--              for use in search/display across the application

-- Add short_meaning to kanjis table
ALTER TABLE kanjis ADD COLUMN short_meaning TEXT;

-- Add short_meaning to components table
ALTER TABLE components ADD COLUMN short_meaning TEXT;

-- Update schema version
PRAGMA user_version = 5;
