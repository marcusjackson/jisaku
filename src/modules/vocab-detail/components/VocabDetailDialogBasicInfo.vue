<script setup lang="ts">
/**
 * VocabDetailDialogBasicInfo
 *
 * Dialog for editing vocabulary basic information fields:
 * JLPT level, common-word status, and description.
 */

import { ref, watch } from 'vue'

import {
  BaseButton,
  BaseDialog,
  BaseSelect,
  BaseSwitch,
  BaseTextarea
} from '@/base/components'

import { NONE, VOCAB_JLPT_OPTIONS } from '../utils/constants'

import type { BasicInfoSaveData } from '../vocab-detail-types'
import type { Vocabulary } from '@/api/vocabulary'

const props = defineProps<{
  open: boolean
  vocab: Vocabulary
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: [data: BasicInfoSaveData]
}>()

const jlptLevel = ref(NONE)
const isCommon = ref(false)
const description = ref('')
const isSubmitting = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    jlptLevel.value = props.vocab.jlptLevel ?? NONE
    isCommon.value = props.vocab.isCommon
    description.value = props.vocab.description ?? ''
  },
  { immediate: true }
)

function handleSubmit(): void {
  if (isSubmitting.value) return
  isSubmitting.value = true

  const data: BasicInfoSaveData = {
    jlptLevel:
      jlptLevel.value !== NONE
        ? (jlptLevel.value as BasicInfoSaveData['jlptLevel'])
        : null,
    isCommon: isCommon.value,
    description: description.value.trim() || null
  }

  emit('save', data)
  isSubmitting.value = false
  emit('update:open', false)
}

function handleCancel(): void {
  emit('update:open', false)
}
</script>

<template>
  <BaseDialog
    :open="props.open"
    title="Edit Basic Information"
    @update:open="emit('update:open', $event)"
  >
    <form
      class="vocab-detail-dialog-basic-info-form"
      @submit.prevent="handleSubmit"
    >
      <BaseSelect
        v-model="jlptLevel"
        label="JLPT Level"
        :options="VOCAB_JLPT_OPTIONS"
      />

      <BaseSwitch
        v-model="isCommon"
        label="Common Word"
      />

      <BaseTextarea
        v-model="description"
        label="Description"
        placeholder="Add a description..."
        :rows="4"
      />

      <div class="vocab-detail-dialog-basic-info-actions">
        <BaseButton
          type="button"
          variant="secondary"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton
          :disabled="isSubmitting"
          :loading="isSubmitting"
          type="submit"
        >
          Save
        </BaseButton>
      </div>
    </form>
  </BaseDialog>
</template>

<style scoped>
.vocab-detail-dialog-basic-info-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.vocab-detail-dialog-basic-info-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
