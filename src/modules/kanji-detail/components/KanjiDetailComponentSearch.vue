<script setup lang="ts">
/**
 * KanjiDetailComponentSearch
 *
 * Search interface for finding and selecting components to link to kanji.
 * Filters by character or short meaning, provides "Create New" option.
 */

import { computed, ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseInput from '@/base/components/BaseInput.vue'

import type { Component } from '@/api/component/component-types'

const props = withDefaults(
  defineProps<{
    /** Components available for linking (pre-filtered by parent) */
    availableComponents: Component[]
    /** Label for search input */
    label?: string
    /** Placeholder text */
    placeholder?: string
  }>(),
  {
    label: 'Search Components',
    placeholder: 'Search by character or meaning...'
  }
)

const emit = defineEmits<{
  /** User selected a component from results */
  select: [componentId: number]
  /** User clicked "Create New Component" button */
  create: [searchTerm: string]
}>()

const searchTerm = ref('')

// Filter components by character or short meaning (case-insensitive)
const filteredComponents = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return props.availableComponents

  return props.availableComponents.filter(
    (component) =>
      component.character.toLowerCase().includes(term) ||
      component.shortMeaning?.toLowerCase().includes(term)
  )
})

const showCreateButton = computed(
  () => searchTerm.value.trim() && filteredComponents.value.length === 0
)

function handleSelect(componentId: number): void {
  emit('select', componentId)
  searchTerm.value = ''
}

function handleCreate(): void {
  emit('create', searchTerm.value.trim())
  searchTerm.value = ''
}
</script>

<template>
  <div class="kanji-detail-component-search">
    <BaseInput
      v-model="searchTerm"
      :label="props.label"
      name="component-search"
      :placeholder="props.placeholder"
      type="text"
    />

    <div
      v-if="filteredComponents.length > 0"
      class="kanji-detail-component-search-results"
    >
      <button
        v-for="component in filteredComponents"
        :key="component.id"
        class="kanji-detail-component-search-result-item"
        type="button"
        @click="handleSelect(component.id)"
      >
        <span class="kanji-detail-component-search-result-character">
          {{ component.character }}
        </span>
        <span
          v-if="component.shortMeaning"
          class="kanji-detail-component-search-result-meaning"
        >
          {{ component.shortMeaning }}
        </span>
      </button>
    </div>

    <div
      v-else-if="!showCreateButton && searchTerm.trim()"
      class="kanji-detail-component-search-no-results"
    >
      <p>No components found.</p>
    </div>

    <div
      v-if="showCreateButton"
      class="kanji-detail-component-search-create"
    >
      <BaseButton
        type="button"
        variant="primary"
        @click="handleCreate"
      >
        Create New Component: "{{ searchTerm.trim() }}"
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.kanji-detail-component-search {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-component-search-results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
}

.kanji-detail-component-search-result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.kanji-detail-component-search-result-item:hover {
  background-color: var(--color-bg-secondary);
}

.kanji-detail-component-search-result-item:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: -2px;
}

.kanji-detail-component-search-result-character {
  min-width: 44px;
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-normal);
  text-align: center;
}

.kanji-detail-component-search-result-meaning {
  flex: 1;
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanji-detail-component-search-no-results {
  padding: var(--spacing-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}

.kanji-detail-component-search-create {
  display: flex;
  justify-content: center;
}
</style>
