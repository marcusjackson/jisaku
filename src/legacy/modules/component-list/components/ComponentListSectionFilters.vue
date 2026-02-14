<script setup lang="ts">
/**
 * ComponentListSectionFilters
 *
 * Section component that orchestrates all component filter UI components.
 * Redesigned to match the kanji list filters design.
 */

import { computed, onMounted, ref, watch } from 'vue'

import BaseButton from '@/legacy/base/components/BaseButton.vue'
import BaseInput from '@/legacy/base/components/BaseInput.vue'

import type { ComponentFilters } from '@/legacy/shared/types/database-types'

const props = defineProps<{
  /** Current filter state */
  filters: ComponentFilters
  /** Character search value (debounced separately) */
  characterSearch: string
  /** Search keywords value (debounced separately) */
  searchKeywords: string
  /** Whether any filters are active */
  hasActiveFilters: boolean
}>()

const emit = defineEmits<{
  /** Update character search input */
  'update:characterSearch': [value: string]
  /** Update search keywords input */
  'update:searchKeywords': [value: string]
  /** Update a filter value */
  updateFilter: [key: keyof ComponentFilters, value: unknown]
  /** Clear all filters */
  clearFilters: []
}>()

// Collapsible state with localStorage persistence
const STORAGE_KEY = 'component-list-filters-collapsed'
const isCollapsed = ref(false)

// Initialize collapsed state on mount
onMounted(() => {
  // Check viewport width to set default
  const isMobile = window.innerWidth < 768

  // Try to load from localStorage
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) {
    isCollapsed.value = stored === 'true'
  } else {
    // Default based on viewport
    isCollapsed.value = isMobile
  }
})

// Persist to localStorage when state changes
watch(isCollapsed, (newValue) => {
  localStorage.setItem(STORAGE_KEY, String(newValue))
})

function toggleCollapsed() {
  isCollapsed.value = !isCollapsed.value
}

// Count active filters for display in header
const activeFilterCount = computed(() => {
  let count = 0
  if (props.filters.character) count++
  if (props.filters.searchKeywords) count++
  if (props.filters.strokeCountMin !== undefined) count++
  if (props.filters.strokeCountMax !== undefined) count++
  if (props.filters.sourceKanjiId !== undefined) count++
  return count
})

function handleCharacterInput(value: string | number | undefined) {
  emit('update:characterSearch', String(value ?? ''))
}

function handleSearchKeywordsInput(value: string | number | undefined) {
  emit('update:searchKeywords', String(value ?? ''))
}

function handleStrokeMinInput(value: string | number | undefined) {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10)
  emit(
    'updateFilter',
    'strokeCountMin',
    isNaN(num) || value === '' ? undefined : num
  )
}

function handleStrokeMaxInput(value: string | number | undefined) {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10)
  emit(
    'updateFilter',
    'strokeCountMax',
    isNaN(num) || value === '' ? undefined : num
  )
}
</script>

<template>
  <section
    aria-label="Filter components"
    class="component-list-filters"
  >
    <!-- Collapsible Header -->
    <button
      :aria-expanded="!isCollapsed"
      class="component-list-filters-header"
      type="button"
      @click="toggleCollapsed"
    >
      <span class="component-list-filters-header-text">
        Filters
        <span
          v-if="activeFilterCount > 0"
          class="component-list-filters-header-badge"
        >
          {{ activeFilterCount }}
        </span>
      </span>
      <svg
        class="component-list-filters-header-chevron"
        :class="{ 'component-list-filters-header-chevron-open': !isCollapsed }"
        fill="none"
        height="20"
        viewBox="0 0 20 20"
        width="20"
        xmlns="http://www.w3.org/2000/svg"
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
      class="component-list-filters-content"
    >
      <div class="component-list-filters-row">
        <!-- Character Filter -->
        <div
          class="component-list-filters-field component-list-filters-field-character"
        >
          <BaseInput
            label="Character"
            :model-value="characterSearch"
            name="character"
            placeholder="亻"
            @update:model-value="handleCharacterInput"
          />
        </div>

        <!-- Search Keywords Filter -->
        <div
          class="component-list-filters-field component-list-filters-field-keywords"
        >
          <BaseInput
            label="Meaning/Keywords"
            :model-value="searchKeywords"
            name="searchKeywords"
            placeholder="person, human..."
            @update:model-value="handleSearchKeywordsInput"
          />
        </div>

        <!-- Stroke Range -->
        <div
          class="component-list-filters-field component-list-filters-field-strokes"
        >
          <span class="component-list-filters-stroke-label">Strokes</span>
          <div class="component-list-filters-stroke-inputs">
            <BaseInput
              label="Minimum strokes"
              :model-value="filters.strokeCountMin"
              name="strokeMin"
              placeholder="Min"
              type="number"
              @update:model-value="handleStrokeMinInput"
            />
            <span class="component-list-filters-stroke-separator">–</span>
            <BaseInput
              label="Maximum strokes"
              :model-value="filters.strokeCountMax"
              name="strokeMax"
              placeholder="Max"
              type="number"
              @update:model-value="handleStrokeMaxInput"
            />
          </div>
        </div>
      </div>

      <div class="component-list-filters-bottom">
        <div
          v-if="hasActiveFilters"
          class="component-list-filters-actions"
        >
          <BaseButton
            variant="ghost"
            @click="emit('clearFilters')"
          >
            Clear filters
          </BaseButton>
        </div>

        <div class="component-list-filters-collapse">
          <BaseButton
            size="sm"
            variant="secondary"
            @click="toggleCollapsed"
          >
            Collapse
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Clear filters button visible when collapsed and filters active -->
    <div
      v-if="isCollapsed && hasActiveFilters"
      class="component-list-filters-collapsed-actions"
    >
      <BaseButton
        size="sm"
        variant="ghost"
        @click="emit('clearFilters')"
      >
        Clear filters
      </BaseButton>
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

.component-list-filters-header-badge {
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

.component-list-filters-header-chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

.component-list-filters-header-chevron-open {
  transform: rotate(180deg);
}

.component-list-filters-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md) var(--spacing-md);
}

.component-list-filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--spacing-md);
}

.component-list-filters-field-character {
  min-width: 100px;
}

.component-list-filters-field-keywords {
  min-width: 140px;
}

.component-list-filters-field-strokes {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.component-list-filters-stroke-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.component-list-filters-stroke-inputs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
}

.component-list-filters-stroke-inputs :deep(.base-input) {
  flex: 1;
  min-width: 60px;
}

.component-list-filters-stroke-inputs :deep(.base-input-label) {
  /* Hide the label visually but keep for screen readers */
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  border: 0;
}

.component-list-filters-stroke-separator {
  color: var(--color-text-tertiary);
}

.component-list-filters-actions {
  display: flex;
  justify-content: flex-start;
}

.component-list-filters-bottom {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.component-list-filters-collapse {
  display: flex;
  justify-content: flex-end;
}

.component-list-filters-collapsed-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 var(--spacing-md) var(--spacing-md);
}

@media (width <= 480px) {
  .component-list-filters-bottom {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .component-list-filters-actions,
  .component-list-filters-collapse {
    justify-content: center;
  }
}
</style>
