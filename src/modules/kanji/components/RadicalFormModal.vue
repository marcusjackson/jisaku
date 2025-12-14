<script setup lang="ts">
/**
 * RadicalFormModal
 *
 * Modal dialog for creating a new radical inline from the kanji form.
 * Creates a component with canBeRadical=true.
 * Provides a simple form for entering basic radical information.
 */

import { ref, watch } from 'vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useField, useForm } from 'vee-validate'
import { z } from 'zod'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'
import BaseInput from '@/base/components/BaseInput.vue'

import { useComponentRepository } from '@/shared/composables/use-component-repository'

import type { Component } from '@/shared/types/database-types'

defineProps<{
  /** Placeholder - not used but keeps component signature consistent */
  placeholder?: string
}>()

const emit = defineEmits<{
  created: [radical: Component]
}>()

const open = defineModel<boolean>('open', { default: false })

// Validation schema for radical creation
const radicalSchema = z.object({
  character: z
    .string()
    .min(1, 'Character is required')
    .max(1, 'Must be a single character'),
  kangxiNumber: z
    .number({ invalid_type_error: 'Kangxi number is required' })
    .int('Must be a whole number')
    .min(1, 'Must be at least 1')
    .max(214, 'Must be at most 214'),
  strokeCount: z
    .number({ invalid_type_error: 'Stroke count is required' })
    .int('Must be a whole number')
    .min(1, 'Must be at least 1')
    .max(17, 'Must be at most 17'),
  kangxiMeaning: z.string().optional(),
  radicalNameJapanese: z.string().optional()
})

type RadicalFormValues = z.infer<typeof radicalSchema>

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const { handleSubmit, resetForm } = useForm<RadicalFormValues>({
  validationSchema: toTypedSchema(radicalSchema)
})

// Field bindings
const { errorMessage: characterError, value: character } =
  useField<string>('character')
const { errorMessage: kangxiNumberError, value: kangxiNumber } =
  useField<number>('kangxiNumber')
const { errorMessage: strokeCountError, value: strokeCount } =
  useField<number>('strokeCount')
const { value: kangxiMeaning } = useField<string>('kangxiMeaning')
const { value: radicalNameJapanese } = useField<string>('radicalNameJapanese')

// Reset form when dialog closes
watch(open, (isOpen) => {
  if (!isOpen) {
    resetForm()
    submitError.value = null
  }
})

const { create } = useComponentRepository()

const onSubmit = handleSubmit((formValues) => {
  isSubmitting.value = true
  submitError.value = null

  try {
    const radical = create({
      character: formValues.character,
      strokeCount: formValues.strokeCount,
      canBeRadical: true,
      kangxiNumber: formValues.kangxiNumber,
      kangxiMeaning: formValues.kangxiMeaning ?? null,
      radicalNameJapanese: formValues.radicalNameJapanese ?? null
    })

    emit('created', radical)
    open.value = false
  } catch (err) {
    submitError.value =
      err instanceof Error ? err.message : 'Failed to create radical'
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <BaseDialog
    v-model:open="open"
    description="Add a new Kangxi radical to the database"
    title="Create Radical"
  >
    <form
      class="radical-form-modal"
      @submit.prevent="onSubmit"
    >
      <div
        v-if="submitError"
        class="radical-form-modal-error"
        role="alert"
      >
        {{ submitError }}
      </div>

      <div class="radical-form-modal-row">
        <div
          class="radical-form-modal-field radical-form-modal-field-character"
        >
          <BaseInput
            v-model="character"
            :error="characterError"
            label="Character"
            name="character"
            required
          />
        </div>

        <div class="radical-form-modal-field radical-form-modal-field-number">
          <BaseInput
            v-model.number="kangxiNumber"
            :error="kangxiNumberError"
            label="Kangxi #"
            name="kangxiNumber"
            required
            type="number"
          />
        </div>

        <div class="radical-form-modal-field radical-form-modal-field-strokes">
          <BaseInput
            v-model.number="strokeCount"
            :error="strokeCountError"
            label="Strokes"
            name="strokeCount"
            required
            type="number"
          />
        </div>
      </div>

      <div class="radical-form-modal-row">
        <div class="radical-form-modal-field">
          <BaseInput
            v-model="kangxiMeaning"
            label="Meaning"
            name="kangxiMeaning"
            placeholder="e.g., water"
          />
        </div>

        <div class="radical-form-modal-field">
          <BaseInput
            v-model="radicalNameJapanese"
            label="Japanese Name"
            name="radicalNameJapanese"
            placeholder="e.g., さんずい"
          />
        </div>
      </div>

      <div class="radical-form-modal-actions">
        <BaseButton
          :disabled="isSubmitting"
          type="button"
          variant="secondary"
          @click="open = false"
        >
          Cancel
        </BaseButton>
        <BaseButton
          :disabled="isSubmitting"
          :loading="isSubmitting"
          type="submit"
          variant="primary"
        >
          Create Radical
        </BaseButton>
      </div>
    </form>
  </BaseDialog>
</template>

<style scoped>
.radical-form-modal {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  padding-top: var(--spacing-4);
}

.radical-form-modal-error {
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  background-color: var(--color-error-bg);
  color: var(--color-error);
  font-size: var(--font-size-sm);
}

.radical-form-modal-row {
  display: flex;
  gap: var(--spacing-4);
}

.radical-form-modal-field {
  flex: 1;
  min-width: 0;
}

.radical-form-modal-field-character {
  flex: 0 0 80px;
}

.radical-form-modal-field-number {
  flex: 0 0 100px;
}

.radical-form-modal-field-strokes {
  flex: 0 0 80px;
}

.radical-form-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding-top: var(--spacing-2);
}

@media (width <= 480px) {
  .radical-form-modal-row {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .radical-form-modal-field-character,
  .radical-form-modal-field-number,
  .radical-form-modal-field-strokes {
    flex: 1;
  }

  .radical-form-modal-actions {
    flex-direction: column-reverse;
  }

  .radical-form-modal-actions > * {
    width: 100%;
  }
}
</style>
