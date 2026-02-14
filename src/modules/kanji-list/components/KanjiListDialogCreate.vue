<script setup lang="ts">
/**
 * KanjiListDialogCreate
 *
 * Form for creating a new kanji entry.
 * Uses vee-validate + zod for validation.
 */

import { ref } from 'vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'

import { BaseButton, BaseInput } from '@/base/components'

import { useKanjiRepository } from '@/api/kanji'

import { useToast } from '@/shared/composables'

import { kanjiCreateSchema } from '../schemas/kanji-create-schema'

const emit = defineEmits<{
  created: [kanjiId: number]
  cancel: []
}>()

const schema = toTypedSchema(kanjiCreateSchema)
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
    const repo = useKanjiRepository()

    // Check if kanji already exists
    const existing = repo.getByCharacter(values.character.trim())
    if (existing) {
      setFieldError('character', 'This kanji is already registered')
      return
    }

    const created = repo.create({ character: values.character.trim() })
    showSuccess(`Added kanji "${created.character}"`)
    resetForm()
    emit('created', created.id)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create kanji'
    setFieldError('character', msg)
    showError(msg)
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <form
    class="kanji-list-dialog-create"
    data-testid="kanji-create-form"
    @submit.prevent="onSubmit"
  >
    <div class="kanji-list-dialog-create-field">
      <BaseInput
        v-model="characterValue"
        autofocus
        :error="errorMessage"
        label="Character"
        placeholder="字"
        required
      />
    </div>

    <div class="kanji-list-dialog-create-actions">
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
.kanji-list-dialog-create {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.kanji-list-dialog-create-field {
  max-width: 100px;
}

.kanji-list-dialog-create-field :deep(input) {
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-base);
  text-align: center;
}

.kanji-list-dialog-create-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
