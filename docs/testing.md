# Testing Strategy

Testing philosophy, tools, and patterns used in this codebase.

---

## Test Stack

| Tool                        | Purpose                      |
| --------------------------- | ---------------------------- |
| Vitest                      | Unit and component tests     |
| @testing-library/vue        | Component testing            |
| @testing-library/user-event | User interaction simulation  |
| Playwright                  | E2E and visual regression    |
| jsdom                       | DOM implementation for tests |
| sql.js                      | SQLite in tests              |

---

## File Organization

### Colocated Tests

Place test files next to source files:

```
components/
├── KanjiForm.vue
├── KanjiForm.test.ts    ← Test here
composables/
├── use-kanji-repository.ts
├── use-kanji-repository.test.ts
```

### E2E Tests

```
e2e/
├── kanji-crud.test.ts
├── kanji-list.test.ts
└── visual/
```

---

## When to Test What

| Category  | Target | What to Test                       |
| --------- | ------ | ---------------------------------- |
| Unit      | 80%+   | Composables, utils, zod schemas    |
| Component | 70%+   | User interactions, form submit     |
| E2E       | Paths  | Critical CRUD flows, export/import |

---

## Unit Test Pattern

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('useKanjiRepository', () => {
  let repo: ReturnType<typeof useKanjiRepository>

  beforeEach(async () => {
    const db = await createTestDatabase()
    repo = useKanjiRepository(db)
  })

  it('creates a kanji', () => {
    const kanji = repo.create({ character: '水', strokeCount: 4 })
    expect(kanji.character).toBe('水')
  })
})
```

---

## Component Test Pattern

Test from user's perspective using accessible queries:

```typescript
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'

describe('KanjiForm', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(KanjiForm, { props: { onSubmit } })

    await user.type(screen.getByLabelText(/character/i), '水')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSubmit).toHaveBeenCalled()
  })
})
```

---

## Query Priority

1. `getByRole` — Accessible roles (button, textbox)
2. `getByLabelText` — Form inputs by label
3. `getByText` — Visible text content
4. `getByTestId` — Last resort

```typescript
// ✅ Preferred
screen.getByRole('button', { name: /save/i })
screen.getByLabelText(/character/i)

// ⚠️ Acceptable
screen.getByText(/no results/i)

// ❌ Avoid unless necessary
screen.getByTestId('kanji-card')
```

---

## Async Testing

```typescript
const user = userEvent.setup()

await user.type(input, 'text')
await user.click(button)

// For async assertions
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

---

## E2E Test Pattern

```typescript
import { test, expect } from '@playwright/test'

test('creates a new kanji', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Add Kanji')

  await page.fill('[data-testid="character-input"]', '水')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL(/\/kanji\/\d+/)
})
```

---

## E2E Reliability

### Use data-testid for Stability

```vue
<button data-testid="kanji-save-button">Save</button>
```

```typescript
await page.getByTestId('kanji-save-button').click()
```

### Wait for State, Not Time

```typescript
// ✅ Correct - wait for element
await page.getByTestId('kanji-list').waitFor()

// ❌ Wrong - arbitrary wait
await page.waitForTimeout(1000)
```

### Reliable Async Handling

```typescript
// Wait for network idle after action
await Promise.all([
  page.waitForLoadState('networkidle'),
  page.click('button[type="submit"]')
])
```

---

## Database Testing

```typescript
import { createTestDatabase, seedKanji } from '@/test/helpers/database'

describe('KanjiRootDetail', () => {
  let db: Database

  beforeEach(async () => {
    db = await createTestDatabase()
    await seedKanji(db, { character: '水', strokeCount: 4 })
  })

  it('displays kanji', async () => {
    render(KanjiRootDetail, {
      props: { kanjiId: 1 },
      global: { provide: { database: db } }
    })

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument()
    })
  })
})
```

---

## Running Tests

```bash
# Unit & component
pnpm test              # Run once
pnpm test:watch        # Watch mode

# E2E
pnpm test:e2e          # Headless
pnpm test:e2e --headed # Visible browser

# All checks
pnpm ci:full           # Everything
```

---

## What NOT to Test

- Implementation details
- Internal state
- Private methods
- Third-party library behavior

---

## Pre-PR Checklist

- [ ] New composables have unit tests
- [ ] New components have component tests
- [ ] Critical flows have E2E coverage
- [ ] All tests pass (`pnpm ci:full`)
- [ ] Test files colocated with source

---

## Related Documentation

- [Architecture](./architecture.md) — Component patterns
- [Conventions](./conventions.md) — Naming standards
