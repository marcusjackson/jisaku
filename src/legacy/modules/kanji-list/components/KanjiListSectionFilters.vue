<script setup lang="ts">
/**
 * KanjiListSectionFilters
 *
 * Section component that orchestrates all kanji filter UI components.
 * Arranges filters in a responsive layout with clear filters button.
 * Filters are collapsible with state persisted to localStorage.
 */

import { computed, onMounted, ref, watch } from 'vue'

import BaseButton from '@/legacy/base/components/BaseButton.vue'

import KanjiFilterCharacter from './KanjiFilterCharacter.vue'
import KanjiFilterComponent from './KanjiFilterComponent.vue'
import KanjiFilterJlptLevel from './KanjiFilterJlptLevel.vue'
import KanjiFilterJoyoLevel from './KanjiFilterJoyoLevel.vue'
import KanjiFilterKenteiLevel from './KanjiFilterKenteiLevel.vue'
import KanjiFilterKunYomi from './KanjiFilterKunYomi.vue'
import KanjiFilterOnYomi from './KanjiFilterOnYomi.vue'
import KanjiFilterRadical from './KanjiFilterRadical.vue'
import KanjiFilterSearchKeywords from './KanjiFilterSearchKeywords.vue'
import KanjiFilterStrokeRange from './KanjiFilterStrokeRange.vue'

import type {
  Component,
  KanjiFilters
} from '@/legacy/shared/types/database-types'

const props = defineProps<{
  /** Current filter state */
  filters: KanjiFilters
  /** Character search value (debounced separately) */
  characterSearch: string
  /** Search keywords value (debounced separately) */
  searchKeywords: string
  /** On-yomi search value (debounced separately) */
  onYomiSearch: string
  /** Kun-yomi search value (debounced separately) */
  kunYomiSearch: string
  /** Whether any filters are active */
  hasActiveFilters: boolean
  /** Available components for filter dropdown */
  components: Component[]
  /** Available radicals for filter dropdown (components with canBeRadical=true) */
  radicals: Component[]
}>()

const emit = defineEmits<{
  /** Update character search input */
  'update:characterSearch': [value: string]
  /** Update search keywords input */
  'update:searchKeywords': [value: string]
  /** Update on-yomi search input */
  'update:onYomiSearch': [value: string]
  /** Update kun-yomi search input */
  'update:kunYomiSearch': [value: string]
  /** Update a filter value */
  updateFilter: [key: keyof KanjiFilters, value: unknown]
  /** Clear all filters */
  clearFilters: []
}>()

// Collapsible state with localStorage persistence
const STORAGE_KEY = 'kanji-list-filters-collapsed'
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
  if (props.filters.jlptLevels && props.filters.jlptLevels.length > 0) count++
  if (props.filters.joyoLevels && props.filters.joyoLevels.length > 0) count++
  if (props.filters.kenteiLevels && props.filters.kenteiLevels.length > 0)
    count++
  if (props.filters.radicalId) count++
  if (props.filters.componentId) count++
  if (props.filters.onYomi) count++
  if (props.filters.kunYomi) count++
  return count
})
</script>

<template>
  <section
    aria-label="Filter kanji"
    class="kanji-list-filters"
  >
    <!-- Collapsible Header -->
    <button
      :aria-expanded="!isCollapsed"
      class="kanji-list-filters-header"
      type="button"
      @click="toggleCollapsed"
    >
      <span class="kanji-list-filters-header-text">
        Filters
        <span
          v-if="activeFilterCount > 0"
          class="kanji-list-filters-header-badge"
        >
          {{ activeFilterCount }}
        </span>
      </span>
      <svg
        class="kanji-list-filters-header-chevron"
        :class="{ 'kanji-list-filters-header-chevron-open': !isCollapsed }"
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
      class="kanji-list-filters-content"
    >
      <div class="kanji-list-filters-row">
        <KanjiFilterCharacter
          :model-value="characterSearch"
          @update:model-value="emit('update:characterSearch', $event)"
        />

        <KanjiFilterSearchKeywords
          :model-value="searchKeywords"
          @update:model-value="emit('update:searchKeywords', $event)"
        />

        <KanjiFilterOnYomi
          :model-value="onYomiSearch"
          @update:model-value="emit('update:onYomiSearch', $event)"
        />

        <KanjiFilterKunYomi
          :model-value="kunYomiSearch"
          @update:model-value="emit('update:kunYomiSearch', $event)"
        />

        <KanjiFilterStrokeRange
          :max="filters.strokeCountMax"
          :min="filters.strokeCountMin"
          @update:max="emit('updateFilter', 'strokeCountMax', $event)"
          @update:min="emit('updateFilter', 'strokeCountMin', $event)"
        />

        <KanjiFilterComponent
          :components="components"
          :model-value="filters.componentId ?? null"
          @update:model-value="emit('updateFilter', 'componentId', $event)"
        />

        <KanjiFilterRadical
          :model-value="filters.radicalId ?? null"
          :radicals="radicals"
          @update:model-value="emit('updateFilter', 'radicalId', $event)"
        />
      </div>

      <div class="kanji-list-filters-row">
        <KanjiFilterJlptLevel
          :model-value="filters.jlptLevels ?? []"
          @update:model-value="
            emit(
              'updateFilter',
              'jlptLevels',
              $event.length > 0 ? $event : undefined
            )
          "
        />

        <KanjiFilterJoyoLevel
          :model-value="filters.joyoLevels ?? []"
          @update:model-value="
            emit(
              'updateFilter',
              'joyoLevels',
              $event.length > 0 ? $event : undefined
            )
          "
        />

        <KanjiFilterKenteiLevel
          :model-value="filters.kenteiLevels ?? []"
          @update:model-value="
            emit(
              'updateFilter',
              'kenteiLevels',
              $event.length > 0 ? $event : undefined
            )
          "
        />
      </div>

      <div class="kanji-list-filters-bottom">
        <div
          v-if="hasActiveFilters"
          class="kanji-list-filters-actions"
        >
          <BaseButton
            variant="ghost"
            @click="emit('clearFilters')"
          >
            Clear filters
          </BaseButton>
        </div>

        <div class="kanji-list-filters-collapse">
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
      class="kanji-list-filters-collapsed-actions"
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
.kanji-list-filters {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.kanji-list-filters-header {
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

.kanji-list-filters-header:hover {
  background-color: var(--color-surface-hover);
}

.kanji-list-filters-header-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.kanji-list-filters-header-badge {
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

.kanji-list-filters-header-chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

.kanji-list-filters-header-chevron-open {
  transform: rotate(180deg);
}

.kanji-list-filters-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md) var(--spacing-md);
}

.kanji-list-filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--spacing-md);
}

.kanji-list-filters-actions {
  display: flex;
  justify-content: flex-start;
}

.kanji-list-filters-bottom {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.kanji-list-filters-collapse {
  display: flex;
  justify-content: flex-end;
}

.kanji-list-filters-collapsed-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 var(--spacing-md) var(--spacing-md);
}

@media (width <= 480px) {
  .kanji-list-filters-bottom {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .kanji-list-filters-actions,
  .kanji-list-filters-collapse {
    justify-content: center;
  }
}
</style>
