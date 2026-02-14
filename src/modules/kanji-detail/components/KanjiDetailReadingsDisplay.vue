<script setup lang="ts">
/**
 * KanjiDetailReadingsDisplay
 *
 * Compact display of kanji readings grouped by level.
 * Format: 「音」エイ・オウ  [中] アイ  [外] アオ
 */

import { computed } from 'vue'

import type { KunReading, OnReading, ReadingLevel } from '../kanji-detail-types'

const props = defineProps<{
  onReadings: OnReading[]
  kunReadings: KunReading[]
}>()

/** Group readings by level in order: 小, 中, 高, 外 */
const levelOrder: ReadingLevel[] = ['小', '中', '高', '外']

interface GroupedReading {
  level: ReadingLevel
  readings: string[]
}

const groupedOnReadings = computed((): GroupedReading[] => {
  const groups = new Map<ReadingLevel, string[]>()
  for (const reading of props.onReadings) {
    const list = groups.get(reading.readingLevel) ?? []
    list.push(reading.reading)
    groups.set(reading.readingLevel, list)
  }
  return levelOrder
    .filter((level) => groups.has(level))
    .map((level) => ({
      level,
      readings: groups.get(level) ?? []
    }))
})

const groupedKunReadings = computed((): GroupedReading[] => {
  const groups = new Map<ReadingLevel, string[]>()
  for (const reading of props.kunReadings) {
    const display = reading.okurigana
      ? `${reading.reading}.${reading.okurigana}`
      : reading.reading
    const list = groups.get(reading.readingLevel) ?? []
    list.push(display)
    groups.set(reading.readingLevel, list)
  }
  return levelOrder
    .filter((level) => groups.has(level))
    .map((level) => ({
      level,
      readings: groups.get(level) ?? []
    }))
})

const hasOnReadings = computed(() => props.onReadings.length > 0)
const hasKunReadings = computed(() => props.kunReadings.length > 0)
</script>

<template>
  <div class="readings-display">
    <!-- On-yomi line -->
    <div
      v-if="hasOnReadings"
      class="readings-line"
      data-testid="on-readings-display"
    >
      <span class="readings-type-badge">音</span>
      <span
        v-for="(group, idx) in groupedOnReadings"
        :key="group.level"
        class="readings-group"
      >
        <span
          v-if="group.level !== '小'"
          class="readings-level-marker"
          >[{{ group.level }}]</span
        >
        <span class="readings-text">{{ group.readings.join('・') }}</span>
        <span
          v-if="idx < groupedOnReadings.length - 1"
          class="readings-separator"
        />
      </span>
    </div>
    <div
      v-else
      class="readings-line readings-empty"
      data-testid="on-readings-empty"
    >
      <span class="readings-type-badge">音</span>
      <span class="readings-none">—</span>
    </div>

    <!-- Kun-yomi line -->
    <div
      v-if="hasKunReadings"
      class="readings-line"
      data-testid="kun-readings-display"
    >
      <span class="readings-type-badge">訓</span>
      <span
        v-for="(group, idx) in groupedKunReadings"
        :key="group.level"
        class="readings-group"
      >
        <span
          v-if="group.level !== '小'"
          class="readings-level-marker"
          >[{{ group.level }}]</span
        >
        <span class="readings-text">{{ group.readings.join('・') }}</span>
        <span
          v-if="idx < groupedKunReadings.length - 1"
          class="readings-separator"
        />
      </span>
    </div>
    <div
      v-else
      class="readings-line readings-empty"
      data-testid="kun-readings-empty"
    >
      <span class="readings-type-badge">訓</span>
      <span class="readings-none">—</span>
    </div>
  </div>
</template>

<style scoped>
.readings-display {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.readings-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--spacing-xs);
  line-height: 1.6;
}

.readings-type-badge {
  display: inline-flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 1.5em;
  height: 1.5em;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.readings-group {
  display: inline-flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.readings-level-marker {
  position: relative;
  top: 0.1em;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.readings-text {
  font-size: var(--font-size-lg);
}

.readings-separator {
  width: var(--spacing-md);
}

.readings-none {
  color: var(--color-text-muted);
}

.readings-empty {
  color: var(--color-text-muted);
}
</style>
