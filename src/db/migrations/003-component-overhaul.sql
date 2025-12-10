-- Component System Overhaul Migration
-- Version: 3
--
-- This migration:
-- 1. Migrates radicals table data into components table, then drops radicals
-- 2. Updates kanjis.radical_id FK to point to components instead of radicals
-- 3. Enhances components table with radical metadata
-- 4. Creates component_forms table for different visual shapes
-- 5. Replaces kanji_components with component_occurrences (per-occurrence analysis)
-- 6. Adds component_groupings for manual pattern analysis
-- 7. Adds classification_types and position_types reference tables
-- 8. Splits cultural notes into semantic + education/mnemonics
-- 9. Adds sorting/ordering fields (identifier, radical_stroke_count)
--
-- NOTE: This migration uses table recreation pattern for SQLite compatibility
-- because ALTER TABLE DROP COLUMN doesn't work when FKs reference the table.

PRAGMA foreign_keys = OFF;

-- =============================================================================
-- STEP 1: ENHANCE COMPONENTS TABLE FIRST
-- =============================================================================
-- We need the enhanced components table before we can migrate kanjis.radical_id

-- Add radical-related metadata to components
ALTER TABLE components ADD COLUMN can_be_radical BOOLEAN DEFAULT 0;
ALTER TABLE components ADD COLUMN kangxi_number INTEGER CHECK (kangxi_number >= 1 AND kangxi_number <= 214);
ALTER TABLE components ADD COLUMN kangxi_meaning TEXT;
ALTER TABLE components ADD COLUMN radical_name_japanese TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_components_kangxi_number ON components(kangxi_number);
CREATE INDEX IF NOT EXISTS idx_components_can_be_radical ON components(can_be_radical);

-- =============================================================================
-- STEP 2: MIGRATE RADICALS TO COMPONENTS
-- =============================================================================

-- Insert radicals as components (if not already existing by character)
INSERT INTO components (character, stroke_count, can_be_radical, kangxi_number, kangxi_meaning, radical_name_japanese)
SELECT 
    r.character,
    r.stroke_count,
    1,  -- can_be_radical = true
    r.number,  -- kangxi_number
    r.meaning,  -- kangxi_meaning
    r.japanese_name  -- radical_name_japanese
FROM radicals r
WHERE NOT EXISTS (
    SELECT 1 FROM components c WHERE c.character = r.character
);

-- For radicals that DO exist as components, update their radical metadata
UPDATE components
SET 
    can_be_radical = 1,
    kangxi_number = (SELECT r.number FROM radicals r WHERE r.character = components.character),
    kangxi_meaning = (SELECT r.meaning FROM radicals r WHERE r.character = components.character),
    radical_name_japanese = COALESCE(
        (SELECT r.japanese_name FROM radicals r WHERE r.character = components.character),
        components.radical_name_japanese
    )
WHERE EXISTS (SELECT 1 FROM radicals r WHERE r.character = components.character);

-- =============================================================================
-- STEP 3: RECREATE KANJIS TABLE WITH NEW SCHEMA
-- =============================================================================
-- SQLite doesn't support ALTER TABLE DROP COLUMN when FKs reference the column,
-- so we recreate the table with the new structure.

-- Create new kanjis table with updated schema
CREATE TABLE kanjis_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL UNIQUE,
    stroke_count INTEGER NOT NULL CHECK (stroke_count > 0 AND stroke_count <= 64),
    -- radical_id now references components instead of radicals
    radical_id INTEGER,
    jlpt_level TEXT CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
    joyo_level TEXT CHECK (joyo_level IN (
        'elementary1', 'elementary2', 'elementary3',
        'elementary4', 'elementary5', 'elementary6',
        'secondary'
    )),
    stroke_diagram_image BLOB,
    stroke_gif_image BLOB,
    -- Split notes_cultural into notes_semantic + notes_education_mnemonics
    notes_etymology TEXT,
    notes_semantic TEXT,
    notes_education_mnemonics TEXT,
    notes_personal TEXT,
    -- New sorting/ordering fields
    identifier INTEGER,
    radical_stroke_count INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    -- FK now points to components table
    FOREIGN KEY (radical_id) REFERENCES components(id) ON DELETE SET NULL
);

