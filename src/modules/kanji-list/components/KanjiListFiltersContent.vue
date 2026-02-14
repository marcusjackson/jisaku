<script setup lang="ts">
import KanjiListFilterAnalysisFields from './KanjiListFilterAnalysisFields.vue'
import KanjiListFilterCharacter from './KanjiListFilterCharacter.vue'
import KanjiListFilterClassifications from './KanjiListFilterClassifications.vue'
import KanjiListFilterComponents from './KanjiListFilterComponents.vue'
import KanjiListFilterJlptLevel from './KanjiListFilterJlptLevel.vue'
import KanjiListFilterJoyoLevel from './KanjiListFilterJoyoLevel.vue'
import KanjiListFilterKenteiLevel from './KanjiListFilterKenteiLevel.vue'
import KanjiListFilterKeywords from './KanjiListFilterKeywords.vue'
import KanjiListFilterKunYomi from './KanjiListFilterKunYomi.vue'
import KanjiListFilterMeanings from './KanjiListFilterMeanings.vue'
import KanjiListFilterOnYomi from './KanjiListFilterOnYomi.vue'
import KanjiListFilterRadical from './KanjiListFilterRadical.vue'
import KanjiListFilterStrokeDiagrams from './KanjiListFilterStrokeDiagrams.vue'
import KanjiListFilterStrokeRange from './KanjiListFilterStrokeRange.vue'

import type { KanjiListFilters } from '../kanji-list-types'
import type { ClassificationType } from '@/api/classification'
import type { Component } from '@/api/component'

defineProps<{
  filters: KanjiListFilters
  characterSearch: string
  keywordsSearch: string
  meaningsSearch: string
  onYomiSearch: string
  kunYomiSearch: string
  components: Component[]
  radicals: Component[]
  classificationTypes: ClassificationType[]
}>()

const emit = defineEmits<{
  'update:characterSearch': [value: string]
  'update:keywordsSearch': [value: string]
  'update:meaningsSearch': [value: string]
  'update:onYomiSearch': [value: string]
  'update:kunYomiSearch': [value: string]
  updateFilter: [key: keyof KanjiListFilters, value: unknown]
}>()

function updateArrayFilter(key: keyof KanjiListFilters, value: unknown[]) {
  emit('updateFilter', key, value.length > 0 ? value : undefined)
}
</script>

<template>
  <div class="kanji-list-filters-content">
    <!-- Text search row -->
    <div class="kanji-list-filters-row">
      <KanjiListFilterCharacter
        :model-value="characterSearch"
        @update:model-value="emit('update:characterSearch', $event)"
      />
      <KanjiListFilterKeywords
        :model-value="keywordsSearch"
        @update:model-value="emit('update:keywordsSearch', $event)"
      />
      <KanjiListFilterMeanings
        :model-value="meaningsSearch"
        @update:model-value="emit('update:meaningsSearch', $event)"
      />
      <KanjiListFilterOnYomi
        :model-value="onYomiSearch"
        @update:model-value="emit('update:onYomiSearch', $event)"
      />
      <KanjiListFilterKunYomi
        :model-value="kunYomiSearch"
        @update:model-value="emit('update:kunYomiSearch', $event)"
      />
    </div>

    <!-- Stroke and dropdown filters row -->
    <div class="kanji-list-filters-row">
      <KanjiListFilterStrokeRange
        :max="filters.strokeCountMax"
        :min="filters.strokeCountMin"
        @update:max="emit('updateFilter', 'strokeCountMax', $event)"
        @update:min="emit('updateFilter', 'strokeCountMin', $event)"
      />
      <KanjiListFilterComponents
        :components="components"
        :model-value="filters.componentIds ?? []"
        @update:model-value="emit('updateFilter', 'componentIds', $event)"
      />
      <KanjiListFilterRadical
        :model-value="filters.radicalId ?? null"
        :radicals="radicals"
        @update:model-value="emit('updateFilter', 'radicalId', $event)"
      />
      <KanjiListFilterClassifications
        :classification-types="classificationTypes"
        :model-value="filters.classificationTypeIds ?? []"
        @update:model-value="
          emit('updateFilter', 'classificationTypeIds', $event)
        "
      />
    </div>

    <!-- Level chips row -->
    <div class="kanji-list-filters-row">
      <KanjiListFilterJlptLevel
        :model-value="filters.jlptLevels ?? []"
        @update:model-value="updateArrayFilter('jlptLevels', $event)"
      />
      <KanjiListFilterJoyoLevel
        :model-value="filters.joyoLevels ?? []"
        @update:model-value="updateArrayFilter('joyoLevels', $event)"
      />
      <KanjiListFilterKenteiLevel
        :model-value="filters.kenteiLevels ?? []"
        @update:model-value="updateArrayFilter('kenteiLevels', $event)"
      />
    </div>

    <!-- Advanced filters row -->
    <div class="kanji-list-filters-row">
      <KanjiListFilterStrokeDiagrams
        :animation-value="filters.strokeOrderAnimation ?? null"
        :diagram-value="filters.strokeOrderDiagram ?? null"
        @update:animation-value="
          emit('updateFilter', 'strokeOrderAnimation', $event)
        "
        @update:diagram-value="
          emit('updateFilter', 'strokeOrderDiagram', $event)
        "
      />
      <KanjiListFilterAnalysisFields
        :model-value="filters.analysisFilters ?? []"
        @update:model-value="emit('updateFilter', 'analysisFilters', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.kanji-list-filters-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md) var(--spacing-md);
}

.kanji-list-filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--spacing-md);
}
</style>
