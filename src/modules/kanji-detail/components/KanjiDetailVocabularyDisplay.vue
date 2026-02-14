<script setup lang="ts">
/**
 * KanjiDetailVocabularyDisplay
 *
 * Displays vocabulary list in view mode.
 * Shows all vocabulary entries containing the current kanji.
 */

import KanjiDetailVocabularyItem from './KanjiDetailVocabularyItem.vue'

import type { VocabularyListItem } from '../kanji-detail-types'

defineProps<{
  vocabulary: VocabularyListItem[]
}>()
</script>

<template>
  <div
    v-if="vocabulary.length === 0"
    class="empty-state"
    data-testid="vocabulary-empty-state"
  >
    <p class="empty-message">No vocabulary entries found for this kanji.</p>
  </div>

  <ul
    v-else
    class="vocabulary-list"
    data-testid="vocabulary-list"
  >
    <KanjiDetailVocabularyItem
      v-for="item in vocabulary"
      :key="item.vocabularyId"
      :vocabulary="item"
    />
  </ul>
</template>

<style scoped>
.empty-state {
  padding: var(--spacing-lg);
  text-align: center;
}

.empty-message {
  margin: 0;
  color: var(--color-text-secondary);
}

.vocabulary-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
  margin: 0;
  padding: 0;
}
</style>
