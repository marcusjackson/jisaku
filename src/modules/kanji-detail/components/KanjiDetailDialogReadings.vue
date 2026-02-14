<script setup lang="ts">
/**
 * KanjiDetailDialogReadings
 *
 * Dialog for editing all kanji readings (on-yomi and kun-yomi).
 * Manages local edit state until save is confirmed.
 */

import { computed, ref, watch } from 'vue'

import { BaseButton, BaseDialog } from '@/base/components'

import { useKanjiDetailReadingsDialogHandlers } from '../composables/use-kanji-detail-readings-dialog-handlers'

import KanjiDetailReadingsList from './KanjiDetailReadingsList.vue'

import type {
  EditKunReading,
  EditOnReading,
  KunReading,
  OnReading,
  ReadingsSaveData
} from '../kanji-detail-types'

const props = defineProps<{
  open: boolean
  onReadings: OnReading[]
  kunReadings: KunReading[]
  destructiveMode?: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: [data: ReadingsSaveData]
}>()

// Local edit state
const editOnReadings = ref<EditOnReading[]>([])
const editKunReadings = ref<EditKunReading[]>([])
const nextTempId = ref(-1)

// Reset state when dialog opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      editOnReadings.value = props.onReadings.map((r) => ({
        id: r.id,
        reading: r.reading,
        readingLevel: r.readingLevel
      }))
      editKunReadings.value = props.kunReadings.map((r) => ({
        id: r.id,
        reading: r.reading,
        okurigana: r.okurigana ?? '',
        readingLevel: r.readingLevel
      }))
      nextTempId.value = -1
    }
  },
  { immediate: true }
)

// Character type warnings
function hasHiragana(text: string): boolean {
  return /[\u3040-\u309F]/.test(text)
}

function hasKatakana(text: string): boolean {
  return /[\u30A0-\u30FF]/.test(text)
}

const onReadingWarnings = computed(() =>
  editOnReadings.value.map((r) =>
    hasHiragana(r.reading) ? 'On-yomi is generally katakana' : undefined
  )
)

const kunReadingWarnings = computed(() =>
  editKunReadings.value.map((r) =>
    hasKatakana(r.reading) ? 'Kun-yomi is generally hiragana' : undefined
  )
)

const kunOkuriganaWarnings = computed(() =>
  editKunReadings.value.map((r) =>
    hasKatakana(r.okurigana) ? 'Okurigana is generally hiragana' : undefined
  )
)

// Handlers
const {
  addKunReading,
  addOnReading,
  moveKunReading,
  moveOnReading,
  removeKunReading,
  removeOnReading,
  updateKunOkurigana,
  updateKunReadingField,
  updateKunReadingLevel,
  updateOnReadingField,
  updateOnReadingLevel
} = useKanjiDetailReadingsDialogHandlers(
  editOnReadings,
  editKunReadings,
  nextTempId
)

// Save handler
function handleSave(): void {
  emit('save', {
    kunReadings: editKunReadings.value,
    onReadings: editOnReadings.value
  })
  emit('update:open', false)
}
</script>

<template>
  <BaseDialog
    :open="props.open"
    title="Edit Readings"
    @update:open="emit('update:open', $event)"
  >
    <div class="readings-dialog-content">
      <KanjiDetailReadingsList
        :destructive-mode="props.destructiveMode ?? false"
        empty-text="No on-yomi readings"
        :readings="editOnReadings"
        title="On-yomi (音読み)"
        :warnings="onReadingWarnings"
        @add="addOnReading"
        @delete="removeOnReading"
        @move="moveOnReading"
        @update:reading="updateOnReadingField"
        @update:reading-level="updateOnReadingLevel"
      />

      <KanjiDetailReadingsList
        :destructive-mode="props.destructiveMode ?? false"
        empty-text="No kun-yomi readings"
        :okurigana-warnings="kunOkuriganaWarnings"
        :readings="editKunReadings"
        show-okurigana
        title="Kun-yomi (訓読み)"
        :warnings="kunReadingWarnings"
        @add="addKunReading"
        @delete="removeKunReading"
        @move="moveKunReading"
        @update:okurigana="updateKunOkurigana"
        @update:reading="updateKunReadingField"
        @update:reading-level="updateKunReadingLevel"
      />

      <div class="readings-dialog-actions">
        <BaseButton
          variant="secondary"
          @click="emit('update:open', false)"
        >
          Cancel
        </BaseButton>
        <BaseButton @click="handleSave">Save</BaseButton>
      </div>
    </div>
  </BaseDialog>
</template>

<style scoped>
.readings-dialog-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-height: 70vh;
  overflow-y: auto;
}

.readings-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
