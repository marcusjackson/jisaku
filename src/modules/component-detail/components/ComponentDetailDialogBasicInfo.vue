<script setup lang="ts">
/**
 * ComponentDetailDialogBasicInfo
 *
 * Dialog for editing component basic information fields:
 * stroke count, source kanji, can-be-radical, and radical attributes.
 */

import { ref, watch } from 'vue'

import { BaseButton, BaseDialog } from '@/base/components'

import ComponentDetailBasicInfoFormFields from './ComponentDetailBasicInfoFormFields.vue'

import type { BasicInfoSaveData } from '../component-detail-types'
import type { Component } from '@/api/component/component-types'
import type { Kanji } from '@/api/kanji'

const props = defineProps<{
  open: boolean
  component: Component
  sourceKanji: Kanji | null
  kanjiOptions: Kanji[]
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: [data: BasicInfoSaveData]
}>()

const NONE_VALUE = '__none__'

const strokeCount = ref('')
const strokeCountError = ref<string | undefined>()
const sourceKanjiId = ref(NONE_VALUE)
const canBeRadical = ref(false)
const kangxiNumber = ref('')
const kangxiNumberError = ref<string | undefined>()
const kangxiMeaning = ref('')
const radicalNameJapanese = ref('')
const isSubmitting = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    const c = props.component
    strokeCount.value = c.strokeCount !== null ? String(c.strokeCount) : ''
    strokeCountError.value = undefined
    sourceKanjiId.value = c.sourceKanjiId ? String(c.sourceKanjiId) : NONE_VALUE
    canBeRadical.value = c.canBeRadical
    kangxiNumber.value = c.kangxiNumber !== null ? String(c.kangxiNumber) : ''
    kangxiNumberError.value = undefined
    kangxiMeaning.value = c.kangxiMeaning ?? ''
    radicalNameJapanese.value = c.radicalNameJapanese ?? ''
  },
  { immediate: true }
)

function validateStrokeCount(): boolean {
  strokeCountError.value = undefined
  if (!strokeCount.value) return true
  const num = parseInt(strokeCount.value, 10)
  if (isNaN(num) || num < 1 || num > 64) {
    strokeCountError.value = 'Stroke count must be between 1 and 64'
    return false
  }
  return true
}

function validateKangxiNumber(): boolean {
  kangxiNumberError.value = undefined
  if (!canBeRadical.value || !kangxiNumber.value) return true
  const num = parseInt(kangxiNumber.value, 10)
  if (isNaN(num) || num < 1 || num > 214) {
    kangxiNumberError.value = 'Kangxi number must be between 1 and 214'
    return false
  }
  return true
}

function handleSubmit(): void {
  if (!validateStrokeCount() || !validateKangxiNumber()) return
  isSubmitting.value = true
  const data: BasicInfoSaveData = {
    strokeCount: strokeCount.value ? parseInt(strokeCount.value, 10) : null,
    sourceKanjiId:
      sourceKanjiId.value !== NONE_VALUE
        ? parseInt(sourceKanjiId.value, 10)
        : null,
    canBeRadical: canBeRadical.value,
    kangxiNumber:
      canBeRadical.value && kangxiNumber.value
        ? parseInt(kangxiNumber.value, 10)
        : null,
    kangxiMeaning:
      canBeRadical.value && kangxiMeaning.value ? kangxiMeaning.value : null,
    radicalNameJapanese:
      canBeRadical.value && radicalNameJapanese.value
        ? radicalNameJapanese.value
        : null
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
      class="component-detail-dialog-basic-info-form"
      @submit.prevent="handleSubmit"
    >
      <ComponentDetailBasicInfoFormFields
        v-model:can-be-radical="canBeRadical"
        v-model:kangxi-meaning="kangxiMeaning"
        v-model:kangxi-number="kangxiNumber"
        v-model:radical-name-japanese="radicalNameJapanese"
        v-model:source-kanji-id="sourceKanjiId"
        v-model:stroke-count="strokeCount"
        :kangxi-number-error="kangxiNumberError"
        :kanji-options="kanjiOptions"
        :stroke-count-error="strokeCountError"
      />

      <div class="component-detail-dialog-basic-info-actions">
        <BaseButton
          type="button"
          variant="secondary"
          @click="handleCancel"
          >Cancel</BaseButton
        >
        <BaseButton
          :disabled="isSubmitting"
          :loading="isSubmitting"
          type="submit"
          >Save</BaseButton
        >
      </div>
    </form>
  </BaseDialog>
</template>

<style scoped>
.component-detail-dialog-basic-info-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-dialog-basic-info-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
