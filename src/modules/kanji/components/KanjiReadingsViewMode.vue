<script setup lang="ts">
/**
 * KanjiReadingsViewMode
 *
 * UI component: Display kanji readings in view mode (on-yomi and kun-yomi lists).
 * Shows grade level markers for non-elementary readings.
 */

import type { KunReading, OnReading } from '@/shared/types/database-types'

defineProps<{
  /** On-yomi readings for display */
  onReadings: OnReading[]
  /** Kun-yomi readings for display */
  kunReadings: KunReading[]
}>()

/**
 * Format kun-yomi for display with dot notation
 * e.g., reading="あか" + okurigana="り" → "あか.り"
 */
function formatKunYomiDisplay(reading: KunReading): string {
  if (!reading.okurigana) {
    return reading.reading
  }
  return `${reading.reading}.${reading.okurigana}`
}
</script>

<template>
  <div class="kanji-readings-view">
    <!-- On-yomi section -->
    <div class="kanji-readings-section">
      <h4 class="kanji-readings-section-title">On-yomi:</h4>
      <div
        v-if="onReadings.length === 0"
        class="kanji-readings-empty"
      >
        No on-yomi readings
      </div>
      <ul
        v-else
        class="kanji-readings-list"
      >
        <li
          v-for="reading in onReadings"
          :key="reading.id"
          class="kanji-readings-item"
        >
          <span class="kanji-readings-text">{{ reading.reading }}</span>
          <span
            v-if="reading.readingLevel !== '小'"
            class="kanji-readings-level"
          >
            [{{ reading.readingLevel }}]
          </span>
        </li>
      </ul>
    </div>

    <!-- Kun-yomi section -->
    <div class="kanji-readings-section">
      <h4 class="kanji-readings-section-title">Kun-yomi:</h4>
      <div
        v-if="kunReadings.length === 0"
        class="kanji-readings-empty"
      >
        No kun-yomi readings
      </div>
      <ul
        v-else
        class="kanji-readings-list"
      >
        <li
          v-for="reading in kunReadings"
          :key="reading.id"
          class="kanji-readings-item"
        >
          <span class="kanji-readings-text">{{
            formatKunYomiDisplay(reading)
          }}</span>
          <span
            v-if="reading.readingLevel !== '小'"
            class="kanji-readings-level"
          >
            [{{ reading.readingLevel }}]
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.kanji-readings-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-readings-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
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

.kanji-readings-list {
  margin: 0;
  padding: 0;
  padding-left: var(--spacing-md);
  list-style: none;
}

.kanji-readings-item {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) 0;
}

.kanji-readings-text {
  font-size: var(--font-size-lg);
}

.kanji-readings-level {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
