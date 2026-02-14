# Jisaku (自作) - Build Your Own Kanji Dictionary

> **自作** (jisaku): "self-made", "homemade", "one's own creation"

A personal tool for building your own Japanese language reference through research and documentation.

---

## ⚠️ Refactoring In Progress

This project is undergoing a major UI refactoring. Two versions are available during the transition:

| Version    | URL Prefix  | Status                              |
| ---------- | ----------- | ----------------------------------- |
| **New UI** | `/`         | Under construction (coming soon)    |
| **Legacy** | `/legacy/*` | Fully functional, existing features |

**What this means:**

- The app defaults to the legacy UI at `/legacy/kanji`
- New routes will show a "Coming Soon" placeholder
- All existing functionality remains available via legacy routes
- Once new UI is complete, legacy will be removed

See `docs/refactor/` for detailed migration plans.

---

## What This Is

This is a tool I built for myself to research and document kanji. Instead of consuming pre-made dictionary content, I wanted to build my own reference by hand — researching etymologies, analyzing components, documenting patterns as I find them.

### Why Build Your Own Dictionary?

For me, the process of researching and writing entries is where the learning happens. Looking up a kanji in several different sources, synthesizing what matters — that's how I understand things.

### Who Might Want This

- People who learn by creating, not just reading
- Those frustrated by incomplete or scattered resources
- Anyone interested in deep etymology or linguistic analysis
- Learners who want full control over their data

---

## What It Can Do

### Current

**Kanji Management:**

- Create, edit, and organize kanji entries
- Readings (on-yomi and kun-yomi with grade levels)
- Multiple meanings with ordering and reading groupings
- Classifications (象形文字, 指事文字, 会意文字, 形声文字, 仮借字)
- JLPT and Joyo level organization
- Stroke order diagrams and animations
- Structured notes (etymology, semantic analysis, education & mnemonics, personal)

**Component Analysis:**

- Track kanji building blocks and radicals
- Component forms (visual variants like 水 → 氵 → 氺)
- Occurrence tracking with position types (hen, tsukuri, kanmuri, etc.)
- Per-occurrence analysis notes
- Custom groupings for pattern discovery

**Vocabulary System:**

- Vocabulary entries with readings and meanings
- Kanji breakdown showing constituent characters
- Integration with kanji pages
- JLPT level classification and filtering

**Offline & Data:**

- Fully offline, installable as PWA
- Export/import database as SQLite file
- All data stored locally in your browser

---

## How It Works

### Three Areas of Focus

**Kanji** — The characters themselves. Meanings, classifications, cultural significance, how you understand them.

**Components** — The building blocks. Radicals and sub-components, how they combine, what patterns emerge, what shapes they take.

**Vocabulary** — The practical application. How kanji form words, which readings are used, what meanings emerge from combinations.

Each area supports the others. Components help you understand kanji. Kanji help you understand vocabulary. Vocabulary deepens your understanding of kanji.

---

## Technical Details

Built with Vue 3, TypeScript, and sql.js (SQLite in WebAssembly). Everything runs in the browser. No server needed.

**Stack:**

- Vue 3 Composition API
- SQLite via sql.js (persistent in IndexedDB)
- Reka UI for accessible components
- vee-validate + zod for forms
- Vitest + Playwright for testing
- Vite Plugin PWA

**Data:**

- Portable SQLite file
- Export/import anytime
- Runs completely offline

## 📁 Project Structure

```
src/
├── api/                        # API layer (repositories, types) - NEW
│   ├── kanji/                  # Kanji repository
│   ├── component/              # Component repository
│   ├── vocabulary/             # Vocabulary repository
│   └── ...                     # Other entity repositories
├── modules/                    # Feature modules (NEW UI)
├── pages/                      # Route entry points (NEW UI)
├── base/                       # Generic, reusable components
├── shared/                     # App-specific shared code
├── db/                         # Database layer
├── router/                     # Vue Router (dual routing)
├── styles/                     # Global styles, design tokens
└── legacy/                     # Legacy UI (during refactoring)
    ├── modules/                # Legacy feature modules
    ├── pages/                  # Legacy route entry points
    ├── base/                   # Legacy base components
    ├── shared/                 # Legacy shared code
    └── styles/                 # Legacy styles

e2e/
├── legacy/                     # Legacy E2E tests
└── (new tests will go here)

docs/
├── refactor/                   # Refactoring plans and guidelines
└── ...                         # Other documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd jisaku

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev            # Start dev server
pnpm build          # Build for production
pnpm preview        # Preview production build
pnpm test           # Run unit tests
pnpm test:e2e       # Run E2E tests (new UI)
pnpm test:e2e:legacy  # Run E2E tests (legacy UI)
pnpm lint           # Lint code (excludes legacy)
pnpm lint:legacy    # Lint legacy code
pnpm lint:css       # Lint CSS
pnpm format         # Format code
```

### Development Workflow

For efficient development, use the provided Makefile for running checks on specific files or changed files:

```bash
# Run all checks on changed files only
make check-changed

# Run all fixes on changed files only
make fix-changed

# Run tests on changed files + tests for changed source files
make test-changed

# Run checks on specific files
make check FILES="src/components/MyComponent.vue src/utils/helpers.ts"

# Run individual tools on specific files
make lint FILES="src/foo.ts"
make lint-css FILES="src/bar.vue"
make format FILES="src/baz.ts"
```

This is much faster than running full checks when working on specific features. Use the pnpm scripts above for comprehensive runs or CI.

---

## 📖 Documentation

- **[Features](docs/features.md)** — Current features overview
- **[Architecture](docs/architecture.md)** — Module structure, patterns
- **[Conventions](docs/conventions.md)** — Naming, coding standards
- **[Schema](docs/schema.md)** — Database schema reference
- **[Testing](docs/testing.md)** — Testing strategy and patterns
- **[Design Tokens](docs/design-tokens.md)** — Theming and styling
- **[Future Ideas](docs/future-ideas.md)** — Potential features and enhancements

---

## Development

```bash
pnpm install
pnpm dev
```

See [docs/](docs/) for architecture, conventions, and implementation plans.

---

## License

LGPL-2.1
