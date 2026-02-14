<script setup lang="ts">
/**
 * KanjiListRoot
 *
 * Root component for the kanji list feature.
 * Handles database initialization, data fetching, and loading/error states.
 * Orchestrates filters, list, and dialog sections.
 */

import { computed, onMounted, ref, watch } from 'vue'

import { BaseSpinner } from '@/base/components'

import { useDatabase } from '@/shared/composables/use-database'

import { useKanjiListData } from '../composables/use-kanji-list-data'
import { useKanjiListState } from '../composables/use-kanji-list-state'

import KanjiListSectionDialog from './KanjiListSectionDialog.vue'
import KanjiListSectionFilters from './KanjiListSectionFilters.vue'
import KanjiListSectionList from './KanjiListSectionList.vue'

import type { KanjiListFilters } from '../kanji-list-types'

// Database initialization
const { initError, initialize, isInitialized, isInitializing } = useDatabase()

// Filter state
const {
  activeFilterCount,
  characterSearch,
  clearFilters,
  filters,
  hasActiveFilters,
  keywordsSearch,
  kunYomiSearch,
  meaningsSearch,
  onYomiSearch,
  refreshTrigger,
  triggerRefresh,
  updateFilter
} = useKanjiListState()

// Data fetching
const {
  classificationTypes,
  components,
  fetchError,
  kanjiList,
  loadKanji,
  loadReferenceData,
  primaryClassifications,
  radicals
} = useKanjiListData()

const isDialogOpen = ref(false)
const displayError = computed(() => initError.value ?? fetchError.value)

// Watch for filter changes
watch(
  filters,
  () => {
    if (isInitialized.value) loadKanji(filters.value)
  },
  { deep: true }
)

// Watch for refresh trigger
watch(refreshTrigger, () => {
  if (isInitialized.value) {
    loadReferenceData()
    loadKanji(filters.value)
  }
})

// Handle filter update from section component
function handleFilterUpdate(key: keyof KanjiListFilters, value: unknown): void {
  updateFilter(key, value as KanjiListFilters[typeof key])
}

// Handle kanji created
function handleKanjiCreated(): void {
  isDialogOpen.value = false
  triggerRefresh()
}

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadReferenceData()
    loadKanji(filters.value)
  } catch {
    // Error captured in initError
  }
})
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="isInitializing"
    class="kanji-list-root-loading"
  >
    <BaseSpinner
      label="Loading database..."
      size="lg"
    />
  </div>

  <!-- Error state -->
  <div
    v-else-if="displayError"
    class="kanji-list-root-error"
  >
    <p class="kanji-list-root-error-title">
      An error occurred while loading data
    </p>
    <p class="kanji-list-root-error-message">{{ displayError.message }}</p>
  </div>

  <!-- Content -->
  <div
    v-else-if="isInitialized"
    class="kanji-list-root"
  >
    <KanjiListSectionFilters
      :active-filter-count="activeFilterCount"
      :character-search="characterSearch"
      :classification-types="classificationTypes"
      :components="components"
      :filters="filters"
      :has-active-filters="hasActiveFilters"
      :keywords-search="keywordsSearch"
      :kun-yomi-search="kunYomiSearch"
      :meanings-search="meaningsSearch"
      :on-yomi-search="onYomiSearch"
      :radicals="radicals"
      @clear-filters="clearFilters"
      @update-filter="handleFilterUpdate"
      @update:character-search="characterSearch = $event"
      @update:keywords-search="keywordsSearch = $event"
      @update:kun-yomi-search="kunYomiSearch = $event"
      @update:meanings-search="meaningsSearch = $event"
      @update:on-yomi-search="onYomiSearch = $event"
    />

    <KanjiListSectionList
      :has-active-filters="hasActiveFilters"
      :kanji-list="kanjiList"
      :primary-classifications="primaryClassifications"
      @add-kanji="isDialogOpen = true"
      @refresh="triggerRefresh"
    />

    <KanjiListSectionDialog
      v-model:open="isDialogOpen"
      @created="handleKanjiCreated"
    />
  </div>
</template>

<style scoped>
.kanji-list-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.kanji-list-root-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.kanji-list-root-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  text-align: center;
}

.kanji-list-root-error-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.kanji-list-root-error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
}
</style>
