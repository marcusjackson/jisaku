<script setup lang="ts">
/**
 * VocabularyListRoot
 *
 * Root component for the vocabulary list feature.
 * Handles database initialization, data fetching, filtering, and loading/error states.
 * Orchestrates filters and passes filtered data to VocabularySectionList.
 */

import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BaseSpinner from '@/legacy/base/components/BaseSpinner.vue'

import SharedPageContainer from '@/legacy/shared/components/SharedPageContainer.vue'
import { useDatabase } from '@/legacy/shared/composables/use-database'
import { useFilterPersistence } from '@/legacy/shared/composables/use-filter-persistence'
import { useKanjiRepository } from '@/legacy/shared/composables/use-kanji-repository'
import { useToast } from '@/legacy/shared/composables/use-toast'
import { useVocabularyRepository } from '@/legacy/shared/composables/use-vocabulary-repository'

import { useVocabularyFilters } from '../composables/use-vocabulary-filters'

import VocabularySectionFilters from './VocabularySectionFilters.vue'
import VocabularySectionList from './VocabularySectionList.vue'

import type {
  Kanji,
  Vocabulary,
  VocabularyFilters
} from '@/legacy/shared/types/database-types'
import type { QuickCreateVocabularyData } from '@/legacy/shared/validation/quick-create-vocabulary-schema'

// Router
const router = useRouter()

// Database initialization
const { initError, initialize, isInitialized, isInitializing, persist } =
  useDatabase()

// Filter persistence
useFilterPersistence('vocabulary-list')

// Repositories for data access
const { create, search } = useVocabularyRepository()
const { getAll: getAllKanji } = useKanjiRepository()

// Toast notifications
const { error: showError, success } = useToast()

// Filter state
const { clearFilters, filters, hasActiveFilters, searchText, updateFilter } =
  useVocabularyFilters()

// Local state
const vocabularyList = ref<Vocabulary[]>([])
const allKanji = ref<Kanji[]>([])
const fetchError = ref<Error | null>(null)

// Handler for filter updates from section component
function handleFilterUpdate(key: keyof VocabularyFilters, value: unknown) {
  updateFilter(key, value)
}

// Fetch vocabulary with current filters
function loadVocabulary() {
  try {
    vocabularyList.value = search(filters.value)
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Fetch all kanji for filter dropdown
function loadKanji() {
  try {
    allKanji.value = getAllKanji()
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Re-fetch vocabulary when filters change
watch(filters, () => {
  if (isInitialized.value) {
    loadVocabulary()
  }
})

// Handler for seed data refresh
function handleRefresh() {
  loadKanji()
  loadVocabulary()
}

// Handler for quick-create vocabulary
async function handleCreateVocabulary(data: QuickCreateVocabularyData) {
  try {
    const newVocab = create({
      word: data.word,
      kana: data.kana ?? null,
      shortMeaning: data.shortMeaning ?? null
    })
    await persist()
    success(`Vocabulary "${newVocab.word}" created`)
    // Navigate to detail page
    await router.push({
      name: 'legacy-vocabulary-detail',
      params: { id: newVocab.id }
    })
  } catch (err) {
    showError(
      err instanceof Error ? err.message : 'Failed to create vocabulary'
    )
  }
}

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadKanji()
    loadVocabulary()
  } catch {
    // Error is already captured in initError
  }
})
</script>

<template>
  <!-- Loading state -->
  <SharedPageContainer
    v-if="isInitializing"
    class="vocabulary-list-root-loading"
  >
    <BaseSpinner
      label="Loading database..."
      size="lg"
    />
    <p class="vocabulary-list-root-loading-text">Loading database...</p>
  </SharedPageContainer>

  <!-- Error state -->
  <SharedPageContainer
    v-else-if="initError || fetchError"
    class="vocabulary-list-root-error"
  >
    <p class="vocabulary-list-root-error-title">Failed to load</p>
    <p class="vocabulary-list-root-error-message">
      {{ initError?.message || fetchError?.message }}
    </p>
  </SharedPageContainer>

  <!-- Content -->
  <SharedPageContainer v-else-if="isInitialized">
    <VocabularySectionFilters
      :all-kanji="allKanji"
      :filters="filters"
      :has-active-filters="hasActiveFilters"
      :search-text="searchText"
      @clear-filters="clearFilters"
      @update-filter="handleFilterUpdate"
      @update:search-text="searchText = $event"
    />

    <VocabularySectionList
      :has-active-filters="hasActiveFilters"
      :vocabulary-list="vocabularyList"
      @create-vocabulary="handleCreateVocabulary"
      @refresh="handleRefresh"
    />
  </SharedPageContainer>
</template>

<style scoped>
.vocabulary-list-root-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  min-height: 50vh;
}

.vocabulary-list-root-loading-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.vocabulary-list-root-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 50vh;
  text-align: center;
}

.vocabulary-list-root-error-title {
  margin: 0;
  color: var(--color-error);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.vocabulary-list-root-error-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}
</style>
