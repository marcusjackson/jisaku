<script setup lang="ts">
/**
 * KanjiListSectionFilters
 *
 * Section component that orchestrates all kanji filter UI components.
 * Collapsible panel with localStorage persistence for collapsed state.
 * Default collapsed on mobile, expanded on desktop.
 */

import { onMounted, ref, watch } from 'vue'

import { BaseButton } from '@/base/components'

import KanjiListFiltersContent from './KanjiListFiltersContent.vue'

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
  hasActiveFilters: boolean
  activeFilterCount: number
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
  clearFilters: []
}>()

// Collapsible state
const STORAGE_KEY = 'kanji-list-filters-collapsed'
const isCollapsed = ref(false)

onMounted(() => {
  const isMobile = window.innerWidth < 768
  const stored = localStorage.getItem(STORAGE_KEY)
  isCollapsed.value = stored !== null ? stored === 'true' : isMobile
})

watch(isCollapsed, (val) => {
  localStorage.setItem(STORAGE_KEY, String(val))
})

function toggleCollapsed(): void {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <section
    aria-label="Filter kanji"
    class="kanji-list-filters"
    data-testid="kanji-list-filters"
  >
    <!-- Collapsible Header -->
    <button
      :aria-expanded="!isCollapsed"
      class="kanji-list-filters-header"
      data-testid="kanji-list-filters-toggle"
      type="button"
      @click="toggleCollapsed"
    >
      <span class="kanji-list-filters-header-text">
        Filters
        <span
          v-if="activeFilterCount > 0"
          class="kanji-list-filters-badge"
        >
          {{ activeFilterCount }}
        </span>
      </span>
      <svg
        :class="[
          'kanji-list-filters-chevron',
          { 'kanji-list-filters-chevron-open': !isCollapsed }
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
      class="kanji-list-filters-expanded-content"
    >
      <div class="kanji-list-filters-scrollable-content">
        <KanjiListFiltersContent
          :character-search="characterSearch"
          :classification-types="classificationTypes"
          :components="components"
          :filters="filters"
          :keywords-search="keywordsSearch"
          :kun-yomi-search="kunYomiSearch"
          :meanings-search="meaningsSearch"
          :on-yomi-search="onYomiSearch"
          :radicals="radicals"
          @update-filter="(key, value) => emit('updateFilter', key, value)"
          @update:character-search="emit('update:characterSearch', $event)"
          @update:keywords-search="emit('update:keywordsSearch', $event)"
          @update:kun-yomi-search="emit('update:kunYomiSearch', $event)"
          @update:meanings-search="emit('update:meaningsSearch', $event)"
          @update:on-yomi-search="emit('update:onYomiSearch', $event)"
        />
      </div>

      <!-- Bottom actions: Clear + Collapse -->
      <div class="kanji-list-filters-bottom-actions">
        <BaseButton
          data-testid="kanji-list-filters-clear"
          :disabled="!hasActiveFilters"
          size="sm"
          variant="ghost"
          @click="emit('clearFilters')"
        >
          Clear filters
        </BaseButton>

        <BaseButton
          data-testid="kanji-list-filters-collapse"
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

.kanji-list-filters-badge {
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

.kanji-list-filters-chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

.kanji-list-filters-chevron-open {
  transform: rotate(180deg);
}

.kanji-list-filters-expanded-content {
  display: flex;
  flex-direction: column;
}

.kanji-list-filters-scrollable-content {
  position: relative;
  max-height: 190px;
  overflow-y: auto;
}

@media (width > 640px) {
  .kanji-list-filters-scrollable-content {
    max-height: 180px;
  }
}

.kanji-list-filters-bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
