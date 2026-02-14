<script setup lang="ts">
/**
 * ComponentListDialogCreate
 *
 * Form for creating a new component entry.
 * Uses vee-validate + zod for validation.
 */

import { ref } from 'vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'

import { BaseButton, BaseInput } from '@/base/components'

import { useComponentRepository } from '@/api/component'

import { useToast } from '@/shared/composables'

import { componentCreateSchema } from '../schemas/component-create-schema'

const emit = defineEmits<{
  created: [componentId: number]
  cancel: []
}>()

const schema = toTypedSchema(componentCreateSchema)
const { handleSubmit, resetForm, setFieldError } = useForm({
  validationSchema: schema,
  initialValues: { character: '' }
})
const { errorMessage, value: characterValue } = useField<string>('character')

const isSubmitting = ref(false)
const { error: showError, success: showSuccess } = useToast()

const onSubmit = handleSubmit((values) => {
  isSubmitting.value = true

  try {
    const repo = useComponentRepository()

    // Check if component already exists
    const existing = repo.getByCharacter(values.character.trim())
    if (existing) {
      setFieldError('character', 'This component is already registered')
      return
    }

    const created = repo.create({ character: values.character.trim() })
    showSuccess(`Added component "${created.character}"`)
    resetForm()
    emit('created', created.id)
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Failed to create component'
    setFieldError('character', msg)
    showError(msg)
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <form
    class="component-list-dialog-create"
    data-testid="component-create-form"
    @submit.prevent="onSubmit"
  >
    <div class="component-list-dialog-create-field">
      <BaseInput
        v-model="characterValue"
        autofocus
        :error="errorMessage"
        label="Character"
        placeholder="亻"
      />
    </div>

    <div class="component-list-dialog-create-actions">
      <BaseButton
        :disabled="isSubmitting"
        size="sm"
        type="button"
        variant="secondary"
        @click="emit('cancel')"
      >
        Cancel
      </BaseButton>
      <BaseButton
        :disabled="isSubmitting"
        :loading="isSubmitting"
        size="sm"
        type="submit"
      >
        Add
      </BaseButton>
    </div>
  </form>
</template>

<style scoped>
.component-list-dialog-create {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.component-list-dialog-create-field {
  max-width: 100px;
}

.component-list-dialog-create-field :deep(input) {
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-base);
  text-align: center;
}

.component-list-dialog-create-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
