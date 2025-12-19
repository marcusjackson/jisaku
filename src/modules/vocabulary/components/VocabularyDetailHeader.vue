<script setup lang="ts">
/**
 * VocabularyDetailHeader
 *
 * Displays the vocabulary header with word, kana, and short meaning.
 * Includes edit button to open header edit dialog.
 */

import BaseButton from '@/base/components/BaseButton.vue'

import SharedSearchKeywordsIndicator from '@/shared/components/SharedSearchKeywordsIndicator.vue'

import type { Vocabulary } from '@/shared/types/database-types'

const props = defineProps<{
  vocabulary: Vocabulary
}>()

const emit = defineEmits<{
  edit: []
}>()
</script>

<template>
  <header class="vocabulary-detail-header">
    <div class="vocabulary-detail-header-main">
      <h1 class="vocabulary-detail-header-word">
        {{ props.vocabulary.word }}
      </h1>
      <div
        v-if="props.vocabulary.kana"
        class="vocabulary-detail-header-readings"
      >
        <span class="vocabulary-detail-header-kana">
          {{ props.vocabulary.kana }}
        </span>
      </div>
    </div>

    <div class="vocabulary-detail-header-meta">
      <p
        v-if="props.vocabulary.shortMeaning"
        class="vocabulary-detail-header-meaning"
      >
        {{ props.vocabulary.shortMeaning }}
      </p>
      <p
        v-else
        class="vocabulary-detail-header-meaning vocabulary-detail-header-meaning--empty"
      >
        No meaning set
      </p>
      <SharedSearchKeywordsIndicator
        :search-keywords="props.vocabulary.searchKeywords"
      />
    </div>

    <BaseButton
      class="vocabulary-detail-header-edit"
      size="sm"
      variant="secondary"
      @click="emit('edit')"
    >
      Edit
    </BaseButton>
  </header>
</template>

<style scoped>
.vocabulary-detail-header {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: var(--spacing-sm) var(--spacing-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.vocabulary-detail-header-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.vocabulary-detail-header-word {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
}

.vocabulary-detail-header-readings {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
}

.vocabulary-detail-header-kana {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.vocabulary-detail-header-meta {
  grid-column: 1 / 2;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.vocabulary-detail-header-meaning {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.vocabulary-detail-header-meaning--empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.vocabulary-detail-header-edit {
  grid-column: 2;
  grid-row: 1;
  align-self: start;
}
</style>
