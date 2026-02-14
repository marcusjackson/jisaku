# Jisaku Constitution

<!--
Sync Impact Report
==================
Version Change: 1.0.0 (Initial ratification)
Ratification Date: 2026-01-10
Last Amended: 2026-01-10

Principles Established:
- I. File Size Discipline (CRITICAL)
- II. Modular Architecture
- III. Offline-First & Data Sovereignty
- IV. Test-Driven Development
- V. Accessibility & Standards
- VI. Progressive Enhancement

Templates Requiring Updates:
✅ plan-template.md - Constitution Check section aligns
✅ spec-template.md - User story requirements align
✅ tasks-template.md - Task categorization aligns
✅ No command-specific files requiring agent updates

Follow-up TODOs: None - all placeholders filled
-->

## Core Principles

### I. File Size Discipline (CRITICAL)

**MANDATORY**: All source files MUST respect strict line count limits enforced by ESLint. Limits exclude comments and blank lines (`skipBlankLines: true, skipComments: true`).

**Limits**:

- Test files: max **600** lines
- Type definition files: max **300** lines
- Section components: max **250** lines
- Root components: max **200** lines
- Composables: max **200** lines
- Repositories: max **250** lines
- UI components: max **200** lines
- Page components: max **100** lines

**Enforcement**: Run `pnpm lint` to verify. Never manually count lines - ESLint is source of truth.

**When approaching limits**:

- Root components → Extract handlers to `use-[module]-detail-handlers.ts`
- Section components → Split into ViewMode/EditMode components
- Large composables → Split into queries/mutations files
- Large repositories → Split into queries/mutations patterns

**Rationale**: File size discipline prevents monolithic code, enforces single responsibility, and maintains readability. Small files are easier to test, debug, and refactor. This is non-negotiable - exceeding limits breaks the build.

### II. Modular Architecture

**MANDATORY**: Code MUST be organized by feature modules with clear boundaries. No direct cross-module imports. All data access through centralized API layer.

**Structure rules**:

- Features live in `src/modules/[feature]/` with components, composables, schemas, types, utils
- Generic code (works in ANY Vue project) goes in `src/base/`
- App-specific shared code goes in `src/shared/`
- All database access through `src/api/` repositories
- Pages are thin wrappers in `src/pages/`

**Component hierarchy**:

- **Root** (max 200 lines): Page orchestration, data fetching, loading/error states
- **Section** (max 250 lines): Layout organization, mode management (view/edit)
- **UI** (max 200 lines): Presentation only, props in/events out

**Rationale**: Modular architecture with enforced boundaries prevents coupling, enables parallel development, and makes testing straightforward. The API layer abstracts database concerns. Component hierarchy ensures predictable organization.

### III. Offline-First & Data Sovereignty

**MANDATORY**: Application MUST function completely offline. All data MUST remain local to user's browser. No external API dependencies for core functionality.

**Requirements**:

- SQLite database runs in browser via sql.js (WebAssembly)
- All CRUD operations work without network
- PWA installable for offline use
- Database export/import as SQLite files for user control
- IndexedDB persistence for database durability

**Rationale**: Users own their research data completely. No cloud lock-in, no privacy concerns, no network dependency. Data portability is fundamental - users can take their SQLite file anywhere.

### IV. Test-Driven Development

**MANDATORY**: New features and bug fixes MUST include appropriate test coverage before merging. All tests MUST pass before deployment.

**Coverage targets**:

- Unit tests (composables, utils, schemas): 80%+ coverage
- Component tests (user interactions): 70%+ coverage
- E2E tests: Critical CRUD flows and data integrity paths

**Testing rules**:

- Tests colocated with source files (`[filename].test.ts`)
- E2E tests in `e2e/` directory
- Use Testing Library queries (accessibility-based selection)
- No arbitrary waits in E2E - use `waitFor` state changes
- Full test suite (`pnpm ci:full`) must pass before merge

**Rationale**: Tests prevent regressions, document behavior, and enable confident refactoring. Colocated tests improve discoverability. Accessibility-based queries ensure semantic HTML.

### V. Accessibility & Standards

**MANDATORY**: All interactive UI MUST be keyboard accessible and follow WCAG 2.1 AA standards.

**Requirements**:

- Semantic HTML elements (not div-soup)
- Keyboard navigation for all interactive elements
- ARIA labels on icon-only buttons
- Visible focus indicators
- Form validation with inline error messages
- Sufficient color contrast (design tokens enforce this)

**Rationale**: Accessibility is not optional. Keyboard users, screen reader users, and users with motor disabilities must have full access. Semantic HTML benefits SEO and assistive technology.

### VI. Progressive Enhancement

**MANDATORY**: CSS MUST use design token variables. No hardcoded values for colors, spacing, typography, or effects.

