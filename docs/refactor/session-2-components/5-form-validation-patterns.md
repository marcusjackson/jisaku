# Form Validation Patterns

**Summary:** Standardized patterns for form validation using vee-validate + zod. All forms must follow these patterns to ensure consistency and maintainability.

---

## Core Pattern

### Required Stack

- **vee-validate** — Form state management
- **zod** — Schema validation
- **@vee-validate/zod** — Bridge (toTypedSchema)

### File Structure

```
src/modules/kanji-list/
├── schemas/
│   ├── kanji-create-schema.ts        # Validation schema
│   └── kanji-create-schema.test.ts   # Schema tests
└── components/
    └── KanjiListDialogCreate.vue # Uses schema
```

### Schema Location

- **Module-specific forms** → Module's schemas folder (e.g., `schemas/kanji-create-schema.ts`)
- **Shared validators** → `src/shared/validation/common-schemas.ts`

---

## Schema File Pattern

```typescript
/**
 * Validation schema for [form name]
 */
import { z } from 'zod'
import { singleCharacterSchema, optionalString } from '@/shared/validation'

export const kanjiCreateSchema = z.object({
  character: singleCharacterSchema,
  shortMeaning: optionalString(100),
  searchKeywords: optionalString(500)
})

export type KanjiCreateData = z.infer<typeof kanjiCreateSchema>
```

**Rules:**

- Named export matching form purpose
- Export inferred type
- Use shared validators when possible
- Import from `@/shared/validation` (barrel export)

---

## Common Validators

Located in `src/shared/validation/common-schemas.ts`:

```typescript
// Single character (handles Unicode)
export const singleCharacterSchema = z
  .string()
  .min(1, '漢字を入力してください')
  .refine(
    (val) => {
      const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' })
      return [...segmenter.segment(val.trim())].length === 1
    },
    { message: '1文字だけ入力してください' }
  )

// Optional string with max length
export function optionalString(maxLength: number) {
  return z.string().max(maxLength, `Max ${maxLength} characters`)
}
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

## Component Integration

```vue
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { kanjiCreateSchema } from '../schemas/kanji-create-schema'

// Convert zod schema to vee-validate schema
const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(kanjiCreateSchema),
  initialValues: {
    character: props.character || '',
    shortMeaning: props.shortMeaning || ''
  }
})

// Bind fields
const { value: character, errorMessage: characterError } =
  useField<string>('character')
const { value: shortMeaning, errorMessage: shortMeaningError } =
  useField<string>('shortMeaning')

// Submit handler
const onSubmit = handleSubmit((values) => {
  emit('save', {
    character: values.character,
    shortMeaning: values.shortMeaning || null
  })
})
</script>

<template>
  <form @submit.prevent="onSubmit">
    <BaseInput
      v-model="character"
      :error="characterError"
      label="Character"
      required
    />
    <BaseInput
      v-model="shortMeaning"
      :error="shortMeaningError"
      label="Short Meaning"
    />
    <BaseButton type="submit">Save</BaseButton>
  </form>
</template>
```

---

## Schema Testing

Test file colocated with schema:

```typescript
import { describe, expect, it } from 'vitest'
import { kanjiCreateSchema } from './kanji-create-schema'

describe('kanjiCreateSchema', () => {
  describe('character field', () => {
    it('accepts valid kanji', () => {
      const result = kanjiCreateSchema.safeParse({ character: '水' })
      expect(result.success).toBe(true)
    })

    it('rejects empty', () => {
      const result = kanjiCreateSchema.safeParse({ character: '' })
      expect(result.success).toBe(false)
    })

    it('rejects multiple characters', () => {
      const result = kanjiCreateSchema.safeParse({ character: '水火' })
      expect(result.success).toBe(false)
    })
  })

  describe('optional fields', () => {
    it('accepts empty strings', () => {
      const result = kanjiCreateSchema.safeParse({
        character: '水',
        shortMeaning: ''
      })
      expect(result.success).toBe(true)
    })

    it('enforces max length', () => {
      const result = kanjiCreateSchema.safeParse({
        character: '水',
        shortMeaning: 'a'.repeat(101)
      })
      expect(result.success).toBe(false)
    })
  })
})
```

**Coverage Requirements:**

- Valid cases
- Empty/missing values
- Length limits
- Format constraints

---

## Error Display

### Inline Errors (Preferred)

```vue
<BaseInput
  v-model="character"
  :error="characterError"  <!-- vee-validate error -->
  label="Character"
/>
```

BaseInput handles error display styling.

### Toast for Backend Errors

```typescript
const onSubmit = handleSubmit(async (values) => {
  try {
    await repository.create(values)
    toast.success('Kanji created')
  } catch (error) {
    toast.error('Failed to create kanji')
  }
})
```

---

## Checklist

When creating a new form:

- [ ] Create schema file (`[form]-schema.ts`)
- [ ] Export schema and inferred type
- [ ] Use shared validators where applicable
- [ ] Add comprehensive tests (colocated)
- [ ] Import with `toTypedSchema()` in component
- [ ] Use `useForm()` and `useField()`
- [ ] Bind error messages to inputs
- [ ] Use `handleSubmit()` for form submission
- [ ] Handle backend errors with toast
- [ ] Verify all tests pass

---

## Anti-Patterns

❌ **Don't:**

- Manual validation in components
- Inline schemas (use separate file)
- Imperative error handling
- Arbitrary setTimeout/delays
- Missing tests for schemas

✅ **Do:**

- Declarative schemas
- Shared validators
- Colocated tests
- Proper error display
- Type-safe forms
