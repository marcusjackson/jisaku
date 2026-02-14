<script setup lang="ts">
/**
 * KanjiDetailVocabularySearch
 *
 * Search and autocomplete component for linking existing vocabulary.
 * Shows filtered results based on search term, excluding already-linked items.
 */

import { computed, ref } from 'vue'

import { BaseButton, BaseInput } from '@/base/components'

import type { VocabularyListItem } from '../kanji-detail-types'

const props = defineProps<{
  allVocabulary: VocabularyListItem[]
  excludeIds: number[]
  placeholder?: string
  disabled?: boolean
  initialSearchTerm?: string
}>()

const emit = defineEmits<{
  select: [vocabularyId: number]
  create: [searchTerm: string]
}>()

const searchTerm = ref(props.initialSearchTerm ?? '')

const filteredVocabulary = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return []

  return props.allVocabulary
    .filter((v) => !props.excludeIds.includes(v.vocabularyId))
    .filter(
      (v) =>
        v.word.toLowerCase().includes(term) ||
        (v.kana?.toLowerCase().includes(term) ?? false) ||
        (v.shortMeaning?.toLowerCase().includes(term) ?? false)
    )
    .slice(0, 10)
})

const hasResults = computed(() => filteredVocabulary.value.length > 0)
const showCreateButton = computed(() => searchTerm.value.trim().length > 0)

function handleSelect(vocabularyId: number): void {
  emit('select', vocabularyId)
  searchTerm.value = ''
}

function handleCreate(): void {
  emit('create', searchTerm.value.trim())
}
</script>

<template>
  <div class="vocabulary-search">
    <BaseInput
      v-model="searchTerm"
      data-testid="vocabulary-search-input"
      :disabled="props.disabled"
      :placeholder="props.placeholder ?? 'Search vocabulary...'"
      type="text"
    />

    <div
      v-if="hasResults"
      class="vocabulary-search-results"
      data-testid="vocabulary-search-results"
    >
      <button
        v-for="vocab in filteredVocabulary"
        :key="vocab.vocabularyId"
        class="vocabulary-search-result-item"
        :data-testid="`vocabulary-search-result-${vocab.vocabularyId}`"
        type="button"
        @click="handleSelect(vocab.vocabularyId)"
      >
        <span class="vocabulary-search-result-word">{{ vocab.word }}</span>
        <span
          v-if="vocab.kana"
          class="vocabulary-search-result-kana"
        >
          {{ vocab.kana }}
        </span>
        <span
          v-if="vocab.shortMeaning"
          class="vocabulary-search-result-meaning"
        >
          {{ vocab.shortMeaning }}
        </span>
      </button>
    </div>

    <div
      v-if="!hasResults && showCreateButton"
      class="vocabulary-search-no-results"
    >
      <p class="vocabulary-search-no-results-text">No vocabulary found</p>
      <BaseButton
        data-testid="vocabulary-search-create-button"
        size="sm"
        variant="secondary"
        @click="handleCreate"
      >
        Create "{{ searchTerm }}"
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.vocabulary-search {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.vocabulary-search-results {
  display: flex;
  flex-direction: column;
  max-height: var(--size-list-max-height, 300px);
  overflow-y: auto;
  border: var(--border-width-sm) solid var(--color-border);
  border-radius: var(--border-radius-md);
}

.vocabulary-search-result-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border: none;
  border-bottom: var(--border-width-sm) solid var(--color-border);
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.vocabulary-search-result-item:last-child {
  border-bottom: none;
}

.vocabulary-search-result-item:hover {
  background-color: var(--color-background-hover);
}

.vocabulary-search-result-item:focus {
  outline: var(--border-width-md) solid var(--color-focus);
  outline-offset: calc(var(--spacing-2xs) * -1);
}

.vocabulary-search-result-word {
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.vocabulary-search-result-kana {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.vocabulary-search-result-meaning {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.vocabulary-search-no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: var(--border-width-sm) solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background-secondary);
}

.vocabulary-search-no-results-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
