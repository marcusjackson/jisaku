<script setup lang="ts">
/**
 * VocabListDialogCreate
 *
 * Form for creating a new vocabulary entry.
 * Uses vee-validate + zod for validation.
 */

import { ref } from 'vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'

import { BaseButton, BaseInput } from '@/base/components'

import { useVocabularyRepository } from '@/api/vocabulary'

import { useToast } from '@/shared/composables'

import { vocabCreateSchema } from '../schemas/vocab-create-schema'

const emit = defineEmits<{
  created: [vocabId: number]
  cancel: []
}>()

const schema = toTypedSchema(vocabCreateSchema)
const { handleSubmit, resetForm, setFieldError } = useForm({
  validationSchema: schema,
  initialValues: { word: '', kana: '' }
})
const { errorMessage: wordError, value: wordValue } = useField<string>('word')
const { errorMessage: kanaError, value: kanaValue } = useField<string>('kana')

const isSubmitting = ref(false)
const { error: showError, success: showSuccess } = useToast()

const onSubmit = handleSubmit((values) => {
  isSubmitting.value = true

  try {
    const repo = useVocabularyRepository()

    // Check if vocabulary already exists
    const existing = repo.getByWord(values.word.trim())
    if (existing) {
      setFieldError('word', 'This word is already registered')
      return
    }

    const created = repo.create({
      word: values.word.trim(),
      kana: values.kana.trim()
    })
    showSuccess(`Added vocabulary "${created.word}"`)
    resetForm()
    emit('created', created.id)
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Failed to create vocabulary'
    setFieldError('word', msg)
    showError(msg)
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <form
    class="vocab-list-dialog-create"
    data-testid="vocab-create-form"
    @submit.prevent="onSubmit"
  >
    <div class="vocab-list-dialog-create-field">
      <BaseInput
        v-model="wordValue"
        autofocus
        :error="wordError"
        label="Word"
        placeholder="日本"
        required
      />
    </div>

    <div class="vocab-list-dialog-create-field">
      <BaseInput
        v-model="kanaValue"
        :error="kanaError"
        label="Kana"
        placeholder="にほん"
      />
    </div>

    <div class="vocab-list-dialog-create-actions">
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
.vocab-list-dialog-create {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.vocab-list-dialog-create-field {
  max-width: 100%;
}

.vocab-list-dialog-create-field :deep(input) {
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-base);
}

.vocab-list-dialog-create-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
