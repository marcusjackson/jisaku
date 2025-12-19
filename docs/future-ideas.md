# Future Ideas

A catalog of potential features and enhancements for Jisaku. These are ideas for exploration, not commitments—pick what interests you and ignore the rest.

---

## How to Use This Document

Ideas are organized by category with rough effort estimates:

- 🟢 **Small** — A few hours to a day
- 🟡 **Medium** — Several days to a week
- 🔴 **Large** — Multiple weeks or significant rearchitecting

These estimates are subjective. Something marked "small" might have hidden complexity.

---

## Contents

1. [Data Enrichment](#1-data-enrichment)
2. [Search & Discovery](#2-search--discovery)
3. [Learning & Study Tools](#3-learning--study-tools)
4. [Import & Export](#4-import--export)
5. [User Experience](#5-user-experience)
6. [Content Expansion](#6-content-expansion)
7. [Developer Tools](#7-developer-tools)
8. [Experimental](#8-experimental)

---

## 1. Data Enrichment

Enhancing the depth and flexibility of existing entities.

### 1.1 Keyword Systems 🟡

Support multiple keyword/ordering systems beyond custom identifiers:

- RTK (Remembering the Kanji) order/keywords
- KKLC (Kodansha Kanji Learner's Course) order/keywords
- WaniKani levels
- Switchable display mode: show kanji in RTK order, KKLC order, etc.
- Import keywords from external sources

### 1.2 Frequency Data 🟢

Add frequency information:

- Word frequency rankings for vocabulary
- Kanji frequency in newspapers/novels
- Visual frequency indicators (bars, badges)
- Sort/filter by frequency

### 1.3 Related Kanji 🟡

Track relationships between kanji:

- Synonyms (類義語) — kanji with similar meanings
- Antonyms (対義語) — kanji with opposite meanings
- Visually similar kanji (常 vs 堂)
- Phonetic series (same phonetic component)

### 1.4 Multiple Meanings Per Kanji 🟡

Expand the meanings system:

- Separate Japanese vs English meaning entries
- Meaning types (primary, secondary, archaic, regional)
- Country-specific meanings (Japan vs China)
- Notes on semantic drift over time

### 1.5 Story/Mnemonic System 🟡

Dedicated mnemonic management:

- Multiple stories per kanji
- Story templates incorporating components
- Favorite/rate mnemonics
- Optional import from community sources (Koohii, etc.)

### 1.6 Sources & Citations 🟡

Track where information comes from:

- Add source references to notes
- Source types: dictionary, textbook, website, teacher, personal observation
- Link specific notes to specific sources
- Filter by source
- Optional reliability ratings

---

## 2. Search & Discovery

Finding and exploring entries more effectively.

### 2.1 Advanced Search 🟡

Expand search capabilities:

- Search by on-reading
- Search by kun-reading
- Search by meaning (across kanji and vocabulary)
- Combined/filtered search (e.g., N3 kanji containing 水)

### 2.2 Similar Kanji Search 🔴

Find kanji that look alike:

- Visual similarity detection
- "Kanji that are often confused with X"
- Side-by-side comparison view

### 2.3 Radical-Based Navigation 🟡

Traditional dictionary-style browsing:

- Browse kanji by radical
- Radical index (部首索引) view
- Group by stroke count within radical

### 2.4 Component Pattern Discovery 🟡

Find patterns in component usage:

- "Show all kanji where 言 appears on the left"
- Position-based filtering (all hen components, all kanmuri, etc.)
- Phonetic component groupings (kanji that share a sound component)

### 2.5 Graph Visualization 🔴

Visual exploration of relationships:

- Force-directed graph of kanji-component relationships
- Clickable nodes to navigate
- Filter/highlight by criteria

---

## 3. Learning & Study Tools

Active practice and review features.

### 3.1 Spaced Repetition (SRS) 🔴

Built-in flashcard system:

- Kanji, component, or vocabulary decks
- Custom deck creation
- Review scheduling algorithm
- Progress tracking
- Sync progress to local storage

### 3.2 Quiz Modes 🟡

Various quiz types:

- Multiple choice meaning quiz
- Reading quiz (show kanji, guess reading)
- Reverse quiz (show meaning, guess kanji)
- Component breakdown quiz
- Writing practice (trace strokes)

### 3.3 Study Sets 🟡

Organize content for study:

- Create custom sets of kanji/vocabulary
- Study by JLPT level
- Study by Joyo grade
- "Kanji of the day" random selection

### 3.4 Progress Tracking 🟡

Monitor learning progress:

- Completion status per entry (new, learning, known)
- Statistics dashboard
- Learning heatmap (like GitHub contributions)
- Export progress reports

---

## 4. Import & Export

Moving data in and out.

### 4.1 Anki Export 🟡

Generate Anki decks:

- Export kanji as flashcards
- Export vocabulary as flashcards
- Include readings, meanings, images
- Customizable card templates

### 4.2 CSV/JSON Export 🟢

Data in portable formats:

- Full database export to JSON
- Selective export (just kanji, just vocabulary)
- CSV export for spreadsheet use
- Export with or without images

### 4.3 Bulk Import 🟡

Add multiple entries at once:

- Import from CSV/TSV
- Import from JSON
- Merge vs replace options
- Validation and error reporting

### 4.4 External Dataset Import 🔴

Import from known datasets:

- KANJIDIC entries
- JMdict vocabulary
- RTK/KKLC keywords
- Merge carefully with existing data

### 4.5 Printable Output 🟡

Physical study materials:

- PDF kanji study sheets
- Printable flashcards
- Formatted lists for offline use

---

## 5. User Experience

Interface and usability improvements.

### 5.1 Dark Mode 🟢

Theme support:

- Dark color scheme
- System preference detection
- Manual toggle
- Possibly additional themes (sepia, high contrast)

### 5.2 Home Dashboard 🟡

A proper home page:

- Statistics overview (total kanji, vocabulary, components)
- Recent entries
- Quick actions
- Study suggestions

### 5.3 Customizable Grid 🟢

List page display options:

- Adjust card/grid density
- Show/hide specific fields
- Sort options

### 5.4 Improved Mobile Experience 🟡

Better on small screens:

- Bottom navigation bar
- Swipe gestures
- Touch-optimized editing

### 5.5 Stroke Order Viewer Improvements 🟢

Enhanced stroke diagrams:

- Step-through mode (show strokes one by one)
- Speed control for GIFs
- Looping toggle
- Reverse playback

### 5.6 Keyboard Shortcuts 🟢

Power user navigation:

- Quick search (Cmd/Ctrl+K)
- Navigate between entries (J/K)
- Quick actions (E for edit, etc.)

### 5.7 Multi-Language UI 🔴

Interface localization:

- Japanese UI option
- Other languages
- User-selectable

---

## 6. Content Expansion

Going beyond kanji.

### 6.1 Kana Reference 🟢

Include hiragana and katakana:

- Kana chart/lookup
- Historical kana forms
- Kana origins from kanji

### 6.2 Example Sentences 🟡

Context for vocabulary:

- Attach example sentences to vocabulary entries
- Furigana rendering
- Translation support
- Audio playback (if recordings available)

### 6.3 Handwriting Recognition 🔴

Input by drawing:

- Draw kanji to search
- Basic stroke recognition
- Mobile-friendly canvas

---

## 7. Developer Tools

For debugging and development.

### 7.1 Database Inspector 🟢

Built-in database viewer:

- Browse tables directly
- Run raw SQL queries
- Export individual tables

### 7.2 Debug Mode 🟢

Development helpers:

- Show SQL queries in console
- Performance timing
- State inspection

### 7.3 Data Validation Reports 🟡

Find data quality issues:

- Missing stroke counts
- Orphaned records
- Duplicate components
- Incomplete entries report

---

## 8. Experimental

Ideas that might be interesting but need exploration.

### 8.1 Sync & Backup 🔴

Optional cloud features:

- Backup to cloud storage (user's own account)
- Sync across devices
- Version history

This would require significant infrastructure and careful privacy consideration.

### 8.2 AI Assistance 🔴

AI-powered features:

- Mnemonic generation suggestions
- Auto-fill component breakdowns
- Reading/meaning suggestions
- Pattern detection

Depends on external services and adds complexity.

### 8.3 Browser Extension 🔴

Lookup from any webpage:

- Highlight kanji to look up
- Quick add to dictionary
- Link to existing entries

### 8.4 Shared Content 🔴

Optional sharing:

- Export/import mnemonic packs
- Community contributions
- Public reference data

This changes the nature of the app significantly.

---

## Not Planned

Some features that don't fit the project's philosophy:

- **User accounts / login** — The app is local-first and personal
- **Server dependency** — Core features must work offline
- **Advertising / monetization** — This is a personal tool
- **Social features** — Not a community platform
- **Gamification** — Focus on utility over engagement tricks

---

## Implementation Notes

When picking something to implement:

1. Check if it requires schema changes (migrations needed)
2. Consider mobile experience from the start
3. Follow existing patterns in the codebase
4. Add tests for new functionality
5. Update documentation

See `architecture.md` and `conventions.md` for coding patterns.
