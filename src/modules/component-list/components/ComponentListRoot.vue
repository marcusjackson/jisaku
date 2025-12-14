<script setup lang="ts">
/**
 * ComponentListRoot
 *
 * Root component for the component list feature.
 * Handles database initialization, data fetching, filtering, and loading/error states.
 * Orchestrates filters and passes filtered data to ComponentListSectionGrid.
 */

import { onMounted, ref, watch } from 'vue'

import BaseSpinner from '@/base/components/BaseSpinner.vue'

import SharedPageContainer from '@/shared/components/SharedPageContainer.vue'
import { useComponentRepository } from '@/shared/composables/use-component-repository'
import { useDatabase } from '@/shared/composables/use-database'
import { useFilterPersistence } from '@/shared/composables/use-filter-persistence'

import { useComponentFilters } from '../composables/use-component-filters'

import ComponentListSectionFilters from './ComponentListSectionFilters.vue'
import ComponentListSectionGrid from './ComponentListSectionGrid.vue'

import type { Component, ComponentFilters } from '@/shared/types/database-types'

// Database initialization
const { initError, initialize, isInitialized, isInitializing } = useDatabase()

// Filter persistence
useFilterPersistence('component-list')

// Repository for data access
const { search } = useComponentRepository()

// Filter state
const {
  characterSearch,
  clearFilters,
  filters,
  hasActiveFilters,
  searchKeywords,
  updateFilter
} = useComponentFilters()

// Local state
const componentList = ref<Component[]>([])
const fetchError = ref<Error | null>(null)

// Handler for filter updates from section component
function handleFilterUpdate(key: keyof ComponentFilters, value: unknown) {
  updateFilter(key, value)
}

// Fetch components with current filters
function loadComponents() {
  try {
    componentList.value = search(filters.value)
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Re-fetch components when filters change
watch(filters, () => {
  if (isInitialized.value) {
    loadComponents()
  }
})

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadComponents()
  } catch {
    // Error is already captured in initError
  }
})
</script>

<template>
  <!-- Loading state -->
  <SharedPageContainer
    v-if="isInitializing"
    class="component-list-root-loading"
  >
    <BaseSpinner
      label="Loading database..."
      size="lg"
    />
    <p class="component-list-root-loading-text">Loading database...</p>
  </SharedPageContainer>

  <!-- Error state -->
  <SharedPageContainer
    v-else-if="initError || fetchError"
    class="component-list-root-error"
  >
    <p class="component-list-root-error-title">Failed to load</p>
    <p class="component-list-root-error-message">
      {{ initError?.message || fetchError?.message }}
    </p>
  </SharedPageContainer>

  <!-- Content -->
  <SharedPageContainer v-else-if="isInitialized">
    <ComponentListSectionFilters
      :character-search="characterSearch"
      :filters="filters"
      :has-active-filters="hasActiveFilters"
      :search-keywords="searchKeywords"
      @clear-filters="clearFilters"
      @update-filter="handleFilterUpdate"
      @update:character-search="(val) => (characterSearch = val)"
      @update:search-keywords="(val) => (searchKeywords = val)"
    />
    <ComponentListSectionGrid
      :component-list="componentList"
      :has-active-filters="hasActiveFilters"
    />
  </SharedPageContainer>
</template>

<style scoped>
.component-list-root-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  min-height: 50vh;
}

.component-list-root-loading-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.component-list-root-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 50vh;
  text-align: center;
}

.component-list-root-error-title {
  margin: 0;
  color: var(--color-error);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.component-list-root-error-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}
</style>
