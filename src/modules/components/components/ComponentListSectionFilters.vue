<script setup lang="ts">
/**
 * ComponentListSectionFilters
 *
 * Section component that orchestrates all component filter UI components.
 * Simple filtering by character and stroke range.
 */

import { computed, onMounted, ref, watch } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseInput from '@/base/components/BaseInput.vue'

import type { ComponentFilters } from '@/shared/types/database-types'

const props = defineProps<{
  /** Current filter state */
  filters: ComponentFilters
  /** Character search value (debounced separately) */
  characterSearch: string
  /** Whether any filters are active */
  hasActiveFilters: boolean
}>()

const emit = defineEmits<{
  /** Update character search input */
  'update:characterSearch': [value: string]
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
  if (props.filters.strokeCountMin !== undefined) count++
  if (props.filters.strokeCountMax !== undefined) count++
  if (props.filters.sourceKanjiId !== undefined) count++
  return count
})

// Local state for stroke range inputs
const strokeMin = ref<string>('')
const strokeMax = ref<string>('')

// Sync local state with props
watch(
  () => props.filters.strokeCountMin,
  (newVal) => {
    strokeMin.value = newVal !== undefined ? String(newVal) : ''
  },
  { immediate: true }
)

watch(
  () => props.filters.strokeCountMax,
  (newVal) => {
    strokeMax.value = newVal !== undefined ? String(newVal) : ''
  },
  { immediate: true }
)

function handleStrokeMinChange(value: string | number | undefined) {
  const strValue = String(value ?? '')
  strokeMin.value = strValue
  const num = parseInt(strValue, 10)
  emit('updateFilter', 'strokeCountMin', isNaN(num) ? undefined : num)
}

function handleStrokeMaxChange(value: string | number | undefined) {
  const strValue = String(value ?? '')
  strokeMax.value = strValue
  const num = parseInt(strValue, 10)
  emit('updateFilter', 'strokeCountMax', isNaN(num) ? undefined : num)
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
          class="component-list-filters-header-count"
        >
          ({{ activeFilterCount }})
        </span>
      </span>
      <span
        aria-hidden="true"
        :class="{
          'component-list-filters-header-icon': true,
          'component-list-filters-header-icon-collapsed': isCollapsed
        }"
      >
        ▼
      </span>
    </button>

    <!-- Filter Content (collapsible) -->
    <div
      v-show="!isCollapsed"
      class="component-list-filters-content"
    >
      <!-- Character Search -->
      <div class="component-list-filters-field">
        <label
          class="component-list-filters-label"
          for="component-filter-character"
        >
          Search
        </label>
        <BaseInput
          id="component-filter-character"
          :model-value="characterSearch"
          placeholder="Character or meaning..."
          type="text"
          @update:model-value="
            (val) => emit('update:characterSearch', val as string)
          "
        />
      </div>

      <!-- Stroke Range -->
      <div class="component-list-filters-field">
        <label class="component-list-filters-label">Stroke Count</label>
        <div class="component-list-filters-range">
          <BaseInput
            id="component-filter-stroke-min"
            inputmode="numeric"
            :model-value="strokeMin"
            placeholder="Min"
            type="text"
            @update:model-value="handleStrokeMinChange"
          />
          <span class="component-list-filters-range-separator">to</span>
          <BaseInput
            id="component-filter-stroke-max"
            inputmode="numeric"
            :model-value="strokeMax"
            placeholder="Max"
            type="text"
            @update:model-value="handleStrokeMaxChange"
          />
        </div>
      </div>

      <!-- Clear Filters Button -->
      <div
        v-if="hasActiveFilters"
        class="component-list-filters-actions"
      >
        <BaseButton
          size="sm"
          variant="ghost"
          @click="emit('clearFilters')"
        >
          Clear Filters
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.component-list-filters {
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.component-list-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  background: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.2s;
}

.component-list-filters-header:hover {
  background-color: var(--color-surface-hover);
}

.component-list-filters-header-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.component-list-filters-header-count {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-normal);
}

.component-list-filters-header-icon {
  color: var(--color-text-secondary);
  transition: transform 0.2s;
}

.component-list-filters-header-icon-collapsed {
  transform: rotate(-90deg);
}

.component-list-filters-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-lg) var(--spacing-lg);
}

.component-list-filters-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.component-list-filters-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.component-list-filters-range {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.component-list-filters-range-separator {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.component-list-filters-actions {
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border);
}

@media (width >= 768px) {
  .component-list-filters-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
  }

  .component-list-filters-actions {
    grid-column: 1 / -1;
  }
}
</style>