-- Migrate data from old kanjis table, mapping radical_id to component
INSERT INTO kanjis_new (
    id, character, stroke_count, radical_id, jlpt_level, joyo_level,
    stroke_diagram_image, stroke_gif_image,
    notes_etymology, notes_semantic, notes_personal,
    created_at, updated_at
)
SELECT 
    k.id, k.character, k.stroke_count,
    -- Map old radical_id (pointing to radicals) to component id
    (SELECT c.id FROM components c JOIN radicals r ON r.character = c.character WHERE r.id = k.radical_id),
    k.jlpt_level, k.joyo_level,
    k.stroke_diagram_image, k.stroke_gif_image,
    k.notes_etymology,
    k.notes_cultural,  -- notes_cultural becomes notes_semantic
    k.notes_personal,
    k.created_at, k.updated_at
FROM kanjis k;

-- Drop old kanjis table
DROP TABLE kanjis;

-- Rename new table to kanjis
ALTER TABLE kanjis_new RENAME TO kanjis;

-- Recreate indexes for kanjis
CREATE INDEX IF NOT EXISTS idx_kanjis_character ON kanjis(character);
CREATE INDEX IF NOT EXISTS idx_kanjis_stroke_count ON kanjis(stroke_count);
CREATE INDEX IF NOT EXISTS idx_kanjis_jlpt_level ON kanjis(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_kanjis_joyo_level ON kanjis(joyo_level);
CREATE INDEX IF NOT EXISTS idx_kanjis_radical_id ON kanjis(radical_id);
CREATE INDEX IF NOT EXISTS idx_kanjis_identifier ON kanjis(identifier);
CREATE INDEX IF NOT EXISTS idx_kanjis_radical_order ON kanjis(
    radical_stroke_count,
    (stroke_count - COALESCE(radical_stroke_count, 0)),
    stroke_count
);

-- Recreate trigger for kanjis
CREATE TRIGGER IF NOT EXISTS update_kanjis_updated_at
    AFTER UPDATE ON kanjis
    FOR EACH ROW
BEGIN
    UPDATE kanjis SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- STEP 4: DROP RADICALS TABLE (no longer needed)
-- =============================================================================

-- Drop the radicals trigger first
DROP TRIGGER IF EXISTS update_radicals_updated_at;

-- Drop the radicals table
DROP TABLE IF EXISTS radicals;

-- =============================================================================
-- STEP 5: RECREATE COMPONENTS TABLE TO DROP description_short
-- =============================================================================

-- Create new components table without description_short
CREATE TABLE components_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL,
    stroke_count INTEGER NOT NULL CHECK (stroke_count > 0),
    source_kanji_id INTEGER,
    japanese_name TEXT,
    description TEXT,
    can_be_radical BOOLEAN DEFAULT 0,
    kangxi_number INTEGER CHECK (kangxi_number >= 1 AND kangxi_number <= 214),
    kangxi_meaning TEXT,
    radical_name_japanese TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (source_kanji_id) REFERENCES kanjis(id) ON DELETE SET NULL
);

-- Migrate data, merging description_short into description if description is null
INSERT INTO components_new (
    id, character, stroke_count, source_kanji_id, japanese_name, description,
    can_be_radical, kangxi_number, kangxi_meaning, radical_name_japanese,
    created_at, updated_at
)
SELECT 
    id, character, stroke_count, source_kanji_id, japanese_name,
    COALESCE(description, description_short),  -- Use description, fallback to description_short
    can_be_radical, kangxi_number, kangxi_meaning, radical_name_japanese,
    created_at, updated_at
FROM components;

-- Drop old components table
DROP TABLE components;

