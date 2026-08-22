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

### Today

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
- SQLite database persists in browser IndexedDB
- Works indefinitely without internet or servers
- Export/import database for backup or portability

---

## How It Works

### Three Areas of Focus

**Kanji** — The characters themselves. Meanings, classifications, cultural significance, how you understand them.

**Components** — The building blocks. Radicals and sub-components, how they combine, what patterns emerge, what shapes they take.

**Vocabulary** — The practical application. How kanji form words, which readings are used, what meanings emerge from combinations.

Each area supports the others. Components help you understand kanji. Kanji help you understand vocabulary. Vocabulary deepens your understanding of kanji.

### This Is a Personal Tool

This project is **not a service or a multi-user platform**. It's built for you to use alone:

- No "users" — just you
- No authentication or accounts
- No servers or syncing
- No performance optimization for scale
- No metrics or analytics

Design decisions always prioritize: "Does this serve the individual better?" not "Does this scale?"

---

## Technical Details

Built with Vue 3, TypeScript, and SQL.js (SQLite in WebAssembly). Everything runs in the browser. No server needed.

**Stack:**

- Vue 3 Composition API
- TypeScript (strict mode)
- SQLite via sql.js (WebAssembly, persistent in IndexedDB)
- Reka UI (accessible, headless components)
- vee-validate + zod (form validation)
- Vite + PWA Plugin
- Vitest + Playwright (testing)

**Data:**

- Portable SQLite file
- Export/import anytime
- Runs completely offline

---

## 📁 Project Structure

```
src/
├── api/                        # API layer (repositories, queries, mutations)
├── modules/                    # Feature modules (kanji-list, kanji-detail, etc.)
├── pages/                      # Route entry points (thin wrappers)
├── base/                       # Generic, reusable components and composables
├── shared/                     # App-specific shared code
├── db/                         # Database initialization, migrations, lifecycle
├── router/                     # Vue Router configuration
└── styles/                     # Global styles and design tokens

e2e/                            # End-to-end tests (Playwright)
test/                           # Unit test setup and helpers
docs/                           # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

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

The app will open in your browser. All data is saved locally in IndexedDB.

### Building for Production

```bash
pnpm build     # Create optimized production build
pnpm preview   # Preview the production build locally
```

The built app is a fully-functional PWA. Install it on your device via the browser menu.

---

## 📚 Development

### Available Commands

```bash
pnpm dev              # Start dev server (hot reload)
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm lint             # Lint code (ESLint + Prettier + Stylelint)
pnpm format           # Format code with Prettier
pnpm type-check       # TypeScript type checking
```

### Working with Makefile

For efficiency during development, use the Makefile for incremental checks:

```bash
make lint-changed       # Lint only changed files
make test-changed       # Test only affected areas
make lint FILES="src/foo.ts"  # Lint specific files
make ci-full            # Full validation (lint + unit + E2E)
```

### Development Workflow

1. Create a feature branch
2. Make changes and test locally (`pnpm dev`)
3. Run lint and tests (`make lint-changed`, `make test-changed`)
4. Commit with conventional commit format
5. Push and create a pull request

---

## 🔐 Privacy & Data

- **All data stays local** — Nothing is sent to external servers
- **Full ownership** — Export your database anytime as a standard SQLite file
- **Offline-first** — Works without internet connection
- **Standard format** — SQLite is a widely-supported, future-proof format

Your dictionary is yours.

---

## License

LGPL-2.1
