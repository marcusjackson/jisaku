<script setup lang="ts">
/**
 * KanjiDetailSectionReadings
 *
 * Section component for kanji readings (on-yomi and kun-yomi).
 * Displays compact reading format with edit dialog.
 */

import { ref } from 'vue'

import { BaseButton } from '@/base/components'

import { SharedSection } from '@/shared/components'

import KanjiDetailDialogReadings from './KanjiDetailDialogReadings.vue'
import KanjiDetailReadingsDisplay from './KanjiDetailReadingsDisplay.vue'

import type {
  KunReading,
  OnReading,
  ReadingsSaveData
} from '../kanji-detail-types'

defineProps<{
  onReadings: OnReading[]
  kunReadings: KunReading[]
  destructiveMode?: boolean
}>()

const emit = defineEmits<{
  save: [data: ReadingsSaveData]
}>()

const isDialogOpen = ref(false)

function handleSave(data: ReadingsSaveData): void {
  emit('save', data)
  isDialogOpen.value = false
}
</script>

<template>
  <SharedSection
    test-id="kanji-detail-readings"
    title="Readings"
  >
    <template #actions>
      <BaseButton
        data-testid="readings-edit-button"
        size="sm"
        variant="secondary"
        @click="isDialogOpen = true"
      >
        Edit
      </BaseButton>
    </template>

    <KanjiDetailReadingsDisplay
      :kun-readings="kunReadings"
      :on-readings="onReadings"
    />

    <KanjiDetailDialogReadings
      v-model:open="isDialogOpen"
      :destructive-mode="destructiveMode ?? false"
      :kun-readings="kunReadings"
      :on-readings="onReadings"
      @save="handleSave"
    />
  </SharedSection>
</template>
