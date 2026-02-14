<script setup lang="ts">
/**
 * VocabularyCard
 *
 * UI component displaying a single vocabulary entry in the list.
 * Pure presentation — receives data via props.
 */

import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import type { Vocabulary } from '@/legacy/shared/types/database-types'

const props = defineProps<{
  vocabulary: Vocabulary
}>()

const jlptBadgeClass = computed(() => {
  if (!props.vocabulary.jlptLevel) return ''
  return `vocabulary-card-badge-jlpt-${props.vocabulary.jlptLevel.toLowerCase()}`
})

const jlptLabel = computed(() => {
  if (!props.vocabulary.jlptLevel) return null
  if (props.vocabulary.jlptLevel === 'non-jlpt') return '非JLPT'
  return props.vocabulary.jlptLevel
})
</script>

<template>
  <RouterLink
    class="vocabulary-card"
    :to="`/legacy/vocabulary/${vocabulary.id}`"
  >
    <span class="vocabulary-card-word">{{ vocabulary.word }}</span>

    <div class="vocabulary-card-info">
      <span
        v-if="vocabulary.shortMeaning"
        class="vocabulary-card-meaning"
      >
        {{ vocabulary.shortMeaning }}
      </span>

      <div class="vocabulary-card-badges">
        <span
          v-if="vocabulary.jlptLevel"
          class="vocabulary-card-badge"
          :class="jlptBadgeClass"
        >
          {{ jlptLabel }}
        </span>
        <span
          v-if="vocabulary.isCommon"
          class="vocabulary-card-badge vocabulary-card-badge-common"
        >
          常用
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.vocabulary-card {
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

.vocabulary-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.vocabulary-card:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.vocabulary-card-word {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-2xl);
  line-height: 1;
}

.vocabulary-card-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.vocabulary-card-meaning {
  max-width: 145px;
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vocabulary-card-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-1);
}

.vocabulary-card-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

/* JLPT level colors */
.vocabulary-card-badge-jlpt-n5 {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.vocabulary-card-badge-jlpt-n4 {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.vocabulary-card-badge-jlpt-n3 {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.vocabulary-card-badge-jlpt-n2 {
  background-color: var(--color-error-bg);
  color: var(--color-primary);
}

.vocabulary-card-badge-jlpt-n1 {
  background-color: var(--color-error-bg);
  color: var(--color-error);
}

.vocabulary-card-badge-jlpt-non-jlpt {
  border: var(--border-width) solid var(--color-border);
  background-color: var(--color-surface-variant);
  color: var(--color-text-muted);
}

/* Common badge */
.vocabulary-card-badge-common {
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}
</style>
