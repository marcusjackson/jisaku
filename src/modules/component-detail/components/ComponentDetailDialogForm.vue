<script setup lang="ts">
/**
 * ComponentDetailDialogForm
 *
 * Dialog for adding or editing component form variants.
 */

import { computed, ref, watch } from 'vue'

import {
  BaseButton,
  BaseDialog,
  BaseInput,
  BaseTextarea
} from '@/base/components'

import type { FormSubmitData } from '../component-detail-types'
import type { ComponentForm } from '@/api/component'

const props = withDefaults(
  defineProps<{
    /** Whether dialog is open */
    open: boolean
    /** Form to edit (null/undefined for add mode) */
    form?: ComponentForm | null
  }>(),
  {
    form: null
  }
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: FormSubmitData]
  cancel: []
}>()

// Form state
const formCharacter = ref('')
const formName = ref('')
const strokeCount = ref('')
const usageNotes = ref('')
const characterError = ref<string | null>(null)

// Computed values
const isEditMode = computed(() => props.form != null)
const dialogTitle = computed(() =>
  isEditMode.value ? 'Edit Form Variant' : 'Add Form Variant'
)

// Reset form when dialog opens
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    characterError.value = null
    if (props.form) {
      // Edit mode: populate from existing form
      formCharacter.value = props.form.formCharacter
      formName.value = props.form.formName ?? ''
      strokeCount.value =
        props.form.strokeCount !== null ? String(props.form.strokeCount) : ''
      usageNotes.value = props.form.usageNotes ?? ''
    } else {
      // Add mode: clear form
      formCharacter.value = ''
      formName.value = ''
      strokeCount.value = ''
      usageNotes.value = ''
    }
  },
  { immediate: true }
)

function validate(): boolean {
  characterError.value = null

  if (!formCharacter.value.trim()) {
    characterError.value = 'Character is required'
    return false
  }

  return true
}

function handleSubmit(): void {
  if (!validate()) return

  const data: FormSubmitData = {
    formCharacter: formCharacter.value.trim(),
    formName: formName.value.trim() || null,
    strokeCount: strokeCount.value ? parseInt(strokeCount.value, 10) : null,
    usageNotes: usageNotes.value.trim() || null
  }

  emit('submit', data)
  emit('update:open', false)
}

function handleCancel(): void {
  emit('cancel')
  emit('update:open', false)
}
</script>

<template>
  <BaseDialog
    :open="open"
    :title="dialogTitle"
    @update:open="emit('update:open', $event)"
  >
    <form
      class="dialog-form"
      @submit.prevent="handleSubmit"
    >
      <BaseInput
        v-model="formCharacter"
        :disabled="isEditMode"
        :error="characterError ?? undefined"
        label="Character"
        placeholder="Enter form character"
      />

      <BaseInput
        v-model="formName"
        label="Form Name"
        placeholder="e.g. water radical"
      />

      <BaseInput
        v-model="strokeCount"
        inputmode="numeric"
        label="Stroke Count"
        placeholder="e.g. 3"
        type="text"
      />

      <BaseTextarea
        v-model="usageNotes"
        label="Usage Notes"
        placeholder="e.g. Used on left side of kanji..."
        :rows="3"
      />

      <div class="dialog-form-actions">
        <BaseButton
          type="button"
          variant="secondary"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton type="submit">Save</BaseButton>
      </div>
    </form>
  </BaseDialog>
</template>

<style scoped>
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.dialog-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}
</style>
