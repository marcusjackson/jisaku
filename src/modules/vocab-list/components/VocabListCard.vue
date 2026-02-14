<script setup lang="ts">
/**
 * VocabListCard
 *
 * UI component displaying a single vocabulary entry in the list.
 * Shows: word, kana (if different), short meaning, JLPT badge, common badge.
 */

import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { JLPT_LABELS } from '../vocab-list-types'

import type { Vocabulary } from '@/api/vocabulary'

const props = defineProps<{
  vocabulary: Vocabulary
}>()

const jlptLabel = computed(() => {
  if (!props.vocabulary.jlptLevel) return null
  return JLPT_LABELS[props.vocabulary.jlptLevel]
})

const jlptBadgeClass = computed(() => {
  if (!props.vocabulary.jlptLevel) return ''
  return `vocab-list-card-badge-jlpt-${props.vocabulary.jlptLevel.toLowerCase().replace('-', '')}`
})

// Show kana only if different from word (word may be kanji only)
const showKana = computed(() => {
  return (
    props.vocabulary.kana && props.vocabulary.kana !== props.vocabulary.word
  )
})
</script>

<template>
  <RouterLink
    class="vocab-list-card"
    data-testid="vocab-list-card"
    :to="`/vocabulary/${vocabulary.id}`"
  >
    <span class="vocab-list-card-word">{{ vocabulary.word }}</span>

    <div class="vocab-list-card-info">
      <span
        v-if="showKana"
        class="vocab-list-card-kana"
      >
        {{ vocabulary.kana }}
      </span>

      <span
        v-if="vocabulary.shortMeaning"
        class="vocab-list-card-meaning"
      >
        {{ vocabulary.shortMeaning }}
      </span>

      <div class="vocab-list-card-badges">
        <span
          v-if="jlptLabel"
          class="vocab-list-card-badge"
          :class="jlptBadgeClass"
        >
          {{ jlptLabel }}
        </span>
        <span
          v-if="vocabulary.isCommon"
          class="vocab-list-card-badge vocab-list-card-badge-common"
        >
          常用
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.vocab-list-card {
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

.vocab-list-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.vocab-list-card:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.vocab-list-card-word {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-2xl);
  line-height: 1;
}

.vocab-list-card-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.vocab-list-card-kana {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.vocab-list-card-meaning {
  max-width: 145px;
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vocab-list-card-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-1);
}

.vocab-list-card-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

/* JLPT level colors */
.vocab-list-card-badge-jlpt-n5 {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.vocab-list-card-badge-jlpt-n4 {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.vocab-list-card-badge-jlpt-n3 {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.vocab-list-card-badge-jlpt-n2 {
  background-color: var(--color-error-bg);
  color: var(--color-primary);
}

.vocab-list-card-badge-jlpt-n1 {
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}

.vocab-list-card-badge-jlpt-nonjlpt {
  border: var(--border-width) solid var(--color-border);
  background-color: var(--color-surface-variant);
  color: var(--color-text-secondary);
}

.vocab-list-card-badge-common {
  border: var(--border-width) solid var(--color-border);
  background-color: var(--color-surface-variant);
  color: var(--color-text-secondary);
}
</style>
