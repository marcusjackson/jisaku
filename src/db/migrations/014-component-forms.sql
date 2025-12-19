-- Component Forms Migration
-- Version: 14
--
-- This migration adds the component_forms table for tracking visual variants
-- of semantic components (e.g., 水 vs 氵 vs 氺 are all "water" forms).

-- =============================================================================
-- STEP 1: Drop existing table (created by migration 003 with wrong schema)
-- =============================================================================
DROP TABLE IF EXISTS component_forms;

-- =============================================================================
-- STEP 2: Create component_forms table with correct schema
-- =============================================================================
CREATE TABLE component_forms (
  id               INTEGER PRIMARY KEY,
  component_id     INTEGER NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  form_character   TEXT NOT NULL,
  form_name        TEXT,
  stroke_count     INTEGER,
  usage_notes      TEXT,
  display_order    INTEGER DEFAULT 0,
  created_at       TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at       TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(component_id, form_character)
);

-- =============================================================================
-- STEP 3: Create index for component_forms
-- =============================================================================
CREATE INDEX idx_component_forms_component_id ON component_forms(component_id);

-- Set schema version
PRAGMA user_version = 14;
