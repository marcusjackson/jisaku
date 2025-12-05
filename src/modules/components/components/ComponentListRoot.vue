<script setup lang="ts">
/**
 * ComponentListRoot
 *
 * Root component for the component list feature.
 * Handles database initialization, data fetching, and loading/error states.
 * Passes data down to ComponentListSectionGrid.
 */

import { onMounted, ref } from 'vue'

import BaseSpinner from '@/base/components/BaseSpinner.vue'

import SharedPageContainer from '@/shared/components/SharedPageContainer.vue'
import { useDatabase } from '@/shared/composables/use-database'

import { useComponentRepository } from '../composables/use-component-repository'

import ComponentListSectionGrid from './ComponentListSectionGrid.vue'

import type { Component } from '@/shared/types/database-types'

// Database initialization
const { initError, initialize, isInitialized, isInitializing } = useDatabase()

// Repository for data access
const { getAll } = useComponentRepository()

// Local state
const componentList = ref<Component[]>([])
const fetchError = ref<Error | null>(null)

// Fetch components when database is ready
function loadComponents() {
  try {
    componentList.value = getAll()
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

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
  <ComponentListSectionGrid
    v-else-if="isInitialized"
    :component-list="componentList"
  />
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
