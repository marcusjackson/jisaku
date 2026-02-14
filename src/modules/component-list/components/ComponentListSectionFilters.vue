<script setup lang="ts">
/**
 * ComponentListSectionFilters
 *
 * Section component that orchestrates all component filter UI components.
 * Collapsible panel with localStorage persistence for collapsed state.
 * Default collapsed on mobile, expanded on desktop.
 */

import { onMounted, ref, watch } from 'vue'

import { BaseButton } from '@/base/components'

import {
  type ComponentListFilters,
  STORAGE_KEY_FILTERS_COLLAPSED
} from '../component-list-types'

import ComponentListFiltersContent from './ComponentListFiltersContent.vue'

defineProps<{
  filters: ComponentListFilters
  characterSearch: string
  keywordsSearch: string
  kangxiSearch: string
  hasActiveFilters: boolean
  activeFilterCount: number
}>()

const emit = defineEmits<{
  'update:characterSearch': [value: string]
  'update:keywordsSearch': [value: string]
  'update:kangxiSearch': [value: string]
  updateFilter: [key: keyof ComponentListFilters, value: unknown]
  clearFilters: []
}>()

// Collapsible state
const isCollapsed = ref(false)

onMounted(() => {
  const isMobile = window.innerWidth < 768
  const stored = localStorage.getItem(STORAGE_KEY_FILTERS_COLLAPSED)
  isCollapsed.value = stored !== null ? stored === 'true' : isMobile
})

watch(isCollapsed, (val) => {
  localStorage.setItem(STORAGE_KEY_FILTERS_COLLAPSED, String(val))
})

function toggleCollapsed(): void {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <section
    aria-label="Filter components"
    class="component-list-filters"
    data-testid="component-list-filters"
  >
    <!-- Collapsible Header -->
    <button
      :aria-expanded="!isCollapsed"
      class="component-list-filters-header"
      data-testid="component-list-filters-toggle"
      type="button"
      @click="toggleCollapsed"
    >
      <span class="component-list-filters-header-text">
        Filters
        <span
          v-if="activeFilterCount > 0"
          class="component-list-filters-badge"
        >
          {{ activeFilterCount }}
        </span>
      </span>
      <svg
        :class="[
          'component-list-filters-chevron',
          { 'component-list-filters-chevron-open': !isCollapsed }
        ]"
        fill="none"
        height="20"
        viewBox="0 0 20 20"
        width="20"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
        />
      </svg>
    </button>

    <!-- Collapsible Content -->
    <div
      v-show="!isCollapsed"
      class="component-list-filters-expanded-content"
    >
      <div class="component-list-filters-scrollable-content">
        <ComponentListFiltersContent
          :character-search="characterSearch"
          :filters="filters"
          :kangxi-search="kangxiSearch"
          :keywords-search="keywordsSearch"
          @update-filter="(key, value) => emit('updateFilter', key, value)"
          @update:character-search="emit('update:characterSearch', $event)"
          @update:kangxi-search="emit('update:kangxiSearch', $event)"
          @update:keywords-search="emit('update:keywordsSearch', $event)"
        />
      </div>

      <!-- Bottom actions: Clear + Collapse -->
      <div class="component-list-filters-bottom-actions">
        <BaseButton
          data-testid="component-list-filters-clear"
          :disabled="!hasActiveFilters"
          size="sm"
          variant="ghost"
          @click="emit('clearFilters')"
        >
          Clear filters
        </BaseButton>

        <BaseButton
          data-testid="component-list-filters-collapse"
          size="sm"
          variant="secondary"
          @click="toggleCollapsed"
        >
          Collapse
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.component-list-filters {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.component-list-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md);
  border: none;
  background: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background-color 0.15s;
}

.component-list-filters-header:hover {
  background-color: var(--color-surface-hover);
}

.component-list-filters-header-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.component-list-filters-badge {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  padding: 0 var(--spacing-1);
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.component-list-filters-chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

.component-list-filters-chevron-open {
  transform: rotate(180deg);
}

.component-list-filters-expanded-content {
  display: flex;
  flex-direction: column;
}

.component-list-filters-scrollable-content {
  position: relative;
  max-height: 190px;
  overflow-y: auto;
}

@media (width > 640px) {
  .component-list-filters-scrollable-content {
    max-height: 180px;
  }
}

.component-list-filters-bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
