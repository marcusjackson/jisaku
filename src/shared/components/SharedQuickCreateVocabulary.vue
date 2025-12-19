<script setup lang="ts">
/**
 * SharedQuickCreateVocabulary
 *
 * Quick-create dialog for creating vocabulary with minimal fields.
 * Fields: word, kana (optional), short_meaning
 *
 * Note: full meanings, kanji links, and other details can be added
 * on the vocabulary detail page.
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
const { errorMessage: wordError, value: word } = useField<string>('word')
const { errorMessage: kanaError, value: kana } = useField<string>('kana')
const { errorMessage: shortMeaningError, value: shortMeaning } =
  useField<string>('shortMeaning')

// Watch for dialog open to reset or pre-fill form
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      resetForm()
      if (props.initialWord) {
        word.value = props.initialWord
      }
    }
  }
)

// Watch for initialWord prop changes
watch(
  () => props.initialWord,
  (newValue) => {
    if (newValue && open.value) {
      word.value = newValue
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
    description="Create vocabulary with minimal fields. Add meanings, kanji links, and details on the vocabulary detail page."
    title="Quick Create Vocabulary"
  >
    <form
      id="quick-create-vocabulary-form"
      class="shared-quick-create-vocabulary-form"
      @submit.prevent="onSubmit"
    >
      <div class="shared-quick-create-vocabulary-field">
        <BaseInput
          v-model="word"
          :error="wordError"
          label="Word"
          name="word"
          placeholder="e.g., 食べる"
          required
        />
      </div>

      <div class="shared-quick-create-vocabulary-field">
        <BaseInput
          v-model="kana"
          :error="kanaError"
          label="Reading (Kana)"
          name="kana"
          placeholder="e.g., たべる"
        />
        <p class="shared-quick-create-vocabulary-help">
          Kana reading (optional for kana-only words).
        </p>
      </div>

      <div class="shared-quick-create-vocabulary-field">
        <BaseInput
          v-model="shortMeaning"
          :error="shortMeaningError"
          label="Short Meaning"
          name="shortMeaning"
          placeholder="e.g., to eat"
        />
        <p class="shared-quick-create-vocabulary-help">
          Brief meaning for display (optional).
        </p>
      </div>
    </form>

    <template #footer>
      <div class="shared-quick-create-vocabulary-actions">
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
.shared-quick-create-vocabulary-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.shared-quick-create-vocabulary-field {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.shared-quick-create-vocabulary-help {
  margin: var(--spacing-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.shared-quick-create-vocabulary-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
