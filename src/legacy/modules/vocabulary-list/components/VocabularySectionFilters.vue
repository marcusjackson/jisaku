<script setup lang="ts">
/**
 * VocabularySectionFilters
 *
 * Section component that orchestrates all vocabulary filter UI components.
 * Redesigned to match the kanji and component list filters design.
 */

import { computed, onMounted, ref, watch } from 'vue'

import BaseButton from '@/legacy/base/components/BaseButton.vue'
import BaseCheckbox from '@/legacy/base/components/BaseCheckbox.vue'
import BaseInput from '@/legacy/base/components/BaseInput.vue'
import BaseSelect from '@/legacy/base/components/BaseSelect.vue'

import type {
  JlptLevel,
  Kanji,
  VocabularyFilters
} from '@/legacy/shared/types/database-types'

const props = defineProps<{
  /** Current filter state */
  filters: VocabularyFilters
  /** Search text value (debounced separately) */
  searchText: string
  /** Whether any filters are active */
  hasActiveFilters: boolean
  /** Available kanji for "contains kanji" filter */
  allKanji: Kanji[]
}>()

const emit = defineEmits<{
  /** Update search text input */
  'update:searchText': [value: string]
  /** Update a filter value */
  updateFilter: [key: keyof VocabularyFilters, value: unknown]
  /** Clear all filters */
  clearFilters: []
}>()

// JLPT level options
const JLPT_OPTIONS = [
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'N3', label: 'N3' },
  { value: 'N2', label: 'N2' },
  { value: 'N1', label: 'N1' },
  { value: 'non-jlpt', label: '非JLPT' }
]

// Collapsible state with localStorage persistence
const STORAGE_KEY = 'vocabulary-list-filters-collapsed'
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
  if (props.filters.searchText) count++
  if (props.filters.jlptLevels && props.filters.jlptLevels.length > 0) count++
  if (props.filters.isCommon !== undefined) count++
  if (props.filters.containsKanjiId !== undefined) count++
  return count
})

function handleSearchInput(value: string | number | undefined) {
  emit('update:searchText', String(value ?? ''))
}

// JLPT multi-select handling
const selectedJlptLevels = computed<JlptLevel[]>({
  get: () => props.filters.jlptLevels ?? [],
  set: (value) => {
    emit('updateFilter', 'jlptLevels', value.length > 0 ? value : undefined)
  }
})

function toggleJlptLevel(level: JlptLevel) {
  const current = selectedJlptLevels.value
  if (current.includes(level)) {
    selectedJlptLevels.value = current.filter((l) => l !== level)
  } else {
    selectedJlptLevels.value = [...current, level]
  }
}

// Common filter handling
const isCommon = computed<boolean>({
  get: () => props.filters.isCommon ?? false,
  set: (value) => {
    emit('updateFilter', 'isCommon', value ? true : undefined)
  }
})

// Kanji options for select
const kanjiOptions = computed(() => {
  return props.allKanji.map((k) => ({
    value: String(k.id),
    label: `${k.character} - ${k.shortMeaning ?? '(no meaning)'}`
  }))
})

const selectedKanjiId = computed<string>({
  get: () =>
    props.filters.containsKanjiId !== undefined
      ? String(props.filters.containsKanjiId)
      : '',
  set: (value) => {
    emit(
      'updateFilter',
      'containsKanjiId',
      value ? parseInt(value, 10) : undefined
    )
  }
})
</script>

