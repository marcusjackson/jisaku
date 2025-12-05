# Testing Strategy

This document outlines the testing philosophy, tools, and patterns used in this codebase.

---

## Testing Stack

### Unit & Component Testing

- **Vitest** — Fast test framework built on Vite
- **@testing-library/vue** — Component testing focused on user behavior
- **@testing-library/user-event** — User interaction simulation
- **@testing-library/jest-dom** — Custom matchers for DOM assertions

### End-to-End & Visual Regression

- **Playwright** — Browser automation and E2E testing
- **Playwright visual comparisons** — Built-in screenshot comparison for VRT

### Test Environment

- **jsdom** — DOM implementation for unit tests
- **sql.js** — SQLite in tests (same as production)

---

## Test File Organization

### Colocated Tests

Place test files alongside the code they test:

```
modules/kanji/
├── components/
│   ├── KanjiForm.vue
│   ├── KanjiForm.test.ts       # Component test
│   ├── KanjiCard.vue
│   └── KanjiCard.test.ts
├── composables/
│   ├── use-kanji-repository.ts
│   └── use-kanji-repository.test.ts
└── kanji-form-schema.ts
    kanji-form-schema.test.ts    # Schema validation tests
```

### E2E Tests

E2E tests live in a separate directory:

```
e2e/
├── tests/
│   ├── kanji-crud.spec.ts      # Create, view, edit, delete flows
│   ├── kanji-search.spec.ts    # Search and filter flows
│   ├── settings.spec.ts        # Export/import database
│   └── visual/
│       ├── kanji-list.spec.ts  # Visual regression: list page
│       └── kanji-detail.spec.ts
└── playwright.config.ts
```

---

## Unit Testing

### When to Unit Test

- **Composables** — Business logic, repository methods
- **Utility functions** — Formatters, validators, helpers
- **Zod schemas** — Validation logic

### Composable Tests

```typescript
// use-kanji-repository.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useKanjiRepository } from './use-kanji-repository'
import { createTestDatabase } from '@/test/helpers/database'

describe('useKanjiRepository', () => {
  let db: Database
  let repo: ReturnType<typeof useKanjiRepository>

  beforeEach(async () => {
    db = await createTestDatabase()
    repo = useKanjiRepository(db)
  })

  describe('create', () => {
    it('creates a kanji with required fields', () => {
      const kanji = repo.create({
        character: '水',
        strokeCount: 4
      })

      expect(kanji.id).toBeDefined()
      expect(kanji.character).toBe('水')
      expect(kanji.strokeCount).toBe(4)
    })

    it('throws on duplicate character', () => {
      repo.create({ character: '水', strokeCount: 4 })

      expect(() => {
        repo.create({ character: '水', strokeCount: 4 })
      }).toThrow(/unique/i)
    })
  })

  describe('findByCharacter', () => {
    it('returns null when not found', () => {
      const result = repo.findByCharacter('非')
      expect(result).toBeNull()
    })

    it('returns kanji when found', () => {
      repo.create({ character: '水', strokeCount: 4 })

      const result = repo.findByCharacter('水')
      expect(result?.character).toBe('水')
    })
  })
})
```

### Schema Validation Tests

```typescript
// kanji-form-schema.test.ts
import { describe, it, expect } from 'vitest'
import { kanjiFormSchema } from './kanji-form-schema'

describe('kanjiFormSchema', () => {
  it('accepts valid kanji data', () => {
    const result = kanjiFormSchema.safeParse({
      character: '水',
      strokeCount: 4
    })

    expect(result.success).toBe(true)
  })

  it('rejects empty character', () => {
    const result = kanjiFormSchema.safeParse({
      character: '',
      strokeCount: 4
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('character')
  })

  it('rejects invalid stroke count', () => {
    const result = kanjiFormSchema.safeParse({
      character: '水',
      strokeCount: -1
    })

    expect(result.success).toBe(false)
  })

  it('accepts optional jlpt level', () => {
    const result = kanjiFormSchema.safeParse({
      character: '水',
      strokeCount: 4,
      jlptLevel: 'N5'
    })

    expect(result.success).toBe(true)
  })
})
```

---

## Component Testing

### Philosophy

Test components from the **user's perspective**:

- Query by accessible roles and text, not implementation details
- Simulate real user interactions
- Avoid testing internal state directly

### Component Test Pattern

```typescript
// KanjiForm.test.ts
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import KanjiForm from './KanjiForm.vue'

describe('KanjiForm', () => {
  it('renders form fields', () => {
    render(KanjiForm)

    expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/stroke count/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(KanjiForm, {
      props: { onSubmit }
    })

    await user.type(screen.getByLabelText(/character/i), '水')
    await user.type(screen.getByLabelText(/stroke count/i), '4')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      character: '水',
      strokeCount: 4
    })
  })

  it('displays validation errors', async () => {
    const user = userEvent.setup()

    render(KanjiForm)

    // Submit without filling required fields
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByText(/character is required/i)).toBeInTheDocument()
  })

  it('pre-fills form in edit mode', () => {
    const kanji = {
      id: 1,
      character: '水',
      strokeCount: 4
    }

    render(KanjiForm, {
      props: { kanji, mode: 'edit' }
    })

    expect(screen.getByLabelText(/character/i)).toHaveValue('水')
    expect(screen.getByLabelText(/stroke count/i)).toHaveValue(4)
  })
})
```

### Testing with Database

For components that need database access, provide a test database:

