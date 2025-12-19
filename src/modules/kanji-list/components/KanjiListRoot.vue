<script setup lang="ts">
/**
 * KanjiListRoot
 *
 * Root component for the kanji list feature.
 * Handles database initialization, data fetching, filtering, and loading/error states.
 * Orchestrates filters and passes filtered data to KanjiListSectionGrid.
 */

import { onMounted, ref, watch } from 'vue'

import BaseSpinner from '@/base/components/BaseSpinner.vue'

import SharedPageContainer from '@/shared/components/SharedPageContainer.vue'
import { useClassificationRepository } from '@/shared/composables/use-classification-repository'
import { useComponentRepository } from '@/shared/composables/use-component-repository'
import { useDatabase } from '@/shared/composables/use-database'
import { useFilterPersistence } from '@/shared/composables/use-filter-persistence'
import { useKanjiRepository } from '@/shared/composables/use-kanji-repository'
import { useRadicalRepository } from '@/shared/composables/use-radical-repository'

import { useKanjiFilters } from '../composables/use-kanji-filters'

import KanjiListSectionFilters from './KanjiListSectionFilters.vue'
import KanjiListSectionGrid from './KanjiListSectionGrid.vue'

import type {
  Component,
  Kanji,
  KanjiClassificationWithType,
  KanjiFilters
} from '@/shared/types/database-types'

// Database initialization
const { initError, initialize, isInitialized, isInitializing } = useDatabase()

// Filter persistence
useFilterPersistence('kanji-list')

// Repositories for data access
const { search } = useKanjiRepository()
const { getAll: getAllComponents } = useComponentRepository()
const { getAll: getAllRadicals } = useRadicalRepository()
const { getPrimaryClassificationsForKanji } = useClassificationRepository()

// Filter state
const {
  characterSearch,
  clearFilters,
  filters,
  hasActiveFilters,
  kunYomiSearch,
  onYomiSearch,
  searchKeywords,
  updateFilter
} = useKanjiFilters()

// Local state
const kanjiList = ref<Kanji[]>([])
const components = ref<Component[]>([])
const radicals = ref<Component[]>([])
const classifications = ref<Map<number, KanjiClassificationWithType | null>>(
  new Map()
)
const fetchError = ref<Error | null>(null)

// Handler for filter updates from section component
function handleFilterUpdate(key: keyof KanjiFilters, value: unknown) {
  updateFilter(key, value)
}

// Fetch kanji with current filters
function loadKanji() {
  try {
    kanjiList.value = search(filters.value)
    // Load primary classifications for all kanji in the list
    const kanjiIds = kanjiList.value.map((k) => k.id)
    classifications.value = getPrimaryClassificationsForKanji(kanjiIds)
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Fetch components for filter dropdown
function loadComponents() {
  try {
    components.value = getAllComponents()
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Fetch radicals for filter dropdown
function loadRadicals() {
  try {
    radicals.value = getAllRadicals()
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Re-fetch kanji when filters change
watch(filters, () => {
  if (isInitialized.value) {
    loadKanji()
  }
})

// Handler for seed data refresh
function handleRefresh() {
  loadComponents()
  loadRadicals()
  loadKanji()
}

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadComponents()
    loadRadicals()
    loadKanji()
  } catch {
    // Error is already captured in initError
  }
})
</script>

<template>
  <!-- Loading state -->
  <SharedPageContainer
    v-if="isInitializing"
    class="kanji-list-root-loading"
  >
    <BaseSpinner
      label="Loading database..."
      size="lg"
    />
    <p class="kanji-list-root-loading-text">Loading database...</p>
  </SharedPageContainer>

  <!-- Error state -->
  <SharedPageContainer
    v-else-if="initError || fetchError"
    class="kanji-list-root-error"
  >
    <p class="kanji-list-root-error-title">Failed to load</p>
    <p class="kanji-list-root-error-message">
      {{ initError?.message || fetchError?.message }}
    </p>
  </SharedPageContainer>

  <!-- Content -->
  <SharedPageContainer v-else-if="isInitialized">
    <KanjiListSectionFilters
      :character-search="characterSearch"
      :components="components"
      :filters="filters"
      :has-active-filters="hasActiveFilters"
      :kun-yomi-search="kunYomiSearch"
      :on-yomi-search="onYomiSearch"
      :radicals="radicals"
      :search-keywords="searchKeywords"
      @clear-filters="clearFilters"
      @update-filter="handleFilterUpdate"
      @update:character-search="characterSearch = $event"
      @update:kun-yomi-search="kunYomiSearch = $event"
      @update:on-yomi-search="onYomiSearch = $event"
      @update:search-keywords="searchKeywords = $event"
    />

    <KanjiListSectionGrid
      :classifications="classifications"
      :has-active-filters="hasActiveFilters"
      :kanji-list="kanjiList"
      @refresh="handleRefresh"
    />
  </SharedPageContainer>
</template>

<style scoped>
.kanji-list-root-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  min-height: 50vh;
}

.kanji-list-root-loading-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.kanji-list-root-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 50vh;
  text-align: center;
}

.kanji-list-root-error-title {
  margin: 0;
  color: var(--color-error);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.kanji-list-root-error-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}
</style>
