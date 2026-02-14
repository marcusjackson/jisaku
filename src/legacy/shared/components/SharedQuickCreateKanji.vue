<script setup lang="ts">
/**
 * SharedQuickCreateKanji
 *
 * Quick-create dialog for creating kanji with minimal fields.
 * Fields: character, stroke_count, short_meaning
 *
 * Note: search_keywords can be added later on the detail page.
 */

import { computed, watch } from 'vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'

import BaseButton from '@/legacy/base/components/BaseButton.vue'
import BaseDialog from '@/legacy/base/components/BaseDialog.vue'
import BaseInput from '@/legacy/base/components/BaseInput.vue'

import {
  type QuickCreateKanjiData,
  quickCreateKanjiSchema
} from '@/legacy/shared/validation/quick-create-kanji-schema'

const props = defineProps<{
  /** Initial character value (optional, for pre-filling) */
  initialCharacter?: string
}>()

const emit = defineEmits<{
  cancel: []
  create: [data: QuickCreateKanjiData]
}>()

const open = defineModel<boolean>('open', { default: false })

// Form setup
const schema = toTypedSchema(quickCreateKanjiSchema)

const { handleSubmit, isSubmitting, resetForm } = useForm<QuickCreateKanjiData>(
  {
    validationSchema: schema,
    initialValues: {
      character: props.initialCharacter ?? '',
      shortMeaning: '',
      searchKeywords: ''
    }
  }
)

// Use field-level bindings to avoid readonly proxy issues with v-model
const { errorMessage: characterError, value: characterValue } =
  useField<string>('character')
const { errorMessage: shortMeaningError, value: shortMeaningValue } =
  useField<string>('shortMeaning')
const { errorMessage: searchKeywordsError, value: searchKeywordsValue } =
  useField<string>('searchKeywords')

// Watch for dialog open to reset or pre-fill form
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      characterValue.value = props.initialCharacter ?? ''
      shortMeaningValue.value = ''
      searchKeywordsValue.value = ''
    }
  }
)

// Watch for initialCharacter prop changes
watch(
  () => props.initialCharacter,
  (newValue) => {
    if (newValue && open.value) {
      characterValue.value = newValue
    }
  }
)

const onSubmit = handleSubmit((formValues: QuickCreateKanjiData) => {
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
    description="Create a kanji with minimal fields. Add readings, keywords, and details on the kanji detail page."
    title="Quick Create Kanji"
  >
    <form
      id="quick-create-kanji-form"
      class="shared-quick-create-kanji-form"
      @submit.prevent="onSubmit"
    >
      <div class="shared-quick-create-kanji-field">
        <BaseInput
          v-model="characterValue"
          :error="characterError"
          label="Character"
          name="character"
          required
        />
      </div>

      <div class="shared-quick-create-kanji-field">
        <BaseInput
          v-model="shortMeaningValue"
          :error="shortMeaningError"
          label="Short Meaning"
          name="shortMeaning"
          placeholder="e.g., bright, clear"
        />
        <p class="shared-quick-create-kanji-help">
          Brief meaning for display (optional).
        </p>
      </div>

      <div class="shared-quick-create-kanji-field">
        <BaseInput
          v-model="searchKeywordsValue"
          :error="searchKeywordsError"
          label="Search Keywords"
          name="searchKeywords"
          placeholder="e.g., sun, day, light"
        />
        <p class="shared-quick-create-kanji-help">
          Additional search terms (optional).
        </p>
      </div>
    </form>

    <template #footer>
      <div class="shared-quick-create-kanji-actions">
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
          form="quick-create-kanji-form"
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
.shared-quick-create-kanji-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.shared-quick-create-kanji-row {
  display: flex;
  gap: var(--spacing-md);
}

.shared-quick-create-kanji-field {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.shared-quick-create-kanji-field-character {
  flex: 0 0 100px;
}

.shared-quick-create-kanji-field-strokes {
  flex: 0 0 100px;
}

.shared-quick-create-kanji-help {
  margin: var(--spacing-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.shared-quick-create-kanji-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
