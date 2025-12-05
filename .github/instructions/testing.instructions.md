---
applyTo: '**/*.test.ts,**/e2e/**/*.ts'
---

# Testing Instructions

Guidelines for writing tests in this project.

## Test Stack

- **Vitest** — Unit and component tests
- **@testing-library/vue** — Component testing
- **@testing-library/user-event** — User interaction simulation
- **Playwright** — E2E and visual regression tests

## File Organization

### Colocated Tests

Place test files next to source files:

```
components/
├── KanjiForm.vue
├── KanjiForm.test.ts    ← Test file here
composables/
├── use-kanji-repository.ts
├── use-kanji-repository.test.ts
```

### E2E Tests

E2E tests in separate directory:

```
e2e/
├── tests/
│   ├── kanji-crud.spec.ts
│   └── visual/
│       └── kanji-list.spec.ts
└── playwright.config.ts
```

## Unit Test Pattern

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('functionName', () => {
  beforeEach(() => {
    // Setup
  })

  it('should do something when condition', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = functionName(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

## Component Test Pattern

Test from the user's perspective:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import KanjiForm from './KanjiForm.vue'

describe('KanjiForm', () => {
  it('renders form fields', () => {
    render(KanjiForm)

    expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/stroke count/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(KanjiForm, { props: { onSubmit } })

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

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByText(/character is required/i)).toBeInTheDocument()
  })
})
```

## Query Priority

Use Testing Library queries in this order:

1. `getByRole` — Accessible roles (button, textbox, etc.)
2. `getByLabelText` — Form inputs by label
3. `getByText` — Visible text content
4. `getByTestId` — Last resort, data-testid attribute

```typescript
// ✅ Preferred
screen.getByRole('button', { name: /save/i })
screen.getByLabelText(/character/i)

// ⚠️ Acceptable
screen.getByText(/no kanji found/i)

// ❌ Avoid unless necessary
screen.getByTestId('kanji-card')
```

## Async Testing

Always use `await` with user interactions:

```typescript
const user = userEvent.setup()

await user.type(input, 'text')
await user.click(button)
await user.selectOptions(select, ['option1'])
```

Use `waitFor` for async assertions:

```typescript
import { waitFor } from '@testing-library/vue'

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

## Database Testing

Use test database helpers:

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
      global: {
        provide: { database: db }
      }
    })

    await waitFor(() => {
      expect(screen.getByText('水')).toBeInTheDocument()
    })
  })
})
```

## E2E Test Pattern

```typescript
// e2e/tests/kanji-crud.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Kanji CRUD', () => {
  test('creates a new kanji', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Add Kanji')

    await page.fill('input[name="character"]', '水')
    await page.fill('input[name="strokeCount"]', '4')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/kanji\/\d+/)
    await expect(page.locator('.kanji-character')).toHaveText('水')
  })
})
```

## Visual Regression Tests

```typescript
// e2e/tests/visual/kanji-list.spec.ts
import { test, expect } from '@playwright/test'

test('list page matches snapshot', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('.kanji-list')

  await expect(page).toHaveScreenshot('kanji-list.png')
})
```

## What to Test

### Unit Tests

- Composable logic
- Repository methods
- Utility functions
- Zod schemas

### Component Tests

- User interactions
- Form submission
- Conditional rendering
- Error states

### E2E Tests

- Critical user flows
- Multi-page workflows
- Database operations

## What NOT to Test

- Implementation details
- Internal state
- Private methods
- Third-party library behavior
