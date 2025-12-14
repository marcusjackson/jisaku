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
├── modules/           # Feature modules (kanji, kanji-list, component, component-list, settings)
├── base/              # Generic primitives (works in ANY Vue project)
├── shared/            # App-specific shared code
├── pages/             # Route entry points (thin wrappers)
└── db/                # Database setup and migrations
docs/
├── plan/v1/          # V1 master implementation plans (foundational reading)
└── plan/v1-tasks/    # Individual task files (one per implementation task)
.github/
└── instructions/      # Mandatory coding standards and patterns
```

## MANDATORY READS - Start Here

**These files are mandatory to read before implementing ANY code in this project:**

1. `.github/instructions/general.instructions.md` - Project structure, conventions, naming
2. `.github/instructions/components.instructions.md` - Component hierarchy (Root/Section/UI)
3. `.github/instructions/typescript.instructions.md` - Type safety and patterns
4. `.github/instructions/testing.instructions.md` - Testing requirements and patterns
5. `.github/instructions/commit.instructions.md` - Commit message standards

These establish the foundation for all code quality and consistency.

## V1 Master Planning Documents

Read in order before starting any V1 implementation task:

1. `docs/plan/v1/00-overview.md` - Overview, entity balance, short_meaning field
2. `docs/plan/v1/01-page-organization.md` - Page structure and organization patterns
3. `docs/plan/v1/02-ui-patterns.md` - Section-based editing, destructive action safety
4. `docs/plan/v1/03-kanji-system.md` - Kanji readings, meanings, classifications
5. `docs/plan/v1/04-component-system.md` - Component page as occurrence analysis hub
6. `docs/plan/v1/05-vocabulary-system.md` - Vocabulary system with kanji breakdown
7. `docs/plan/v1/06-base-components.md` - Required base components for V1

**Key v1 Principles:**

- Kanji, components, and vocab are **equal peers** (not kanji-centric)
- Component occurrence analysis happens on **component page**, not kanji page
- All entities have `short_meaning` and `search_keywords` fields
- Quick-create forms are minimal (character, strokes, short_meaning only)
- Section-based editing on detail pages (not mega-forms)

## Testing Requirements

You must ensure pnpm is installed. It should be set up already in your environment.
If not, install it via `npm install -g pnpm@9.15.1`.

### CRITICAL: Before Marking Any Task Complete

**You must do ALL of the following:**

1. **Update seed data** - Ensure test data is up to date for browser verification
2. **Run full checks** - `pnpm ci:full` (includes tests, lint, and type-check)
3. **Verify manually** - Test your work in the Playwright MCP browser
4. **Take screenshots** - Screenshot only work you did in this session (for verification)
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

### Playwright MCP Browser Verification

**REQUIRED before finishing any UI-changing task:**

1. Open the MCP browser and navigate to the app
2. Verify seed data is loaded (go to Settings → Developer Tools → Seed Data button)
3. Test all scenarios covered by your changes
4. Take screenshots of the relevant work (only what you changed in this session)
5. Verify keyboard navigation works (Tab through form fields, etc.)
6. Verify error states display correctly
7. Verify loading states work as expected

### Taking Screenshots

For debugging or verification:

```bash
# In test code - add this temporarily:
await page.screenshot({ path: 'debug-screenshot.png' })

# Or use Playwright's trace viewer for failed tests:
pnpm exec playwright test --trace on
pnpm exec playwright show-trace test-results/[test-folder]/trace.zip
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

1. **Mega-forms instead of section-based** - Putting all fields in one mega-form instead of breaking into SharedSections
   - **Fix**: Follow the V1 pattern: Root fetches data → Section arranges layout → UI components display/edit individual sections

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

1. **Skipping seed data update** - Tests pass but manual verification fails due to missing test data
   - **Fix**: Before manual testing, go to Settings → Developer Tools and click "Seed Data" button

2. **Forgetting E2E test updates** - Changing UI but not updating playwright tests
   - **Fix**: If you modify selectors, labels, or workflows, update corresponding E2E tests

3. **Not running full checks** - Running only unit tests and missing lint/type errors
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

For each V1 implementation task:

1. **Read mandatory instruction files** (see MANDATORY READS section above)
2. **Read V1 master planning documents** (in order, see V1 Master Planning Documents)
3. **Open the task file** from `docs/plan/v1-tasks/phase-X.Y-*.md`
4. **Understand the task** thoroughly before writing any code
5. **Implement** the changes following all project guidelines
6. **Write/update tests** (unit and/or E2E as appropriate)
7. **Run all tests** - unit, E2E, lint, and type-check must pass
8. **Verify manually** if UI changes (use headed Playwright or MCP browser)
9. **Commit** with conventional commit message
10. **Update task status** in the task file's status section

### Task Files

Task files are located in `docs/plan/v1-tasks/`:

- Each task has a dedicated markdown file with complete specifications
- Task files reference the V1 master documents as context
- Task files specify exact files to create, modify, and delete
- Task files include implementation details and data flow diagrams
- Task files have migration checklists to track progress

Example task file: `docs/plan/v1-tasks/phase-4.5-kanji-detail-refactor.md`

### Code Quality Checklist (Before Every Commit)

Use this checklist to verify each task is complete:

- [ ] Read all mandatory instruction files
- [ ] Understand the task file completely
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
- [ ] Manual verification done (if UI changes)
- [ ] Commit message follows conventions
