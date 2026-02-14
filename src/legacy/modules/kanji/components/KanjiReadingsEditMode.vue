<script setup lang="ts">
/**
 * KanjiReadingsEditMode
 *
 * UI component: Edit mode for kanji readings (on-yomi and kun-yomi).
 * Handles display of edit items and coordination of actions.
 */

import BaseButton from '@/legacy/base/components/BaseButton.vue'

import KanjiKunReadingEditItem from './KanjiKunReadingEditItem.vue'
import KanjiOnReadingEditItem from './KanjiOnReadingEditItem.vue'

import type { ReadingLevel } from '@/legacy/shared/types/database-types'

interface EditOnReading {
  id: number
  reading: string
  readingLevel: ReadingLevel
  isNew?: boolean
}

interface EditKunReading {
  id: number
  reading: string
  okurigana: string
  readingLevel: ReadingLevel
  isNew?: boolean
}

interface KunReadingWarning {
  reading?: string
  okurigana?: string
}

withDefaults(
  defineProps<{
    /** Local edit state for on-yomi readings */
    onReadings: EditOnReading[]
    /** Local edit state for kun-yomi readings */
    kunReadings: EditKunReading[]
    /** Warning messages for on-yomi by index */
    onReadingWarnings: Record<number, string>
    /** Warning messages for kun-yomi by index */
    kunReadingWarnings: Record<number, KunReadingWarning>
    /** Whether destructive mode is enabled (shows delete buttons) */
    isDestructiveMode?: boolean
  }>(),
  {
    isDestructiveMode: false
  }
)

const emit = defineEmits<{
  // On-yomi events
  addOnReading: []
  'update:onReading': [index: number, field: 'reading' | 'level', value: string]
  saveNewOnReading: [index: number]
  cancelNewOnReading: [index: number]
  moveOnReadingUp: [index: number]
  moveOnReadingDown: [index: number]
  deleteOnReading: [id: number]
  // Kun-yomi events
  addKunReading: []
  'update:kunReading': [
    index: number,
    field: 'reading' | 'okurigana' | 'level',
    value: string
  ]
  saveNewKunReading: [index: number]
  cancelNewKunReading: [index: number]
  moveKunReadingUp: [index: number]
  moveKunReadingDown: [index: number]
  deleteKunReading: [id: number]
}>()
</script>

<template>
  <div class="kanji-readings-edit">
    <!-- On-yomi edit section -->
    <div class="kanji-readings-edit-section">
      <div class="kanji-readings-edit-header">
        <h4 class="kanji-readings-section-title">On-yomi:</h4>
        <BaseButton
          size="sm"
          variant="ghost"
          @click="emit('addOnReading')"
        >
          + Add
        </BaseButton>
      </div>

      <div
        v-if="onReadings.length === 0"
        class="kanji-readings-empty"
      >
        No on-yomi readings. Click "+ Add" to add one.
      </div>

      <div
        v-else
        class="kanji-readings-edit-list"
      >
        <KanjiOnReadingEditItem
          v-for="(reading, index) in onReadings"
          :key="reading.id"
          :index="index"
          :is-destructive-mode="isDestructiveMode ?? false"
          :reading="reading"
          :total-count="onReadings.length"
          :warning="onReadingWarnings[index]"
          @cancel="emit('cancelNewOnReading', index)"
          @delete="emit('deleteOnReading', reading.id)"
          @move-down="emit('moveOnReadingDown', index)"
          @move-up="emit('moveOnReadingUp', index)"
          @save="emit('saveNewOnReading', index)"
          @update:level="(val) => emit('update:onReading', index, 'level', val)"
          @update:reading="
            (val) => emit('update:onReading', index, 'reading', val)
          "
        />
      </div>
    </div>

    <!-- Kun-yomi edit section -->
    <div class="kanji-readings-edit-section">
      <div class="kanji-readings-edit-header">
        <h4 class="kanji-readings-section-title">Kun-yomi:</h4>
        <BaseButton
          size="sm"
          variant="ghost"
          @click="emit('addKunReading')"
        >
          + Add
        </BaseButton>
      </div>

      <div
        v-if="kunReadings.length === 0"
        class="kanji-readings-empty"
      >
        No kun-yomi readings. Click "+ Add" to add one.
      </div>

      <div
        v-else
        class="kanji-readings-edit-list"
      >
        <KanjiKunReadingEditItem
          v-for="(reading, index) in kunReadings"
          :key="reading.id"
          :index="index"
          :is-destructive-mode="isDestructiveMode ?? false"
          :reading="reading"
          :total-count="kunReadings.length"
          :warning="kunReadingWarnings[index]"
          @cancel="emit('cancelNewKunReading', index)"
          @delete="emit('deleteKunReading', reading.id)"
          @move-down="emit('moveKunReadingDown', index)"
          @move-up="emit('moveKunReadingUp', index)"
          @save="emit('saveNewKunReading', index)"
          @update:level="
            (val) => emit('update:kunReading', index, 'level', val)
          "
          @update:okurigana="
            (val) => emit('update:kunReading', index, 'okurigana', val)
          "
          @update:reading="
            (val) => emit('update:kunReading', index, 'reading', val)
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanji-readings-edit {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.kanji-readings-edit-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-readings-edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kanji-readings-section-title {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.kanji-readings-empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.kanji-readings-edit-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
</style>
