# ✅ **POST-MVP FEATURE MEGACATALOG**

---

# 1. **Kanji Data Enrichment (Core Expansion)**

### **1.1. Classification System (From `classifications` & `kanji_classifications`)**

- Full CRUD for classification types
- Ability to assign multiple classifications to a kanji
- Mark one classification as “main”
- Classification filters on list page (e.g., phonetic, pictographic)
- Classification overview page (browse all categories)

---

### **1.2. Meaning Management (From `kanji_meanings`)**

- Multiple meanings per kanji
- Meaning types (English/Japanese)
- Display order editing
- Notes on country-specific meanings (e.g., is_japan_specific)
- Meaning search filters ("search kanji by meaning")

---

### **1.3. Story / Mnemonic System (From `kanji_stories`)**

- Add custom mnemonics
- Import Koohii or RTK stories (if legally allowable)
- Multiple stories per kanji
- Rate and favorite mnemonic stories
- Mnemonic browsing and sharing system (local or cloud)
- “Story mode” view to show mnemonic and components together

---

### **1.4. Reading System Expansion (From `on_readings` & `kun_readings`)**

**On readings**

- On-reading database pages
- On-reading detail view
- Link on readings to multiple kanji
- Mark hyōgai readings
- Set display order and main reading

**Kun readings**

- CRUD for kun readings
- Metadata: regularly-used flags, hyōgai flags
- Reading-level search filter

---

### **1.5. Keyword Systems (From `kanji_keywords` and `kanji_identifiers`)**

- Assign KLCC, RTK, WK, and other system keywords
- Switch UI display between systems
- Filter kanji by keyword system
- Sorting kanji via system order (e.g., “view in RTK order”)
- Auto-linking/import of these systems

---

### **1.6. Flat Component Modeling Constraint**

- Component relationships are modeled only one level deep
- No recursive/nested decomposition shown in kanji pages
- Component pages show their own immediate subcomponents
- Reduces complexity while keeping decomposition consistent
- Optional future extension to deeper hierarchical modeling

---

# 2. **Radical & Component System Expansion**

### **2.1. Dedicated Radical Pages (Beyond MVP minimal support)**

- Full CRUD radical manager
- Radical detail page
- Radical search
- Radical group browsing
- Show all kanji using a radical (with position metadata!)

---

### **2.2. Radical Position Data (From `radical_positions`)**

- Display component positions visually (hen, tsukuri, kanmuri, etc.)
- Add UI rules to enforce correct “other type” logic
- Add sorting/filtering by radical position
- Kanji decomposition viewer showing positions by layout
- Search by position: “find kanji with left-side water radical”

---

### **2.3. Radical Groups (From `radical_groups`, `kanji_radical_groups`)**

- Radical grouping UI (custom groups)
- Automatic grouping by category or theme
- Show relationships among radicals
- Tag kanji with multiple radical groups

---

### **2.4. Component-level Enhancements**

- Component detail with visual decomposition
- Add component position inside kanji
- Unique mapping of KanjiComponent ↔ RadicalComponent with UI visualization

---

### **2.5. Component Profile Pages (From project summary)**

- Dedicated detail pages for components
- Show component attributes, examples, related kanji
- List kanji that use the component (one-level decomposition)
- Optional child-components list (only immediate subcomponents)
- Link navigation: component → kanji → component
- Search and filter components by shape, tags, or usage frequency

---

# 3. **Vocabulary System (Large Future Track)**

The vocab tables imply a future "Dictionary Mode".

### **3.1. Vocabulary Manager**

- CRUD for vocabulary entries
- Detail page for each vocab word
- Search vocabulary by kanji, kana, meanings, JLPT, etc.

---

### **3.2. Vocab–Kanji Relationships (From `vocab_kanjis`)**

- Show vocab using a kanji on its detail page
- Frequency-sorted vocab lists
- Mark whether word is usually written in kanji or kana
- Practice mode: “learn vocab for kanji X”

---

### **3.3. Lexical Types (From `lexical_types`)**

- POS tags for vocab (noun, verb, adverb, etc.)
- Filters and color badges for word type
- Add example sentences + furigana rendering

---

### **3.4. Vocabulary Difficulty & Frequency Enhancements**

- Visual frequency indicator
- JLPT tagging
- Add SRS practice (see learning section)

---

# 4. **Learning Tools & Study Features**

### **4.1. SRS (Spaced Repetition System)**

- Kanji SRS decks
- Component SRS decks
- Vocab SRS decks
- Custom deck creation
- Sync SRS progress to IndexedDB
- Optional cloud sync (future)

---

### **4.2. Quizzes**

- Multiple choice meaning quiz
- Reading quiz (on/kun)
- Component breakdown quiz
- “Guess the radical position”
- Drawing input recognition (simple stroke checker)

---

### **4.3. Study Modes**

- Study by JLPT level
- Study by radical or component
- Study by classification type
- “Teach me kanji similar to X”
- Kanji contrast mode (“Compare these two kanji side-by-side”)

---

# 5. **UI/UX Enhancements**

### **5.1. Advanced Visualization**

- Decomposition trees:
  - Kanji → components → radicals
- Linking graph view (force-directed graph):
  - Show relations among radicals/components/kanji
- Stroke-order animation viewer upgrade:
  - Step-through mode
  - Reverse strokes

---

### **5.1.2. Stroke-Order Media Support (Expanded)**

- Support for static stroke-order diagrams (SVG/PNG)
- Support for animated stroke-order GIF/WebM
- Local storage of stroke-order files
- Improved viewer: speed control, looping, step-by-step mode

---

### **5.2. Customization**

- User-defined tags & tag filters
- Custom fields for notes
- Theming (dark/light/midnight themes)
- Adjustable grid density on list pages

