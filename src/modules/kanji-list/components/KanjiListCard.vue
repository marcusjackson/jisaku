<script setup lang="ts">
/**
 * KanjiListCard
 *
 * UI component displaying a single kanji entry in the list.
 * Shows: kanji character, short meaning, kentei level, primary classification.
 */

import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { KENTEI_LABELS } from '../kanji-list-types'

import type { KanjiClassification } from '@/api/classification'
import type { Kanji } from '@/api/kanji'

const props = defineProps<{
  kanji: Kanji
  classification?: KanjiClassification | null
}>()

const kenteiLabel = computed(() => {
  if (!props.kanji.kanjiKenteiLevel) return null
  return KENTEI_LABELS[props.kanji.kanjiKenteiLevel]
})

const classificationLabel = computed(() => {
  const name = props.classification?.classificationType?.nameJapanese
  if (!name) return null
  const abbreviations: Record<string, string> = {
    象形文字: '象形',
    指事文字: '指事',
    会意文字: '会意',
    形声文字: '形声',
    仮借字: '仮借'
  }
  return abbreviations[name] ?? name
})
</script>

<template>
  <RouterLink
    class="kanji-list-card"
    data-testid="kanji-list-card"
    :to="`/kanji/${kanji.id}`"
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

.kanji-list-card-badge-classification {
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}

.kanji-list-card-badge-kentei {
  border: var(--border-width) solid var(--color-border);
  background-color: var(--color-surface-variant);
  color: var(--color-text-secondary);
}
</style>
