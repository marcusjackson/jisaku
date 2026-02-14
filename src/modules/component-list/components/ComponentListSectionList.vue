<script setup lang="ts">
/**
 * ComponentListSectionList
 *
 * Section component that displays the grid of component cards.
 * Handles empty states and the "Add Component" action button.
 */

import { ref } from 'vue'

import { BaseButton } from '@/base/components'

import { useSeedData, useToast } from '@/shared/composables'

import ComponentListCard from './ComponentListCard.vue'

import type { Component } from '@/api/component'

defineProps<{
  componentList: Component[]
  hasActiveFilters?: boolean
}>()

const emit = defineEmits<{
  addComponent: []
  refresh: []
}>()

// Dev-only seed functionality
const isDevelopment = import.meta.env.DEV
const { isSeeding, seed } = useSeedData()
const { error: showError, success: showSuccess } = useToast()
const isLocalSeeding = ref(false)

async function handleSeedData(): Promise<void> {
  if (isLocalSeeding.value) return
  isLocalSeeding.value = true
  try {
    await seed()
    showSuccess('Database seeded successfully!')
    emit('refresh')
  } catch (error) {
    console.error('Seed error:', error)
    showError('Failed to seed database')
  } finally {
    isLocalSeeding.value = false
  }
}

function getSeedingState(): boolean {
  return isSeeding.value || isLocalSeeding.value
}
</script>

<template>
  <div
    class="component-list-section-list"
    data-testid="component-list-section-list"
  >
    <header class="component-list-section-list-header">
      <h1 class="component-list-section-list-title">Component List</h1>
      <BaseButton
        data-testid="component-add-button"
        @click="emit('addComponent')"
      >
        Add New
      </BaseButton>
    </header>

    <!-- Empty: no results from filter -->
    <div
      v-if="componentList.length === 0 && hasActiveFilters"
      class="component-list-section-list-empty"
    >
      <p class="component-list-section-list-empty-text">
        No components match your filters.
      </p>
    </div>

    <!-- Empty: no components at all -->
    <div
      v-else-if="componentList.length === 0"
      class="component-list-section-list-empty"
    >
      <p class="component-list-section-list-empty-text">
        No components yet. Add your first one!
      </p>
      <BaseButton
        size="lg"
        @click="emit('addComponent')"
      >
        Add First Component
      </BaseButton>

      <template v-if="isDevelopment">
        <BaseButton
          class="component-list-section-list-seed"
          :disabled="getSeedingState()"
          variant="secondary"
          @click="handleSeedData"
        >
          {{ getSeedingState() ? 'Seeding...' : 'Seed Data' }}
        </BaseButton>
        <p class="component-list-section-list-seed-hint">
          Load example data for testing
        </p>
      </template>
    </div>

    <!-- Component grid -->
    <div
      v-else
      class="component-list-section-list-grid"
      data-testid="component-list-grid"
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
.component-list-section-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.component-list-section-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.component-list-section-list-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.component-list-section-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
  text-align: center;
}

.component-list-section-list-empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.component-list-section-list-seed {
  margin-top: var(--spacing-md);
}

.component-list-section-list-seed-hint {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.component-list-section-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

@media (width >= 768px) {
  .component-list-section-list-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
