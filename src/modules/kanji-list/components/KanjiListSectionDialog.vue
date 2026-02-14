<script setup lang="ts">
/**
 * KanjiListSectionDialog
 *
 * Section component that handles the dialog for creating new kanji.
 * Uses BaseDialog for the modal wrapper.
 */

import { BaseDialog } from '@/base/components'

import KanjiListDialogCreate from './KanjiListDialogCreate.vue'

const emit = defineEmits<{
  created: [kanjiId: number]
}>()

const open = defineModel<boolean>('open', { default: false })

function handleCreated(kanjiId: number): void {
  open.value = false
  emit('created', kanjiId)
}

function handleCancel(): void {
  open.value = false
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    description="Enter the kanji character to create a new entry."
    title="Add New Kanji"
  >
    <KanjiListDialogCreate
      @cancel="handleCancel"
      @created="handleCreated"
    />
  </BaseDialog>
</template>
