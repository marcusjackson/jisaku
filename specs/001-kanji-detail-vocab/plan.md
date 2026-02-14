# Implementation Plan: Kanji Detail Vocabulary Section Refactor

**Branch**: `001-kanji-detail-vocab` | **Date**: 2026-01-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-kanji-detail-vocab/spec.md`

## Summary

Refactor the Kanji Detail Vocabulary section to use dialog-based editing, replacing inline editing with a modal interface. The section displays all vocabulary entries that contain the current kanji, allowing users to view, link, quick-create, and unlink vocabulary entries. Implementation follows established patterns from other refactored kanji detail sections (Readings, Meanings, BasicInfo), using SharedSection for layout, dialog-based CRUD operations, vee-validate + zod for forms, and proper test coverage. All functionality from the legacy KanjiDetailVocabulary component must be replicated with improvements: mobile-responsive dialogs, accessibility enhancements, and destructive mode integration.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: Vue 3.4+ (Composition API, `<script setup>`), vee-validate 4.x, zod 3.x, Reka UI (headless components)  
**Storage**: SQLite via sql.js (WebAssembly, browser-based), IndexedDB persistence  
**Testing**: Vitest (unit/component), Playwright (E2E), Testing Library (component queries)  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), PWA-enabled, offline-first  
**Project Type**: Web application (SPA with Vue Router)  
**Performance Goals**: Vocabulary list render <1s, search results <500ms, all operations complete <100ms, E2E tests complete <1s each  
**Constraints**: File size limits enforced by ESLint (Section ≤250 lines, UI ≤200 lines, Composables ≤200 lines), offline-capable, no external API dependencies, mobile responsive (320px+)  
**Scale/Scope**: Single feature module with ~8-10 components, ~2-3 composables, ~2-3 schemas, full E2E coverage for CRUD flows

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. File Size Discipline ✅ PASS

- All components designed to stay within limits (Section ≤250, UI ≤200, Composables ≤200)
- KanjiDetailSectionVocabulary: Estimated ~100 lines (Section orchestrator with dialog toggle)
- KanjiDetailDialogVocabulary: Estimated ~180 lines (Edit dialog with search/list)
- KanjiDetailVocabularyDisplay: Estimated ~100 lines (View mode list with links)
- KanjiDetailVocabularyItem: Estimated ~60 lines (Single vocabulary display component)
- use-kanji-detail-vocabulary-handlers.ts: Estimated ~150 lines (Link/unlink/create handlers)
- Vocabulary schema: Estimated ~40 lines (Quick-create form validation)

**Justification**: Component decomposition follows established patterns. Each component has single responsibility. Handlers extracted to composable to keep Root component under 200 lines.

### II. Modular Architecture ✅ PASS

- Code organized in `src/modules/kanji-detail/` (components, composables, schemas, utils)
- All database access through `src/api/vocabulary/` repositories (useVocabularyRepository, useVocabKanjiRepository)
- No direct imports from legacy - legacy code copied/adapted as needed
- Component hierarchy: KanjiDetailRoot → KanjiDetailSectionVocabulary → KanjiDetailVocabularyDisplay + KanjiDetailDialogVocabulary → KanjiDetailVocabularyItem
- Naming conventions: All components prefixed `KanjiDetail`, all files include `kanji-detail` in name

**Justification**: Follows exact pattern from Readings and Meanings sections. No architectural deviations.

### III. Offline-First & Data Sovereignty ✅ PASS

- All operations use local SQLite database (sql.js + IndexedDB)
- No external API calls for core functionality
- Vocabulary search operates on local data only
- Quick-create persists to local database
- All CRUD operations work offline

**Justification**: Feature inherently offline - searches and modifies local vocabulary/kanji junction table.

### IV. Test-Driven Development ✅ PASS

- Unit tests for all components (colocated `.test.ts` files)
- Component tests for user interactions (Testing Library queries)
- E2E test for complete CRUD workflow in `e2e/kanji-detail.test.ts`
- Target coverage: 80%+ for composables/utilities, 70%+ for components
- E2E tests designed for <1s execution (no arbitrary waits, use `waitFor`)

**Justification**: Matches test coverage patterns from Readings/Meanings sections. Reuses test helpers from existing kanji-detail tests.

### V. Accessibility & Standards ✅ PASS

- Semantic HTML (RouterLink for navigation, button for actions, ul/li for vocabulary list)
- Keyboard navigation in all dialogs (Tab, Enter, Escape supported)
- ARIA labels on icon-only buttons ("Edit vocabulary", "Add vocabulary", "Remove vocabulary")
- Visible focus indicators (design tokens provide this)
- Form validation with inline errors (vee-validate + zod)
- Dialog focus management (Reka UI Dialog handles this)

**Justification**: Reka UI components provide accessible primitives. Testing Library queries enforce semantic selectors.

### VI. Progressive Enhancement ✅ PASS

- All CSS uses design token variables (`var(--spacing-md)`, `var(--color-text-primary)`, etc.)
- No hardcoded colors, spacing, or typography
- Scoped styles on all components (`<style scoped>`)
- Mobile responsive layout (tested down to 320px width)
- Dialog max-width ensures proper display on small screens

**Justification**: Design tokens centralize visual consistency. Mobile responsiveness tested in E2E suite.

**Overall Assessment**: ✅ **COMPLIANT** - No constitution violations. All principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/001-kanji-detail-vocab/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (completed)
├── research.md          # Phase 0 output (generated below)
├── data-model.md        # Phase 1 output (generated below)
├── quickstart.md        # Phase 1 output (generated below)
├── contracts/           # Phase 1 output (API contracts - generated below)
│   ├── vocabulary-display.interface.ts
│   ├── vocabulary-handlers.interface.ts
│   └── vocabulary-search.interface.ts
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
src/modules/kanji-detail/
├── components/
│   ├── KanjiDetailSectionVocabulary.vue         # NEW: Section orchestrator
│   ├── KanjiDetailSectionVocabulary.test.ts     # NEW: Section tests
│   ├── KanjiDetailDialogVocabulary.vue          # NEW: Edit dialog
│   ├── KanjiDetailDialogVocabulary.test.ts      # NEW: Dialog tests
│   ├── KanjiDetailVocabularyDisplay.vue         # NEW: View mode display
│   ├── KanjiDetailVocabularyDisplay.test.ts     # NEW: Display tests
│   ├── KanjiDetailVocabularyItem.vue            # NEW: Single vocab item
│   ├── KanjiDetailVocabularyItem.test.ts        # NEW: Item tests
│   ├── KanjiDetailVocabularySearch.vue          # NEW: Search interface
│   ├── KanjiDetailVocabularySearch.test.ts      # NEW: Search tests
│   ├── KanjiDetailQuickCreateVocabulary.vue     # NEW: Quick-create form
│   ├── KanjiDetailQuickCreateVocabulary.test.ts # NEW: Quick-create tests
│   └── KanjiDetailRoot.vue                      # MODIFY: Add vocabulary section
│
├── composables/
│   ├── use-kanji-detail-vocabulary-handlers.ts      # NEW: Link/unlink/create
│   ├── use-kanji-detail-vocabulary-handlers.test.ts # NEW: Handler tests
│   └── use-kanji-detail-state.ts                    # MODIFY: Add vocabulary state
│
├── schemas/
│   ├── kanji-detail-vocabulary-quick-create-schema.ts       # NEW: Validation
│   └── kanji-detail-vocabulary-quick-create-schema.test.ts  # NEW: Schema tests
│
├── utils/
│   └── (no new files needed)
│
├── kanji-detail-types.ts                        # MODIFY: Add vocabulary types
└── index.ts                                     # MODIFY: Export new components

src/api/vocabulary/
├── vocabulary-repository.ts          # EXISTS: getAll, getById, create methods
├── vocabulary-queries.ts             # EXISTS: Query operations
├── vocabulary-mutations.ts           # EXISTS: Mutation operations
├── vocab-kanji-repository.ts         # EXISTS: Junction table operations
├── vocabulary-types.ts               # EXISTS: Type definitions
└── index.ts                          # EXISTS: Exports

e2e/
└── kanji-detail.test.ts              # MODIFY: Add vocabulary CRUD tests

test/helpers/
└── vocabulary-test-helpers.ts        # NEW: Test data factories
```

**Structure Decision**: This feature extends the existing `kanji-detail` module with new components following the established Section → Dialog → Display → Item pattern. All vocabulary-related components are colocated in `src/modules/kanji-detail/components/` with the `KanjiDetail` prefix. Handlers are extracted to a dedicated composable to keep KanjiDetailRoot under 200 lines. The API layer at `src/api/vocabulary/` already exists with all required repository methods, so no API changes needed. Tests are colocated with source files per project conventions.

## Complexity Tracking

> **No violations requiring justification**

This feature complies with all constitution principles without requiring any complexity justifications. All architectural decisions follow established patterns:

- File count remains manageable (~10 components, 2-3 composables, 2-3 schemas)
- Component hierarchy follows standard Root → Section → Dialog → Display → Item pattern
- No repository pattern complexity (API layer already exists)
- No additional projects or services introduced
- Testing strategy matches existing modules

**Simplicity maintained through**:

- Reuse of existing API layer (no new repositories needed except one join query method)
- Reuse of SharedSection, SharedConfirmDialog, Reka UI Dialog components
- Copy/adapt search pattern from other sections rather than over-abstracting
- Single composable for handlers rather than splitting prematurely
- Colocated tests with source files (no separate test infrastructure)
