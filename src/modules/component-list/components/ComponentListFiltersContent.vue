<script setup lang="ts">
/**
 * ComponentListFiltersContent
 *
 * Layout component for all filter inputs.
 */

import ComponentListFilterCharacter from './ComponentListFilterCharacter.vue'
import ComponentListFilterKangxi from './ComponentListFilterKangxi.vue'
import ComponentListFilterKeywords from './ComponentListFilterKeywords.vue'
import ComponentListFilterPresence from './ComponentListFilterPresence.vue'
import ComponentListFilterRadicalStatus from './ComponentListFilterRadicalStatus.vue'
import ComponentListFilterStrokeRange from './ComponentListFilterStrokeRange.vue'

import type { ComponentListFilters } from '../component-list-types'

defineProps<{
  filters: ComponentListFilters
  characterSearch: string
  keywordsSearch: string
  kangxiSearch: string
}>()

const emit = defineEmits<{
  'update:characterSearch': [value: string]
  'update:keywordsSearch': [value: string]
  'update:kangxiSearch': [value: string]
  updateFilter: [key: keyof ComponentListFilters, value: unknown]
}>()
</script>

<template>
  <div class="component-list-filters-content">
    <!-- Text search row -->
    <div class="component-list-filters-row">
      <ComponentListFilterCharacter
        :model-value="characterSearch"
        @update:model-value="emit('update:characterSearch', $event)"
      />
      <ComponentListFilterKeywords
        :model-value="keywordsSearch"
        @update:model-value="emit('update:keywordsSearch', $event)"
      />
      <ComponentListFilterKangxi
        :model-value="kangxiSearch"
        @update:model-value="emit('update:kangxiSearch', $event)"
      />
    </div>

    <!-- Stroke, status, presence filters row -->
    <div class="component-list-filters-row">
      <ComponentListFilterStrokeRange
        :max="filters.strokeCountMax"
        :min="filters.strokeCountMin"
        @update:max="emit('updateFilter', 'strokeCountMax', $event)"
        @update:min="emit('updateFilter', 'strokeCountMin', $event)"
      />
      <ComponentListFilterRadicalStatus
        :model-value="filters.canBeRadical"
        @update:model-value="emit('updateFilter', 'canBeRadical', $event)"
      />
      <ComponentListFilterPresence
        label="Description"
        :model-value="filters.descriptionPresence ?? null"
        @update:model-value="
          emit('updateFilter', 'descriptionPresence', $event)
        "
      />
      <ComponentListFilterPresence
        label="Forms"
        :model-value="filters.formsPresence ?? null"
        @update:model-value="emit('updateFilter', 'formsPresence', $event)"
      />
      <ComponentListFilterPresence
        label="Groupings"
        :model-value="filters.groupingsPresence ?? null"
        @update:model-value="emit('updateFilter', 'groupingsPresence', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.component-list-filters-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md) var(--spacing-md);
}

.component-list-filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--spacing-md);
}
</style>
