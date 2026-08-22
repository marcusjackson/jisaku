<script setup lang="ts">
/**
 * ComponentDetailDialogGrouping
 *
 * Dialog for adding or editing a component grouping.
 * Shared between add and edit modes via the `mode` prop.
 */

import { computed, ref, watch } from 'vue'

import {
  BaseButton,
  BaseDialog,
  BaseInput,
  BaseTextarea
} from '@/base/components'

import type { GroupingFormData } from '../component-detail-types'

const props = defineProps<{
  /** Whether dialog is open */
  open: boolean
  /** Dialog mode */
  mode: 'add' | 'edit'
  /** Initial values for edit mode */
  initial?: GroupingFormData | undefined
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: GroupingFormData]
}>()

// Form state
const name = ref('')
const description = ref('')

// Computed
const dialogTitle = computed(() =>
  props.mode === 'edit' ? 'Edit Grouping' : 'Add Grouping'
)
const isSubmitDisabled = computed(() => !name.value.trim())

// Reset form when dialog opens
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    if (props.mode === 'edit' && props.initial) {
      name.value = props.initial.name
      description.value = props.initial.description ?? ''
    } else {
      name.value = ''
      description.value = ''
    }
  },
  { immediate: true }
)

function handleSubmit(): void {
  if (isSubmitDisabled.value) return

  const data: GroupingFormData = {
    name: name.value.trim(),
    description: description.value.trim() || null
  }

  emit('submit', data)
  emit('update:open', false)
}

function handleCancel(): void {
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
        v-model="name"
        label="Name"
        placeholder="Enter grouping name"
      />

      <BaseTextarea
        v-model="description"
        label="Description"
        placeholder="Optional description..."
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
        <BaseButton
          :disabled="isSubmitDisabled"
          type="submit"
        >
          Save
        </BaseButton>
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
