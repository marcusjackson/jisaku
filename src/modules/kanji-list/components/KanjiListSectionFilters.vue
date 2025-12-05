<script setup lang="ts">
/**
 * KanjiListSectionFilters
 *
 * Section component that orchestrates all kanji filter UI components.
 * Arranges filters in a responsive layout with clear filters button.
 */

import BaseButton from '@/base/components/BaseButton.vue'

import KanjiFilterCharacter from './KanjiFilterCharacter.vue'
import KanjiFilterComponent from './KanjiFilterComponent.vue'
import KanjiFilterJlptLevel from './KanjiFilterJlptLevel.vue'
import KanjiFilterJoyoLevel from './KanjiFilterJoyoLevel.vue'
import KanjiFilterRadical from './KanjiFilterRadical.vue'
import KanjiFilterStrokeRange from './KanjiFilterStrokeRange.vue'

import type {
  Component,
  KanjiFilters,
  Radical
} from '@/shared/types/database-types'

defineProps<{
  /** Current filter state */
  filters: KanjiFilters
  /** Character search value (debounced separately) */
  characterSearch: string
  /** Whether any filters are active */
  hasActiveFilters: boolean
  /** Available components for filter dropdown */
  components: Component[]
  /** Available radicals for filter dropdown */
  radicals: Radical[]
}>()

const emit = defineEmits<{
  /** Update character search input */
  'update:characterSearch': [value: string]
  /** Update a filter value */
  updateFilter: [key: keyof KanjiFilters, value: unknown]
  /** Clear all filters */
  clearFilters: []
}>()
</script>

<template>
  <section
    aria-label="Filter kanji"
    class="kanji-list-filters"
  >
    <div class="kanji-list-filters-row">
      <KanjiFilterCharacter
        :model-value="characterSearch"
        @update:model-value="emit('update:characterSearch', $event)"
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
    </div>

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
  </section>
</template>

<style scoped>
.kanji-list-filters {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.kanji-list-filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--spacing-md);
}

.kanji-list-filters-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
