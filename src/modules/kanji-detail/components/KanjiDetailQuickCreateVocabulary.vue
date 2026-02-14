<script setup lang="ts">
/**
 * KanjiDetailQuickCreateVocabulary
 *
 * Form for quickly creating a new vocabulary entry and linking it to the current kanji.
 * Pre-fills word field from search term, allows optional kana and meaning.
 */

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import { BaseButton, BaseInput } from '@/base/components'

import { kanjiDetailVocabularyQuickCreateSchema } from '../schemas/kanji-detail-vocabulary-quick-create-schema'

import type { KanjiDetailVocabularyQuickCreateData } from '../schemas/kanji-detail-vocabulary-quick-create-schema'

const props = defineProps<{
  /** Pre-fill word with search term */
  initialWord?: string
}>()

const emit = defineEmits<{
  create: [data: KanjiDetailVocabularyQuickCreateData]
  cancel: []
}>()

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(kanjiDetailVocabularyQuickCreateSchema),
  initialValues: {
    word: props.initialWord ?? '',
    kana: '',
    shortMeaning: ''
  }
})

const [word, wordAttrs] = defineField('word')
const [kana, kanaAttrs] = defineField('kana')
const [shortMeaning, shortMeaningAttrs] = defineField('shortMeaning')

const onSubmit = handleSubmit((values) => {
  emit('create', values)
  resetForm()
})

function handleCancel(): void {
  resetForm()
  emit('cancel')
}
</script>

<template>
  <form
    class="quick-create-vocabulary-form"
    data-testid="quick-create-vocabulary-form"
    @submit.prevent="onSubmit"
  >
    <div class="quick-create-vocabulary-fields">
      <BaseInput
        v-model="word"
        :error="errors.word"
        label="Word"
        v-bind="wordAttrs"
      />

      <BaseInput
        v-model="kana"
        :error="errors.kana"
        label="Kana (optional)"
        v-bind="kanaAttrs"
      />

      <BaseInput
        v-model="shortMeaning"
        :error="errors.shortMeaning"
        label="Short Meaning (optional)"
        v-bind="shortMeaningAttrs"
      />
    </div>

    <div class="quick-create-vocabulary-actions">
      <BaseButton
        type="button"
        variant="secondary"
        @click="handleCancel"
      >
        Cancel
      </BaseButton>

      <BaseButton
        type="submit"
        variant="primary"
      >
        Create & Link
      </BaseButton>
    </div>
  </form>
</template>

<style scoped>
.quick-create-vocabulary-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.quick-create-vocabulary-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.quick-create-vocabulary-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
}
</style>