---

### **5.3. Offline/Sync Improvements**

- Partial sync with cloud backup (optional)
- Multi-device sync via PouchDB-style replication
- Offline queue for edits

---

### **5.3.1. Offline-First PWA Core Behavior**

- App fully usable with zero internet access
- All data stored locally (IndexedDB + SQLite backend)
- Installable on desktop/mobile as a PWA
- No server dependency for core functionality
- Sync is optional and not required for app use

---

### **5.4. Custom Notes System (From project summary)**

- Rich freeform note fields attached to each kanji
- Suggested note categories (origins, cultural context, personal observations, etymological theories)
- Support for multiple note blocks per kanji
- Full-text searchable notes (integrated into global search)
- Sources & citations attached to specific notes
- Tagging system that applies at the note level
- Optional markdown / rich-text formatting for notes

---

### **5.5. Source Management System**

- Add structured “sources” metadata to kanji and notes
- Track references (dictionary, book, website, teacher, lecture, etc.)
- Per-note source linking and inline attribution
- Filter/search by source
- Optional source reliability ratings

---

# 6. **Import/Export / Bulk-Editing**

### **6.1. Bulk Operations**

- Bulk editing of metadata (JLPT, Joyo)
- Bulk component assignment
- Bulk import from CSV/TSV
- Drag-drop image bulk upload for stroke diagrams

---

### **6.2. Versioning**

- Version history for each kanji (undo edits)
- Compare differences between versions
- Restore previous version

---

### **6.3. Dataset Management**

- Export full dataset to JSON
- Export in Anki-ready format
- Import external datasets (RTK, WK, KKLC, etc.)

---

# 7. **Search, Discovery, Knowledge Graph**

### **7.1. Enhanced Search**

- Similar kanji search
- Search by shape (basic handwriting detection?)
- Search kanji by:
  - On reading
  - Kun reading
  - Meaning
  - Component layout
  - Radical group
  - Classification
- Stroke-count search (range or exact)
- Radical-based search with full filtering options

---

### **7.2. AI-assisted Search & Classification (optional / later)**

- Suggest kanji likely related by phonetic component
- Suggest corrections or relationships (learned heuristics)
- Make quizzes adapt to user’s weak areas

---

# 8. **Metadata, Cross-Referencing, and Integrity Tools**

### **8.1. Advanced Validation Tools**

- Duplicate component detection
- Mismatched radical positions warnings
- Incomplete decomposition detection
- Potential misclassified kanji suggestions

---

### **8.2. Integrity Reports**

- Summary:
  - Missing stroke diagrams
  - Missing mnemonics
  - Missing meanings
  - Missing readings
- “Data completeness score” per kanji

---

# 9. **User Generative Features**

### **9.1. Tagging & Custom Taxonomies**

- User-defined “kanji sets”
- Community tagging (if cloud sync added)
- Generate user custom radical/component groups

---

### **9.2. Annotation Layers**

- Draw notes on stroke diagrams
- Save handwritten mnemonics
- Attach audio recordings
- Custom images per kanji

---

# 10. **Gamification & Progress Tracking**

### **10.1. Achievements**

- “Learned all N5 kanji”
- “Completed 100 mnemonics”
- “Logged in 7 days in row”

---

### **10.2. Learning Heatmap**

- Like GitHub contribution heatmap
- Shows study and review activity

---

### **10.3. XP Leveling System**

- Earn experience from quizzes, reviews
- Levels unlock special study sets or themes

---

# 11. **Export/Integration Features**

### **11.1. Integrations:**

- Generating printable PDF study sheets
- Export to Anki decks
- Export to CSV for other apps
- Browser extension to look up kanji on hover

---

### **11.2. SQLite Database Portability**

- Export entire user dataset as a single SQLite file
- Import/replace existing database with a user-provided SQLite file
- Validate schema version before import
- “Portable save file” UX flow
- Optional backup/restore slots managed via SQLite exports

---

# 12. **Content Expansion Beyond Kanji**

### **12.1. Kana Support**

- Kana lookup pages
- Derivative classifiers (“kana loan forms”)

---

### **12.2. Sentence Examples Database**

- Linked sentences for vocab or kanji
- Furigana renderer
- Audio playback support

---

# 13. **Developer/Admin Tools**

### **13.1. Schema Inspection**

- Interactive diagram of entity relationships
- Automatic migration generator

---

### **13.2. Debug Mode**

- Show SQL queries
- Database content viewer
- Export table-by-table viewer for debugging

---

# 14. **Collaboration / Sharing (Long-Term)**

- Share kanji sets with other users
- Publish or subscribe to mnemonic packs
- Cloud accounts
- User login (optional)
- "Public decks" (similar to AnkiWeb)

---

# 15. **AI Enhancements (Optional Track)**

### **15.1. Natural-Language Command Parsing**

- Convert user-written sentences into structured database updates
- Examples: “Add 木 as a component of 森”, “Tag 明 as jouyou”
- AI-assisted review of parsed structure before commit
- Error-correction suggestions for ambiguous commands

---

### 15.2. Miscellaneous

- AI stroke-order generator for missing images
- AI mnemonic generator (custom to user's style)
- AI-assisted decomposition validator
- AI handwriting recognition search
- AI reading/meaning guesser based on patterns

---

# SUMMARY

**Your old schema implies an extremely robust kanji-encyclopedia dictionary-learning system**, far beyond an MVP. The post-MVP features above are structured so you can choose:

- **Data enrichment**
- **Radical/component deep modeling**
- **Vocabulary mode**
- **Study & learning tools**
- **Gamification / UX expansion**
- **Import/export + dataset management**
- **AI/advanced search**
- **Collaboration features**