**Rules**:

- All styles use `var(--token-name)` from design system
- Design tokens in `src/styles/` centralize visual consistency
- Scoped styles required (`<style scoped>`)
- No inline styles except for dynamic computed values

**Example**:

```css
/* ✅ Correct */
.card {
  padding: var(--spacing-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
}

/* ❌ Wrong - hardcoded values */
.card {
  padding: 16px;
  background: #ffffff;
  color: #333;
}
```

**Rationale**: Design tokens enable theming, enforce visual consistency, and prevent magic numbers. Centralized design system makes global style changes trivial.

## Development Workflow

### Code Quality Gates

**Before any code review**:

1. File sizes within limits (`pnpm lint` passes)
2. TypeScript strict mode - zero `any` types
3. All tests pass (`pnpm ci:full`)
4. No console.log statements in production code
5. Loading and error states handled in Root components
6. CSS uses design token variables

### Refactoring Protocol

When files approach size limits:

1. Check `docs/refactor/` for decomposition patterns
2. Plan extraction before implementing new features
3. Maintain test coverage during extraction
4. Update imports across dependent files

**Documented patterns**:

- `docs/refactor/session-2-components/` - Component decomposition strategies
- `docs/refactor/session-1-architecture/` - Repository splitting patterns

### Commit Standards

Follow Conventional Commits format:

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore, perf
Scopes: kanji, component, vocabulary, settings, base, shared, db
```

**Examples**:

- `feat(kanji): add reading grouping to meanings section`
- `fix(vocabulary): correct JLPT level filtering logic`
- `refactor(component): extract handlers to composable`
- `test(kanji): add E2E test for classification editing`

## Quality Standards

### TypeScript Requirements

- Strict mode enabled in `tsconfig.json`
- Explicit types on all function parameters and return values
- Use `import type` for type-only imports
- No `any` types - use `unknown` with type guards if needed

### Import Organization

```typescript
// 1. Vue/framework imports
import { ref, computed } from 'vue'

// 2. Third-party libraries
import { useForm } from 'vee-validate'

// 3. Base imports (@/base/...)
import BaseButton from '@/base/components/BaseButton.vue'

// 4. API imports (@/api/...)
import { useKanjiRepository } from '@/api/kanji'

// 5. Shared imports (@/shared/...)
import { useDatabase } from '@/shared/composables/use-database'

// 6. Module imports (relative ./ or ../)
import KanjiCard from './KanjiCard.vue'

// 7. Type imports (import type)
import type { Kanji } from '../kanji-types'
```

### File Naming Conventions

| Type           | Pattern                     | Example                     |
| -------------- | --------------------------- | --------------------------- |
| Vue components | `PascalCase.vue`            | `KanjiRootDetail.vue`       |
| TypeScript     | `kebab-case.ts`             | `use-kanji-repository.ts`   |
| Composables    | `use-[name].ts`             | `use-kanji-detail-state.ts` |
| Types          | `[module]-types.ts`         | `kanji-types.ts`            |
| Schemas        | `[module]-[form]-schema.ts` | `kanji-form-schema.ts`      |
| Tests          | `[filename].test.ts`        | `KanjiForm.test.ts`         |

### Error Handling Strategy

| Error Type          | Treatment                          |
| ------------------- | ---------------------------------- |
| Form validation     | Inline errors below fields         |
| Database operations | Toast notification                 |
| Not found (404)     | Empty state on page                |
| Loading states      | Spinner/skeleton in Root component |

## Governance

### Amendment Procedure

1. Propose amendment in discussion (document rationale)
2. Verify compliance with `.github/instructions/` files
3. Update constitution with semantic versioning
4. Propagate changes to templates and documentation
5. Update this Sync Impact Report

### Versioning Policy

Constitution follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Backward incompatible governance changes (principle removal/redefinition)
- **MINOR**: New principle added or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, non-semantic refinements

### Compliance Review

All pull requests MUST:

- Verify file sizes are within limits
- Check TypeScript strict mode compliance
- Ensure test coverage requirements met
- Validate accessibility standards (keyboard nav, ARIA)
- Confirm design token usage in CSS

**Constitution supersedes** all other coding practices. When conflict arises between documentation files and this constitution, constitution wins.

For runtime development guidance and detailed implementation patterns, consult:

- `.github/instructions/` - Mandatory coding standards by file type
- `.github/copilot-instructions.md` - Agent-specific development guidance
- `docs/architecture.md` - System design and component patterns
- `docs/conventions.md` - Naming rules and best practices
- `docs/testing.md` - Testing strategy and patterns
- `docs/refactor/` - File size management and decomposition guides

**Version**: 1.0.0 | **Ratified**: 2026-01-10 | **Last Amended**: 2026-01-10
