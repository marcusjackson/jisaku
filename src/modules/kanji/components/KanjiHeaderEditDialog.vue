<script setup lang="ts">
/**
 * KanjiHeaderEditDialog
 *
 * Dialog for editing kanji header fields:
 * - character
 * - short_meaning
 * - search_keywords
 */

import { ref, watch } from 'vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'
import BaseInput from '@/base/components/BaseInput.vue'

const props = defineProps<{
  open: boolean
  character: string
  shortMeaning: string | null
  searchKeywords: string | null
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: [
    data: {
      character: string
      shortMeaning: string | null
      searchKeywords: string | null
    }
  ]
}>()

const schema = toTypedSchema(
  z.object({
    character: z
      .string()
      .min(1, 'Character is required')
      .max(1, 'Must be a single character'),
    shortMeaning: z.string().max(100, 'Max 100 characters').optional(),
    searchKeywords: z.string().max(500, 'Max 500 characters').optional()
  })
)

const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    character: props.character,
    shortMeaning: props.shortMeaning ?? '',
    searchKeywords: props.searchKeywords ?? ''
  }
})

// Use field-level bindings to avoid readonly proxy issues with v-model
const { errorMessage: characterError, value: characterValue } =
  useField<string>('character')
const { errorMessage: shortMeaningError, value: shortMeaningValue } =
  useField<string>('shortMeaning')
const { errorMessage: searchKeywordsError, value: searchKeywordsValue } =
  useField<string>('searchKeywords')

const isSubmitting = ref(false)

// Reset form when dialog opens
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
    shortMeaning: formValues.shortMeaning ?? null,
    searchKeywords: formValues.searchKeywords ?? null
  })
  isSubmitting.value = false
  emit('update:open', false)
})

function handleCancel() {
  resetForm()
  emit('update:open', false)
}
</script>

<template>
  <BaseDialog
    description="Edit the kanji character, display meaning, and search keywords"
    :open="props.open"
    title="Edit Header"
    @update:open="emit('update:open', $event)"
  >
    <form
      class="kanji-header-edit-dialog-form"
      @submit.prevent="onSubmit"
    >
      <div class="kanji-header-edit-dialog-field">
        <BaseInput
          v-model="characterValue"
          :error="characterError"
          label="Character"
          maxlength="1"
          required
        />
      </div>

      <div class="kanji-header-edit-dialog-field">
        <BaseInput
          v-model="shortMeaningValue"
          :error="shortMeaningError"
          label="Short Meaning"
          maxlength="100"
          placeholder="Brief meaning for display"
        />
      </div>

      <div class="kanji-header-edit-dialog-field">
        <BaseInput
          v-model="searchKeywordsValue"
          :error="searchKeywordsError"
          label="Search Keywords"
          maxlength="500"
          placeholder="Additional search terms"
        />
      </div>

      <div class="kanji-header-edit-dialog-actions">
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
.kanji-header-edit-dialog-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-header-edit-dialog-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.kanji-header-edit-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
