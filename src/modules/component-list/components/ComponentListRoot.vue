<script setup lang="ts">
/**
 * ComponentListRoot
 *
 * Root component for the component list feature.
 * Handles database initialization, data fetching, and loading/error states.
 * Orchestrates filters, list, and dialog sections.
 */

import { computed, onMounted, ref, watch } from 'vue'

import { BaseSpinner } from '@/base/components'

import { useDatabase } from '@/shared/composables/use-database'

import { useComponentListData } from '../composables/use-component-list-data'
import { useComponentListState } from '../composables/use-component-list-state'

import ComponentListSectionDialog from './ComponentListSectionDialog.vue'
import ComponentListSectionFilters from './ComponentListSectionFilters.vue'
import ComponentListSectionList from './ComponentListSectionList.vue'

import type { ComponentListFilters } from '../component-list-types'

// Database initialization
const { initError, initialize, isInitialized, isInitializing } = useDatabase()

// Filter state
const {
  activeFilterCount,
  characterSearch,
  clearFilters,
  filters,
  hasActiveFilters,
  kangxiSearch,
  keywordsSearch,
  refreshTrigger,
  triggerRefresh,
  updateFilter
} = useComponentListState()

// Data fetching
const { componentList, fetchError, loadComponents } = useComponentListData()

const isDialogOpen = ref(false)
const displayError = computed(() => initError.value ?? fetchError.value)

// Watch for filter changes
watch(
  filters,
  () => {
    if (isInitialized.value) loadComponents(filters.value)
  },
  { deep: true }
)

// Watch for refresh trigger
watch(refreshTrigger, () => {
  if (isInitialized.value) {
    loadComponents(filters.value)
  }
})

// Handle filter update from section component
function handleFilterUpdate(
  key: keyof ComponentListFilters,
  value: unknown
): void {
  updateFilter(key, value as ComponentListFilters[typeof key])
}

// Handle component created
function handleComponentCreated(): void {
  isDialogOpen.value = false
  triggerRefresh()
}

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadComponents(filters.value)
  } catch {
    // Error captured in initError
  }
})
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="isInitializing"
    class="component-list-root-loading"
  >
    <BaseSpinner
      label="Loading database..."
      size="lg"
    />
  </div>

  <!-- Error state -->
  <div
    v-else-if="displayError"
    class="component-list-root-error"
  >
    <p class="component-list-root-error-title">
      An error occurred while loading data
    </p>
    <p class="component-list-root-error-message">{{ displayError.message }}</p>
  </div>

  <!-- Content -->
  <div
    v-else-if="isInitialized"
    class="component-list-root"
  >
    <ComponentListSectionFilters
      :active-filter-count="activeFilterCount"
      :character-search="characterSearch"
      :filters="filters"
      :has-active-filters="hasActiveFilters"
      :kangxi-search="kangxiSearch"
      :keywords-search="keywordsSearch"
      @clear-filters="clearFilters"
      @update-filter="handleFilterUpdate"
      @update:character-search="characterSearch = $event"
      @update:kangxi-search="kangxiSearch = $event"
      @update:keywords-search="keywordsSearch = $event"
    />

    <ComponentListSectionList
      :component-list="componentList"
      :has-active-filters="hasActiveFilters"
      @add-component="isDialogOpen = true"
      @refresh="triggerRefresh"
    />

    <ComponentListSectionDialog
      v-model:open="isDialogOpen"
      @created="handleComponentCreated"
    />
  </div>
</template>

<style scoped>
.component-list-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.component-list-root-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.component-list-root-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  text-align: center;
}

.component-list-root-error-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.component-list-root-error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
}
</style>
