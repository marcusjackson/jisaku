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
├── modules/           # Feature modules (kanji, component, vocabulary, settings)
├── base/              # Generic primitives (works in ANY Vue project)
├── shared/            # App-specific shared code
├── pages/             # Route entry points (thin wrappers)
└── db/                # Database setup and migrations
docs/                  # Project documentation
.github/
└── instructions/      # Mandatory coding standards and patterns
```

## Before Starting Any Task

**Complete these steps before beginning any implementation:**

1. **Read all mandatory instruction files** (see MANDATORY READS section below)
2. **Review relevant documentation** in `docs/` folder (architecture, schema, features)
3. **Understand the task requirements** completely before writing any code
4. **Ensure pnpm is installed** (`pnpm --version` should show 9.15.1 or similar)
5. **Start dev server** if not already running (`pnpm dev`)

## MANDATORY READS - Start Here

**These files are mandatory to read before implementing ANY code in this project:**

1. `.github/instructions/general.instructions.md` - Project structure, conventions, naming
2. `.github/instructions/components.instructions.md` - Component hierarchy (Root/Section/UI)
3. `.github/instructions/typescript.instructions.md` - Type safety and patterns
4. `.github/instructions/testing.instructions.md` - Testing requirements and patterns
5. `.github/instructions/commit.instructions.md` - Commit message standards

These establish the foundation for all code quality and consistency.

## Project Documentation

When working on features, consult the documentation in `docs/`:

- `docs/architecture.md` - System design, component patterns, module structure
- `docs/schema.md` - Database schema and relationships
- `docs/features.md` - Current features overview
- `docs/conventions.md` - Naming, coding standards, file organization
- `docs/testing.md` - Testing philosophy and patterns
- `docs/design-tokens.md` - CSS variables and theming
- `docs/future-ideas.md` - Potential enhancements (for inspiration)

**Key Architectural Principles:**

- Kanji, components, and vocabulary are **equal entities** (not kanji-centric)
- All entities have `short_meaning` and `search_keywords` fields
- Section-based editing on detail pages (not mega-forms)
- Module isolation - features don't directly import from each other
- Base code in `base/` is generic; shared code in `shared/` is app-specific

## Testing Requirements

You must ensure pnpm is installed. It should be set up already in your environment.
If not, install it via `npm install -g pnpm@9.15.1`.

### CRITICAL: Before Marking Any Task Complete

**You must do ALL of the following:**

1. **Update seed data** - If modifying the DB schema, update the use-seed-data composable
2. **Run full checks** - `pnpm ci:full` (includes unit tests, E2E tests, lint, and type-check)
3. **Self-verify with Playwright MCP server** - Use MCP browser tools to test your changes interactively
   - Load seed data first (Settings → Developer Tools → Seed Data button)
   - Test all user interactions
4. **Take screenshots** - Capture all visual changes/additions made in this session
5. **All must pass** - Zero test failures, zero lint errors, zero type errors

### Every Code Change Must Pass Tests

Before completing any implementation:

1. **Run full check**: `pnpm ci:full`
2. **Verify all pass**: Unit tests, E2E tests, lint, type-check
3. **Fix any failures** before reporting completion

### Test Types

| Type  | Command           | When to Run                   |
| ----- | ----------------- | ----------------------------- |
| Unit  | `pnpm test`       | After any TS/Vue file changes |
| E2E   | `pnpm test:e2e`   | After any user-facing changes |
| Lint  | `pnpm lint`       | Before committing             |
| Types | `pnpm type-check` | After type-related changes    |
| Full  | `pnpm ci:full`    | Before marking task complete  |

### Colocated Tests

Tests live next to source files:

```
KanjiForm.vue
KanjiForm.test.ts    ← unit test
```

E2E tests are in `e2e/` folder.

## Testing & Verification

### Two Types of Testing

This project uses **two complementary approaches** for quality assurance:

1. **E2E Tests (Automated Regression Testing)**
   - Run via `pnpm test:e2e` in headless mode
   - Automated test suites in `e2e/` folder
   - Must pass before marking any task complete
   - Purpose: Catch regressions, ensure existing functionality works

2. **Playwright MCP Server (Self-Verification in Browser)**
   - Interactive browser-based verification using Playwright MCP server
   - Playwright MCP server is **enabled by default in your GitHub Copilot Agent environment**
   - Use MCP browser tools to navigate, interact, and screenshot the running app
   - Purpose: Visual verification, exploratory testing, screenshot documentation
   - Learn more: [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)

**Both are required** - E2E tests ensure nothing breaks, MCP server verification ensures your changes work correctly.

### Self-Verification with Playwright MCP Server

**REQUIRED before finishing any UI-changing task:**

1. **Start dev server** if not running (`pnpm dev` - typically runs on http://localhost:5173)
2. **Use Playwright MCP server tools** to open a browser and navigate to the running app
3. **Load seed data first** - The database starts empty. Use the "Seed Data" button in settings to load sample data
4. **Test all scenarios** covered by your changes - interact with the UI as a user would
5. **Take screenshots** - Capture all major visual additions/modifications made in this session
6. **Verify interactions** - Test keyboard navigation (Tab, Enter, Escape), error states, loading states

**Note:** "Playwright MCP browser" or "MCP browser" refers to using the Playwright MCP server for browser-based self-verification. You have access to Playwright MCP server tools by default.

### Optional: E2E Test Debugging

If E2E tests fail and you need to debug them visually:

```bash
# Run specific test in headed mode (visible browser)
pnpm exec playwright test e2e/kanji-crud.test.ts --headed

