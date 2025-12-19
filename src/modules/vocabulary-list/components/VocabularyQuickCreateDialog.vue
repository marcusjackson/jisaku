<script setup lang="ts">
/**
 * VocabularyQuickCreateDialog
 *
 * Quick-create dialog for creating vocabulary with minimal fields.
 * Fields: word, kana (optional), short_meaning
 *
 * Note: JLPT level, description can be added later on the detail page.
 */

import { computed, watch } from 'vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'
import BaseInput from '@/base/components/BaseInput.vue'

import {
  type QuickCreateVocabularyData,
  quickCreateVocabularySchema
} from '@/shared/validation/quick-create-vocabulary-schema'

const props = defineProps<{
  /** Initial word value (optional, for pre-filling) */
  initialWord?: string
}>()

const emit = defineEmits<{
  cancel: []
  create: [data: QuickCreateVocabularyData]
}>()

const open = defineModel<boolean>('open', { default: false })

// Form setup
const schema = toTypedSchema(quickCreateVocabularySchema)

const { handleSubmit, isSubmitting, resetForm } =
  useForm<QuickCreateVocabularyData>({
    validationSchema: schema,
    initialValues: {
      word: props.initialWord ?? '',
      kana: '',
      shortMeaning: ''
    }
  })

// Use field-level bindings to avoid readonly proxy issues with v-model
const { errorMessage: wordError, value: wordValue } = useField<string>('word')
const { value: kanaValue } = useField<string>('kana')
const { errorMessage: shortMeaningError, value: shortMeaningValue } =
  useField<string>('shortMeaning')

// Watch for dialog open to reset or pre-fill form
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      wordValue.value = props.initialWord ?? ''
      kanaValue.value = ''
      shortMeaningValue.value = ''
    }
  }
)

// Watch for initialWord prop changes
watch(
  () => props.initialWord,
  (newValue) => {
    if (newValue && open.value) {
      wordValue.value = newValue
    }
  }
)

const onSubmit = handleSubmit((formValues: QuickCreateVocabularyData) => {
  emit('create', formValues)
  open.value = false
})

function handleCancel() {
  resetForm()
  emit('cancel')
  open.value = false
}

// Compute button disabled state
const isSaveDisabled = computed(() => isSubmitting.value)
</script>

<template>
  <BaseDialog
    v-model:open="open"
    description="Create vocabulary with minimal fields. Add JLPT level and details on the vocabulary detail page."
    title="Quick Create Vocabulary"
  >
    <form
      id="quick-create-vocabulary-form"
      class="vocabulary-quick-create-dialog-form"
      @submit.prevent="onSubmit"
    >
      <div class="vocabulary-quick-create-dialog-field">
        <BaseInput
          v-model="wordValue"
          :error="wordError"
          label="Word"
          name="word"
          placeholder="e.g., 日本"
          required
        />
      </div>

      <div class="vocabulary-quick-create-dialog-field">
        <BaseInput
          v-model="kanaValue"
          label="Kana"
          name="kana"
          placeholder="e.g., にほん (optional)"
        />
      </div>

      <div class="vocabulary-quick-create-dialog-field">
        <BaseInput
          v-model="shortMeaningValue"
          :error="shortMeaningError"
          label="Short Meaning"
          name="shortMeaning"
          placeholder="e.g., Japan"
        />
        <p class="vocabulary-quick-create-dialog-help">
          Brief meaning for display (optional).
        </p>
      </div>
    </form>

    <template #footer>
      <div class="vocabulary-quick-create-dialog-actions">
        <BaseButton
          :disabled="isSaveDisabled"
          type="button"
          variant="secondary"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton
          :disabled="isSaveDisabled"
          form="quick-create-vocabulary-form"
          :loading="isSubmitting"
          type="submit"
          variant="primary"
        >
          Create & View
        </BaseButton>
      </div>
    </template>
  </BaseDialog>
</template>

<style scoped>
.vocabulary-quick-create-dialog-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.vocabulary-quick-create-dialog-field {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.vocabulary-quick-create-dialog-help {
  margin: var(--spacing-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.vocabulary-quick-create-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
