<script setup lang="ts">
/**
 * KanjiDetailReadingsList
 *
 * Renders a list of reading items with add/edit/delete/reorder controls.
 * Used by KanjiDetailDialogReadings for both on-yomi and kun-yomi sections.
 */

import { BaseButton } from '@/base/components'

import KanjiDetailReadingItem from './KanjiDetailReadingItem.vue'

import type {
  EditKunReading,
  EditOnReading,
  ReadingLevel
} from '../kanji-detail-types'

export interface ReadingWarning {
  reading?: string
  okurigana?: string
}

withDefaults(
  defineProps<{
    title: string
    readings: EditOnReading[] | EditKunReading[]
    showOkurigana?: boolean
    warnings?: (string | undefined)[]
    okuriganaWarnings?: (string | undefined)[]
    emptyText?: string
    destructiveMode?: boolean
  }>(),
  {
    destructiveMode: false,
    emptyText: 'No readings',
    okuriganaWarnings: () => [],
    showOkurigana: false,
    warnings: () => []
  }
)

const emit = defineEmits<{
  add: []
  'update:reading': [index: number, value: string]
  'update:okurigana': [index: number, value: string]
  'update:readingLevel': [index: number, value: ReadingLevel]
  move: [index: number, direction: -1 | 1]
  delete: [index: number]
}>()

function getOkurigana(reading: EditOnReading | EditKunReading): string {
  return 'okurigana' in reading ? reading.okurigana : ''
}
</script>

<template>
  <div class="readings-section">
    <div class="readings-section-header">
      <h3 class="readings-section-title">{{ title }}</h3>
      <BaseButton
        size="sm"
        variant="ghost"
        @click="emit('add')"
      >
        + Add
      </BaseButton>
    </div>

    <div
      v-if="readings.length === 0"
      class="readings-empty"
    >
      {{ emptyText }}
    </div>

    <div
      v-else
      class="readings-list"
    >
      <KanjiDetailReadingItem
        v-for="(reading, index) in readings"
        :key="reading.id"
        :destructive-mode="destructiveMode ?? false"
        :index="index"
        :okurigana="getOkurigana(reading)"
        :okurigana-warning="okuriganaWarnings?.[index] ?? ''"
        :reading="reading.reading"
        :reading-level="reading.readingLevel"
        :show-okurigana="showOkurigana ?? false"
        :total="readings.length"
        :warning="warnings?.[index] ?? ''"
        @delete="emit('delete', index)"
        @move-down="emit('move', index, 1)"
        @move-up="emit('move', index, -1)"
        @update:okurigana="emit('update:okurigana', index, $event)"
        @update:reading="emit('update:reading', index, $event)"
        @update:reading-level="
          emit('update:readingLevel', index, $event as ReadingLevel)
        "
      />
    </div>
  </div>
</template>

<style scoped>
.readings-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.readings-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.readings-section-title {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.readings-empty {
  padding: var(--spacing-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.readings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>
