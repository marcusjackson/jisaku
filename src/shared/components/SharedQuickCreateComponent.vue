<script setup lang="ts">
/**
 * SharedQuickCreateComponent
 *
 * Quick-create dialog for creating components with minimal fields.
 * Fields: character, short_meaning
 *
 * Note: search_keywords, stroke_count, and radical details can be added later on the detail page.
 */

import { computed, watch } from 'vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'
import BaseInput from '@/base/components/BaseInput.vue'

import {
  type QuickCreateComponentData,
  quickCreateComponentSchema
} from '@/shared/validation/quick-create-component-schema'

const props = defineProps<{
  /** Initial character value (optional, for pre-filling) */
  initialCharacter?: string
}>()

const emit = defineEmits<{
  cancel: []
  create: [data: QuickCreateComponentData]
}>()

const open = defineModel<boolean>('open', { default: false })

// Form setup
const schema = toTypedSchema(quickCreateComponentSchema)

const { handleSubmit, isSubmitting, resetForm } =
  useForm<QuickCreateComponentData>({
    validationSchema: schema,
    initialValues: {
      character: props.initialCharacter ?? '',
      shortMeaning: ''
    }
  })

// Use field-level bindings to avoid readonly proxy issues with v-model
const { errorMessage: characterError, value: character } =
  useField<string>('character')
const { errorMessage: shortMeaningError, value: shortMeaning } =
  useField<string>('shortMeaning')

// Watch for dialog open to reset or pre-fill form
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen) {
      resetForm()
      if (props.initialCharacter) {
        character.value = props.initialCharacter
      }
    }
  }
)

// Watch for initialCharacter prop changes
watch(
  () => props.initialCharacter,
  (newValue) => {
    if (newValue && open.value) {
      character.value = newValue
    }
  }
)

const onSubmit = handleSubmit((formValues: QuickCreateComponentData) => {
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
    description="Create a component with minimal fields. Add description, keywords, stroke count, and radical details on the component detail page."
    title="Quick Create Component"
  >
    <form
      id="quick-create-component-form"
      class="shared-quick-create-component-form"
      @submit.prevent="onSubmit"
    >
      <div class="shared-quick-create-component-field">
        <BaseInput
          v-model="character"
          :error="characterError"
          label="Character"
          name="character"
          required
        />
      </div>

      <div class="shared-quick-create-component-field">
        <BaseInput
          v-model="shortMeaning"
          :error="shortMeaningError"
          label="Short Meaning"
          name="shortMeaning"
          placeholder="e.g., tree, wood"
        />
        <p class="shared-quick-create-component-help">
          Brief meaning for display (optional).
        </p>
      </div>
    </form>

    <template #footer>
      <div class="shared-quick-create-component-actions">
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
          form="quick-create-component-form"
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
.shared-quick-create-component-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.shared-quick-create-component-field {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.shared-quick-create-component-help {
  margin: var(--spacing-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.shared-quick-create-component-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