# Debug mode (step through with inspector)
pnpm exec playwright test e2e/kanji-crud.test.ts --debug
```

## Common Implementation Mistakes

### Adding Database Fields

**Most Common Mistakes:**

1. **Row mapper column indices wrong** - When adding a field to a table, all subsequent column indices shift. Update ALL mappers.
   - **Fix**: Double-check row mapper SELECT statements; count column position from left
2. **Missing field in submit handler** - Field appears in form but doesn't save
   - **Fix**: Check that `submitForm` includes the field: `...(values.fieldName != null && { fieldName: values.fieldName })`

3. **Edit form field not populating** - Field is empty when editing existing entity
   - **Fix**: Add `setFieldValue('fieldName', entity.fieldName)` in the `watch` that populates form on load

### Component & Form Building

**Most Common Mistakes:**

1. **Mega-forms instead of section-based** - Putting all fields in one mega-form instead of breaking into sections
   - **Fix**: Follow the pattern: Root fetches data → Section arranges layout → UI components display/edit individual sections

2. **Missing test mocks** - Adding new fields but forgetting to update mock factories
   - **Fix**: Update all factory functions with the new field before running tests

3. **No inline editing support** - Detail pages still require navigation to separate edit pages
   - **Fix**: Use BaseInlineTextarea or toggle edit mode within SharedSection with save/cancel handlers

### Composable & Repository Updates

**Most Common Mistakes:**

1. **Forgetting field-level update methods** - Only implementing bulk `update()` method
   - **Fix**: Add field-specific methods like `updateFieldName(id, value)` for inline editing

2. **Not persisting changes** - Update method runs but data doesn't stick
   - **Fix**: Always call `await persist()` after database mutations

3. **Missing error handling** - Updates fail silently
   - **Fix**: Wrap in try-catch, show toast on error, update local state on success

### Testing

**Most Common Mistakes:**

1. **Skipping seed data during MCP verification** - Database starts empty, causing verification to fail
   - **Fix**: When using Playwright MCP server for verification, first use the "Seed Data" button in settings

2. **Not updating seed data file** - Adding new entities but not adding example data to use-seed-data.ts
   - **Fix**: Update use-seed-data.ts with representative examples of new entities

3. **Forgetting E2E test updates** - Changing UI but not updating playwright tests
   - **Fix**: If you modify selectors, labels, or workflows, update corresponding E2E tests

4. **Not running full checks** - Running only unit tests and missing lint/type errors
   - **Fix**: Always run `pnpm ci:full` before marking task complete, not just `pnpm test`

### Type Safety

**Most Common Mistakes:**

1. **Using `any` type** - Bypassing TypeScript strict mode
   - **Fix**: Use `unknown` for truly unknown types, then narrow with type guards

2. **Forgetting `import type`** - Including type imports in bundle
   - **Fix**: Always use `import type { Kanji }` for types, not regular `import`

3. **Optional property mistakes** - Not using proper optional/nullable syntax
   - **Fix**: Use `field: string | null` for database nulls, `field?: string` for optional props

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
Scopes: kanji, kanji-list, component, component-list, vocabulary, vocabulary-list, settings, base, shared, db, ui, router
```

