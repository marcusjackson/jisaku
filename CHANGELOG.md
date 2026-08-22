# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

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
