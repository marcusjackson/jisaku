# Quick Reference: New Component Checklist

**Use this checklist when creating any new component, form, or feature.**

---

## Component Creation

### Root Component (max 200 lines)

- [ ] Named `[Entity]Root[Feature].vue`
- [ ] Data fetching with composables
- [ ] Event forwarding to handlers
- [ ] No direct state mutations
- [ ] Extract handlers if approaching 200 lines

### Section Component (max 250 lines)

- [ ] Named `[Entity]Section[Feature].vue`
- [ ] Layout and mode management (view/edit)
- [ ] Receives data as props
- [ ] Emits events up to root
- [ ] Split into ViewMode/EditMode if approaching 250 lines
- [ ] Add `data-testid` attribute to wrapper

### UI Component (max 150 lines)

- [ ] Named `[Entity][Feature][Element].vue`
- [ ] Pure presentation
- [ ] No business logic
- [ ] Emits events only
- [ ] Add `data-testid` to interactive elements

---

## Form Validation

### Schema File

- [ ] Create `[form-name]-schema.ts` in module folder
- [ ] Use shared validators from `@/shared/validation`
- [ ] Export schema and inferred type
- [ ] Create colocated test file

**Example:**

```typescript
// kanji-create-schema.ts
import { z } from 'zod'
import { singleCharacterSchema, optionalString } from '@/shared/validation'

export const kanjiCreateSchema = z.object({
  character: singleCharacterSchema,
  shortMeaning: optionalString(100)
})

export type KanjiCreateData = z.infer<typeof kanjiCreateSchema>
```

### Component Integration

- [ ] Import `toTypedSchema`, `useForm`, `useField` from vee-validate
- [ ] Import schema from schema file
- [ ] Use `toTypedSchema(schema)` for validation
- [ ] Bind fields with `useField<Type>('fieldName')`
- [ ] Use `handleSubmit` for form submission
- [ ] Display errors inline via `:error` prop
- [ ] Handle backend errors with toast

**Example:**

```vue
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { kanjiCreateSchema } from '../schemas/kanji-create-schema'

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(kanjiCreateSchema)
})

const { value: character, errorMessage: characterError } =
  useField<string>('character')

const onSubmit = handleSubmit((values) => {
  emit('save', values)
})
</script>

<template>
  <form @submit.prevent="onSubmit">
    <BaseInput
      v-model="character"
      :error="characterError"
      label="Character"
    />
  </form>
</template>
```

### Schema Tests

- [ ] Test valid inputs
- [ ] Test empty/missing values
- [ ] Test length limits
- [ ] Test format constraints
- [ ] Colocate with schema file

---

## E2E Testing

### Test IDs

- [ ] Add `data-testid` to all sections
- [ ] Add `data-testid` to all buttons
- [ ] Add `data-testid` to list items with IDs
- [ ] Follow naming convention: `{entity}-{section}-{element}`

**Examples:**

```typescript
data-testid="kanji-detail-headline"
data-testid="meanings-section"
data-testid="meanings-edit-button"
data-testid="kanji-card-123"
```

### Test Patterns

- [ ] Use `getByTestId()` for custom elements
- [ ] Use `getByRole()` for accessible elements
- [ ] Wait for state changes with `expect().toBeVisible()`
- [ ] Never use `waitForTimeout()`
- [ ] Verify intermediate states
- [ ] Wait for navigation with `waitForURL()`

**Example:**

```typescript
// Navigate
await page.getByTestId('kanji-card').first().click()
await page.waitForURL(/\/kanji\/\d+/)

// Wait for visibility
await expect(page.getByTestId('kanji-detail-headline')).toBeVisible()

// Interact
await page.getByTestId('headline-edit-button').click()
await expect(page.getByRole('dialog')).toBeVisible()
```

---

## File Structure

```
src/modules/[entity]/
├── [entity]-types.ts              # Types
├── [form]-schema.ts               # Validation schema
├── [form]-schema.test.ts          # Schema tests
├── components/
│   ├── [Entity]Root[Feature].vue          # Root (max 200)
│   ├── [Entity]Section[Feature].vue       # Section (max 250)
│   ├── [Entity][Feature][Element].vue     # UI (max 150)
│   └── *.test.ts                          # Component tests
└── composables/
    ├── use-[entity]-[feature]-state.ts    # State (max 200)
    ├── use-[entity]-[feature]-handlers.ts # Handlers (max 200)
    └── *.test.ts                          # Composable tests
```

---

## Size Limits (ESLint Enforced)

| File Type  | Max Lines |
| ---------- | --------- |
| Page       | 100       |
| Root       | 200       |
| Section    | 250       |
| UI         | 150       |
| Composable | 200       |
| Repository | 250       |
| Types      | 300       |
| Tests      | 600       |

**Note:** Limits exclude comments and blank lines

---

## Common Validators

Located in `src/shared/validation/common-schemas.ts`:

```typescript
// Single character (Unicode-aware)
singleCharacterSchema

// Optional string with max length
optionalString(maxLength: number)
```

**Usage:**

```typescript
import { singleCharacterSchema, optionalString } from '@/shared/validation'

const schema = z.object({
  character: singleCharacterSchema,
  notes: optionalString(500)
})
```

---

## Anti-Patterns to Avoid

### Components

- ❌ Large monolithic components (split into Root/Section/UI)
- ❌ 20+ handlers in component (extract to composable)
- ❌ Direct database calls in components (use repositories)
- ❌ CSS class selectors in tests (use data-testid)

### Validation

- ❌ Manual validation in components
- ❌ Inline schemas (extract to file)
- ❌ No tests for schemas
- ❌ Imperative error handling

### Testing

- ❌ `waitForTimeout()` arbitrary delays
- ❌ CSS selectors (`.class-name`)
- ❌ No intermediate state verification
- ❌ Missing data-testid attributes

---

## Pre-Commit Checklist

- [ ] All files under size limits
- [ ] TypeScript strict (no `any`)
- [ ] Forms use vee-validate + zod
- [ ] Schema tests passing
- [ ] Component tests passing
- [ ] E2E tests passing
- [ ] All interactive elements have data-testid
- [ ] No console.log statements
- [ ] CSS uses design tokens
- [ ] No lint/type errors
- [ ] `pnpm ci:full` passes

---

## Resources

- [Form Validation Patterns](./session-2-components/5-form-validation-patterns.md)
- [E2E Test Reliability](./session-3-testing-ui-sequencing/1-e2e-test-reliability-improvements.md)
- [Component Hierarchy](./session-2-components/1-component-hierarchy-breakdown-plan.md)
- [File Size Strategy](./session-2-components/2-file-size-refactoring-strategy.md)
