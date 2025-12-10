<script setup lang="ts">
/**
 * KanjiDetailBadges
 *
 * UI component displaying JLPT and Joyo level badges for a kanji.
 */

import { computed } from 'vue'

import type { Kanji } from '@/shared/types/database-types'

const props = defineProps<{
  kanji: Kanji
}>()

const jlptBadgeClass = computed(() => {
  if (!props.kanji.jlptLevel) return ''
  return `kanji-detail-badges-jlpt-${props.kanji.jlptLevel.toLowerCase()}`
})

const joyoLabel = computed(() => {
  if (!props.kanji.joyoLevel) return null
  const labels: Record<string, string> = {
    elementary1: '小1',
    elementary2: '小2',
    elementary3: '小3',
    elementary4: '小4',
    elementary5: '小5',
    elementary6: '小6',
    secondary: '中学'
  }
  return labels[props.kanji.joyoLevel] ?? null
})

const hasAnyBadge = computed(() => {
  return Boolean(
    props.kanji.strokeCount ||
    (props.kanji.jlptLevel ?? props.kanji.joyoLevel ?? props.kanji.kenteiLevel)
  )
})
</script>

<template>
  <div
    v-if="hasAnyBadge"
    class="kanji-detail-badges"
  >
    <span
      v-if="kanji.strokeCount"
      class="kanji-detail-badges-badge kanji-detail-badges-strokes"
    >
      {{ kanji.strokeCount }} strokes
    </span>
    <span
      v-if="kanji.jlptLevel"
      class="kanji-detail-badges-badge"
      :class="jlptBadgeClass"
    >
      {{ kanji.jlptLevel }}
    </span>
    <span
      v-if="joyoLabel"
      class="kanji-detail-badges-badge kanji-detail-badges-joyo"
    >
      {{ joyoLabel }}
    </span>
    <span
      v-if="kanji.kenteiLevel"
      class="kanji-detail-badges-badge kanji-detail-badges-kentei"
    >
      {{ kanji.kenteiLevel }}
    </span>
  </div>
</template>

<style scoped>
.kanji-detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.kanji-detail-badges-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

/* JLPT level colors */
.kanji-detail-badges-jlpt-n5 {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.kanji-detail-badges-jlpt-n4 {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.kanji-detail-badges-jlpt-n3 {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.kanji-detail-badges-jlpt-n2 {
  background-color: var(--color-error-bg);
  color: var(--color-primary);
}

.kanji-detail-badges-jlpt-n1 {
  background-color: var(--color-error-bg);
  color: var(--color-error);
}

/* Joyo badge */
.kanji-detail-badges-joyo {
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
}

/* Kentei badge */
.kanji-detail-badges-kentei {
  border: 1px solid var(--color-border);
  background-color: var(--color-surface-variant);
  color: var(--color-text-secondary);
}

/* Strokes badge */
.kanji-detail-badges-strokes {
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
}
</style>
