<script setup lang="ts">
/**
 * VocabListFiltersContent
 *
 * Layout component for all vocabulary filter inputs.
 * Organizes filters into responsive rows.
 */

import VocabListFilterCommon from './VocabListFilterCommon.vue'
import VocabListFilterDescription from './VocabListFilterDescription.vue'
import VocabListFilterJlptLevel from './VocabListFilterJlptLevel.vue'
import VocabListFilterKana from './VocabListFilterKana.vue'
import VocabListFilterKanji from './VocabListFilterKanji.vue'
import VocabListFilterSearch from './VocabListFilterSearch.vue'
import VocabListFilterWord from './VocabListFilterWord.vue'

import type { VocabListFilters } from '../vocab-list-types'
import type { Kanji } from '@/api/kanji'

defineProps<{
  filters: VocabListFilters
  wordSearch: string
  searchText: string
  kanaSearch: string
  allKanji: Kanji[]
}>()

const emit = defineEmits<{
  'update:wordSearch': [value: string]
  'update:searchText': [value: string]
  'update:kanaSearch': [value: string]
  updateFilter: [key: keyof VocabListFilters, value: unknown]
}>()

function updateArrayFilter(key: keyof VocabListFilters, value: unknown[]) {
  emit('updateFilter', key, value.length > 0 ? value : undefined)
}
</script>

<template>
  <div class="vocab-list-filters-content">
    <!-- Text search row -->
    <div class="vocab-list-filters-row">
      <VocabListFilterWord
        :model-value="wordSearch"
        @update:model-value="emit('update:wordSearch', $event)"
      />
      <VocabListFilterSearch
        :model-value="searchText"
        @update:model-value="emit('update:searchText', $event)"
      />
      <VocabListFilterKana
        :model-value="kanaSearch"
        @update:model-value="emit('update:kanaSearch', $event)"
      />
      <VocabListFilterKanji
        :all-kanji="allKanji"
        :model-value="filters.containsKanjiIds ?? []"
        @update:model-value="updateArrayFilter('containsKanjiIds', $event)"
      />
    </div>

    <!-- Level and boolean filters row -->
    <div class="vocab-list-filters-row">
      <VocabListFilterJlptLevel
        :model-value="filters.jlptLevels ?? []"
        @update:model-value="updateArrayFilter('jlptLevels', $event)"
      />
      <VocabListFilterCommon
        :model-value="filters.isCommon ?? false"
        @update:model-value="
          emit('updateFilter', 'isCommon', $event || undefined)
        "
      />
      <VocabListFilterDescription
        :model-value="filters.descriptionFilled ?? null"
        @update:model-value="emit('updateFilter', 'descriptionFilled', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.vocab-list-filters-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md) var(--spacing-md);
}

.vocab-list-filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--spacing-md);
}
</style>