-- Rename new table
ALTER TABLE components_new RENAME TO components;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_components_character ON components(character);
CREATE INDEX IF NOT EXISTS idx_components_source_kanji_id ON components(source_kanji_id);
CREATE INDEX IF NOT EXISTS idx_components_kangxi_number ON components(kangxi_number);
CREATE INDEX IF NOT EXISTS idx_components_can_be_radical ON components(can_be_radical);

-- Recreate trigger
CREATE TRIGGER IF NOT EXISTS update_components_updated_at
    AFTER UPDATE ON components
    FOR EACH ROW
BEGIN
    UPDATE components SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- STEP 6: CREATE REFERENCE TABLES
-- =============================================================================

-- Classification types (Rikusho kanji categories)
CREATE TABLE IF NOT EXISTS classification_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_name TEXT NOT NULL UNIQUE,
    name_japanese TEXT,
    name_english TEXT,
    description TEXT,
    description_short TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_classification_types_name ON classification_types(type_name);

-- Prepopulate with standard Rikusho classifications
INSERT INTO classification_types (type_name, name_japanese, name_english, description_short, display_order) VALUES
('pictograph', '象形文字', 'Pictograph', 'Pictures of physical objects', 1),
('ideograph', '指事文字', 'Ideograph', 'Abstract concepts shown graphically', 2),
('compound_ideograph', '会意文字', 'Compound Ideograph', 'Combining meanings of components', 3),
('phono_semantic', '形声文字', 'Phono-semantic', 'Meaning component + sound component', 4);

-- Position types (component positions within kanji)
CREATE TABLE IF NOT EXISTS position_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    position_name TEXT NOT NULL UNIQUE,
    name_japanese TEXT,
    name_english TEXT,
    description TEXT,
    description_short TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_position_types_name ON position_types(position_name);

-- Prepopulate with standard component positions
INSERT INTO position_types (position_name, name_japanese, name_english, description_short, display_order) VALUES
('hen', '偏', 'Left side', 'Component on left side of kanji', 1),
('tsukuri', '旁', 'Right side', 'Component on right side of kanji', 2),
('kanmuri', '冠', 'Crown/Top', 'Component on top of kanji', 3),
('ashi', '脚', 'Legs/Bottom', 'Component on bottom of kanji', 4),
('tare', '垂', 'Hanging', 'Component hanging from top-left', 5),
('nyou', '繞', 'Enclosure (bottom-left)', 'Component wrapping from bottom-left', 6),
('kamae', '構', 'Enclosure (full)', 'Component fully enclosing kanji', 7),
('other', 'その他', 'Other', 'Does not fit standard positions', 8);

-- =============================================================================
-- STEP 7: CREATE COMPONENT_FORMS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS component_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component_id INTEGER NOT NULL,
    form_character TEXT NOT NULL,
    form_name TEXT,
    description TEXT,
    is_primary BOOLEAN DEFAULT 0,
    stroke_count INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_component_forms_component_id ON component_forms(component_id);

-- =============================================================================
-- STEP 8: CREATE COMPONENT_OCCURRENCES TABLE (replaces kanji_components)
-- =============================================================================

