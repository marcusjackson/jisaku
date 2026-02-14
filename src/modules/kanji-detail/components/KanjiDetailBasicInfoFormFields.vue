<script setup lang="ts">
/**
 * KanjiDetailBasicInfoFormFields
 *
 * Form fields for editing basic kanji info (stroke count, levels, radical).
 */

import { BaseInput, BaseSelect } from '@/base/components'

import { JLPT_OPTIONS, JOYO_OPTIONS, KENTEI_OPTIONS } from '../utils/constants'

import KanjiDetailRadicalInput from './KanjiDetailRadicalInput.vue'

import type { Component as RadicalComponent } from '@/api/component/component-types'

defineProps<{
  allComponents: RadicalComponent[]
  strokeCountError?: string
}>()

const emit = defineEmits<{
  createRadical: [character: string]
}>()

const strokeCount = defineModel<number | null>('strokeCount')
const jlptLevel = defineModel<string>('jlptLevel', { required: true })
const joyoLevel = defineModel<string>('joyoLevel', { required: true })
const kenteiLevel = defineModel<string>('kenteiLevel', { required: true })
const radicalValue = defineModel<string | null>('radicalValue')
const newRadicalCharacter = defineModel<string | undefined>(
  'newRadicalCharacter'
)

const handleStrokeInput = (val: string | number | undefined) => {
  strokeCount.value =
    val === '' || val === undefined
      ? null
      : typeof val === 'number'
        ? val
        : parseInt(val, 10)
}
</script>

<template>
  <div class="form-fields">
    <BaseInput
      :error="strokeCountError"
      label="Stroke Count"
      :model-value="strokeCount ?? ''"
      placeholder="1-64"
      type="number"
      @update:model-value="handleStrokeInput"
    />
    <BaseSelect
      v-model="jlptLevel"
      label="JLPT Level"
      :options="JLPT_OPTIONS"
    />
    <BaseSelect
      v-model="joyoLevel"
      label="Jōyō Grade"
      :options="JOYO_OPTIONS"
    />
    <BaseSelect
      v-model="kenteiLevel"
      label="Kentei Level"
      :options="KENTEI_OPTIONS"
    />
    <KanjiDetailRadicalInput
      v-bind="{
        ...(radicalValue !== undefined ? { radicalValue } : {}),
        ...(newRadicalCharacter !== undefined ? { newRadicalCharacter } : {}),
        allComponents
      }"
      @create-radical="(character) => emit('createRadical', character)"
      @update:new-radical-character="(val) => (newRadicalCharacter = val)"
      @update:radical-value="(val) => (radicalValue = val)"
    />
  </div>
</template>

<style scoped>
.form-fields {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

@media (width <= 480px) {
  .form-fields {
    grid-template-columns: 1fr;
  }
}
</style>
