---
applyTo: '**/*-schema.ts,**/validation/**/*.ts'
---

# Validation Instructions

Guidelines for form validation using zod and vee-validate.

## Schema Files

- **Module schemas**: `modules/[module]/[module]-[form]-schema.ts`
- **Shared schemas**: `shared/validation/common-schemas.ts`
- **Base**: No validation in `base/` (validation is app-specific)

**Note**: Validation schemas belong in `modules/` or `shared/`, never in `base/`. Validation rules are inherently app-specific.

## Zod Schema Pattern

```typescript
// kanji-form-schema.ts
import { z } from 'zod'

export const kanjiFormSchema = z.object({
  character: z
    .string()
    .min(1, 'Character is required')
    .max(1, 'Must be a single character'),

  strokeCount: z
    .number({ required_error: 'Stroke count is required' })
    .int('Must be a whole number')
    .min(1, 'Must be at least 1')
    .max(64, 'Must be at most 64'),

  radicalId: z.number().nullable().optional(),

  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).nullable().optional(),

  joyoLevel: z
    .enum([
      'elementary1',
      'elementary2',
      'elementary3',
      'elementary4',
      'elementary5',
      'elementary6',
      'secondary'
    ])
    .nullable()
    .optional(),

  notes: z.string().optional()
})

// Export inferred type
export type KanjiFormData = z.infer<typeof kanjiFormSchema>
```

## VeeValidate Integration

```typescript
// use-kanji-form.ts
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { kanjiFormSchema, type KanjiFormData } from '../kanji-form-schema'

export function useKanjiForm(initialValues?: Partial<KanjiFormData>) {
  const schema = toTypedSchema(kanjiFormSchema)

  const { handleSubmit, errors, values, resetForm, setFieldValue } = useForm({
    validationSchema: schema,
    initialValues: {
      character: '',
      strokeCount: undefined,
      radicalId: null,
      jlptLevel: null,
      joyoLevel: null,
      notes: '',
      ...initialValues
    }
  })

  return {
    handleSubmit,
    errors,
    values,
    resetForm,
    setFieldValue
  }
}
```

## Field Component Pattern

```vue
<script setup lang="ts">
import { useField } from 'vee-validate'
import BaseInput from '@/shared/components/BaseInput.vue'

const props = defineProps<{
  name: string
  label: string
}>()

const { value, errorMessage } = useField(() => props.name)
</script>

<template>
  <div class="field">
    <label :for="name">{{ label }}</label>
    <BaseInput
      :id="name"
      v-model="value"
      :error="!!errorMessage"
    />
    <span
      v-if="errorMessage"
      class="field-error"
    >
      {{ errorMessage }}
    </span>
  </div>
</template>
```

## Common Validation Patterns

### Required String

```typescript
z.string().min(1, 'Field is required')
```

### Optional String

```typescript
z.string().optional()
```

### Nullable Field

```typescript
z.string().nullable()
```

### Number with Range

```typescript
z.number()
  .int('Must be a whole number')
  .min(1, 'Must be at least 1')
  .max(100, 'Must be at most 100')
```

### Enum Selection

```typescript
z.enum(['option1', 'option2', 'option3'])
```

### Optional Enum

```typescript
z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).nullable().optional()
```

### Custom Validation

```typescript
z.string().refine((val) => isValidKanjiCharacter(val), {
  message: 'Must be a valid kanji character'
})
```

## Error Display

Display inline errors below fields:

```vue
<template>
  <div class="field">
    <BaseInput
      v-model="character"
      :error="!!errors.character"
    />
    <span
      v-if="errors.character"
      class="field-error"
    >
      {{ errors.character }}
    </span>
  </div>
</template>

<style scoped>
.field-error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-1);
}
</style>
```

## Schema Testing

Test validation logic:

```typescript
// kanji-form-schema.test.ts
import { describe, it, expect } from 'vitest'
import { kanjiFormSchema } from './kanji-form-schema'

describe('kanjiFormSchema', () => {
  it('accepts valid data', () => {
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
  })

  it('rejects invalid stroke count', () => {
    const result = kanjiFormSchema.safeParse({
      character: '水',
      strokeCount: 0
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

  it('accepts null jlpt level', () => {
    const result = kanjiFormSchema.safeParse({
      character: '水',
      strokeCount: 4,
      jlptLevel: null
    })
    expect(result.success).toBe(true)
  })
})
```

## Shared Schemas

Common schemas in `shared/validation/`:

```typescript
// shared/validation/common-schemas.ts
import { z } from 'zod'

export const jlptLevelSchema = z.enum(['N5', 'N4', 'N3', 'N2', 'N1'])

export const joyoLevelSchema = z.enum([
  'elementary1',
  'elementary2',
  'elementary3',
  'elementary4',
  'elementary5',
  'elementary6',
  'secondary'
])

export const positiveIntSchema = z.number().int().positive()
```

Use in module schemas:

```typescript
import {
  jlptLevelSchema,
  joyoLevelSchema
} from '@/shared/validation/common-schemas'

export const kanjiFormSchema = z.object({
  // ...
  jlptLevel: jlptLevelSchema.nullable().optional(),
  joyoLevel: joyoLevelSchema.nullable().optional()
})
```
