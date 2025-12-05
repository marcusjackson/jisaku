# Post-MVP Feature Checklist

Tracking checklist for post-MVP features from the megacatalog. Items marked with ✓ are complete, items in **bold** indicate partial progress or MVP overlap.

---

## 1. Kanji Data Enrichment

### 1.1. Classification System

- [ ] Full CRUD for classification types
- [ ] Assign multiple classifications to a kanji
- [ ] Mark one classification as "main"
- [ ] Classification filters on list page
- [ ] Classification overview page

### 1.2. Meaning Management

- [ ] Multiple meanings per kanji
- [ ] Meaning types (English/Japanese)
- [ ] Display order editing
- [ ] Notes on country-specific meanings
- [ ] Meaning search filters

### 1.3. Story / Mnemonic System

- [ ] Add custom mnemonics
- [ ] Import Koohii or RTK stories
- [ ] Multiple stories per kanji
- [ ] Rate and favorite stories
- [ ] Mnemonic browsing system
- [ ] "Story mode" view

### 1.4. Reading System Expansion

**On readings:**

- [ ] On-reading database pages
- [ ] On-reading detail view
- [ ] Link on readings to multiple kanji
- [ ] Mark hyōgai readings
- [ ] Set display order and main reading

**Kun readings:**

- [ ] CRUD for kun readings
- [ ] Metadata: regularly-used flags, hyōgai flags
- [ ] Reading-level search filter

### 1.5. Keyword Systems

- [ ] Assign KLCC, RTK, WK keywords
- [ ] Switch UI display between systems
- [ ] Filter kanji by keyword system
- [ ] Sorting kanji via system order
- [ ] Auto-linking/import of systems

### 1.6. Flat Component Modeling

- [x] Component relationships modeled one level deep (MVP)
- [x] Component pages show immediate subcomponents (MVP)
- [ ] Optional extension to deeper hierarchical modeling

---

## 2. Radical & Component System Expansion

### 2.1. Dedicated Radical Pages

- [ ] Full CRUD radical manager
- [ ] Radical detail page
- [ ] Radical search
- [ ] Radical group browsing
- [ ] Show all kanji using a radical

### 2.2. Radical Position Data

- [ ] Display component positions visually
- [ ] Add UI rules for "other type" logic
- [ ] Sorting/filtering by radical position
- [ ] Kanji decomposition viewer by layout
- [ ] Search by position

### 2.3. Radical Groups

- [ ] Radical grouping UI
- [ ] Automatic grouping by category
- [ ] Show relationships among radicals
- [ ] Tag kanji with multiple radical groups

### 2.4. Component-level Enhancements

- [ ] Component detail with visual decomposition
- [ ] Add component position inside kanji
- [ ] KanjiComponent ↔ RadicalComponent UI visualization

### 2.5. Component Profile Pages

- [x] Dedicated detail pages for components (MVP)
- [x] Show component attributes and examples (MVP)
- [x] List kanji that use the component (MVP)
- [ ] Optional child-components list
- [x] Link navigation: component → kanji (MVP)
- [ ] Search and filter components by shape, tags, or frequency

---

## 3. Vocabulary System

### 3.1. Vocabulary Manager

- [ ] CRUD for vocabulary entries
- [ ] Detail page for each vocab word
- [ ] Search vocabulary

### 3.2. Vocab–Kanji Relationships

- [ ] Show vocab using a kanji on detail page
- [ ] Frequency-sorted vocab lists
- [ ] Mark kanji/kana writing preference
- [ ] Practice mode

### 3.3. Lexical Types

- [ ] POS tags for vocab
- [ ] Filters and color badges
- [ ] Example sentences + furigana

### 3.4. Vocabulary Difficulty & Frequency

- [ ] Visual frequency indicator
- [ ] JLPT tagging
- [ ] SRS practice integration

---

## 4. Learning Tools & Study Features

### 4.1. SRS (Spaced Repetition)

- [ ] Kanji SRS decks
- [ ] Component SRS decks
- [ ] Vocab SRS decks
- [ ] Custom deck creation
- [ ] Sync SRS progress to IndexedDB
- [ ] Optional cloud sync

### 4.2. Quizzes

- [ ] Multiple choice meaning quiz
- [ ] Reading quiz (on/kun)
- [ ] Component breakdown quiz
- [ ] "Guess the radical position"
- [ ] Drawing input recognition

### 4.3. Study Modes

- [ ] Study by JLPT level
- [ ] Study by radical or component
- [ ] Study by classification type
- [ ] "Teach me kanji similar to X"
- [ ] Kanji contrast mode

---

## 5. UI/UX Enhancements

### 5.1. Advanced Visualization

- [ ] Decomposition trees (kanji → components → radicals)
- [ ] Force-directed graph view
- [ ] Stroke-order animation upgrade (step-through, reverse)

### 5.1.2. Stroke-Order Media Support

- [ ] Static stroke-order diagrams (SVG/PNG)
- [ ] Animated stroke-order GIF/WebM
- [ ] Local storage of stroke-order files
- [ ] Improved viewer: speed control, looping, step-by-step

### 5.2. Customization

- [ ] User-defined tags & tag filters
- [ ] Custom fields for notes
- [ ] Theming (dark/light/midnight)
- [ ] Adjustable grid density

