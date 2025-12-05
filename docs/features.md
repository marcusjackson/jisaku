# Features

This document describes the current and planned features for Jisaku.

---

## Overview

Jisaku supports **kanji curation and analysis** through three integrated areas:

- **Kanji** — Entries with structured notes, classifications, and metadata
- **Components** — Analysis of kanji building blocks and their patterns
- **Vocabulary** — Integration of words and readings with kanji

---

## Current Features

### Kanji Management

- Create, view, edit, and delete kanji entries
- Stroke count and radical tracking
- JLPT and Joyo level classification
- Structured notes (etymology, cultural context, personal observations)
- Stroke diagram and animation images
- Link components to kanji with position analysis
- Search and filter kanji by multiple criteria

### Component Analysis

- Manage component (radical and sub-component) entries
- Track component forms (visual variations)
- Analyze component positions in kanji (hen, tsukuri, kanmuri, ashi, etc.)
- Per-occurrence notes and analysis
- Manual grouping for pattern discovery
- Link components to kanji

### Data Management

- Export database as SQLite file
- Import database from SQLite file
- Offline-first PWA with full app functionality offline
- Installable to home screen
- All data persists locally (no server)

### Search & Organization

- Filter kanji by stroke count (range)
- Filter by JLPT level, Joyo level, or component
- Filter by radical or other classifications
- Search by exact character match
- Persistent filter state in URL

### User Interface

- Responsive design (mobile, tablet, desktop)
- Keyboard accessible
- Header navigation with current page indication
- Loading states and error handling
- Form validation with inline error messages

---

## Planned Features

### Phase 1: Enhanced Components (In Progress)

- Component forms management UI (multiple visual shapes)
- Component occurrences with per-occurrence analysis
- Position type selector with visual feedback
- Manual component grouping interface
- Radical identification and sorting by 部首索引

### Phase 2: Readings System

- On-yomi (音読み) readings per kanji
- Kun-yomi (訓読み) readings with okurigana support
- Primary/common reading flags
- Phonetic component analysis
- Reading-specific notes and usage context

### Phase 3: Vocabulary System

- Vocabulary entries with readings and meanings
- Link vocabulary to kanji
- Track which kanji reading is used in which vocabulary
- Vocabulary role assignment (meaning-bearer, sound-bearer, etc.)
- Vocabulary-specific analysis and patterns

### Phase 4: Additional Kanji Metadata

- Multiple meanings per kanji (Kanjipedia-style)
- Language support (Japanese and English meanings)
- Related kanji (類義語, 対義語)
- Kanji Kentei level support

### Phase 5: Navigation & Polish

- Bottom navigation bar
- Home page with statistics
- Enhanced search capabilities
- Visual polishing and theme refinement

### Phase 6: Advanced Features

- Future enhancements and expansions

---

## Detailed Feature Breakdown

### Kanji List Page (`/`)

- Display all kanji in responsive grid/table
- Show kanji character, stroke count, level badges
- Click to navigate to detail page
- "Add Kanji" button
- Empty state when no kanji exist

**Filters:**

- Stroke count (range)
- JLPT level (multi-select)
- Joyo level (multi-select)
- Component (select from existing)
- Radical (select from existing)
- Filters persist in URL query params

**States:**

- Loading spinner on initial load
- Error message if database fails
- Empty state and no-results state

### Kanji Detail Page (`/kanji/:id`)

- Large kanji character display
- Stroke count, radical, level badges
- Stroke diagram image and GIF animation
- Linked components list
- Structured notes (etymology, cultural context, personal)
- Edit and delete buttons
- 404 state if not found

### Kanji Create/Edit Pages

- Character input (unique, single character)
- Stroke count (1-64)
- Radical selector
- JLPT and Joyo level selectors
- Image uploads (stroke diagram and GIF)
- Component multi-selector
- Structured notes (three categories)
- Form validation with inline errors
- Success/error feedback

### Component List Page (`/components`)

- Display all components in list/grid
- Show character, description, source kanji
- Click to view detail
- "Add Component" button
- Empty state

### Component Detail Page (`/components/:id`)

- Component character (large)
- Stroke count and descriptions
- Source kanji (if applicable)
- List of kanji using this component
- Edit and delete buttons

### Component Management

- Create/edit component forms
- Character, stroke count, descriptions
- Source kanji selector
- Japanese name field

### Settings Page (`/settings`)

- Export database button (downloads with timestamp)
- Import database button (with validation)
- Clear all data button (with confirmation)
- App version display

### Accessibility

- All interactive elements keyboard accessible
- Focus visible styles
- ARIA labels for icon buttons
- WCAG AA color contrast

---

## Technical Specifications

### Database

- SQLite via sql.js (WebAssembly)
- IndexedDB persistence
- Foreign key constraints enabled
- Migration system for schema updates

### Performance

- Smooth scrolling with 100+ kanji
- Responsive UI interactions
- Optimized indexes for query performance

### Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

### Offline Capability

- Service worker caching
- Full functionality offline after first load
- Database persists across sessions

---

## Definition of Done

A feature is complete when:

1. All acceptance criteria met
2. Component tests pass
3. E2E test covers happy path
4. No TypeScript errors
5. No ESLint/Stylelint errors
6. Responsive and accessible
7. Loading and error states handled
8. Code reviewed
