<script setup lang="ts">
/**
 * VocabListRoot
 *
 * Root component for the vocabulary list feature.
 * Handles database initialization, data fetching, and loading/error states.
 * Orchestrates filters, list, and dialog sections.
 */

import { computed, onMounted, ref, watch } from 'vue'

import { BaseSpinner } from '@/base/components'

import { useDatabase } from '@/shared/composables/use-database'

import { useVocabListData } from '../composables/use-vocab-list-data'
import { useVocabListState } from '../composables/use-vocab-list-state'

import VocabListSectionDialog from './VocabListSectionDialog.vue'
import VocabListSectionFilters from './VocabListSectionFilters.vue'
import VocabListSectionList from './VocabListSectionList.vue'

import type { VocabListFilters } from '../vocab-list-types'

// Database initialization
const { initError, initialize, isInitialized, isInitializing } = useDatabase()

// Filter state
const {
  activeFilterCount,
  clearFilters,
  filters,
  hasActiveFilters,
  kanaSearch,
  refreshTrigger,
  searchText,
  triggerRefresh,
  updateFilter,
  wordSearch
} = useVocabListState()

// Data fetching
const { allKanji, fetchError, loadReferenceData, loadVocabulary, vocabList } =
  useVocabListData()

const isDialogOpen = ref(false)
const displayError = computed(() => initError.value ?? fetchError.value)

// Watch for filter changes
watch(
  filters,
  () => {
    if (isInitialized.value) loadVocabulary(filters.value)
  },
  { deep: true }
)

// Watch for refresh trigger
watch(refreshTrigger, () => {
  if (isInitialized.value) {
    loadReferenceData()
    loadVocabulary(filters.value)
  }
})

// Handle filter update from section component
function handleFilterUpdate(key: keyof VocabListFilters, value: unknown): void {
  updateFilter(key, value as VocabListFilters[typeof key])
}

// Handle vocab created
function handleVocabCreated(): void {
  isDialogOpen.value = false
  triggerRefresh()
}

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadReferenceData()
    loadVocabulary(filters.value)
  } catch {
    // Error captured in initError
  }
})
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="isInitializing"
    class="vocab-list-root-loading"
  >
    <BaseSpinner
      label="Loading database..."
      size="lg"
    />
  </div>

  <!-- Error state -->
  <div
    v-else-if="displayError"
    class="vocab-list-root-error"
  >
    <p class="vocab-list-root-error-title">
      An error occurred while loading data
    </p>
    <p class="vocab-list-root-error-message">{{ displayError.message }}</p>
  </div>

  <!-- Content -->
  <div
    v-else-if="isInitialized"
    class="vocab-list-root"
  >
    <VocabListSectionFilters
      :active-filter-count="activeFilterCount"
      :all-kanji="allKanji"
      :filters="filters"
      :has-active-filters="hasActiveFilters"
      :kana-search="kanaSearch"
      :search-text="searchText"
      :word-search="wordSearch"
      @clear-filters="clearFilters"
      @update-filter="handleFilterUpdate"
      @update:kana-search="kanaSearch = $event"
      @update:search-text="searchText = $event"
      @update:word-search="wordSearch = $event"
    />

    <VocabListSectionList
      :has-active-filters="hasActiveFilters"
      :vocab-list="vocabList"
      @add-vocab="isDialogOpen = true"
      @refresh="triggerRefresh"
    />

    <VocabListSectionDialog
      v-model:open="isDialogOpen"
      @created="handleVocabCreated"
    />
  </div>
</template>

<style scoped>
.vocab-list-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.vocab-list-root-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.vocab-list-root-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  text-align: center;
}

.vocab-list-root-error-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.vocab-list-root-error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
}
</style>
