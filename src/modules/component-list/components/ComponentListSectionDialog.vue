<script setup lang="ts">
/**
 * ComponentListSectionDialog
 *
 * Section component that handles the dialog for creating new components.
 * Uses BaseDialog for the modal wrapper.
 */

import { BaseDialog } from '@/base/components'

import ComponentListDialogCreate from './ComponentListDialogCreate.vue'

const emit = defineEmits<{
  created: [componentId: number]
}>()

const open = defineModel<boolean>('open', { default: false })

function handleCreated(componentId: number): void {
  open.value = false
  emit('created', componentId)
}

function handleCancel(): void {
  open.value = false
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    description="Enter the component character to create a new entry."
    title="Add New Component"
  >
    <ComponentListDialogCreate
      @cancel="handleCancel"
      @created="handleCreated"
    />
  </BaseDialog>
</template>
