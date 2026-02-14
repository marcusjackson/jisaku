<script setup lang="ts">
/* eslint-disable max-lines -- Complex search/filter/create UI component */
/**
 * SharedEntitySearch
 *
 * A searchable combobox for finding and selecting existing entities.
 * Includes a "Create New" option that triggers the quick-create flow.
 *
 * Features:
 * - Search by character or meaning
 * - Keyboard navigation via Reka UI Combobox
 * - "Create New" option at bottom
 * - Exclude already-linked IDs
 */

import { computed, ref, useId } from 'vue'

import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
  useFilter
} from 'reka-ui'

/** Entity type for entity search */
export type EntityType = 'kanji' | 'component'

/** Entity option for entity search */
export interface EntityOption {
  id: number
  character: string
  shortMeaning: string | null
  strokeCount: number | null
}

const props = withDefaults(
  defineProps<{
    /** Type of entity to search */
    entityType: EntityType
    /** Entity options to search from */
    options: EntityOption[]
    /** IDs to exclude from search results (already linked) */
    excludeIds?: number[]
    /** Placeholder text */
    placeholder?: string
    /** Label text */
    label?: string
    /** Disable the search */
    disabled?: boolean
  }>(),
  {
    excludeIds: () => [],
    placeholder: 'Search...',
    label: '',
    disabled: false
  }
)

const emit = defineEmits<{
  select: [entity: EntityOption]
  createNew: [searchTerm: string]
}>()

// Internal state
const searchTerm = ref('')
const comboboxId = useId()

// Use Reka UI's filter utility for fuzzy matching
const { contains } = useFilter({ sensitivity: 'base' })

// Filter options based on search term and exclusions
const filteredOptions = computed(() => {
  let filtered = props.options.filter(
    (opt) => !props.excludeIds.includes(opt.id)
  )

  if (searchTerm.value.trim()) {
    filtered = filtered.filter((opt) => {
      if (contains(opt.character, searchTerm.value)) return true
      if (opt.shortMeaning && contains(opt.shortMeaning, searchTerm.value)) {
        return true
      }
      return false
    })
  }

  return filtered
})

// Format option for display
function formatOption(opt: EntityOption): string {
  const meaning = opt.shortMeaning ? ` — ${opt.shortMeaning}` : ''
  const stroke =
    opt.strokeCount !== null ? ` (${String(opt.strokeCount)}画)` : ''
  return `${meaning}${stroke}`
}

// Handle selection - can be triggered by update:model-value or @select
function handleSelect(option: EntityOption | null): void {
  if (option) {
    emit('select', option)
    searchTerm.value = ''
  }
}

// Handle item select event directly (more reliable than update:model-value)
function handleItemSelect(event: Event, option: EntityOption): void {
  // Prevent default to avoid double-firing with update:model-value
  event.preventDefault()
  handleSelect(option)
}

// Handle "Create New" click
function handleCreateNew(): void {
  emit('createNew', searchTerm.value.trim())
  searchTerm.value = ''
}

// Entity type display name
const entityTypeName = computed(() => {
  switch (props.entityType) {
    case 'kanji':
      return 'Kanji'
    case 'component':
      return 'Component'
    default:
      return 'Entity'
  }
})
</script>

<template>
  <div class="shared-entity-search">
    <label
      v-if="label"
      class="shared-entity-search-label"
      :for="comboboxId"
    >
      {{ label }}
    </label>

    <ComboboxRoot
      :disabled="disabled ?? false"
      ignore-filter
      :model-value="null"
      @update:model-value="handleSelect"
    >
      <ComboboxAnchor class="shared-entity-search-anchor">
        <ComboboxInput
          :id="comboboxId"
          v-model="searchTerm"
          class="shared-entity-search-input"
          :placeholder="placeholder"
        />
        <ComboboxTrigger
          aria-label="Toggle options"
          class="shared-entity-search-trigger"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="16"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="16"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </ComboboxTrigger>
      </ComboboxAnchor>

      <ComboboxPortal>
        <ComboboxContent
          class="shared-entity-search-content"
          position="popper"
          :side-offset="4"
        >
          <ComboboxViewport class="shared-entity-search-viewport">
            <ComboboxItem
              v-for="option in filteredOptions"
              :key="option.id"
              class="shared-entity-search-item"
              :value="option"
              @select="(event: Event) => handleItemSelect(event, option)"
            >
              <ComboboxItemIndicator
                class="shared-entity-search-item-indicator"
              >
                <svg
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  width="16"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </ComboboxItemIndicator>
              <span class="shared-entity-search-item-character">{{
                option.character
              }}</span>
              <span class="shared-entity-search-item-text">{{
                formatOption(option)
              }}</span>
            </ComboboxItem>

            <ComboboxEmpty class="shared-entity-search-empty">
              No {{ entityTypeName.toLowerCase() }} found
            </ComboboxEmpty>

            <div class="shared-entity-search-create-separator" />
            <button
              class="shared-entity-search-create-button"
              type="button"
              @click="handleCreateNew"
            >
              <span class="shared-entity-search-create-icon">+</span>
              Create New {{ entityTypeName }}
              <span
                v-if="searchTerm.trim()"
                class="shared-entity-search-create-term"
              >
                "{{ searchTerm.trim() }}"
              </span>
            </button>
          </ComboboxViewport>
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>
  </div>
</template>

<style scoped>
.shared-entity-search {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.shared-entity-search-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.shared-entity-search-anchor {
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--input-height);
  border: var(--input-border);
  border-radius: var(--input-radius);
  background-color: var(--input-bg);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.shared-entity-search-anchor:focus-within {
  border: var(--input-border-focus);
  box-shadow: var(--focus-ring);
}

.shared-entity-search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: var(--input-padding);
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
}

.shared-entity-search-input:focus {
  outline: none;
}

.shared-entity-search-input::placeholder {
  color: var(--color-text-muted);
}

.shared-entity-search-trigger {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 100%;
  padding-right: var(--spacing-2);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.shared-entity-search-trigger:hover {
  color: var(--color-text-primary);
}
</style>

<style>
/* Global styles for portaled content */
.shared-entity-search-content {
  z-index: var(--z-dropdown);
  min-width: 250px;
  overflow: hidden;
  border: var(--card-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-lg);
}

.shared-entity-search-viewport {
  max-height: 280px;
  padding: var(--spacing-1);
  overflow-y: auto;
}

.shared-entity-search-empty {
  padding: var(--spacing-3);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}

.shared-entity-search-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  padding-left: var(--spacing-8);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
  user-select: none;
}

.shared-entity-search-item:focus {
  outline: none;
}

.shared-entity-search-item[data-highlighted] {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.shared-entity-search-item-indicator {
  position: absolute;
  left: var(--spacing-2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.shared-entity-search-item-character {
  flex-shrink: 0;
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.shared-entity-search-item-text {
  flex: 1;
  overflow: hidden;
  font-size: var(--font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-entity-search-create-separator {
  height: 1px;
  margin: var(--spacing-1) 0;
  background-color: var(--color-border);
}

.shared-entity-search-create-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-primary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.shared-entity-search-create-button:hover {
  background-color: var(--color-primary-subtle);
}

.shared-entity-search-create-button:focus-visible {
  background-color: var(--color-primary-subtle);
  outline: none;
}

.shared-entity-search-create-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.shared-entity-search-create-term {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-normal);
}
</style>
