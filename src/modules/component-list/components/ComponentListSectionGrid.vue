<script setup lang="ts">
/**
 * ComponentListSectionGrid
 *
 * Section component that handles the layout and arrangement of component cards.
 * Displays the grid of components, empty state, and "Add Component" action button.
 */

import { RouterLink } from 'vue-router'

import BaseButton from '@/base/components/BaseButton.vue'

import ComponentListCard from './ComponentListCard.vue'

import type { Component } from '@/shared/types/database-types'

defineProps<{
  componentList: Component[]
  /** Whether any filters are currently active */
  hasActiveFilters?: boolean
}>()
</script>

<template>
  <div class="component-list-section-grid">
    <header class="component-list-section-grid-header">
      <h1 class="component-list-section-grid-title">Components</h1>
      <RouterLink
        v-slot="{ navigate }"
        custom
        to="/components/new"
      >
        <BaseButton @click="navigate">Add Component</BaseButton>
      </RouterLink>
    </header>

    <!-- Empty state: no results from filter -->
    <div
      v-if="componentList.length === 0 && hasActiveFilters"
      class="component-list-section-grid-empty"
    >
      <p class="component-list-section-grid-empty-text">
        No components match your filters.
      </p>
    </div>

    <!-- Empty state: no components at all -->
    <div
      v-else-if="componentList.length === 0"
      class="component-list-section-grid-empty"
    >
      <p class="component-list-section-grid-empty-text">
        No components yet. Add your first one!
      </p>
      <RouterLink
        v-slot="{ navigate }"
        custom
        to="/components/new"
      >
        <BaseButton
          size="lg"
          @click="navigate"
        >
          Add Your First Component
        </BaseButton>
      </RouterLink>
    </div>

    <!-- Component grid -->
    <div
      v-else
      class="component-list-section-grid-grid"
    >
      <ComponentListCard
        v-for="component in componentList"
        :key="component.id"
        :component="component"
      />
    </div>
  </div>
</template>

<style scoped>
.component-list-section-grid {
  margin-top: var(--spacing-lg);
}

.component-list-section-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.component-list-section-grid-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.component-list-section-grid-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl) var(--spacing-md);
  text-align: center;
}

.component-list-section-grid-empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.component-list-section-grid-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

@media (width >= 768px) {
  .component-list-section-grid-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