Examples:

```
feat(kanji): add stroke count validation
fix(kanji-list): correct filter reset behavior
test(component): add unit tests for ComponentCard
```

## Package Manager: pnpm Only

This project uses **pnpm exclusively**. Do not use `npm` or `yarn`.

- `.npmrc` and `.pnpmrc` are configured to enforce pnpm
- `.gitignore` excludes `package-lock.json` (npm files)
- GitHub Actions uses `pnpm/action-setup@v4`

**Always use `pnpm` for any package management commands.**

## Common Commands

**ALWAYS use Makefile commands for targeted checks** (specific files or changed files) instead of running full checks unnecessarily:

```bash
# Targeted checks (PREFERRED for development)
make check-changed      # Run all checks on changed files only
make fix-changed        # Run all fixes on changed files only
make test-changed       # Run tests on changed + source files
make check FILES="..."  # Run checks on specific files
make lint FILES="..."   # Lint specific files

# Full checks (use for final verification or CI)
pnpm ci:full            # All checks + all tests
pnpm check              # Lint, type-check, format on all files
pnpm test               # All unit tests
pnpm test:e2e           # All E2E tests

# Development
pnpm dev                # Start dev server
```

## Implementation Workflow

For each task:

1. **Read mandatory instruction files** (see MANDATORY READS section above)
2. **Review relevant documentation** (`docs/architecture.md`, `docs/schema.md`, etc.)
3. **Understand the task requirements** thoroughly before writing any code
4. **Implement** the changes following all project guidelines
5. **Write/update tests** (unit and/or E2E as appropriate)
6. **Run all tests** - unit, E2E, lint, and type-check must pass
7. **Self-verify with Playwright MCP server** (for UI changes) - interact with the app, take screenshots
8. **Commit** with conventional commit message

### Task Delivery

Tasks are typically provided in chat messages and may reference:

- Documentation in `docs/` folder
- Database schema (`docs/schema.md`)
- Existing code patterns from similar modules
- Feature ideas from `docs/future-ideas.md`

### Code Quality Checklist (Before Every Commit)

#### Development Workflow

- [ ] Use `make check-changed` or `make check FILES="..."` for targeted checks during development
- [ ] Only run full checks (`pnpm ci:full`) before committing or for final verification
- [ ] Use `make test-changed` to run relevant tests when modifying code

Use this checklist to verify each task is complete:

- [ ] Read all mandatory instruction files
- [ ] Understand the task requirements completely
- [ ] No TypeScript `any` types - all types explicit
- [ ] CSS uses design token variables from `tokens.css`
- [ ] Components follow Root/Section/UI hierarchy
- [ ] Tests colocated with source files
- [ ] Loading and error states handled
- [ ] Keyboard accessible
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Unit tests pass (`pnpm test`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] No lint errors (`pnpm lint`)
- [ ] No type errors (`pnpm type-check`)
- [ ] Self-verification with Playwright MCP server done (if UI changes)
- [ ] Screenshots taken of visual changes
- [ ] Commit message follows conventions
