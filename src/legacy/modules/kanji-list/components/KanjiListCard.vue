<script setup lang="ts">
/**
 * KanjiListCard
 *
 * UI component displaying a single kanji entry in the list.
 * Pure presentation — receives data via props, emits events for interactions.
 */

import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import type {
  Kanji,
  KanjiClassificationWithType
} from '@/legacy/shared/types/database-types'
import { KENTEI_LABELS } from '@/legacy/shared/types/database-types'

const props = defineProps<{
  kanji: Kanji
  /** Primary classification for this kanji (optional, null if none) */
  classification?: KanjiClassificationWithType | null
}>()

const jlptBadgeClass = computed(() => {
  if (!props.kanji.jlptLevel) return ''
  return `kanji-list-card-badge-jlpt-${props.kanji.jlptLevel.toLowerCase()}`
})

const jlptLabel = computed(() => {
  if (!props.kanji.jlptLevel) return null
  // Display 非JLPT for non-jlpt, otherwise show the level as-is
  if (props.kanji.jlptLevel === 'non-jlpt') return '非JLPT'
  return props.kanji.jlptLevel
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
    secondary: '中学',
    'non-joyo': '非常用'
  }
  return labels[props.kanji.joyoLevel] ?? null
})

const kenteiLabel = computed(() => {
  if (!props.kanji.kenteiLevel) return null
  return KENTEI_LABELS[props.kanji.kenteiLevel] ?? null
})

/**
 * Get abbreviated classification label for badge display
 */
const classificationLabel = computed(() => {
  if (!props.classification?.nameJapanese) return null
  const abbreviations: Record<string, string> = {
    象形文字: '象形',
    指事文字: '指事',
    会意文字: '会意',
    形声文字: '形声',
    仮借字: '仮借'
  }
  return (
    abbreviations[props.classification.nameJapanese] ??
    props.classification.nameJapanese
  )
})
</script>

<template>
  <RouterLink
    class="kanji-list-card"
    :to="`/legacy/kanji/${kanji.id}`"
  >
    <span class="kanji-list-card-character">{{ kanji.character }}</span>

    <div class="kanji-list-card-info">
      <span
        v-if="kanji.shortMeaning"
        class="kanji-list-card-meaning"
      >
        {{ kanji.shortMeaning }}
      </span>

      <div class="kanji-list-card-badges">
        <span
          v-if="classificationLabel"
          class="kanji-list-card-badge kanji-list-card-badge-classification"
        >
          {{ classificationLabel }}
        </span>
        <span
          v-if="kanji.jlptLevel"
          class="kanji-list-card-badge"
          :class="jlptBadgeClass"
        >
          {{ jlptLabel }}
        </span>
        <span
          v-if="joyoLabel"
          class="kanji-list-card-badge kanji-list-card-badge-joyo"
        >
          {{ joyoLabel }}
        </span>
        <span
          v-if="kenteiLabel"
          class="kanji-list-card-badge kanji-list-card-badge-kentei"
        >
          {{ kenteiLabel }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.kanji-list-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-md);
  border: var(--card-border);
  border-radius: var(--card-radius);
  background-color: var(--card-bg);
  text-decoration: none;
  box-shadow: var(--card-shadow);
  transition:
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.kanji-list-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.kanji-list-card:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.kanji-list-card-character {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--kanji-card-size);
  line-height: 1;
}

.kanji-list-card-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.kanji-list-card-meaning {
  max-width: 145px;
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanji-list-card-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-1);
}

.kanji-list-card-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

/* Classification type badge */
.kanji-list-card-badge-classification {
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}

/* JLPT level colors */
.kanji-list-card-badge-jlpt-n5 {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.kanji-list-card-badge-jlpt-n4 {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.kanji-list-card-badge-jlpt-n3 {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.kanji-list-card-badge-jlpt-n2 {
  background-color: var(--color-error-bg);
  color: var(--color-primary);
}

.kanji-list-card-badge-jlpt-n1 {
  background-color: var(--color-error-bg);
  color: var(--color-error);
}

.kanji-list-card-badge-jlpt-non-jlpt {
  border: var(--border-width) solid var(--color-border);
  background-color: var(--color-surface-variant);
  color: var(--color-text-muted);
}

/* Joyo level */
.kanji-list-card-badge-joyo {
  background-color: var(--color-background);
  color: var(--color-text-secondary);
}

/* Kentei level */
.kanji-list-card-badge-kentei {
  border: var(--border-width) solid var(--color-border);
  background-color: var(--color-surface-variant);
  color: var(--color-text-secondary);
}
</style>
