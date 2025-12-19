# Features

Overview of Jisaku's current capabilities.

---

## Overview

Jisaku supports **kanji curation and analysis** through three integrated areas:

- **Kanji** — Entries with readings, meanings, classifications, and structured notes
- **Components** — Analysis of kanji building blocks, their forms and patterns
- **Vocabulary** — Words with kanji breakdown and reading analysis

---

## Kanji System

### Entry Management

- Create, view, edit, and delete kanji entries
- Character uniqueness validation
- Stroke count tracking (optional)
- Kanji Kentei level classification

### Classification & Organization

- JLPT level (N5–N1)
- Joyo grade level (elementary 1–6, secondary, or none)
- Radical assignment with 部首索引 ordering
- Classification types: 象形文字, 指事文字, 会意文字, 形声文字, 仮借字
- Custom identifier numbering

### Readings

- On-yomi (音読み) readings
- Kun-yomi (訓読み) readings with okurigana support
- Reading grade levels: 小 (elementary), 中 (middle school), 高 (high school), 外 (uncommon)
- Manual ordering and primary reading indication

### Meanings

- Multiple meanings per kanji with manual ordering
- Optional grouping by reading
- Language flexibility (Japanese or English meanings)

### Visual & Notes

- Stroke order diagram images
- Animated stroke order GIFs
- Four note categories:
  - Etymology (origins and historical development)
  - Semantic analysis (modern usage, compounds, patterns)
  - Education & mnemonics (how it's taught in Japan)
  - Personal (your own observations)

### Search & Filtering

- Filter by stroke count (min/max range)
- Filter by JLPT level (multi-select)
- Filter by Joyo grade (multi-select)
- Filter by component
- Filter by radical
- Search by character or keywords
- Filter state preserved in URL

---

## Component System

### Entry Management

- Create, view, edit, and delete component entries
- Character or multi-character components
- Stroke count tracking (optional)
- Source kanji linking (for derived components)
- Radical identification flags

### Forms (Visual Variants)

- Track different visual shapes of the same component
- Examples: 水 (standalone) vs 氵 (left side) vs 氺 (bottom)
- Each form has a name and optional description
- Manual ordering

### Occurrences

- Track where component appears in kanji
- Position types: hen (偏), tsukuri (旁), kanmuri (冠), ashi (脚), tare (垂), nyou (繞), kamae (構)
- Assign form variant used in each occurrence
- Mark if component serves as radical in that kanji
- Per-occurrence analysis notes
- Manual ordering

### Groupings

- Create custom groups of occurrences for pattern analysis
- Group by semantic patterns, phonetic patterns, or any user-defined criteria
- Each grouping has a name and description
- Occurrences can belong to multiple groups

### Search & Filtering

- Search by character or keywords
- Filter by stroke count range
- Filter by source kanji
- Filter by is-radical status

---

## Vocabulary System

### Entry Management

- Create, view, edit, and delete vocabulary entries
- Word field (kanji/kana as written)
- Kana field for reading (optional)
- Short meaning field
- Description for extended notes

### Organization

- JLPT level classification (N5–N1 or non-JLPT)
- Common word flag
- Search keywords for additional matching

### Kanji Breakdown

- Link vocabulary to its constituent kanji
- Ordered list with manual reordering
- Per-kanji analysis notes
- Navigation to linked kanji pages

### Search & Filtering

- Search by word, reading, or meaning
- Filter by JLPT level
- Filter by common flag
- Filter by contained kanji

---

## Data Management

### Export/Import

- Export full database as SQLite file
- Import database from SQLite file
- Schema validation on import
- Timestamped export filenames

### Offline-First PWA

- Full functionality without internet after first load
- Installable to home screen
- All data persists locally (no server dependency)
- Service worker caching

---

## User Interface

### Design

- Clean, minimal interface
- Responsive design (mobile, tablet, desktop)
- CSS design tokens for consistent styling
- Light theme (dark mode planned)

### Accessibility

- Keyboard navigation throughout
- Focus visible styles
- ARIA labels on interactive elements
- WCAG AA color contrast

### Navigation

- Header with current page indication
- Back buttons on detail pages (top and bottom)
- Filter state preserved when navigating
- Browser back button works correctly

### Editing Patterns

- Section-based editing (not mega-forms)
- Inline editing for text fields
- Dialog-based editing for structured data
- Collapsible sections for lengthy content
- Destructive mode toggle for delete actions

---

## Technical Details

### Database

- SQLite via sql.js (WebAssembly)
- IndexedDB for persistence
- Migration system for schema updates
- Foreign key constraints

### Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

### Testing

- Unit tests with Vitest
- E2E tests with Playwright
- Component tests with Testing Library