CREATE TABLE IF NOT EXISTS component_occurrences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    component_id INTEGER NOT NULL,
    component_form_id INTEGER,
    position_type_id INTEGER,
    is_radical BOOLEAN DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    analysis_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE,
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
    FOREIGN KEY (component_form_id) REFERENCES component_forms(id) ON DELETE SET NULL,
    FOREIGN KEY (position_type_id) REFERENCES position_types(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_occurrences_kanji ON component_occurrences(kanji_id);
CREATE INDEX IF NOT EXISTS idx_occurrences_component ON component_occurrences(component_id);
CREATE INDEX IF NOT EXISTS idx_occurrences_form ON component_occurrences(component_form_id);
CREATE INDEX IF NOT EXISTS idx_occurrences_is_radical ON component_occurrences(is_radical);
CREATE INDEX IF NOT EXISTS idx_occurrences_position ON component_occurrences(position_type_id);

-- Migrate data from kanji_components to component_occurrences
-- The old position column was INTEGER for ordering, not a position type
INSERT INTO component_occurrences (kanji_id, component_id, display_order)
SELECT 
    kanji_id, 
    component_id,
    COALESCE(position, 0)
FROM kanji_components;

-- Drop old kanji_components table
DROP TABLE IF EXISTS kanji_components;

-- =============================================================================
-- STEP 9: CREATE COMPONENT_GROUPINGS TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS component_groupings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component_id INTEGER NOT NULL,
    component_form_id INTEGER,
    name TEXT NOT NULL,
    analysis_notes TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
    FOREIGN KEY (component_form_id) REFERENCES component_forms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_groupings_component ON component_groupings(component_id);
CREATE INDEX IF NOT EXISTS idx_groupings_form ON component_groupings(component_form_id);

CREATE TABLE IF NOT EXISTS component_grouping_members (
    grouping_id INTEGER NOT NULL,
    occurrence_id INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,
    PRIMARY KEY (grouping_id, occurrence_id),
    FOREIGN KEY (grouping_id) REFERENCES component_groupings(id) ON DELETE CASCADE,
    FOREIGN KEY (occurrence_id) REFERENCES component_occurrences(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_grouping_members_grouping ON component_grouping_members(grouping_id);
CREATE INDEX IF NOT EXISTS idx_grouping_members_occurrence ON component_grouping_members(occurrence_id);

-- =============================================================================
-- STEP 10: CREATE KANJI_CLASSIFICATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS kanji_classifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    classification_type_id INTEGER NOT NULL,
    is_primary BOOLEAN DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE,
    FOREIGN KEY (classification_type_id) REFERENCES classification_types(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kanji_classifications_kanji ON kanji_classifications(kanji_id);
CREATE INDEX IF NOT EXISTS idx_kanji_classifications_type ON kanji_classifications(classification_type_id);

-- =============================================================================
-- STEP 11: CREATE TRIGGERS FOR NEW TABLES
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS update_classification_types_updated_at
    AFTER UPDATE ON classification_types
    FOR EACH ROW
BEGIN
    UPDATE classification_types SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_position_types_updated_at
    AFTER UPDATE ON position_types
    FOR EACH ROW
BEGIN
    UPDATE position_types SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_component_forms_updated_at
    AFTER UPDATE ON component_forms
    FOR EACH ROW
BEGIN
    UPDATE component_forms SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_component_occurrences_updated_at
    AFTER UPDATE ON component_occurrences
    FOR EACH ROW
BEGIN
    UPDATE component_occurrences SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_component_groupings_updated_at
    AFTER UPDATE ON component_groupings
    FOR EACH ROW
BEGIN
    UPDATE component_groupings SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_kanji_classifications_updated_at
    AFTER UPDATE ON kanji_classifications
    FOR EACH ROW
BEGIN
    UPDATE kanji_classifications SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- =============================================================================
-- FINALIZE
-- =============================================================================

-- Re-enable foreign keys
PRAGMA foreign_keys = ON;

-- Set schema version
PRAGMA user_version = 3;

-- =============================================================================
-- VALIDATION QUERIES (for testing migration success)
-- =============================================================================
-- Run these manually to verify migration:
--
-- Check that all old kanji_components data migrated:
-- SELECT COUNT(*) FROM component_occurrences;
--
-- Verify foreign key integrity:
-- PRAGMA foreign_key_check;
--
-- Verify indexes created:
-- SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='component_occurrences';
--
-- Verify classification and position types populated:
-- SELECT COUNT(*) FROM classification_types; -- Should be 4
-- SELECT COUNT(*) FROM position_types; -- Should be 8
--
-- Verify radicals migrated to components:
-- SELECT COUNT(*) FROM components WHERE can_be_radical = 1;
