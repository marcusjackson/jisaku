-- Component Groupings Migration
-- Version: 015
--
-- This migration adds the component_groupings and component_grouping_members tables
-- for user-created groups of component occurrences for pattern analysis.

-- =============================================================================
-- STEP 1: Drop existing tables (created by migration 003 with wrong schema)
-- =============================================================================
DROP TABLE IF EXISTS component_grouping_members;
DROP TABLE IF EXISTS component_groupings;

-- =============================================================================
-- STEP 2: Create component_groupings table with correct schema
-- =============================================================================
CREATE TABLE component_groupings (
  id               INTEGER PRIMARY KEY,
  component_id     INTEGER NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  display_order    INTEGER DEFAULT 0,
  created_at       TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at       TEXT DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- STEP 3: Create component_grouping_members table (junction) with correct schema
-- =============================================================================
CREATE TABLE component_grouping_members (
  id               INTEGER PRIMARY KEY,
  grouping_id      INTEGER NOT NULL REFERENCES component_groupings(id) ON DELETE CASCADE,
  occurrence_id    INTEGER NOT NULL REFERENCES component_occurrences(id) ON DELETE CASCADE,
  display_order    INTEGER DEFAULT 0,
  created_at       TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at       TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(grouping_id, occurrence_id)
);

-- =============================================================================
-- STEP 4: Create indexes
-- =============================================================================
CREATE INDEX idx_component_groupings_component_id ON component_groupings(component_id);
CREATE INDEX idx_component_grouping_members_grouping_id ON component_grouping_members(grouping_id);
CREATE INDEX idx_component_grouping_members_occurrence_id ON component_grouping_members(occurrence_id);

-- Set schema version
PRAGMA user_version = 15;
