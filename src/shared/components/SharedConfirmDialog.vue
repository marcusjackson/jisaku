<script setup lang="ts">
/**
 * SharedConfirmDialog
 *
 * A reusable confirmation dialog for destructive or important actions.
 * Built on BaseDialog with support for danger variant styling.
 */

import { computed } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'

type DialogVariant = 'default' | 'danger'

interface Props {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Dialog title */
  title: string
  /** Dialog description/message */
  description: string
  /** Label for confirm button */
  confirmLabel?: string
  /** Label for cancel button */
  cancelLabel?: string
  /** Dialog variant (affects confirm button styling) */
  variant?: DialogVariant
  /** Whether confirm action is in progress */
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cancelLabel: 'Cancel',
  confirmLabel: 'Confirm',
  isLoading: false,
  variant: 'default'
})

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

// Compute button props to handle exactOptionalPropertyTypes
const buttonDisabled = computed(() => props.isLoading)
const confirmVariant = computed<'primary' | 'danger'>(() =>
  props.variant === 'danger' ? 'danger' : 'primary'
)

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <BaseDialog
    :description="props.description"
    :open="props.isOpen"
    :title="props.title"
    @close="handleCancel"
  >
    <!-- Default slot for custom content (e.g., form fields) -->
    <slot />

    <template #footer>
      <div class="shared-confirm-dialog-actions">
        <BaseButton
          :disabled="buttonDisabled"
          variant="secondary"
          @click="handleCancel"
        >
          {{ props.cancelLabel }}
        </BaseButton>
        <BaseButton
          :disabled="buttonDisabled"
          :loading="buttonDisabled"
          :variant="confirmVariant"
          @click="handleConfirm"
        >
          {{ props.confirmLabel }}
        </BaseButton>
      </div>
    </template>
  </BaseDialog>
</template>

<style scoped>
.shared-confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
