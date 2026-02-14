<script setup lang="ts">
/**
 * VocabListSectionDialog
 *
 * Section component that handles the dialog for creating new vocabulary.
 * Uses BaseDialog for the modal wrapper.
 */

import { BaseDialog } from '@/base/components'

import VocabListDialogCreate from './VocabListDialogCreate.vue'

const emit = defineEmits<{
  created: [vocabId: number]
}>()

const open = defineModel<boolean>('open', { default: false })

function handleCreated(vocabId: number): void {
  open.value = false
  emit('created', vocabId)
}

function handleCancel(): void {
  open.value = false
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    description="Enter the word and kana to create a new vocabulary entry."
    title="Add New Vocabulary"
  >
    <VocabListDialogCreate
      @cancel="handleCancel"
      @created="handleCreated"
    />
  </BaseDialog>
</template>