### 5.3. Offline/Sync Improvements

- [x] App fully usable offline (MVP)
- [x] All data stored locally (MVP)
- [x] Installable as PWA (MVP - in progress)
- [ ] Partial sync with cloud backup
- [ ] Multi-device sync
- [ ] Offline queue for edits

### 5.4. Custom Notes System

- [x] Basic notes field on kanji (MVP)
- [ ] Rich freeform note fields
- [ ] Suggested note categories (origins, cultural context, etc.)
- [ ] Multiple note blocks per kanji
- [ ] Full-text searchable notes
- [ ] Sources & citations on notes
- [ ] Note-level tagging
- [ ] Markdown/rich-text formatting

### 5.5. Source Management System

- [ ] Structured "sources" metadata
- [ ] Track references (dictionary, book, website, etc.)
- [ ] Per-note source linking
- [ ] Filter/search by source
- [ ] Source reliability ratings

---

## 6. Import/Export / Bulk-Editing

### 6.1. Bulk Operations

- [ ] Bulk editing of metadata
- [ ] Bulk component assignment
- [ ] Bulk import from CSV/TSV
- [ ] Drag-drop image bulk upload

### 6.2. Versioning

- [ ] Version history for each kanji
- [ ] Compare differences between versions
- [ ] Restore previous version

### 6.3. Dataset Management

- [ ] Export full dataset to JSON
- [ ] Export in Anki-ready format
- [ ] Import external datasets (RTK, WK, KKLC)

---

## 7. Search, Discovery, Knowledge Graph

### 7.1. Enhanced Search

- [ ] Similar kanji search
- [ ] Search by shape
- [ ] Search by on reading
- [ ] Search by kun reading
- [ ] Search by meaning
- [ ] Search by component layout
- [ ] Search by radical group
- [ ] Search by classification
- [x] Stroke-count search (range) - MVP
- [ ] Radical-based search with full filtering

### 7.2. AI-assisted Search & Classification

- [ ] Suggest kanji by phonetic component
- [ ] Suggest corrections/relationships
- [ ] Adaptive quizzes

---

## 8. Metadata & Integrity Tools

### 8.1. Advanced Validation Tools

- [ ] Duplicate component detection
- [ ] Mismatched radical positions warnings
- [ ] Incomplete decomposition detection
- [ ] Misclassified kanji suggestions

### 8.2. Integrity Reports

- [ ] Missing stroke diagrams summary
- [ ] Missing mnemonics summary
- [ ] Missing meanings summary
- [ ] Missing readings summary
- [ ] "Data completeness score" per kanji

---

## 9. User Generative Features

### 9.1. Tagging & Custom Taxonomies

- [ ] User-defined "kanji sets"
- [ ] Community tagging (with cloud sync)
- [ ] Custom radical/component groups

### 9.2. Annotation Layers

- [ ] Draw notes on stroke diagrams
- [ ] Save handwritten mnemonics
- [ ] Attach audio recordings
- [ ] Custom images per kanji

---

## 10. Gamification & Progress Tracking

### 10.1. Achievements

- [ ] "Learned all N5 kanji"
- [ ] "Completed 100 mnemonics"
- [ ] "Logged in 7 days in row"

### 10.2. Learning Heatmap

- [ ] GitHub-style contribution heatmap
- [ ] Shows study and review activity

### 10.3. XP Leveling System

- [ ] Earn experience from quizzes/reviews
- [ ] Levels unlock special content

---

## 11. Export/Integration Features

### 11.1. Integrations

- [ ] Printable PDF study sheets
- [ ] Export to Anki decks
- [ ] Export to CSV
- [ ] Browser extension for kanji lookup

### 11.2. SQLite Database Portability

- [ ] Export entire dataset as SQLite file
- [ ] Import/replace database
- [ ] Validate schema version before import
- [ ] "Portable save file" UX flow
- [ ] Backup/restore slots

---

## 12. Content Expansion Beyond Kanji

### 12.1. Kana Support

- [ ] Kana lookup pages
- [ ] Derivative classifiers

### 12.2. Sentence Examples Database

- [ ] Linked sentences for vocab/kanji
- [ ] Furigana renderer
- [ ] Audio playback support

---

## 13. Developer/Admin Tools

### 13.1. Schema Inspection

- [ ] Interactive ER diagram
- [ ] Automatic migration generator

### 13.2. Debug Mode

- [ ] Show SQL queries
- [ ] Database content viewer
- [ ] Table-by-table export viewer

---

## 14. Collaboration / Sharing

- [ ] Share kanji sets with users
- [ ] Publish/subscribe to mnemonic packs
- [ ] Cloud accounts
- [ ] User login (optional)
- [ ] "Public decks" (like AnkiWeb)

---

## 15. AI Enhancements

### 15.1. Natural-Language Command Parsing

- [ ] Convert sentences into database updates
- [ ] AI-assisted review of parsed structure
- [ ] Error-correction suggestions

### 15.2. Miscellaneous AI

- [ ] AI stroke-order generator
- [ ] AI mnemonic generator
- [ ] AI-assisted decomposition validator
- [ ] AI handwriting recognition search
- [ ] AI reading/meaning guesser