<template>
  <section
    aria-label="Filter vocabulary"
    class="vocabulary-section-filters"
  >
    <!-- Collapsible Header -->
    <button
      :aria-expanded="!isCollapsed"
      class="vocabulary-section-filters-header"
      type="button"
      @click="toggleCollapsed"
    >
      <span class="vocabulary-section-filters-header-text">
        Filters
        <span
          v-if="activeFilterCount > 0"
          class="vocabulary-section-filters-header-badge"
        >
          {{ activeFilterCount }}
        </span>
      </span>
      <svg
        class="vocabulary-section-filters-header-chevron"
        :class="{
          'vocabulary-section-filters-header-chevron-open': !isCollapsed
        }"
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
      class="vocabulary-section-filters-content"
    >
      <div class="vocabulary-section-filters-row">
        <!-- Search Filter -->
        <div
          class="vocabulary-section-filters-field vocabulary-section-filters-field-search"
        >
          <BaseInput
            label="Search"
            :model-value="searchText"
            name="search"
            placeholder="word, kana, meaning..."
            @update:model-value="handleSearchInput"
          />
        </div>

        <!-- Contains Kanji -->
        <div
          class="vocabulary-section-filters-field vocabulary-section-filters-field-kanji"
        >
          <BaseSelect
            v-model="selectedKanjiId"
            label="Contains Kanji"
            :options="kanjiOptions"
            placeholder="Any kanji"
          />
        </div>
      </div>

      <div class="vocabulary-section-filters-row">
        <!-- JLPT Level multi-select -->
        <div
          class="vocabulary-section-filters-field vocabulary-section-filters-field-jlpt"
        >
          <span class="vocabulary-section-filters-label">JLPT Level</span>
          <div class="vocabulary-section-filters-jlpt-options">
            <button
              v-for="option in JLPT_OPTIONS"
              :key="option.value"
              :aria-pressed="
                selectedJlptLevels.includes(option.value as JlptLevel)
              "
              class="vocabulary-section-filters-jlpt-button"
              :class="{
                'vocabulary-section-filters-jlpt-button-active':
                  selectedJlptLevels.includes(option.value as JlptLevel)
              }"
              type="button"
              @click="toggleJlptLevel(option.value as JlptLevel)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Common filter -->
        <div
          class="vocabulary-section-filters-field vocabulary-section-filters-field-common"
        >
          <BaseCheckbox
            v-model="isCommon"
            label="Common only"
          />
        </div>
      </div>

      <div class="vocabulary-section-filters-bottom">
        <div
          v-if="hasActiveFilters"
          class="vocabulary-section-filters-actions"
        >
          <BaseButton
            variant="ghost"
            @click="emit('clearFilters')"
          >
            Clear filters
          </BaseButton>
        </div>

        <div class="vocabulary-section-filters-collapse">
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
      class="vocabulary-section-filters-collapsed-actions"
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
.vocabulary-section-filters {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.vocabulary-section-filters-header {
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

.vocabulary-section-filters-header:hover {
  background-color: var(--color-surface-hover);
}

.vocabulary-section-filters-header-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.vocabulary-section-filters-header-badge {
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

.vocabulary-section-filters-header-chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

.vocabulary-section-filters-header-chevron-open {
  transform: rotate(180deg);
}

.vocabulary-section-filters-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-md) var(--spacing-md);
}

.vocabulary-section-filters-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--spacing-md);
}

.vocabulary-section-filters-field {
  min-width: 140px;
}

.vocabulary-section-filters-field-search {
  flex: 2;
  min-width: 200px;
}

.vocabulary-section-filters-field-kanji {
  flex: 1;
  min-width: 180px;
}

.vocabulary-section-filters-field-jlpt {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.vocabulary-section-filters-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.vocabulary-section-filters-jlpt-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.vocabulary-section-filters-jlpt-button {
  padding: var(--spacing-1) var(--spacing-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.15s;
}

.vocabulary-section-filters-jlpt-button:hover {
  background-color: var(--color-surface-hover);
}

.vocabulary-section-filters-jlpt-button-active {
  border-color: var(--color-primary);
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}

.vocabulary-section-filters-field-common {
  display: flex;
  align-items: center;
}

.vocabulary-section-filters-bottom {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.vocabulary-section-filters-actions {
  display: flex;
  justify-content: flex-start;
}

.vocabulary-section-filters-collapse {
  display: flex;
  justify-content: flex-end;
}

.vocabulary-section-filters-collapsed-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 var(--spacing-md) var(--spacing-md);
}

@media (width <= 480px) {
  .vocabulary-section-filters-bottom {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .vocabulary-section-filters-actions,
  .vocabulary-section-filters-collapse {
    justify-content: center;
  }
}
</style>
