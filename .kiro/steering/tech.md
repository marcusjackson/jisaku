# Technology Stack

## Architecture

**Modular, offline-first PWA** with SQLite persistence and strict component hierarchy.

Key principles:

- Feature modules isolated by domain (kanji, component, vocabulary)
- Centralized API layer (repository pattern) for all database access
- Three-tier component hierarchy (Root/Section/UI) with enforced file size limits
- Base code (generic) vs Shared code (app-specific) separation

## Core Technologies

- **Language**: TypeScript (strict mode, no `any`)
- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **Runtime**: Node.js 20+, browser-based via Vite
- **Database**: SQLite via sql.js (WebAssembly, in-browser)
- **Build**: Vite 6 with PWA plugin
- **Package Manager**: pnpm 9+ (required)

## Key Libraries

- **reka-ui** — Headless accessible components (no opinionated styling)
- **vee-validate + zod** — Form validation and schema-based type safety
- **vue-router** — Dual routing (legacy + new UI during refactoring)
- **sql.js** — SQLite engine compiled to WebAssembly

## Development Standards

### Type Safety

- TypeScript strict mode enabled
- No `any` types — explicit types required
- `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` enforced
- Zod schemas for runtime validation

### Code Quality

- **ESLint**: TypeScript strict, Vue recommended, import sorting
- **Prettier**: Consistent formatting
- **File size limits**: Enforced via ESLint (Root: 200, Section: 250, UI: 200, Composable: 200)
- **Import order**: Vue → third-party → base → api → shared → module → types

### Testing

- **Unit**: Vitest + Testing Library (colocated `.test.ts` files)
- **E2E**: Playwright (Chromium)
- **Commands**: `pnpm test`, `pnpm test:e2e`, `pnpm ci:full`

### CSS

- Design token variables (never hardcode values)
- `--color-*`, `--spacing-*`, `--font-*` patterns
- PostCSS with preset-env

## Development Environment

### Required Tools

- Node.js 20+
- pnpm 9+ (not npm/yarn)
- Modern browser with WebAssembly support

### Common Commands

```bash
pnpm dev           # Dev server
pnpm build         # Production build
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests
pnpm ci:full       # All checks + tests
pnpm lint          # Lint + format check
pnpm type-check    # TypeScript validation
```

## Key Technical Decisions

**SQLite in browser via sql.js** — Enables offline-first with full relational database capabilities without server infrastructure.

**Repository pattern in API layer** — Centralizes all database access, preventing SQL scattered throughout components. Modules call repositories, never direct database queries.

**Component file size limits** — Enforces decomposition patterns (handler extraction, mode splitting) to maintain code quality as features grow.

**Base vs Shared separation** — Generic code (`base/`) can be copy-pasted to any Vue project. App-specific code (`shared/`) lives separately. This maintains reusability and clear boundaries.

**No Pinia** — Component state + composables + SQLite as source of truth. Simpler mental model for single-user, offline-first app.

---

_created: 2026-01-10_
