# E2E Test Reliability Improvements

**Summary:** This document analyzes the root causes of E2E test flakiness and provides patterns for writing reliable, maintainable Playwright tests.

---

## Table of Contents

1. [Root Causes of Flakiness](#1-root-causes-of-flakiness) (Lines 20-70)
2. [Selector Strategy](#2-selector-strategy) (Lines 75-130)
3. [Async Handling Patterns](#3-async-handling-patterns) (Lines 135-200)
4. [Test Setup Patterns](#4-test-setup-patterns) (Lines 205-260)
5. [Debugging Workflow](#5-debugging-workflow) (Lines 265-310)
6. [Refactored Test Examples](#6-refactored-test-examples) (Lines 315-370)

---

## 1. Root Causes of Flakiness

### Identified Issues

**1. Race Conditions**

- Tests click before elements are interactive
- State updates not awaited before assertions
- Toast notifications overlapping with next action

**2. Implicit Waits**

```typescript
// Current problematic pattern
await page.waitForTimeout(500) // Arbitrary wait
await page.waitForTimeout(3500) // Waiting for toast
```

**3. Brittle Selectors**

```typescript
// Fragile: depends on exact class name
await page.locator('.kanji-detail-meanings-edit-item')

// Fragile: depends on text content
await page.getByText('No meanings added yet')
```

**4. Missing State Assertions**

```typescript
// Problem: Click without verifying element is ready
await page.click('.kanji-list-card')
// Should verify we're on detail page before proceeding
```

### Test Files with Most Flakes

| File                          | Flake Rate | Primary Issue             |
| ----------------------------- | ---------- | ------------------------- |
| kanji-meanings.test.ts        | High       | Complex state, many waits |
| kanji-classifications.test.ts | Medium     | Dialog timing             |
| kanji-readings.test.ts        | Medium     | Reordering async          |
| component-crud.test.ts        | Low        | Basic CRUD                |

---

## 2. Selector Strategy

### Selector Hierarchy (Preferred Order)

1. **data-testid** — Most reliable, explicitly for testing
2. **Role + Name** — Accessible, reasonably stable
3. **Label** — Good for form fields
4. **Text content** — Last resort, fragile

### Recommended Patterns

```typescript
// ✅ Best: data-testid (add to components)
await page.getByTestId('meanings-section')
await page.getByTestId('add-meaning-button')

// ✅ Good: Role-based
await page.getByRole('button', { name: 'Edit' })
await page.getByRole('dialog')
await page.getByRole('heading', { name: /meanings/i })

// ✅ Good: Label for form fields
await page.getByLabel('Meaning')
await page.getByLabel('Character')

// ⚠️ Use sparingly: Text content
await page.getByText('No meanings added yet')

// ❌ Avoid: CSS class selectors
await page.locator('.kanji-detail-meanings-edit-item')
```

### Adding data-testid Attributes

**Rule:** All interactive elements and major sections need test IDs.

```vue
<!-- Component Implementation -->
<template>
  <section data-testid="kanji-detail-headline">
    <BaseButton
      data-testid="headline-edit-button"
      @click="openDialog"
    >
      Edit
    </BaseButton>
  </section>
</template>
```

**Naming Convention:**

```
[entity]-[section]-[element]

Examples:
- kanji-detail-headline
- kanji-meanings-section
- meanings-add-button
- meaning-item-{id}
- filters-toggle
```

**Required test IDs:**

- Sections: `{entity}-{section}-section` or `{entity}-{section}`
- Buttons: `{action}-{entity}-button` or `{section}-{action}-button`
- List items: `{entity}-item-{id}` or `{entity}-card-{id}`
- Dialogs: `{action}-{entity}-dialog`
- Forms: `{entity}-{field}-input`

**Usage in tests:**

```typescript
await page.getByTestId('kanji-detail-headline').isVisible()
await page.getByTestId('headline-edit-button').click()
await page.getByTestId('kanji-card-123').click()
```

---

## 3. Async Handling Patterns

### Replace Arbitrary Waits

```typescript
// ❌ Bad: Arbitrary timeout
await page.waitForTimeout(500)
await page.waitForTimeout(3500) // "wait for toast"

// ✅ Good: Wait for specific condition
await page.waitForLoadState('networkidle')
await expect(page.getByRole('dialog')).toBeVisible()
await expect(page.getByText('Meaning added')).toBeVisible()
```

### Wait Patterns by Scenario

**After Navigation:**

```typescript
await page.goto('/')
await page.waitForLoadState('networkidle')
// Or wait for specific element
await expect(page.getByRole('heading', { name: /kanji list/i })).toBeVisible()
```

**After Click that Triggers Navigation:**

```typescript
await page.getByTestId('kanji-card').first().click()
await page.waitForURL(/\/kanji\/\d+/)
await expect(page.getByTestId('kanji-detail-header')).toBeVisible()
```

**After Form Submission:**

```typescript
await page.getByRole('button', { name: 'Save' }).click()
// Wait for dialog to close
await expect(page.getByRole('dialog')).not.toBeVisible()
// OR wait for success toast
await expect(page.getByText(/saved/i)).toBeVisible()
```

**After State Update:**

```typescript
await page.getByRole('button', { name: 'Add' }).click()
// Wait for new item to appear
await expect(page.getByTestId('meaning-item-new')).toBeVisible()
// OR wait for count to change
await expect(page.getByTestId('meanings-list').locator('li')).toHaveCount(3)
```

### Toast Handling

```typescript
// Create helper function
async function waitForToastAndDismiss(page: Page, message: RegExp | string) {
  const toast = page.getByRole('alert').filter({ hasText: message })
  await expect(toast).toBeVisible()
  // Optionally dismiss or wait for auto-dismiss
  await expect(toast).not.toBeVisible({ timeout: 5000 })
}

// Usage
await page.getByRole('button', { name: 'Delete' }).click()
await waitForToastAndDismiss(page, /deleted/i)
```

---

## 4. Test Setup Patterns

### Database Seeding

```typescript
// test/helpers/e2e-setup.ts
import type { Page } from '@playwright/test'

export async function seedTestData(page: Page) {
  // Navigate to settings
  await page.goto('/settings')
  await page.waitForLoadState('networkidle')

  // Use seed data button
  const seedButton = page.getByTestId('seed-data-button')

  if (await seedButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await seedButton.click()
    await expect(page.getByText(/data seeded/i)).toBeVisible()
  }
}

export async function clearTestData(page: Page) {
  await page.goto('/settings')
  await page.waitForLoadState('networkidle')

  const clearButton = page.getByTestId('clear-data-button')
  if (await clearButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await clearButton.click()
    await page.getByRole('button', { name: 'Confirm' }).click()
  }
}
```

### Test Fixture Pattern

```typescript
// e2e/fixtures.ts
import { test as base } from '@playwright/test'

export const test = base.extend({
  // Auto-seed data before each test
  seededPage: async ({ page }, use) => {
    await seedTestData(page)
    await use(page)
    await clearTestData(page)
  }
})

// Usage in tests
test('can edit meaning', async ({ seededPage }) => {
  // seededPage already has test data
})
```

---

## 5. Debugging Workflow

### Step 1: Run in Headed Mode

```bash
pnpm exec playwright test e2e/kanji-meanings.test.ts --headed
```

### Step 2: Use Debug Mode

```bash
pnpm exec playwright test e2e/kanji-meanings.test.ts --debug
```

### Step 3: Add Trace on Failure

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  retries: 2
})
```

### Step 4: Inspect Trace

```bash
pnpm exec playwright show-trace test-results/trace.zip
```

### Common Debug Patterns

```typescript
// Pause execution for inspection
await page.pause()

// Log element state
const element = page.getByTestId('meanings-section')
console.log('Visible:', await element.isVisible())
console.log('Count:', await element.count())

// Screenshot at specific point
await page.screenshot({ path: 'debug/meanings-section.png' })
```

---

## 6. Test Example Pattern

```typescript
test('can add a new meaning', async ({ page }) => {
  // 1. Navigate and wait for page load
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /kanji list/i })).toBeVisible()

  // 2. Navigate to detail page
  await page.getByTestId('kanji-card').first().click()
  await page.waitForURL(/\/kanji\/\d+/)
  await expect(page.getByTestId('kanji-detail-headline')).toBeVisible()

  // 3. Enter edit mode and verify state
  const section = page.getByTestId('kanji-meanings-section')
  await section.getByTestId('meanings-edit-button').click()
  await expect(section.getByRole('button', { name: 'Save' })).toBeVisible()

  // 4. Count initial state
  const list = section.getByTestId('meanings-list')
  const initialCount = await list.locator('li').count()

  // 5. Open dialog and wait for visibility
  await section.getByTestId('meanings-add-button').click()
  await expect(page.getByRole('dialog')).toBeVisible()

  // 6. Fill form and submit
  await page.getByLabel('Meaning').fill('test meaning')
  await page.getByRole('button', { name: 'Save' }).click()

  // 7. Verify results
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(list.locator('li')).toHaveCount(initialCount + 1)
  await expect(list.getByText('test meaning')).toBeVisible()
})
```

**Key principles demonstrated:**

- Use `data-testid` for all major elements
- Explicit waits for state changes
- Verify intermediate states
- No arbitrary timeouts
- Clear step-by-step flow

---

## Cross-References

- **Related**: [Session 2: Section Decomposition Patterns](../session-2-components/3-section-decomposition-patterns.md)
- **Next**: [2-ui-ux-consistency-guidelines.md](./2-ui-ux-consistency-guidelines.md)
- **Implementation**: [3-implementation-sequencing.md](./3-implementation-sequencing.md)
