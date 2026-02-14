<script setup lang="ts">
/**
 * KanjiDetailDialogBasicInfo
 *
 * Dialog for editing kanji basic information.
 */

import { ref, watch } from 'vue'

import { BaseButton, BaseDialog } from '@/base/components'

import { useKanjiDetailBasicInfoClassifications } from '../composables/use-kanji-detail-basic-info-classifications'
import { NONE } from '../utils/constants'

import KanjiDetailBasicInfoClassificationsList from './KanjiDetailBasicInfoClassificationsList.vue'
import KanjiDetailBasicInfoFormFields from './KanjiDetailBasicInfoFormFields.vue'

import type {
  BasicInfoSaveData,
  JlptLevel,
  JoyoLevel,
  KanjiKenteiLevel
} from '../kanji-detail-types'
import type {
  ClassificationType,
  KanjiClassification
} from '@/api/classification/classification-types'
import type { Component as RadicalComponent } from '@/api/component/component-types'
import type { Kanji } from '@/api/kanji/kanji-types'

const props = defineProps<{
  open: boolean
  kanji: Kanji
  radical: RadicalComponent | null
  allComponents: RadicalComponent[]
  classifications: KanjiClassification[]
  classificationTypes: ClassificationType[]
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: [data: BasicInfoSaveData]
}>()

const strokeCount = ref<number | null>(null)
const strokeCountError = ref<string | undefined>(undefined)
const jlptLevel = ref(NONE)
const joyoLevel = ref(NONE)
const kenteiLevel = ref(NONE)
const radicalValue = ref<string | null>(null)
const newRadicalCharacter = ref<string | undefined>(undefined)

const classificationsState = useKanjiDetailBasicInfoClassifications(
  props.classifications
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      strokeCount.value = props.kanji.strokeCount
      strokeCountError.value = undefined
      jlptLevel.value = props.kanji.jlptLevel ?? NONE
      joyoLevel.value = props.kanji.joyoLevel ?? NONE
      kenteiLevel.value = props.kanji.kanjiKenteiLevel ?? NONE
      radicalValue.value = props.kanji.radicalId?.toString() ?? null
      newRadicalCharacter.value = undefined
      classificationsState.reset(props.classifications)
    }
  }
)

function handleSubmit(): void {
  if (
    strokeCount.value !== null &&
    (strokeCount.value < 1 || strokeCount.value > 64)
  ) {
    strokeCountError.value = 'Must be 1-64'
    return
  }
  strokeCountError.value = undefined

  const radicalId = radicalValue.value ? Number(radicalValue.value) : null

  const saveData: BasicInfoSaveData = {
    strokeCount: strokeCount.value,
    jlptLevel: jlptLevel.value === NONE ? null : (jlptLevel.value as JlptLevel),
    joyoLevel: joyoLevel.value === NONE ? null : (joyoLevel.value as JoyoLevel),
    kanjiKenteiLevel:
      kenteiLevel.value === NONE
        ? null
        : (kenteiLevel.value as KanjiKenteiLevel),
    radicalId,
    classifications: classificationsState.normalizedItems.value
  }

  // Only include newRadicalCharacter if it has a value
  if (newRadicalCharacter.value) {
    saveData.newRadicalCharacter = newRadicalCharacter.value
  }

  emit('save', saveData)
  emit('update:open', false)
}

function handleCreateRadical(character: string): void {
  radicalValue.value = null
  newRadicalCharacter.value = character
}
</script>

<template>
  <BaseDialog
    :open="props.open"
    title="Edit Basic Information"
    @update:open="emit('update:open', $event)"
  >
    <form
      class="dialog-form"
      @submit.prevent="handleSubmit"
    >
      <KanjiDetailBasicInfoFormFields
        v-model:jlpt-level="jlptLevel"
        v-model:joyo-level="joyoLevel"
        v-model:kentei-level="kenteiLevel"
        v-model:new-radical-character="newRadicalCharacter"
        v-model:radical-value="radicalValue"
        v-model:stroke-count="strokeCount"
        :all-components="allComponents"
        v-bind="strokeCountError ? { strokeCountError } : {}"
        @create-radical="handleCreateRadical"
      />

      <KanjiDetailBasicInfoClassificationsList
        :classification-types="classificationTypes"
        :classifications-state="classificationsState"
      />

      <div class="dialog-actions">
        <BaseButton
          type="button"
          variant="secondary"
          @click="emit('update:open', false)"
          >Cancel</BaseButton
        >
        <BaseButton type="submit">Save</BaseButton>
      </div>
    </form>
  </BaseDialog>
</template>

<style scoped>
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
