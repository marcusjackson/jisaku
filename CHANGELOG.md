# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [1.3.0] - 2026-10-21

### Added

- Kanji detail: a kanji's radical can now be cleared.

### Fixed

- Data safety: importing a database now builds the new data first and swaps it in last, so a failed import no longer leaves you with half your data.
- Data safety: Clear All Data, and create-and-link, each run as a single transaction. Nested transactions join the outer one.
- Data safety: migrations run with foreign keys off; foreign keys stay on after an export; the final save starts writing immediately; and the app only saves on hide when something changed.
- Kanji detail: classification type changes now save, dialogs close only after a successful save, new meaning and group rows are numbered correctly and blank ones are dropped, group member order is stable, and the component picker refreshes.
- Component detail now starts fresh when you move between components instead of keeping the previous one's state; component and vocabulary validation (stroke count, character, headline length) is now consistent.
- Lists: filters and sort survive going into a detail page and back; a failed load shows a message and clears on the next load; kanji added in the same second sort newest first.
- Settings: duplicate type names are reported, emptied names are cleared, and type lists reload after an import.
- Accessibility and polish: the theme applies before first paint, Japanese text is marked as Japanese for screen readers, focus rings use `:focus-visible`, load errors are announced, and the app icons and colour tokens are filled in.

### Changed

- Internal cleanup: dead code and unused repository methods removed, shared option types unified, a large batch of review fixes across the settings, vocabulary, kanji and component modules, and updated dependencies (Vitest 5, Reka UI 2.11).

## [1.2.0] - 2026-08-23

### Added

Following features new UI completed:

- Component detail: Groupings section for organizing related components.
- Vocabulary detail: Basic Information and Kanji Breakdown sections.
- Settings: manage position types and classification types (create/edit/reorder).

### Fixed

- Database sometimes failed to load in the browser (sql.js WASM binary serving).
- Vocabulary detail headline edit button lost its inline layout on mobile.
- Various accessibility and correctness issues (drop-zone semantics, a11y, import order).