```typescript
// KanjiRootDetail.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import KanjiRootDetail from './KanjiRootDetail.vue'
import { createTestDatabase, seedKanji } from '@/test/helpers/database'
import { DatabaseProvider } from '@/shared/composables/use-database'

describe('KanjiRootDetail', () => {
  let db: Database

  beforeEach(async () => {
    db = await createTestDatabase()
    await seedKanji(db, { character: '水', strokeCount: 4 })
  })

  it('displays kanji details', async () => {
    render(KanjiRootDetail, {
      props: { kanjiId: 1 },
      global: {
        provide: {
          [DatabaseProvider]: db
        }
      }
    })

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument()
      expect(screen.getByText(/4 strokes/i)).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    render(KanjiRootDetail, {
      props: { kanjiId: 1 },
      global: {
        provide: {
          [DatabaseProvider]: db
        }
      }
    })

    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
```

---

## E2E Testing

### When to E2E Test

- Critical user flows (CRUD operations)
- Multi-page workflows
- Database export/import
- PWA functionality

### E2E Test Pattern

```typescript
// e2e/tests/kanji-crud.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Kanji CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('creates a new kanji', async ({ page }) => {
    // Navigate to new kanji form
    await page.click('text=Add Kanji')

    // Fill form
    await page.fill('input[name="character"]', '水')
    await page.fill('input[name="strokeCount"]', '4')
    await page.selectOption('select[name="jlptLevel"]', 'N5')

    // Submit
    await page.click('button[type="submit"]')

    // Verify redirect to detail page
    await expect(page).toHaveURL(/\/kanji\/\d+/)
    await expect(page.locator('.kanji-character')).toHaveText('水')
  })

  test('edits an existing kanji', async ({ page }) => {
    // Seed a kanji first
    await page.evaluate(() => {
      // Direct DB manipulation for test setup
    })

    // Navigate to edit
    await page.goto('/kanji/1')
    await page.click('text=Edit')

    // Modify stroke count
    await page.fill('input[name="strokeCount"]', '5')
    await page.click('button[type="submit"]')

    // Verify update
    await expect(page.locator('.stroke-count')).toContainText('5')
  })

  test('deletes a kanji with confirmation', async ({ page }) => {
    // Setup
    await page.goto('/kanji/1')

    // Click delete
    await page.click('text=Delete')

    // Confirm dialog
    await expect(page.locator('.confirm-dialog')).toBeVisible()
    await page.click('text=Confirm')

    // Verify redirect and removal
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=水')).not.toBeVisible()
  })
})
```

---

## Visual Regression Testing

### When to VRT

- UI components with multiple visual states
- Layout-critical pages
- After design token changes

### VRT Pattern

```typescript
// e2e/tests/visual/kanji-list.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Kanji List Visual', () => {
  test('list page matches snapshot', async ({ page }) => {
    await page.goto('/')

    // Wait for content to load
    await page.waitForSelector('.kanji-list')

    await expect(page).toHaveScreenshot('kanji-list.png')
  })

  test('empty state matches snapshot', async ({ page }) => {
    // Clear database
    await page.evaluate(() => {
      // Clear all kanji
    })

    await page.goto('/')

    await expect(page).toHaveScreenshot('kanji-list-empty.png')
  })

  test('list with filters matches snapshot', async ({ page }) => {
    await page.goto('/')

    // Apply filter
    await page.selectOption('[data-testid="jlpt-filter"]', 'N5')

    await expect(page).toHaveScreenshot('kanji-list-filtered.png')
  })
})
```

### Updating Snapshots

```bash
# Update all snapshots
pnpm test:e2e --update-snapshots

# Update specific test snapshots
pnpm test:e2e --update-snapshots -g "kanji list"
```

---

## Test Helpers

### Database Helpers

```typescript
// test/helpers/database.ts
import initSqlJs, { Database } from 'sql.js'

export async function createTestDatabase(): Promise<Database> {
  const SQL = await initSqlJs()
  const db = new SQL.Database()

  // Run migrations
  await runMigrations(db)

  return db
}

export async function seedKanji(
  db: Database,
  data: Partial<Kanji>
): Promise<Kanji> {
  const defaults = {
    character: '木',
    strokeCount: 4
  }

  const kanji = { ...defaults, ...data }

  db.run(`INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)`, [
    kanji.character,
    kanji.strokeCount
  ])

  return {
    id: db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number,
    ...kanji
  }
}
```

### Render Helpers

```typescript
// test/helpers/render.ts
import { render } from '@testing-library/vue'
import type { Component } from 'vue'

export function renderWithProviders(
  component: Component,
  options: {
    props?: Record<string, unknown>
    db?: Database
  } = {}
) {
  return render(component, {
    props: options.props,
    global: {
      provide: {
        database: options.db
      }
    }
  })
}
```

---

## Running Tests

```bash
# Unit & component tests
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage

# E2E tests
pnpm test:e2e          # Run all E2E
pnpm test:e2e:ui       # Interactive UI mode

# Visual regression
pnpm test:e2e --project=chromium  # Single browser for VRT consistency
```

---

## Coverage Goals

| Category    | Target         | Notes                                |
| ----------- | -------------- | ------------------------------------ |
| Composables | 80%+           | Business logic, repository methods   |
| Utils       | 90%+           | Pure functions should be well tested |
| Components  | 70%+           | Focus on user interactions           |
| E2E         | Critical paths | All CRUD flows, export/import        |

---

## Testing Checklist

Before submitting a PR:

- [ ] New composables have unit tests
- [ ] New components have component tests
- [ ] Critical user flows have E2E coverage
- [ ] Tests pass locally (`pnpm test && pnpm test:e2e`)
- [ ] No skipped tests without explanation
- [ ] Test file is colocated with source file
