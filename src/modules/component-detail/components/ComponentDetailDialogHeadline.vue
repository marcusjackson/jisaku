<script setup lang="ts">
/**
 * ComponentDetailDialogHeadline
 *
 * Dialog for editing component headline fields: character, short meaning, keywords.
 */

import { ref, watch } from 'vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'

import { BaseButton, BaseDialog, BaseInput } from '@/base/components'

import { componentHeadlineSchema } from '../schemas/component-detail-headline-schema'

import type { HeadlineSaveData } from '../component-detail-types'

const props = defineProps<{
  open: boolean
  character: string
  shortMeaning: string | null
  searchKeywords: string | null
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: [data: HeadlineSaveData]
}>()

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(componentHeadlineSchema),
  initialValues: {
    character: props.character,
    shortMeaning: props.shortMeaning ?? '',
    searchKeywords: props.searchKeywords ?? ''
  }
})

const { errorMessage: characterError, value: characterValue } =
  useField<string>('character')
const { errorMessage: shortMeaningError, value: shortMeaningValue } =
  useField<string>('shortMeaning')
const { errorMessage: searchKeywordsError, value: searchKeywordsValue } =
  useField<string>('searchKeywords')

const isSubmitting = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      characterValue.value = props.character
      shortMeaningValue.value = props.shortMeaning ?? ''
      searchKeywordsValue.value = props.searchKeywords ?? ''
    }
  }
)

const onSubmit = handleSubmit((formValues) => {
  isSubmitting.value = true
  emit('save', {
    character: formValues.character,
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
      class="component-detail-dialog-headline-form"
      @submit.prevent="onSubmit"
    >
      <BaseInput
        v-model="characterValue"
        :error="characterError"
        label="Character"
        maxlength="1"
        required
      />

      <BaseInput
        v-model="shortMeaningValue"
        :error="shortMeaningError"
        label="Short Meaning"
        maxlength="100"
        placeholder="Brief text for quick identification"
      />

      <BaseInput
        v-model="searchKeywordsValue"
        :error="searchKeywordsError"
        label="Search Keywords"
        maxlength="500"
        placeholder="Additional search terms"
      />

      <div class="component-detail-dialog-headline-actions">
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
.component-detail-dialog-headline-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-dialog-headline-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
