# Jisaku (自作) - Build Your Own Kanji Dictionary

> **自作** (jisaku): "self-made", "homemade", "one's own creation"

A personal tool for building your own Japanese language reference through research and documentation.

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

- Kanji entries with structured notes (etymology, cultural context, personal observations)
- Component decomposition and analysis
- Organization by JLPT levels, Joyo grades, stroke counts
- Fully offline, installable as a PWA
- Export/import as SQLite file

### Planned

- Component forms (how shapes change: 水 → 氵)
- Position tracking (hen, tsukuri, etc.)
- Per-occurrence notes for each component appearance
- Manual groupings for pattern analysis
- Readings system (on-yomi, kun-yomi)
- Meanings (Japanese dictionary influenced, ordered by frequency)
- Vocabulary integration
- Phonetic component analysis

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
├── modules/                    # Feature modules
│   ├── kanji/                  # Kanji CRUD and analysis
│   ├── kanji-list/             # Kanji browsing and search
│   ├── components/             # Component management and analysis
│   ├── vocabulary/             # Vocabulary system
│   └── settings/               # App settings, DB export/import
├── base/                       # Generic, reusable components
│   ├── components/             # BaseButton, BaseInput, etc.
│   ├── composables/            # useLocalStorage, useMediaQuery, etc.
│   └── utils/                  # Generic utilities
├── shared/                     # App-specific shared code
│   ├── components/             # SharedHeader, SharedPageContainer
│   ├── composables/            # useDatabase, useNotification
│   ├── types/                  # Database types, app types
│   ├── utils/                  # Kanji formatters, DB helpers
│   ├── validation/             # Common zod schemas
│   └── constants/              # App-wide constants
├── pages/                      # Route entry points
├── router/                     # Vue Router configuration
├── assets/                     # Static assets
└── styles/                     # Global styles, design tokens

docs/                           # Documentation
scripts/                        # Dev scripts (seeding, etc.)
e2e/                            # Playwright E2E tests
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

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
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm test         # Run unit tests
pnpm test:e2e     # Run E2E tests
pnpm lint         # Lint code
pnpm lint:css     # Lint CSS
pnpm format       # Format code
```

---

## 📖 Documentation

- **[Features](docs/features.md)** — Current and planned features
- **[Architecture](docs/architecture.md)** — Module structure, patterns
- **[Conventions](docs/conventions.md)** — Naming, coding standards
- **[Schema](docs/schema.md)** — Database schema reference
- **[Testing](docs/testing.md)** — Testing strategy and patterns
- **[Design Tokens](docs/design-tokens.md)** — Theming and styling
- **[Phase 1: Component System Overhaul](docs/plan/v1-implementation-plan.md#phase-1-component-system-overhaul)** — Enhanced components, forms, and analysis
- **[Phase 2: Readings System](docs/plan/v1-implementation-plan.md#phase-2-readings-system)** — On-yomi, kun-yomi support
- **[Phase 3: Vocabulary System](docs/plan/v1-implementation-plan.md#phase-3-vocabulary-system)** — Vocabulary entries and linking

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
