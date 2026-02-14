<script setup lang="ts">
/**
 * VocabDetailDialogHeadline
 *
 * Dialog for editing vocabulary headline fields: word, kana, short meaning, keywords.
 */

import { ref, watch } from 'vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'

import { BaseButton, BaseDialog, BaseInput } from '@/base/components'

import { vocabHeadlineSchema } from '../schemas/vocab-detail-headline-schema'

import type { HeadlineSaveData } from '../vocab-detail-types'

const props = defineProps<{
  open: boolean
  word: string
  kana: string
  shortMeaning: string | null
  searchKeywords: string | null
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: [data: HeadlineSaveData]
}>()

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(vocabHeadlineSchema),
  initialValues: {
    word: props.word,
    kana: props.kana,
    shortMeaning: props.shortMeaning ?? '',
    searchKeywords: props.searchKeywords ?? ''
  }
})

const { errorMessage: wordError, value: wordValue } = useField<string>('word')
const { errorMessage: kanaError, value: kanaValue } = useField<string>('kana')
const { errorMessage: shortMeaningError, value: shortMeaningValue } =
  useField<string>('shortMeaning')
const { errorMessage: searchKeywordsError, value: searchKeywordsValue } =
  useField<string>('searchKeywords')

const isSubmitting = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      wordValue.value = props.word
      kanaValue.value = props.kana
      shortMeaningValue.value = props.shortMeaning ?? ''
      searchKeywordsValue.value = props.searchKeywords ?? ''
    }
  }
)

const onSubmit = handleSubmit((formValues) => {
  isSubmitting.value = true
  emit('save', {
    word: formValues.word,
    kana: formValues.kana,
    shortMeaning: formValues.shortMeaning || null,
    searchKeywords: formValues.searchKeywords || null
  })
  isSubmitting.value = false
  emit('update:open', false)
})

function handleCancel(): void {
  resetForm()
  emit('update:open', false)
}
</script>

<template>
  <BaseDialog
    :open="props.open"
    title="Edit Headline"
    @update:open="emit('update:open', $event)"
  >
    <form
      class="vocab-detail-dialog-headline-form"
      @submit.prevent="onSubmit"
    >
      <BaseInput
        v-model="wordValue"
        :error="wordError"
        label="Word"
        maxlength="100"
        required
      />

      <BaseInput
        v-model="kanaValue"
        :error="kanaError"
        label="Kana"
        maxlength="100"
        placeholder="Reading in hiragana or katakana"
      />

      <BaseInput
        v-model="shortMeaningValue"
        :error="shortMeaningError"
        label="Short Meaning"
        maxlength="100"
        placeholder="Brief meaning for quick identification"
      />

      <BaseInput
        v-model="searchKeywordsValue"
        :error="searchKeywordsError"
        label="Search Keywords"
        maxlength="500"
        placeholder="Additional search terms"
      />

      <div class="vocab-detail-dialog-headline-actions">
        <BaseButton
          type="button"
          variant="secondary"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton
          :disabled="isSubmitting"
          :loading="isSubmitting"
          type="submit"
        >
          Save
        </BaseButton>
      </div>
    </form>
  </BaseDialog>
</template>

<style scoped>
.vocab-detail-dialog-headline-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.vocab-detail-dialog-headline-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
