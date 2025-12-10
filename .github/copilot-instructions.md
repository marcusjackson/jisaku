# GitHub Copilot Instructions

Project-specific instructions for GitHub Copilot Agent mode.

## Project Context

**Jisaku** is a personal, offline-first PWA for researching and documenting kanji.

### Tech Stack

- Vue 3 (Composition API, `<script setup>`)
- TypeScript (strict mode)
- Vite + PWA
- SQLite via sql.js (browser-based)
- Reka UI (headless accessible components)
- vee-validate + zod (forms/validation)
- Vitest (unit tests) + Playwright (E2E)

### Key Directories

```
src/
├── modules/           # Feature modules (kanji, kanji-list, components, settings)
├── base/              # Generic primitives (works in ANY Vue project)
├── shared/            # App-specific shared code
├── pages/             # Route entry points (thin wrappers)
└── db/                # Database setup and migrations
docs/
├── plan/v1/         # V1 implementation plans (READ THESE)
└── *.md               # Architecture, conventions, schema docs
```

## V1 Planning Documents

Before starting implementation, read these planning docs in order:

1. `docs/plan/v1/00-overview.md` - Index, entity balance, short_meaning field
2. `docs/plan/v1/01-ui-patterns.md` - Entity-agnostic editing, quick-create
3. `docs/plan/v1/02-component-system.md` - Component page as occurrence hub
4. `docs/plan/v1/03-kanji-enhancements.md` - Readings, meanings, classifications
5. `docs/plan/v1/04-vocabulary.md` - Vocabulary system with balanced linking
6. `docs/plan/v1/05-base-components.md` - Reka UI integration audit
7. `docs/plan/v1/06-task-queue.md` - Ordered implementation tasks

**Key v1 Changes:**

- Kanji, components, and vocab are **equal peers** (not kanji-centric)
- Component occurrence analysis happens on **component page**, not kanji page
- New `short_meaning` field on all entities for search/display
- Quick-create forms are minimal (character, strokes, short_meaning)

## Testing Requirements

You must ensure pnpm is installed. It should be set up already in your environment.
If not, install it via `npm install -g pnpm@9.15.1`.

### Every Code Change Must Pass Tests

Before completing any implementation:

1. **Run unit tests**: `pnpm test`
2. **Run E2E tests**: `pnpm test:e2e`
3. **Fix any failures** before reporting completion

### Test Types

| Type  | Command           | When to Run                   |
| ----- | ----------------- | ----------------------------- |
| Unit  | `pnpm test`       | After any TS/Vue file changes |
| E2E   | `pnpm test:e2e`   | After any user-facing changes |
| Lint  | `pnpm lint`       | Before committing             |
| Types | `pnpm type-check` | After type-related changes    |

### Colocated Tests

Tests live next to source files:

```
KanjiForm.vue
KanjiForm.test.ts    ← unit test
```

E2E tests are in `e2e/` folder.

## Manual Playwright Verification

When E2E tests pass but you want to verify visually, use **headed mode**:

```bash
# Run specific test file in headed mode (visible browser)
pnpm exec playwright test e2e/kanji-crud.test.ts --headed

# Run specific test by name
pnpm exec playwright test -g "creates a new kanji" --headed

# Debug mode (step through with inspector)
pnpm exec playwright test e2e/kanji-crud.test.ts --debug
```

## Playwright MCP Browser Verification

Before finishing tasks that modify UI, you must verify visually in your MCP browser.

There's no test data by default, so when applicable go to the Settings page and click the "Seed Data" button in the Developer Tools section.

### Taking Screenshots

For debugging or verification:

```bash
# In test code - add this temporarily:
await page.screenshot({ path: 'debug-screenshot.png' })

# Or use Playwright's trace viewer for failed tests:
pnpm exec playwright test --trace on
pnpm exec playwright show-trace test-results/[test-folder]/trace.zip
```

## Reka UI Reference

Reka UI documentation is available at `docs/reference/reka-ui/` for these components:

- alert-dialog, checkbox, collapsible, combobox, dialog
- dropdown-menu, pagination, popover, select, switch
- tabs, toast, tooltip

When implementing or modifying base components, reference these docs for proper Reka UI patterns.

## Code Quality Checklist

Before marking any task complete:

- [ ] TypeScript strict - no `any`, explicit types
- [ ] CSS uses design token variables from `tokens.css`
- [ ] Components follow Root/Section/UI hierarchy
- [ ] Tests colocated with source files
- [ ] Loading and error states handled
- [ ] Keyboard accessible
- [ ] No console.log statements
- [ ] Unit tests pass (`pnpm test`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] No lint errors (`pnpm lint`)

## Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore, perf
Scopes: kanji, kanji-list, components, settings, base, shared, db, ui, router
```

Examples:

```
feat(kanji): add stroke count validation
fix(kanji-list): correct filter reset behavior
test(components): add unit tests for ComponentCard
```

## Package Manager: pnpm Only

This project uses **pnpm exclusively**. Do not use `npm` or `yarn`.

- `.npmrc` and `.pnpmrc` are configured to enforce pnpm
- `.gitignore` excludes `package-lock.json` (npm files)
- GitHub Actions uses `pnpm/action-setup@v4`

**Always use `pnpm` for any package management commands.**

## Common Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests (headless)
pnpm lint             # Lint all files
pnpm type-check       # TypeScript check
```

## Implementation Workflow

For each task from `docs/plan/v1/06-task-queue.md`:

1. **Read** the task and referenced context docs
2. **Implement** the changes
3. **Write/update tests** (unit and/or E2E as appropriate)
4. **Run tests** - all must pass
5. **Verify manually** if UI changes (use headed Playwright)
6. **Update task status** in `06-task-queue.md`
7. **Commit** with conventional commit message
